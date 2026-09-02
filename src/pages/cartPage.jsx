import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import BrickButton from "../components/BrickButton";
import Spinner from "../components/Spinner";
import { startPayfastCheckout } from "../utils/payfastCheckout";

// The "/cart" page: lists everything the logged-in user has added to their
// cart, lets them change quantities or remove items, calculates a delivery
// fee based on which PUDO parcel locker box the order fits into, and has
// the final "Buy Now" checkout button.
export default function CartPage({ user, refreshCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  // Whether we're still waiting on the initial cart fetch (as opposed to
  // cartItems just genuinely being empty).
  const [loadingCart, setLoadingCart] = useState(true);
  // Whether buyNow() is in flight - covers the brief gap between clicking
  // Buy Now and the browser actually navigating off to PayFast.
  const [isRedirecting, setIsRedirecting] = useState(false);
  // The buyer's nearest/preferred PUDO locker, typed in by hand (looked up
  // by the buyer themselves on PUDO's own app/site) - required at checkout
  // since it's the only way we know where to ship the order.
  const [pudoLocker, setPudoLocker] = useState("");

  // Calculate total price
  // Adds up (price * quantity) for every line in the cart.
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.lego_sets.price * item.quantity,
    0,
  );

  const [deliveryFee, setDeliveryFee] = useState(0);

  // Can every item in the cart (accounting for quantity) fit together in
  // this particular box? We only try two simple packing arrangements:
  //
  //   1. Side-by-side: every item sits next to the others along the box's
  //      width. So all the widths get added together, but the box still
  //      only needs to be as long/tall as the single biggest item.
  //   2. Stacked: every item sits on top of the others. So all the heights
  //      get added together, but the box only needs to be as long/wide as
  //      the single biggest item.
  //
  // If either arrangement fits (and the combined weight is within the
  // box's weight limit), we say this box works. This isn't a full 3D
  // bin-packing solver (it won't find a mixed grid layout), but it covers
  // the common cases well enough for a small cart.
  function packingFits(items, box) {
    // Weight is simple: it doesn't matter how things are arranged, the
    // combined weight either fits the box's limit or it doesn't.
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight_kg * item.quantity,
      0,
    );
    if (totalWeight > box.max_weight_kg) return false;

    // The biggest single item along each dimension - used as the "floor"
    // that the box must be at least this big regardless of arrangement.
    const maxLength = Math.max(...items.map((item) => item.length_cm));
    const maxWidth = Math.max(...items.map((item) => item.width_cm));
    const maxHeight = Math.max(...items.map((item) => item.height_cm));

    // If every unit (one item repeated `quantity` times) were lined up
    // side-by-side or stacked, how much total width/height would that take?
    const totalWidth = items.reduce(
      (sum, item) => sum + item.width_cm * item.quantity,
      0,
    );
    const totalHeight = items.reduce(
      (sum, item) => sum + item.height_cm * item.quantity,
      0,
    );

    // Side-by-side: widths add up, length/height stay at the largest item's size
    const sideBySideFits =
      totalWidth <= box.max_width_cm &&
      maxLength <= box.max_length_cm &&
      maxHeight <= box.max_height_cm;

    // Stacked: heights add up, length/width stay at the largest item's size
    const stackedFits =
      totalHeight <= box.max_height_cm &&
      maxLength <= box.max_length_cm &&
      maxWidth <= box.max_width_cm;

    return sideBySideFits || stackedFits;
  }

  // Finds the cheapest/smallest PUDO box that everything in `items` fits
  // into, or null if nothing fits in any available box.
  //filter boxes that fit
  async function getSmallestPudoBox(items) {
    const { data, error } = await supabase.from("pudo_boxes").select("*");
    if (error) {
      console.error("Error loading Pudo boxes:", error);
      return null;
    }

    const fittingBoxes = data.filter((box) => packingFits(items, box));

    // Sort by volume and pick the smallest
    // (Smaller volume roughly correlates with a cheaper box, since PUDO
    // pricing scales with box size.)
    fittingBoxes.sort(
      (a, b) =>
        a.max_length_cm * a.max_width_cm * a.max_height_cm -
        b.max_length_cm * b.max_width_cm * b.max_height_cm,
    );

    return fittingBoxes[0] || null;
  }

  // Whenever the cart contents change, re-figure-out which PUDO box the
  // whole order fits in, and use that box's price as the delivery fee.
  useEffect(() => {
    async function calculateDeliveryFee() {
      if (cartItems.length > 0) {
        // Flatten the cart into a plain list of { ...dimensions, quantity }
        // objects, since getSmallestPudoBox only cares about each set's
        // size/weight and how many of it we're buying - not the cart_id
        // or other cart-specific fields.
        const items = cartItems.map((item) => ({
          ...item.lego_sets,
          quantity: item.quantity,
        }));
        const box = await getSmallestPudoBox(items);
        setDeliveryFee(box ? box.price : 0);
      } else {
        // Cart is empty - no delivery fee to charge.
        setDeliveryFee(0);
      }
    }
    calculateDeliveryFee();
  });

  const total = subtotal + deliveryFee;

  // Load this user's cart whenever `user` becomes available (it starts out
  // null until App.jsx finishes checking the Supabase session).
  useEffect(() => {
    async function loadCart() {
      if (!user) {
        // No user yet - nothing to wait on.
        setCartItems([]);
        setLoadingCart(false);
        return;
      }
      // lego_sets(*) pulls in the full related product row (name, price,
      // image, dimensions, etc.) for each cart entry in one query.
      const { data, error } = await supabase
        .from("cart")
        .select("cart_id, quantity, lego_sets(*)")
        .eq("user_id", user.id);

      if (error) console.error("Error loading cart:", error);
      else setCartItems(data);
      setLoadingCart(false);
    }
    loadCart();
  }, [user]);

  // Updates one cart line's quantity, both in the database and in local
  // state (so the UI updates immediately without re-fetching everything).
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
      refreshCartCount?.();
    }
  }

  // Deletes one cart line entirely, both in the database and locally.
  async function removeItem(cartId) {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("cart_id", cartId);
    if (error) console.error("Error removing item:", error);
    else {
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
      refreshCartCount?.();
    }
  }

  // Kicks off PayFast checkout for the whole cart. isRedirecting stays
  // true on success on purpose - the page is about to navigate away, so
  // there's no "done" state to reset.
  async function buyNow() {
    if (!pudoLocker.trim()) {
      alert("Please enter your nearest PUDO locker before checking out.");
      return;
    }
    setIsRedirecting(true);
    try {
      await startPayfastCheckout(pudoLocker.trim());
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Something went wrong starting checkout. Please try again.");
      setIsRedirecting(false);
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-12">
      <h2 className="flex justify-center text-3xl font-bold text-black mb-10 text-center border-b-4 border-red-600 relative z-10 mx-auto w-fit">
        Your Cart
      </h2>

      <div className="max-w-3xl mx-auto">
        {loadingCart ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : !user ? (
          // No user yet - either they're not logged in, or App.jsx is still
          // finishing its session check (e.g. right after a fresh page load
          // like the redirect back from PayFast). Either way, don't touch
          // user.id until we actually have one.
          <div className="bg-white border border-gray-200 shadow-md rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-6">
              Please log in to view your cart.
            </p>
            <BrickButton to="/login" size="lg">
              Log In
            </BrickButton>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty state - nudge the visitor toward browsing products
          // instead of just showing a bare line of text.
          <div className="bg-white border border-gray-200 shadow-md rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-6">Your cart is empty.</p>
            <BrickButton to="/products" size="lg">
              Browse Products
            </BrickButton>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li
                  key={item.cart_id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-gray-200 shadow-md rounded-lg p-4"
                >
                  {/* Thumbnail - fixed-size box + object-contain so every
                      product photo lines up the same regardless of its
                      original size. */}
                  <div className="w-full sm:w-24 h-24 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.lego_sets.image_url}
                      alt={item.lego_sets.set_name}
                      loading="lazy"
                      decoding="async"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.lego_sets.set_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      R{item.lego_sets.price} each
                    </p>
                    {/* Quantity stepper for this line item. */}
                    <div className="flex items-center gap-2">
                      <BrickButton
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity - 1)
                        }
                        variant="gray"
                        size="sm"
                      >
                        -
                      </BrickButton>
                      <span className="w-6 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <BrickButton
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.lego_sets.stock}
                        variant="gray"
                        size="sm"
                      >
                        +
                      </BrickButton>
                    </div>
                  </div>

                  {/* This line's subtotal + a Remove button. */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <p className="font-semibold text-red-600">
                      R{item.lego_sets.price * item.quantity}
                    </p>
                    <BrickButton
                      onClick={() => removeItem(item.cart_id)}
                      variant="danger"
                      size="sm"
                    >
                      Remove
                    </BrickButton>
                  </div>
                </li>
              ))}
            </ul>

            {/* Order summary card: subtotal, calculated delivery fee, and
                the combined total, plus the checkout button. */}
            <div className="mt-8 bg-white border border-gray-200 shadow-md rounded-lg p-6 max-w-sm ml-auto">
              <div className="flex justify-between items-center text-lg font-bold mb-2">
                <span>Subtotal</span>
                <span className="text-gray-800">R{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mb-2">
                <span>Delivery Fee</span>
                <span className="text-gray-800">R{deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total</span>
                <span className="text-red-600">R{total}</span>
              </div>

              {/* Delivery locker - we ship via PUDO parcel lockers, so we
                  need to know which one to send the order to. */}
              <label className="block mb-4">
                <span className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Nearest PUDO Locker
                  </span>
                  <a
                    href="https://www.pudo.co.za/where-to-find-us.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Find your nearest locker &rarr;
                  </a>
                </span>
                <input
                  type="text"
                  placeholder="e.g. PUDO Locker - Clearwater Mall"
                  value={pudoLocker}
                  onChange={(e) => setPudoLocker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-red-500 text-sm
                         placeholder:text-gray-500"
                />
              </label>

              <BrickButton
                onClick={buyNow}
                variant="green"
                size="lg"
                className="w-full"
                disabled={isRedirecting || !pudoLocker.trim()}
              >
                {isRedirecting ? (
                  <>
                    <Spinner size="h-4 w-4" className="mr-2 border-2" />
                    Redirecting to PayFast...
                  </>
                ) : (
                  "Buy Now"
                )}
              </BrickButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
