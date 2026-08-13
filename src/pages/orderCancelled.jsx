import BrickButton from "../components/BrickButton";

// Shown if the user cancels out of PayFast's checkout page. No payment
// was taken, and their cart is untouched (buyNow() never deletes the
// cart anymore - only a successful webhook does).
export default function OrderCancelled() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-12 max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled and no money was taken. Your cart is still
          saved if you'd like to try again.
        </p>
        <BrickButton to="/cart" size="lg">
          Back to Cart
        </BrickButton>
      </div>
    </section>
  );
}
