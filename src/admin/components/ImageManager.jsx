import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { supabase } from "../../supabase/supabaseClient";
import Spinner from "../../components/Spinner";

const BUCKET = "lego-images";
const MAX_BYTES = 5 * 1024 * 1024; // must match the bucket's 5 MB limit
const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Upload, reorder, delete and choose the main photo for one set.
// The main photo is automatically copied to lego_sets.image_url by a
// database trigger, so shop listings and the cart always show it.
export default function ImageManager({ setId }) {
  const [images, setImages] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Fetches this set's photos in their saved order.
  const fetchImages = useCallback(
    () =>
      supabase
        .from("set_images")
        .select("*")
        .eq("set_id", setId)
        .order("sort_order")
        .order("image_id"),
    [setId],
  );

  async function load() {
    const { data, error } = await fetchImages();
    if (error) setError(error.message);
    else setImages(data);
  }

  useEffect(() => {
    let cancelled = false;
    fetchImages().then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else setImages(data);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchImages]);

  // Wraps each action: shows a spinner, reports errors, reloads afterwards.
  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message ?? String(err));
    }
    await load();
    setBusy(false);
  }

  function handleUpload(e) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    const bad = files.find((f) => !ALLOWED[f.type] || f.size > MAX_BYTES);
    if (bad) {
      setError(`"${bad.name}" must be a JPG, PNG or WebP image under 5 MB.`);
      return;
    }

    run(async () => {
      let nextOrder = images.reduce((m, i) => Math.max(m, i.sort_order), -1) + 1;
      let needsPrimary = !images.some((i) => i.is_primary);

      for (const file of files) {
        const path = `sets/${setId}/${crypto.randomUUID()}.${ALLOWED[file.type]}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from("set_images").insert({
          set_id: setId,
          url: pub.publicUrl,
          storage_path: path,
          sort_order: nextOrder++,
          is_primary: needsPrimary,
        });
        if (dbErr) {
          // Don't leave an orphaned file behind.
          await supabase.storage.from(BUCKET).remove([path]);
          throw dbErr;
        }
        needsPrimary = false;
      }
    });
  }

  function makeMain(image) {
    run(async () => {
      // Only one main photo per set is allowed, so clear the old one first.
      const { error: clearErr } = await supabase
        .from("set_images")
        .update({ is_primary: false })
        .eq("set_id", setId)
        .eq("is_primary", true);
      if (clearErr) throw clearErr;
      const { error } = await supabase
        .from("set_images")
        .update({ is_primary: true })
        .eq("image_id", image.image_id);
      if (error) throw error;
    });
  }

  // Swap a photo with its neighbour (-1 = left, +1 = right).
  function move(index, direction) {
    const other = images[index + direction];
    const image = images[index];
    if (!other) return;
    run(async () => {
      // Renumber everything in the new order so ties can't happen.
      const order = [...images];
      order[index] = other;
      order[index + direction] = image;
      for (let i = 0; i < order.length; i++) {
        if (order[i].sort_order !== i) {
          const { error } = await supabase
            .from("set_images")
            .update({ sort_order: i })
            .eq("image_id", order[i].image_id);
          if (error) throw error;
        }
      }
    });
  }

  function remove(image) {
    if (!window.confirm("Delete this photo?")) return;
    run(async () => {
      const { error } = await supabase
        .from("set_images")
        .delete()
        .eq("image_id", image.image_id);
      if (error) throw error;

      // Older photos can be shared between sets (e.g. one theme picture),
      // so only delete the file if nothing else still uses it.
      if (image.storage_path) {
        const { count } = await supabase
          .from("set_images")
          .select("image_id", { count: "exact", head: true })
          .eq("storage_path", image.storage_path);
        if (count === 0) {
          await supabase.storage.from(BUCKET).remove([image.storage_path]);
        }
      }

      // If the main photo was deleted, promote the next one.
      if (image.is_primary) {
        const next = images.find((i) => i.image_id !== image.image_id);
        if (next) {
          await supabase.from("set_images").update({ is_primary: true }).eq("image_id", next.image_id);
        }
      }
    });
  }

  if (!images) {
    return error ? <p className="text-red-600">{error}</p> : <Spinner />;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        JPG, PNG or WebP, up to 5 MB each. The ★ photo is the main one shown in the shop.
      </p>

      {error && <p className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2">{error}</p>}

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {images.map((img, index) => (
          <li
            key={img.image_id}
            className={`relative rounded-lg border-2 p-2 bg-gray-50 ${
              img.is_primary ? "border-red-500" : "border-transparent"
            }`}
          >
            <img src={img.url} alt="" className="w-full aspect-square object-contain" />
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                title="Move left"
                disabled={busy || index === 0}
                onClick={() => move(index, -1)}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                title={img.is_primary ? "Main photo" : "Make main photo"}
                disabled={busy || img.is_primary}
                onClick={() => makeMain(img)}
                className="p-1 rounded hover:bg-gray-200"
              >
                {img.is_primary ? (
                  <StarSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <StarIcon className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                title="Delete photo"
                disabled={busy}
                onClick={() => remove(img)}
                className="p-1 rounded hover:bg-red-100 text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="Move right"
                disabled={busy || index === images.length - 1}
                onClick={() => move(index, 1)}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <label
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer ${
          busy ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {busy ? <Spinner size="h-4 w-4" /> : "+"} Add photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          className="sr-only"
        />
      </label>
    </div>
  );
}
