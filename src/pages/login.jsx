import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import BrickButton from "../components/BrickButton";
import GoogleSignInButton from "../components/GoogleSignInButton";
export default function Login() {
  // One object holding both form fields, updated by handleChange below.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  // Lets us redirect the user programmatically after a successful login.
  const navigate = useNavigate();

  // Generic input handler: uses the input's `name` attribute to update the
  // matching key in formData, so one function works for both fields.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from doing a full page reload on submit
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");
      console.log("User: ", formData.user);
      navigate("/"); // send them to the home page once logged in
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        data-aos="fade-up"
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
          Login
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mb-6 text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-red-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <BrickButton type="submit" className="w-full">
          Login
        </BrickButton>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleSignInButton />
      </form>
    </div>
  );
}
