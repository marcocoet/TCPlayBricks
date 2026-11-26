import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import BrickButton from "../../components/BrickButton";
import Spinner from "../../components/Spinner";

const LOW_STOCK = 2; // highlight sets with this many or fewer left

// Admin list of every set, with search, theme filter and low-stock filter.
export default function SetsList() {
  const [sets, setSets] = useState(null);
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [themeId, setThemeId] = useState("");
  const [lowOnly, setLowOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const [setsRes, themesRes] = await Promise.all([
        supabase
          .from("lego_sets")
          .select("set_id, set_name, set_number, slug, price, stock, image_url, theme_id, release_year")
          .order("set_name"),
        supabase.from("themes").select("theme_id, theme_name").order("theme_name"),
      ]);
      if (setsRes.error || themesRes.error) {
        setError((setsRes.error || themesRes.error).message);
        return;
      }
      setSets(setsRes.data);
      setThemes(themesRes.data);
    }
    load();
  }, []);

  const themeName = useMemo(
    () => Object.fromEntries(themes.map((t) => [t.theme_id, t.theme_name])),
    [themes],
  );

  const filtered = useMemo(() => {
    if (!sets) return [];
    const q = search.trim().toLowerCase();
    return sets.filter(
      (s) =>
        (!q ||
          s.set_name.toLowerCase().includes(q) ||
          (s.set_number ?? "").toLowerCase().includes(q)) &&
        (!themeId || String(s.theme_id) === themeId) &&
        (!lowOnly || s.stock <= LOW_STOCK),
    );
  }, [sets, search, themeId, lowOnly]);

  if (error) return <p className="text-red-600">Could not load sets: {error}</p>;
  if (!sets) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name or set number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-72"
        />
        <select
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All themes</option>
          {themes.map((t) => (
            <option key={t.theme_id} value={t.theme_id}>
              {t.theme_name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
          />
          Low stock only (≤ {LOW_STOCK})
        </label>
        <BrickButton to="/admin/sets/new" className="ml-auto">
          + New set
        </BrickButton>
      </div>

      <p className="text-sm text-gray-500 mb-2">
        {filtered.length} of {sets.length} sets
      </p>

      <ul className="bg-white rounded-lg shadow divide-y">
        {filtered.map((s) => (
          <li key={s.set_id}>
            <Link
              to={`/admin/sets/${s.set_id}`}
              className="flex items-center gap-3 p-3 hover:bg-gray-50"
            >
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 object-contain rounded bg-gray-50 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-gray-100 shrink-0" />
              )}
              <div className="min-w-0 grow">
                <p className="font-semibold text-gray-800 truncate">{s.set_name}</p>
                <p className="text-sm text-gray-500 truncate">
                  #{s.set_number} · {themeName[s.theme_id] ?? "No theme"}
                  {s.release_year ? ` · ${s.release_year}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-800">R{Number(s.price).toFixed(2)}</p>
                <p
                  className={`text-sm ${
                    s.stock <= LOW_STOCK ? "text-red-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  {s.stock} in stock
                </p>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-6 text-center text-gray-500">No sets match.</li>
        )}
      </ul>
    </div>
  );
}
