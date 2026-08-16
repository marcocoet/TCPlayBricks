import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

// The search bar + Min/Max Price filters used on the landing page and the
// products page. It doesn't render results itself - instead it calls
// `onResults` (passed in by the parent page) with whatever it finds, and
// the parent decides how to display them.
export default function SearchBoxWithFilters({ onResults }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  // Local copy of the search results, used to show the dropdown preview list.
  const [results, setResults] = useState([]);
  // Whether the search input is focused - controls whether the dropdown
  // of matching results is visible.
  const [isFocused, setIsFocused] = useState(false);
  // Themes matching the current search term, kept around so pressing Enter
  // can jump straight to that theme's page on /products.
  const [matchedThemes, setMatchedThemes] = useState([]);
  const navigate = useNavigate();

  // Runs on every keystroke in the search box. Builds a Supabase query based
  // on whatever text/min/max price filters are currently set.
  async function handleSearch(e) {
    const term = e.target.value;
    setSearchTerm(term);

    // If there's no search text and no price filters, just clear the
    // results instead of querying (an empty search would just re-fetch
    // everything, which we don't want here).
    if (term.trim() === "" && !minPrice && !maxPrice) {
      setResults([]);
      setMatchedThemes([]);
      onResults([]);
      return;
    }

    // Start with: only sets that are in stock. Themes are joined in so we
    // can both match against theme name and show it in the results.
    let query = supabase
      .from("lego_sets")
      .select("*, themes(theme_name)")
      .gt("stock", 0);

    // .ilike is a case-insensitive "contains" match. This matches the typed
    // term against the set's name, its set number, or its theme's name.
    if (term.trim() !== "") {
      // Themes live in their own table, so a theme match has to be resolved
      // to theme_id(s) first before it can be OR'd in alongside the
      // set_name/set_number conditions.
      const { data: matchingThemes, error: themeError } = await supabase
        .from("themes")
        .select("theme_id, theme_name")
        .ilike("theme_name", `%${term}%`);

      if (themeError) {
        console.error("Error searching themes: ", themeError);
      }
      setMatchedThemes(matchingThemes || []);

      const conditions = [
        `set_name.ilike.%${term}%`,
        `set_number.ilike.%${term}%`,
      ];
      if (matchingThemes?.length) {
        conditions.push(
          `theme_id.in.(${matchingThemes.map((t) => t.theme_id).join(",")})`,
        );
      }
      query = query.or(conditions.join(","));
    } else {
      setMatchedThemes([]);
    }
    // .gte / .lte add "greater than or equal" / "less than or equal" price
    // filters only if the user actually typed a min/max value.
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    const { data, error } = await query;
    if (error) {
      console.error("Error searching sets: ", error);
    } else {
      setResults(data);
      onResults(data); // hand the results up to whichever page is using this component
    }
  }

  // Pressing Enter while the typed term matches a theme jumps straight to
  // that theme's page on /products, same as clicking a theme button would.
  function handleKeyDown(e) {
    if (e.key !== "Enter") return;

    const term = searchTerm.trim().toLowerCase();
    const exactMatch = matchedThemes.find(
      (t) => t.theme_name.toLowerCase() === term,
    );
    const theme =
      exactMatch ?? (matchedThemes.length === 1 ? matchedThemes[0] : null);

    if (theme) {
      e.preventDefault();
      setIsFocused(false);
      navigate(`/products?theme=${encodeURIComponent(theme.theme_name)}`);
    }
  }

  return (
    <div className="flex justify-center w-full mb-6">
      <div className="relative w-full max-w-md z-50">
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Min Price"
            min="0"
            value={minPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMinPrice(value < 0 ? 0 : value); // clamp to 0, no negative prices
            }}
            className="no-spinner w-1/2 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base
                   placeholder:text-gray-600 placeholder:font-medium"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="no-spinner w-1/2 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base
                   placeholder:text-gray-600 placeholder:font-medium"
          />
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search set name, number, or theme..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // delay so clicks register
          className="w-full px-4 py-3 relative rounded-lg border border-gray-300 bg-white shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900
                 placeholder:text-gray-600 placeholder:font-medium"
        />

        {/* Dropdown results - only shown while the input is focused and
            there's at least one match, so it doesn't linger after clicking
            away or when the search box is empty. */}
        {isFocused && results.length > 0 && (
          <ul
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200
            rounded-lg shadow-xl max-h-64 overflow-y-auto z-[9999] text-gray-800"
          >
            {results.map((set) => (
              <li
                key={set.set_id}
                onClick={() => (window.location.href = `/products/${set.slug}`)}
                className="px-4 py-2 text-sm hover:bg-red-50 cursor-pointer transition-colors"
              >
                <span className="font-semibold">{set.set_name}</span>{" "}
                <span className="text-gray-500">({set.set_number})</span>
                {set.themes?.theme_name && (
                  <span className="block text-xs text-gray-400">
                    {set.themes.theme_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
