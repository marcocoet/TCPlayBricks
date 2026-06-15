import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function CartPage({ user }) {
  const [cartItems, setCartItems] = useState([]);

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + item.lego_sets.price * item.quantity,
    0,
  );

  useEffect(() => {
    async function loadCart() {
      const { data, error } = await supabase
        .from("cart")
        .select("cart_id, quantity, lego_sets(*)")
        .eq("user_id", user.id);

      if (error) console.error("Error loading cart:", error);
      else setCartItems(data);
    }
    if (user) loadCart();
  }, [user]);

  async function updateQuantity(cartId, newQty) {
    if (newQty < 1) return; // prevent going below 1
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("cart_id", cartId);

    if (error) console.error("Error updating quantity:", error);
    else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartId ? { ...item, quantity: newQty } : item,
        ),
      );
    }
  }

  async function removeItem(cartId) {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("cart_id", cartId);
    if (error) console.error("Error removing item:", error);
    else setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
  }

  async function buyNow() {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id);
    if (error) console.error("Error during checkout:", error);
    else {
      alert("Checkout complete!");
      setCartItems([]);
    }
  }

  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li
              key={item.cart_id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{item.lego_sets.set_name}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_id, item.quantity - 1)
                    }
                    className="bg-gray-300 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.lego_sets.stock} // ✅ block if at stock limit
                    className={`px-2 py-1 rounded ${
                      item.quantity >= item.lego_sets.stock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-300"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.cart_id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <div className="mt-6">
          <p className="text-xl font-bold">Total: R{total}</p>
          <button
            onClick={buyNow}
            className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
          >
            Buy Now
          </button>
        </div>
      )}
    </section>
  );
}
