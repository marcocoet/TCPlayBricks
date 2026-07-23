import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function ProductPage() {
  const { slug } = useParams();
  const [setData, setSetData] = useState(null);
  const [user, setUser] = useState(null);
  const [desiredQty, setDesiredQty] = useState(1);

  // ✅ Get logged-in user
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    }
    getUser();
  }, []);

  // ✅ Fetch product by slug
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

  // ✅ Update instead of insert
  async function handleAddToCart(set, userId) {
    // Step 1: Check if item already exists
    const { data: existing, error: selectError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("set_id", set.set_id)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking cart:", selectError);
      return;
    }

    // Step 2: Check available stock
    const { data: product, error: productError } = await supabase
      .from("lego_sets")
      .select("stock")
      .eq("set_id", set.set_id)
      .single();

    if (productError) {
      console.error("Error fetching product stock:", productError);
      return;
    }

    const availableStock = product.stock;

    if (existing) {
      // Step 3: Calculate new quantity
      const newQty = existing.quantity + 1;

      if (newQty > availableStock) {
        alert(`Not enough stock! Only ${availableStock} available.`);
        return;
      }

      // Step 4: Update quantity
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: newQty })
        .eq("cart_id", existing.cart_id);

      if (updateError) {
        console.error("Error updating cart:", updateError);
      } else {
        alert(`${set.set_name} quantity updated to ${newQty}!`);
      }
    } else {
      if (availableStock < 1) {
        alert("This item is out of stock!");
        return;
      }

      // Step 3: Insert new row if item doesn’t exist
      const { error: insertError } = await supabase.from("cart").insert([
        {
          user_id: userId,
          set_id: set.set_id,
          quantity: 1,
        },
      ]);

      if (insertError) {
        console.error("Error adding to cart:", insertError);
      } else {
        alert(`${set.set_name} added to cart!`);
      }
    }
  }

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <img
            src={setData.image_url}
            alt={setData.set_name}
            data-aos="fade-up"
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

          <p className="text-gray-600 mb-6">
            Stock: <span className="font-semibold">{setData.stock}</span>
          </p>
          <p className="text-gray-600 mb-2">
            <span className="text-lg text-blue-500 font-semibold">
              R{setData.price}
            </span>
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setDesiredQty(Math.max(1, desiredQty - 1))}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              -
            </button>
            <span>{desiredQty}</span>
            <button
              onClick={() => setDesiredQty(desiredQty + 1)}
              disabled={desiredQty >= setData.stock} // ✅ disable if at stock limit
              className={`px-3 py-1 rounded ${
                desiredQty >= setData.stock
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300"
              }`}
            >
              +
            </button>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col space-y-1.5">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105">
              Buy it Now
            </button>
            <button
              onClick={() => {
                if (!user) {
                  window.location.href = "/login"; // ✅ redirect to login
                  return;
                }
                handleAddToCart(setData, user.id, desiredQty);
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
