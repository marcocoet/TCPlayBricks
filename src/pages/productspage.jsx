import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link, useLocation } from "react-router-dom";
import FetchThemes from "../components/fetchThemes";
import SearchBoxWithFilters from "../components/searchBoxWithFilters";

export default function Products() {
  const [legoSets, setLegoSets] = useState([]);

  const location = useLocation();

  // Extract ?theme=XYZ
  const params = new URLSearchParams(location.search);
  const themeName = params.get("theme");

  // Load sets
  useEffect(() => {
    async function loadSets() {
      let query = supabase
        .from("lego_sets")
        .select("*, themes(theme_name)")
        .gt("stock", 0)
        .order("release_year", { ascending: false });

      if (themeName) {
        const { data: themeData, error: themeError } = await supabase
          .from("themes")
          .select("theme_id")
          .eq("theme_name", themeName)
          .single();

        if (themeError) {
          console.error("Error fetching theme:", themeError);
        } else if (themeData) {
          query = query.eq("theme_id", themeData.theme_id);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching sets:", error);
      } else {
        setLegoSets(data);
      }
    }
    loadSets();
  }, [themeName]);

  return (
    <section className="min-h-screen flex flex-col items-center relative">
      {/* Centered Heading + Search */}
      <div
        data-aos="fade-up"
        className="relative z-50 flex flex-col items-center justify-center min-h-[50vh] w-full px-6"
      >
        <div data-aos="fade-right" className="w-full max-w-md ">
          <h1 className="flex justify-center text-3xl font-bold text-black mb-10 text-center border-b-4 border-blue-500 relative z-50 ">
            Search Products
          </h1>
          <SearchBoxWithFilters onResults={setLegoSets} />
        </div>
      </div>

      {/* Theme Options */}
      <div data-aos="fade-up" className="w-full mb-10 px-6">
        <FetchThemes />
      </div>

      {/* Sets Grid */}
      <h2
        data-aos="fade-up"
        className="text-3xl font-bold text-black mb-10 text-center border-b-4 border-blue-500 inline-block"
      >
        {themeName ? `${themeName} Sets` : "All LEGO Sets"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        {legoSets.map((set, index) => (
          <Link
            key={set.set_id}
            to={`/products/${set.slug}`}
            className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transform transition"
          >
            <img
              src={set.image_url}
              alt={set.set_name}
              data-aos="fade-up"
              data-aos-delay={index * 150}
              className="w-full max-h-92 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold">{set.set_name}</h3>
            <p className="text-gray-600 mb-2">
              Theme:{" "}
              <span className="font-semibold">{set.themes?.theme_name}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Set Number:{" "}
              <span className="font-semibold">{set.set_number}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Release Year:{" "}
              <span className="font-semibold">{set.release_year}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Stock: <span className="font-semibold">{set.stock}</span>
            </p>
            <p className="text-gray-600 mb-2">
              <span className="text-lg font-semibold text-blue-500">
                R{set.price}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
