import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import BrickButton from "../../components/BrickButton";
import Spinner from "../../components/Spinner";
import ImageManager from "../components/ImageManager";

// Turns "Batmobile Tumbler: Scarecrow" into "batmobile-tumbler-scarecrow"
// for the product page URL.
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY = {
  set_name: "",
  set_number: "",
  slug: "",
  theme_id: "",
  release_year: "",
  price: "",
  stock: "0",
  length_cm: "",
  width_cm: "",
  height_cm: "",
  weight_kg: "",
};

// Form fields that hold numbers. Empty optional ones are saved as null.
const NUMBER_FIELDS = ["release_year", "price", "stock", "length_cm", "width_cm", "height_cm", "weight_kg"];

// Add a new set (/admin/sets/new) or edit an existing one (/admin/sets/:setId).
export default function SetEdit() {
  const { setId } = useParams();
  const isNew = !setId;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }
  // On a new set, keep the slug following the name until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    supabase
      .from("themes")
      .select("theme_id, theme_name")
      .order("theme_name")
      .then(({ data }) => setThemes(data ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .eq("set_id", setId)
        .single();
      if (error) {
        setMessage({ type: "error", text: `Could not load set: ${error.message}` });
      } else {
        // Inputs want strings; turn nulls into "".
        setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, data[k] ?? ""])));
      }
      setLoading(false);
    }
    load();
  }, [isNew, setId]);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "set_name" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.set_name.trim() || !form.set_number.trim() || !form.theme_id || form.price === "") {
      setMessage({ type: "error", text: "Name, set number, theme and price are required." });
      return;
    }

    const row = {
      set_name: form.set_name.trim(),
      set_number: form.set_number.trim(),
      slug: slugify(form.slug || form.set_name) || null,
      theme_id: Number(form.theme_id),
    };
    for (const f of NUMBER_FIELDS) {
      row[f] = form[f] === "" ? null : Number(form[f]);
    }
    if (row.stock === null) row.stock = 0;
    if (row.price < 0 || row.stock < 0) {
      setMessage({ type: "error", text: "Price and stock can't be negative." });
      return;
    }

    setSaving(true);
    const query = isNew
      ? supabase.from("lego_sets").insert(row).select("set_id").single()
      : supabase.from("lego_sets").update(row).eq("set_id", setId).select("set_id").single();
    const { data, error } = await query;
    setSaving(false);

    if (error) {
      const text =
        error.code === "23505"
          ? "Another set already uses that set number or URL name."
          : error.message;
      setMessage({ type: "error", text });
      return;
    }

    if (isNew) {
      // Go to the edit page so photos can be added straight away.
      navigate(`/admin/sets/${data.set_id}`, { replace: true });
    } else {
      setMessage({ type: "ok", text: "Saved." });
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${form.set_name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("lego_sets").delete().eq("set_id", setId);
    if (error) {
      const text =
        error.code === "23503"
          ? "This set is in an order or someone's cart, so it can't be deleted. Set its stock to 0 to stop it being sold."
          : error.message;
      setMessage({ type: "error", text });
      return;
    }
    navigate("/admin/sets", { replace: true });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const input = "border border-gray-300 rounded-md px-3 py-2 w-full";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl">
      <Link to="/admin/sets" className="text-sm text-red-600 hover:underline">
        ← All sets
      </Link>
      <h2 className="text-xl font-bold text-gray-800 mt-2 mb-4">
        {isNew ? "New set" : form.set_name || "Edit set"}
      </h2>

      {message && (
        <p
          role="status"
          className={`mb-4 rounded-md px-4 py-2 ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="set_name">Name *</label>
            <input id="set_name" className={input} value={form.set_name}
              onChange={(e) => update("set_name", e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="set_number">Set number *</label>
            <input id="set_number" className={input} value={form.set_number}
              onChange={(e) => update("set_number", e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="theme_id">Theme *</label>
            <select id="theme_id" className={input} value={form.theme_id}
              onChange={(e) => update("theme_id", e.target.value)}>
              <option value="">Choose a theme</option>
              {themes.map((t) => (
                <option key={t.theme_id} value={t.theme_id}>{t.theme_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="price">Price (R) *</label>
            <input id="price" type="number" step="0.01" min="0" className={input}
              value={form.price} onChange={(e) => update("price", e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="stock">Stock</label>
            <input id="stock" type="number" step="1" min="0" className={input}
              value={form.stock} onChange={(e) => update("stock", e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="release_year">Release year</label>
            <input id="release_year" type="number" step="1" className={input}
              value={form.release_year} onChange={(e) => update("release_year", e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="slug">Page URL name</label>
            <input id="slug" className={input} value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }} />
            <p className="text-xs text-gray-500 mt-1">
              /products/{slugify(form.slug || form.set_name) || "…"}
              {!isNew && " — changing this breaks old links to the set."}
            </p>
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-1">
            Box size & weight <span className="font-normal text-gray-500">(used to pick the PUDO box)</span>
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["length_cm", "Length (cm)"],
              ["width_cm", "Width (cm)"],
              ["height_cm", "Height (cm)"],
              ["weight_kg", "Weight (kg)"],
            ].map(([field, text]) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1" htmlFor={field}>{text}</label>
                <input id={field} type="number" step="0.01" min="0" className={input}
                  value={form[field]} onChange={(e) => update(field, e.target.value)} />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <BrickButton type="submit" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create set" : "Save changes"}
          </BrickButton>
          {!isNew && form.slug && (
            <BrickButton to={`/products/${form.slug}`} variant="gray">
              View in shop
            </BrickButton>
          )}
          {!isNew && (
            <BrickButton type="button" variant="danger" onClick={handleDelete} className="ml-auto">
              Delete set
            </BrickButton>
          )}
        </div>
      </form>

      <section className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Photos</h3>
        {isNew ? (
          <p className="text-gray-500">Create the set first, then you can add photos.</p>
        ) : (
          <ImageManager setId={Number(setId)} />
        )}
      </section>
    </div>
  );
}
