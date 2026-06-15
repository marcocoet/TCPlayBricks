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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      {themes.map((theme) => (
        <Link
          key={theme.theme_name}
          to={`/products?theme=${encodeURIComponent(theme.theme_name)}`}
          className="bg-white shadow-md rounded-lg p-6 text-center 
             hover:bg-red-500 hover:text-white 
             transition transform hover:scale-105 font-semibold"
        >
          {theme.theme_name}
        </Link>
      ))}
    </div>
  );
}
