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
import BrickButton from "./BrickButton";

// The site header/nav bar, shown on every page via MainLayout.
// `user` is passed down from App.jsx so we know whether to show
// Login/Sign Up or the logged-in user's email + Logout button.
export default function Header({ user, cartCount = 0 }) {
  // profile holds extra info about the logged-in user (their email, looked
  // up from our own "profiles" table rather than the auth system directly).
  const [profile, setProfile] = useState(null);
  // Whether the mobile hamburger dropdown menu is open.
  const [menuOpen, setMenuOpen] = useState(false);

  // Whenever `user` changes (login/logout), fetch that user's profile row.
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single(); // .single() expects exactly one row back

        if (!error) {
          setProfile(data);
        } else {
          console.error("Error loading profile:", error);
        }
      }
    }
    loadProfile();
  }, [user]);

  // Signs the user out via Supabase, then hard-redirects to /login.
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

        {/* Hamburger (mobile only) - only visible below the `sm` breakpoint,
            toggles the mobile dropdown menu further down this file. */}
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

        {/* Navigation (desktop) - hidden on mobile, shown from `sm` up.
            Each NavLink's className is a function of isActive, so the
            current page's link gets highlighted red automatically. */}
        <div className="hidden sm:flex space-x-2 md:space-x-4 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                isActive
                  ? "bg-red-600 text-white"
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
                  ? "bg-red-600 text-white"
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
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            Contact
          </NavLink>

          {/* Show Sign Up / Login when logged out, or the user's email +
              Logout button when logged in. */}
          {!user ? (
            <>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `px-2 py-1 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition ${
                    isActive
                      ? "bg-red-600 text-white"
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
                      ? "bg-red-600 text-white"
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
              <BrickButton onClick={handleLogout}>Logout</BrickButton>
            </>
          )}

          {/* ShoppingCart - if not logged in, send them to /login instead
              of /cart (the cart page needs a user to load their items). */}
          <NavLink
            to={user ? "/cart" : "/login"}
            className="relative p-2 rounded-md hover:bg-gray-100 transition"
          >
            <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Mobile dropdown menu - same links as above, stacked vertically,
          only rendered when the hamburger button has toggled menuOpen on. */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col space-y-2 px-4 pb-4">
          <NavLink
            to="/"
            className="px-4 py-2 rounded-md bg-red-600 text-white"
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className="px-4 py-2 rounded-md bg-red-600 text-white"
          >
            Products
          </NavLink>
          <NavLink
            to="/contact"
            className="px-4 py-2 rounded-md bg-red-600 text-white"
          >
            Contact
          </NavLink>
          {!user ? (
            <>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-md bg-red-600 text-white"
              >
                Sign Up
              </NavLink>
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-md bg-red-600 text-white"
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
              <BrickButton onClick={handleLogout} className="w-full">
                Logout
              </BrickButton>
            </>
          )}
          <NavLink
            to={user ? "/cart" : "/login"}
            className="px-4 py-2 rounded-md bg-red-600 text-white"
          >
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
        </div>
      )}
    </header>
  );
}
