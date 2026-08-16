import { Link } from "react-router-dom";

// Simple site footer shown at the bottom of every page via MainLayout.
export default function footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center space-y-1">
        <p>&copy; 2024 TC PlayBricks. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <Link to="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <span aria-hidden="true">|</span>
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
