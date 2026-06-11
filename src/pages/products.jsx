import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function ProductPage() {
  const { slug } = useParams();
  const [setData, setSetData] = useState(null);

  useEffect(() => {
    async function fetchSet() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) console.error("Error fetching product:", error);
      else setSetData(data);
    }
    fetchSet();
  }, [slug]);

  if (!setData) return <p className="text-center mt-10">Loading...</p>;

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <img
            src={setData.image_url}
            alt={setData.set_name}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {setData.set_name}
          </h2>
          <p className="text-gray-600 mb-2">
            Set Number:{" "}
            <span className="font-semibold">{setData.set_number}</span>
          </p>
          <p className="text-gray-600 mb-2">
            Release Year:{" "}
            <span className="font-semibold">{setData.release_year}</span>
          </p>

          <p className="text-gray-600 mb-2">
            Price: <span className="font-semibold">R{setData.price}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Stock: <span className="font-semibold">{setData.stock}</span>
          </p>

          {/* Call to Action */}
          <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition">
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}
