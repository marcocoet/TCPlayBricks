import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";
import FetchThemes from "../components/fetchThemes";

export default function Landingpage() {
  const [legoSets, setLegoSets] = useState([]);
  {
    /*featured sets */
  }
  const [searchTerm, setSearchTerm] = useState("");
  {
    /*search set*/
  }
  const [searchResults, setSearchResults] = useState([]);
  {
    /*search results*/
  }

  {
    /*featured sets */
  }
  useEffect(() => {
    async function loadSets() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .limit(5)
        .gt("stock", 0)
        .order("release_year", { ascending: false });

      if (error) {
        console.error("Error fetching sets: ", error);
      } else {
        console.log("Fetched sets: ", data);
        setLegoSets(data);
      }
    }
    loadSets();
  }, []);
  {
    /*search set*/
  }
  async function handleSearch(e) {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("lego_sets")
      .select("*")
      .or(`set_name.ilike.%${term}%,set_number.ilike.%${term}%`)
      .gt("stock", 0);
    //search by name or set number

    if (error) {
      console.error("Error searching sets: ", error);
    } else {
      setSearchResults(data);
    }
  }

  return (
    <section className="bg-white min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-red-500 mb-6 text-center">
        Explore our available themes and sets and start building your dream
        collection!
      </h1>
      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
        Search for your favorite LEGO set or choose a theme.
      </p>

      <div className="flex flex-col items-center w-full md-10 gap-6">
        {/* Search Box */}
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="Search for a set name or set number..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {searchResults.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 w-full">
              {searchResults.map((set) => (
                <li
                  key={set.set_id}
                  onClick={() => {
                    window.location.href = `/products/${set.slug}`;
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {set.set_name} ({set.set_number})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Theme Options */}
        <div className="flex-1">
          <FetchThemes />
        </div>
      </div>

      {/* Featured Sets */}
      <div className="mt-10 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-red-500 mb-6 self-center">
          Featured Sets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {legoSets.map((set) => (
            <Link
              key={set.set_id}
              to={`/products/${set.slug}`}
              className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transform transition"
            >
              <div
                key={set.set_id}
                className="bg-white shadow-md rounded-lg p-4"
              >
                <img
                  src={set.image_url}
                  alt={set.set_name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  {set.set_name}
                </h3>

                <p className="text-gray-600">Set Number: {set.set_number}</p>
                <p className="text-gray-600">
                  Release Year: {set.release_year}
                </p>
                <p className="text-gray-600">Price: R{set.price}</p>
                <p className="text-gray-600">Stock: {set.stock}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
