import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";

// A rotating palette of LEGO-brick colors for the theme buttons below.
// Each theme button picks one of these by index (index % length), so the
// colors cycle red -> yellow -> pink -> green -> orange -> purple -> repeat.
const THEME_COLORS = [
  { bg: "bg-red-500", hover: "hover:bg-red-600", ring: "focus-visible:ring-red-300" },
  { bg: "bg-yellow-400", hover: "hover:bg-yellow-500", ring: "focus-visible:ring-yellow-200", text: "text-gray-900" },
  { bg: "bg-pink-500", hover: "hover:bg-pink-600", ring: "focus-visible:ring-pink-300" },
  { bg: "bg-green-600", hover: "hover:bg-green-700", ring: "focus-visible:ring-green-300" },
  { bg: "bg-orange-500", hover: "hover:bg-orange-600", ring: "focus-visible:ring-orange-300" },
  { bg: "bg-purple-500", hover: "hover:bg-purple-600", ring: "focus-visible:ring-purple-300" },
];

// Renders the horizontally-scrolling row of theme buttons (Star Wars,
// Friends, Ideas, ...) used on both the landing page and products page.
export default function ThemeNav() {
  const [themes, setThemes] = useState([]);

  // Fetch the list of theme names once when this component mounts.
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
      <h2 className="text-3xl font-bold text-black mb-10 text-center border-b-4 border-red-600 inline-block relative">
        View Themes
      </h2>
      {/* Scrollable Themes Row - overflow-x-auto lets it scroll sideways on
          small screens instead of wrapping; scrollbar-hide (in index.css)
          hides the ugly native scrollbar. */}
      <div
        id="themesRow"
        className="flex overflow-x-auto flex-nowrap space-x-4 pb-2 scrollbar-hide"
      >
        {themes.map((theme, index) => {
          // Pick a color from the palette based on this button's position,
          // wrapping back to the start once we run past the palette's length.
          const color = THEME_COLORS[index % THEME_COLORS.length];
          return (
            <Link
              key={theme.theme_name}
              to={`/products?theme=${encodeURIComponent(theme.theme_name)}`}
              className={`relative flex items-center justify-center min-w-35 px-6 py-3 rounded-xl
                         ${color.text ?? "text-white"} font-semibold ${color.bg} ${color.hover}
                         shadow-[0_4px_0_rgba(0,0,0,0.25)] border border-black/10
                         transition-all duration-150 ease-out
                         hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.25)]
                         active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.25)]
                         focus-visible:outline-none focus-visible:ring-4 ${color.ring}`}
            >
              {/* Stud decorations for a LEGO brick feel - two small circles
                  sitting on top of the button, purely decorative. */}
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-inner" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-inner" />
              </span>
              {theme.theme_name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
