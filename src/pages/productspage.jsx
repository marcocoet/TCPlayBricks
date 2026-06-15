import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link, useLocation } from "react-router-dom";

export default function Products() {
  const [legoSets, setLegoSets] = useState([]);
  const location = useLocation();

  // Extract ?theme=XYZ
  const params = new URLSearchParams(location.search);
  const themeName = params.get("theme"); // e.g. "Star Wars"

  useEffect(() => {
    async function loadSets() {
      let query = supabase
        .from("lego_sets")
        .select("*, themes(theme_name)")
        .gt("stock", 0)
        .order("release_year", { ascending: false });

      if (themeName) {
        // First resolve theme_id from theme_name
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
    <section className="bg-gray-50 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-red-500 mb-8 text-center">
        {themeName ? `${themeName} Sets` : "All Lego Sets"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {legoSets.map((set) => (
          <Link
            key={set.set_id}
            to={`/products/${set.slug}`}
            className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transform transition"
          >
            <img
              src={set.image_url}
              alt={set.set_name}
              className="w-full h-auto rounded-lg"
            />
            <h3 className="text-lg font-semibold mt-4">{set.set_name}</h3>
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
              Price: <span className="font-semibold">R{set.price}</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
