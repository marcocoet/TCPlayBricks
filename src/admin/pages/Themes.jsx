import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import BrickButton from "../../components/BrickButton";
import Spinner from "../../components/Spinner";

function fetchThemes() {
  return Promise.all([
    supabase.from("themes").select("theme_id, theme_name").order("theme_name"),
    supabase.from("lego_sets").select("theme_id"),
  ]);
}

// Add, rename and delete themes. A theme that still has sets can't be
// deleted (the database refuses), so we explain that instead.
export default function Themes() {
  const [themes, setThemes] = useState(null);
  const [counts, setCounts] = useState({});
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { theme_id, theme_name }
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Puts fetched themes + per-theme set counts into state.
  function apply([t, s]) {
    if (t.error) {
      setError(t.error.message);
      return;
    }
    const c = {};
    for (const row of s.data ?? []) c[row.theme_id] = (c[row.theme_id] ?? 0) + 1;
    setCounts(c);
    setThemes(t.data);
  }

  async function load() {
    apply(await fetchThemes());
  }

  useEffect(() => {
    let cancelled = false;
    fetchThemes().then((res) => {
      if (!cancelled) apply(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run(action) {
    setBusy(true);
    setError(null);
    const { error } = await action();
    if (error) {
      setError(
        error.code === "23505"
          ? "A theme with that name already exists."
          : error.code === "23503"
            ? "This theme still has sets. Move them to another theme first."
            : error.message,
      );
    }
    await load();
    setBusy(false);
    return !error;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (await run(() => supabase.from("themes").insert({ theme_name: name }))) setNewName("");
  }

  async function handleRename(e) {
    e.preventDefault();
    const name = editing.theme_name.trim();
    if (!name) return;
    if (
      await run(() =>
        supabase.from("themes").update({ theme_name: name }).eq("theme_id", editing.theme_id),
      )
    ) {
      setEditing(null);
    }
  }

  function handleDelete(theme) {
    if (!window.confirm(`Delete the theme "${theme.theme_name}"?`)) return;
    run(() => supabase.from("themes").delete().eq("theme_id", theme.theme_id));
  }

  if (!themes) {
    return error ? (
      <p className="text-red-600">{error}</p>
    ) : (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const input = "border border-gray-300 rounded-md px-3 py-2";

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          className={`${input} grow`}
          placeholder="New theme name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <BrickButton type="submit" disabled={busy || !newName.trim()}>
          Add
        </BrickButton>
      </form>

      {error && <p className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2">{error}</p>}

      <ul className="bg-white rounded-lg shadow divide-y">
        {themes.map((theme) => (
          <li key={theme.theme_id} className="flex items-center gap-3 p-3">
            {editing?.theme_id === theme.theme_id ? (
              <form onSubmit={handleRename} className="flex gap-2 grow">
                <input
                  autoFocus
                  className={`${input} grow`}
                  value={editing.theme_name}
                  onChange={(e) => setEditing({ ...editing, theme_name: e.target.value })}
                />
                <BrickButton type="submit" size="sm" disabled={busy}>
                  Save
                </BrickButton>
                <BrickButton type="button" size="sm" variant="gray" onClick={() => setEditing(null)}>
                  Cancel
                </BrickButton>
              </form>
            ) : (
              <>
                <span className="grow font-medium text-gray-800">{theme.theme_name}</span>
                <span className="text-sm text-gray-500">
                  {counts[theme.theme_id] ?? 0} sets
                </span>
                <BrickButton size="sm" variant="gray" onClick={() => setEditing(theme)}>
                  Rename
                </BrickButton>
                <BrickButton
                  size="sm"
                  variant="danger"
                  disabled={busy}
                  onClick={() => handleDelete(theme)}
                >
                  Delete
                </BrickButton>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
