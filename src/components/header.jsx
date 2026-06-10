import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <header className="bg-white text-gray-800 p-4 ">
      <nav className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide">
          TC <span className="text-red-500">Play</span>Bricks
        </h1>

        {/* Navigation */}
        <div className="flex space-x-6">
          <Link
            to="/"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            Contact
          </Link>
          <Link
            to="/signup"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            Login
          </Link>
          {/* ShoppingCart */}
          <Link
            to="/cart"
            className="hover:text-red-500 transform hover:scale-110 transition duration-200"
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
