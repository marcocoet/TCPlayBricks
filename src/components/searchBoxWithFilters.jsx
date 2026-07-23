import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function SearchBoxWithFilters({ onResults }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  async function handleSearch(e) {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "" && !minPrice && !maxPrice) {
      setResults([]);
      onResults([]);
      return;
    }

    let query = supabase.from("lego_sets").select("*").gt("stock", 0);

    if (term.trim() !== "") {
      query = query.or(`set_name.ilike.%${term}%,set_number.ilike.%${term}%`);
    }
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    const { data, error } = await query;
    if (error) {
      console.error("Error searching sets: ", error);
    } else {
      setResults(data);
      onResults(data);
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
              setMinPrice(value < 0 ? 0 : value);
            }}
            className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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
                 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />

        {/* Dropdown results */}
        {isFocused && results.length > 0 && (
          <ul
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200
            rounded-lg shadow-xl max-h-64 overflow-y-auto z-9999 text-gray-800"
          >
            {results.map((set) => (
              <li
                key={set.set_id}
                onClick={() => (window.location.href = `/products/${set.slug}`)}
                className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer transition-colors"
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
