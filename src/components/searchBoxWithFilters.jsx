import { useState } from "react";
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
      onResults([]);
      return;
    }

    // Start with: only sets that are in stock.
    let query = supabase.from("lego_sets").select("*").gt("stock", 0);

    // .ilike is a case-insensitive "contains" match. This matches the typed
    // term against either the set's name or its set number.
    if (term.trim() !== "") {
      query = query.or(`set_name.ilike.%${term}%,set_number.ilike.%${term}%`);
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
            className="no-spinner w-1/2 px-3 py-2 rounded-lg border border-gray-300 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="no-spinner w-1/2 px-3 py-2 rounded-lg border border-gray-300 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
          />
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search set name or number..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // delay so clicks register
          className="w-full px-4 py-3 relative rounded-lg border border-gray-300 shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
        />

        {/* Dropdown results - only shown while the input is focused and
            there's at least one match, so it doesn't linger after clicking
            away or when the search box is empty. */}
        {isFocused && results.length > 0 && (
          <ul
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200
            rounded-lg shadow-xl max-h-64 overflow-y-auto z-9999 text-gray-800"
          >
            {results.map((set) => (
              <li
                key={set.set_id}
                onClick={() => (window.location.href = `/products/${set.slug}`)}
                className="px-4 py-2 text-sm hover:bg-red-50 cursor-pointer transition-colors"
              >
                <span className="font-semibold">{set.set_name}</span>{" "}
                <span className="text-gray-500">({set.set_number})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
