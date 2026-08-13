import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabase/supabaseClient";
import BrickButton from "../components/BrickButton";
import Spinner from "../components/Spinner";
import { startPayfastCheckout } from "../utils/payfastCheckout";

// The single-product detail page, e.g. "/products/batmobile-tumbler".
// Shows one set's photo/details and handles adding it to the cart.
export default function ProductPage({ refreshCartCount }) {
  // useParams() reads the ":slug" part of the route path defined in App.jsx.
  const { slug } = useParams();
  const [setData, setSetData] = useState(null); // the product itself, once loaded
  const [user, setUser] = useState(null); // logged-in user (needed to add to cart)
  const [desiredQty, setDesiredQty] = useState(1); // quantity picker value
  // Whether "Buy it Now" is in flight (adding to cart + redirecting to
  // PayFast) - same idea as the cart page's isRedirecting.
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Every in-stock set's slug, in the same newest-first order as the main
  // products grid - lets the prev/next arrows step through sets without
  // going back to the listing page.
  const [orderedSlugs, setOrderedSlugs] = useState([]);

  // Fetch the ordering once - it doesn't depend on which product we're
  // currently viewing.
  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("slug")
        .gt("stock", 0)
        .order("release_year", { ascending: false });

      if (error) console.error("Error fetching set order:", error);
      else setOrderedSlugs(data.map((set) => set.slug));
    }
    loadOrder();
  }, []);

  const currentIndex = orderedSlugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? orderedSlugs[currentIndex - 1] : null;
  const nextSlug =
    currentIndex !== -1 && currentIndex < orderedSlugs.length - 1
      ? orderedSlugs[currentIndex + 1]
      : null;

  // Reset the quantity picker whenever we land on a different product, so
  // it doesn't carry over the previous set's selected quantity. Adjusting
  // state directly during render (React's recommended pattern for this)
  // instead of in a useEffect avoids an extra render pass.
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setDesiredQty(1);
  }

  // ✅ Get logged-in user
  // We fetch the user ourselves here (rather than getting it from App.jsx)
  // since this page needs it specifically for the "Add to Cart" flow.
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
  // Re-runs if the slug in the URL changes (e.g. navigating from one
  // product page directly to another).
  useEffect(() => {
    async function fetchSet() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .eq("slug", slug)
        .single(); // exactly one row expected for a given slug

      if (error) console.error("Error fetching product:", error);
      else setSetData(data);
    }
    fetchSet();
  }, [slug]);

  // While the product is still loading (or if the slug didn't match
  // anything), show a spinner instead of crashing on setData.field.
  if (!setData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ✅ Update instead of insert
  // Adds `qty` of `set` to the given user's cart - or, if it's already in
  // there, adds `qty` on top of the existing quantity instead of creating
  // a duplicate row. Pass `silent: true` to skip the success alert (used
  // by "Buy it Now", which redirects away immediately afterward). Throws
  // on any failure so callers like handleBuyItNow can stop before
  // attempting checkout.
  async function handleAddToCart(set, userId, qty = 1, { silent = false } = {}) {
    // Step 1: Check if item already exists
    const { data: existing, error: selectError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("set_id", set.set_id)
      .maybeSingle(); // like .single() but returns null instead of erroring if no row exists

    if (selectError) {
      console.error("Error checking cart:", selectError);
      throw selectError;
    }

    // Step 2: Check available stock
    const { data: product, error: productError } = await supabase
      .from("lego_sets")
      .select("stock")
      .eq("set_id", set.set_id)
      .single();

    if (productError) {
      console.error("Error fetching product stock:", productError);
      throw productError;
    }

    const availableStock = product.stock;

    if (existing) {
      // Step 3: Calculate new quantity
      const newQty = existing.quantity + qty;

      if (newQty > availableStock) {
        alert(`Not enough stock! Only ${availableStock} available.`);
        throw new Error("Not enough stock");
      }

      // Step 4: Update quantity
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: newQty })
        .eq("cart_id", existing.cart_id);

      if (updateError) {
        console.error("Error updating cart:", updateError);
        throw updateError;
      }
      if (!silent) alert(`${set.set_name} quantity updated to ${newQty}!`);
      refreshCartCount?.();
    } else {
      if (availableStock < 1) {
        alert("This item is out of stock!");
        throw new Error("Out of stock");
      }

      // Step 3: Insert new row if item doesn’t exist
      const { error: insertError } = await supabase.from("cart").insert([
        {
          user_id: userId,
          set_id: set.set_id,
          quantity: qty,
        },
      ]);

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        throw insertError;
      }
      if (!silent) alert(`${set.set_name} added to cart!`);
      refreshCartCount?.();
    }
  }

  // "Buy it Now": adds the selected quantity to the cart, then immediately
  // sends the browser to PayFast checkout for the whole cart (same
  // redirect the cart page's "Buy Now" uses).
  async function handleBuyItNow() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setIsRedirecting(true);
    try {
      await handleAddToCart(setData, user.id, desiredQty, { silent: true });
    } catch {
      // handleAddToCart already alerted the specific reason (out of
      // stock, etc.), so just stop here without a second generic alert.
      setIsRedirecting(false);
      return;
    }
    try {
      await startPayfastCheckout();
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Something went wrong starting checkout. Please try again.");
      setIsRedirecting(false);
    }
  }

  const arrowButtonClasses =
    "flex items-center justify-center h-11 w-11 rounded-full bg-white shadow-md border border-gray-200 transition hover:bg-gray-100 hover:scale-105";

  return (
    <section className="relative bg-gray-50 min-h-screen flex items-center justify-center py-12 px-6">
      {/* Prev/Next arrows - step through every in-stock set (newest first,
          same order as the products grid) without going back to /products. */}
      {prevSlug ? (
        <Link
          to={`/products/${prevSlug}`}
          aria-label="Previous set"
          className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 ${arrowButtonClasses}`}
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 opacity-30 cursor-not-allowed ${arrowButtonClasses}`}
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </span>
      )}
      {nextSlug ? (
        <Link
          to={`/products/${nextSlug}`}
          aria-label="Next set"
          className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 ${arrowButtonClasses}`}
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 opacity-30 cursor-not-allowed ${arrowButtonClasses}`}
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </span>
      )}

      {/* grid-cols-1 md:grid-cols-2 -> image and details stack on mobile,
          sit side-by-side from the md breakpoint up. */}
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
            <span className="text-lg text-red-600 font-semibold">
              R{setData.price}
            </span>
          </p>
          {/* Quantity stepper - clamps to a minimum of 1, and disables the
              "+" button once desiredQty reaches available stock. */}
          <div className="flex items-center space-x-2 mb-4">
            <BrickButton
              onClick={() => setDesiredQty(Math.max(1, desiredQty - 1))}
              variant="gray"
              size="sm"
            >
              -
            </BrickButton>
            <span>{desiredQty}</span>
            <BrickButton
              onClick={() => setDesiredQty(desiredQty + 1)}
              disabled={desiredQty >= setData.stock}
              variant="gray"
              size="sm"
            >
              +
            </BrickButton>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col space-y-1.5">
            <BrickButton
              size="lg"
              variant="green"
              disabled={isRedirecting}
              onClick={handleBuyItNow}
            >
              {isRedirecting ? (
                <>
                  <Spinner size="h-4 w-4" className="mr-2 border-2" />
                  Redirecting to PayFast...
                </>
              ) : (
                "Buy it Now"
              )}
            </BrickButton>
            <BrickButton
              size="lg"
              disabled={isRedirecting}
              onClick={() => {
                if (!user) {
                  window.location.href = "/login"; // ✅ redirect to login
                  return;
                }
                handleAddToCart(setData, user.id, desiredQty).catch(() => {});
              }}
            >
              Add to Cart
            </BrickButton>
          </div>
        </div>
      </div>
    </section>
  );
}
