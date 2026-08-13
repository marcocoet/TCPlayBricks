import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import BrickButton from "../components/BrickButton";
import { getPasswordStrengthError } from "../utils/passwordStrength";

// "/reset-password": where the link in the password-reset email points.
// Supabase's client automatically reads the special token in the URL and
// turns it into a temporary "recovery" session - once that's in place,
// calling supabase.auth.updateUser({ password }) sets the new password.
export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  // null while we're still checking for a valid recovery session, then
  // true/false once we know whether this page was reached via a real
  // reset-password link.
  const [hasRecoverySession, setHasRecoverySession] = useState(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase fires this event once it's parsed a valid recovery token
    // from the URL and established the temporary session for it.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoverySession(true);
      }
    });

    // The event above can fire before this listener attaches, so also
    // check directly in case a session already exists from it.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasRecoverySession(true);
    });

    // Give the URL-parsing a moment before concluding there's no valid
    // recovery link, rather than flashing the error state immediately.
    const timeout = setTimeout(() => {
      setHasRecoverySession((current) => current ?? false);
    }, 1500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const passwordError = getPasswordStrengthError(formData.password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    if (error) {
      alert(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        data-aos="fade-up"
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
          Reset Password
        </h2>

        {hasRecoverySession === null ? (
          <p className="text-gray-600 text-center">Checking your link...</p>
        ) : hasRecoverySession === false ? (
          <p className="text-gray-600 text-center">
            This password reset link is invalid or has expired. Request a
            new one from the{" "}
            <a href="/forgot-password" className="text-red-600 hover:underline">
              forgot password
            </a>{" "}
            page.
          </p>
        ) : done ? (
          <p className="text-gray-600 text-center">
            Your password has been updated. Redirecting you now...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your new password"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters, with uppercase, lowercase, a number,
                and a special character.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <BrickButton type="submit" className="w-full">
              Update Password
            </BrickButton>
          </form>
        )}
      </div>
    </div>
  );
}
