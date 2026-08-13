import BrickButton from "../components/BrickButton";

// Shown after PayFast redirects the browser back here post-payment.
// Note: this page appearing doesn't by itself prove payment succeeded -
// that confirmation comes from the payfast-notify webhook separately,
// which is the thing that actually marks the sale "paid" and clears the
// cart. This page is just a friendly landing spot for the user.
export default function OrderSuccess() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-12 max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thanks for your order! We're processing it now and will be in touch
          with delivery details soon.
        </p>
        <BrickButton to="/products" size="lg">
          Continue Shopping
        </BrickButton>
      </div>
    </section>
  );
}
