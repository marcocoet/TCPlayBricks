import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";

export default function ThemeNav() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function loadThemes() {
      const { data, error } = await supabase
        .from("themes")
        .select("theme_name");

      if (error) {
        console.error("Error fetching themes:", error);
      } else {
        setThemes(data);
      }
    }
    loadThemes();
  }, []);

  return (
    <div className="mt-2 text-center">
      <h2 className="text-3xl font-bold text-black mb-10 text-center border-b-4 border-blue-500 inline-block relative">
        View Themes
      </h2>
      {/* Scrollable Themes Row */}
      <div
        id="themesRow"
        className="flex overflow-x-auto flex-nowrap space-x-4 pb-2 scrollbar-hide"
      >
        {themes.map((theme) => (
          <Link
            key={theme.theme_name}
            to={`/products?theme=${encodeURIComponent(theme.theme_name)}`}
            className="flex items-center justify-center min-w-35 px-6 py-3 rounded-lg 
                       text-white font-semibold bg-blue-500 hover:bg-blue-600 
                       transition transform hover:scale-105 shadow-md"
          >
            {theme.theme_name}
          </Link>
        ))}
      </div>
    </div>
  );
}
