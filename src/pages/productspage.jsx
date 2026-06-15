import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";

export default function Products() {
  const [legoSets, setLegoSets] = useState([]);

  useEffect(() => {
    async function loadAllSets() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .order("release_year", { ascending: false });

      if (error) {
        console.error("Error fetching sets: ", error);
      } else {
        console.log("Fetched sets: ", data);
        setLegoSets(data);
      }
    }
    loadAllSets();
  }, []);

  return (
    <section className="bg-gray-50 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-red-500 mb-8 text-center">
        All Lego Sets
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
            ></img>

            <h3 className="text-lg font-semibold mt-4">{set.set_name}</h3>
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
