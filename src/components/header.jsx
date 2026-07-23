import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../supabase/supabaseClient";
import { HomeIcon } from "@heroicons/react/16/solid";
import Logo from "../assets/TC_PlayBricks_Logo.png";

export default function Header({ user }) {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="bg-white text-gray-800 shadow-md">
      <nav className="container mx-auto flex justify-between items-center px-3 py-2 sm:px-6 sm:py-3">
        {/* Logo */}
        <img
          alt="Logo"
          src={Logo}
          className="h-full max-h-30 object-contain"
          loading="lazy"
        />

        {/* Hamburger (mobile only) */}
        <button
          className="sm:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-800" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-800" />
          )}
        </button>

        {/* Navigation (desktop) */}
        <div className="hidden sm:flex space-x-2 md:space-x-4 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            <HomeIcon className="h-4 w-4 mr-1 sm:h-5 sm:w-5" />
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            Contact
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`
                }
              >
                Sign Up
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`
                }
              >
                Login
              </NavLink>
            </>
          ) : (
            <>
              {profile && (
                <span className="text-gray-700 font-bold text-sm sm:text-base">
                  {profile.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-white text-sm sm:text-base bg-blue-500 hover:opacity-90 transition"
              >
                Logout
              </button>
            </>
          )}

          {/* ShoppingCart */}
          <NavLink
            to={user ? "/cart" : "/login"}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
          </NavLink>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col space-y-2 px-4 pb-4">
          <NavLink
            to="/"
            className="px-4 py-2 rounded-md bg-blue-500 text-white"
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className="px-4 py-2 rounded-md bg-blue-500 text-white"
          >
            Products
          </NavLink>
          <NavLink
            to="/contact"
            className="px-4 py-2 rounded-md bg-blue-500 text-white"
          >
            Contact
          </NavLink>
          {!user ? (
            <>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
              >
                Sign Up
              </NavLink>
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
              >
                Login
              </NavLink>
            </>
          ) : (
            <>
              {profile && (
                <span className="px-4 py-2 text-gray-700 font-bold">
                  {profile.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md font-semibold text-white bg-blue-500 hover:opacity-90 transition"
              >
                Logout
              </button>
            </>
          )}
          <NavLink
            to={user ? "/cart" : "/login"}
            className="px-4 py-2 rounded-md bg-blue-500 text-white"
          >
            Cart
          </NavLink>
        </div>
      )}
    </header>
  );
}
