import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabase/supabaseClient";

export default function Header({ user }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        if (!error) {
          setProfile(data);
        } else {
          console.error("Error loading profile:", error);
        }
      }
    }
    loadProfile();
  }, [user]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      window.location.href = "/login";
    }
  }

  return (
    <header className="bg-white text-gray-800 p-4">
      <nav className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide">
          TC <span className="text-red-500">Play</span>Bricks
        </h1>

        {/* Navigation */}
        <div className="flex space-x-6 items-center">
          <Link
            to="/"
            className="hover:text-red-500 hover:scale-110 transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-red-500 hover:scale-110 transition"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="hover:text-red-500 hover:scale-110 transition"
          >
            Contact
          </Link>

          {!user ? (
            <>
              <Link
                to="/signup"
                className="hover:text-red-500 hover:scale-110 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="hover:text-red-500 hover:scale-110 transition"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              {/* Show email from profiles table */}
              {profile && (
                <span className="text-gray-700 font-medium">
                  {profile.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}

          {/* ShoppingCart */}
          <Link
            to={user ? "/cart" : "/login"} // ✅ if not logged in → go to login
            className="hover:text-red-500 hover:scale-110 transition"
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
