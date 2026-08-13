import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";
import BrickButton from "../components/BrickButton";

// "/forgot-password": collects an email and asks Supabase to send a
// password-reset link to it. Doesn't log the user in or check anything
// about the account here - the actual password change happens on
// resetPassword.jsx once they click the link in that email.
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // redirectTo tells Supabase which page of our site the reset link
    // should send the user back to. That page (resetPassword.jsx) then
    // uses the recovery session Supabase attaches to the URL to let them
    // actually set a new password.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      // Show the same "check your email" message whether or not the
      // address is registered - this avoids revealing which emails have
      // accounts on the site.
      setSent(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        data-aos="fade-up"
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
          Forgot Password
        </h2>

        {sent ? (
          <>
            <p className="text-gray-700 text-center mb-6">
              If an account exists for that email, a password reset link has
              been sent. Check your inbox (and spam folder).
            </p>
            <BrickButton to="/login" size="lg" className="w-full">
              Back to Login
            </BrickButton>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-600 mb-6 text-center">
              Enter the email address on your account and we'll send you a
              link to reset your password.
            </p>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <BrickButton type="submit" className="w-full">
              Send Reset Link
            </BrickButton>
            <p className="text-sm text-gray-600 text-center mt-4">
              <Link to="/login" className="text-red-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
