import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";
import {
  CheckBadgeIcon,
  Squares2X2Icon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import FetchThemes from "../components/fetchThemes";
import BrickButton from "../components/BrickButton";
import Spinner from "../components/Spinner";
import Hero from "../assets/herobg.webp";
import SearchBoxWithFilters from "../components/searchBoxWithFilters";

// The home page ("/"): hero banner + search, an intro blurb, the theme
// button row, and a small grid of featured/recent sets.
export default function Landingpage() {
  const [legoSets, setLegoSets] = useState([]);
  // True until the initial fetch finishes, so we can show a spinner
  // instead of a briefly-empty grid.
  const [loadingSets, setLoadingSets] = useState(true);

  // On page load, fetch the 5 newest in-stock sets to show in the
  // "Featured Products" grid further down the page.
  useEffect(() => {
    async function loadSets() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .limit(7)
        .gt("stock", 0) // only sets that are actually in stock
        .order("release_year", { ascending: false }); // newest first

      if (error) {
        console.error("Error fetching sets: ", error);
      } else {
        setLegoSets(data);
      }
      setLoadingSets(false);
    }
    loadSets();
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section - full-width background image with a dark overlay
          so the white text stays readable on top of it. */}
      <div
        data-aos="fade-up"
        className="relative z-50 min-h-[80vh] w-full bg-cover bg-center flex flex-col items-start justify-center px-8"
        style={{ backgroundImage: `url(${Hero})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 max-w-3xl text-left text-white">
          <h1
            data-aos="fade-right"
            className="text-4xl md:text-6xl font-extrabold mb-4"
          >
            Build Your Dream Collection. One Set at a Time.
          </h1>
          <p data-aos="fade-left" className="text-lg md:text-xl mb-6">
            Explore our themes and sets and start building your dream LEGO®
            collection today!
          </p>

          {/* Modular Search + Filters - passing setLegoSets as onResults
              means typing a search here replaces the "Featured Products"
              grid below with the matching sets. */}
          <div data-aos="zoom-in" className="w-full max-w-md relative z-20">
            <SearchBoxWithFilters onResults={setLegoSets} />
          </div>

          {/* Feature Icons - just decorative trust badges, no logic here. */}
          <div
            data-aos="fade-up"
            className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold mt-6"
          >
            <span className="flex items-center gap-2">
              <CheckBadgeIcon className="h-5 w-5" />
              100% Authentic Sets
            </span>
            <span className="flex items-center gap-2">
              <Squares2X2Icon className="h-5 w-5" />
              Curated Collections
            </span>
            <span className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" />
              Fast & Secure Shipping
            </span>
          </div>
        </div>
      </div>

      {/* Introduction - static marketing copy about the store. */}
      <div
        data-aos="fade-up"
        className="py-10 px-6 rounded-lg shadow-md max-w-3xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">
          Rare & Retired LEGO Sets
        </h2>

        <p className="text-lg text-gray-700 mb-4">
          We sell rare retired LEGO sets. Whether you’re a collector or a
          builder, we’ve got something for you.
        </p>

        <p className="text-gray-600 leading-relaxed">
          <span className="font-bold">
            All advertised LEGO sets are in their original boxes and in good
            condition.
          </span>{" "}
          We also sell retired LEGO sets that have been built before. To ship
          them safely, we carefully break them down and pack all pieces into
          labeled plastic bags.
        </p>

        <p className="text-gray-600 leading-relaxed mt-4">
          These pre‑built sets are not advertised, but there’s a good chance we
          have the one you’re looking for. Contact us and we’ll let you know if
          it’s available. Pre‑built sets are offered at a very{" "}
          <span className="font-semibold text-green-600">generous price</span>!
        </p>

        <div className="mt-6 text-center">
          <BrickButton
            to="/contact"
            size="lg"
            onClick={() => window.scrollTo(0, 0)}
          >
            Contact Us
          </BrickButton>
        </div>
      </div>

      {/* Theme Options - the horizontally-scrolling colored buttons
          (Star Wars, Friends, ...), each one links to /products?theme=X */}
      <div data-aos="fade-up" className="w-full px-6 py-10">
        <FetchThemes />
      </div>

      {/* Featured Sets Grid - shows whatever's currently in `legoSets`:
          either the 5 newest sets from the initial fetch, or search
          results if the visitor used the search box above. */}
      <h2
        data-aos="fade-up"
        className="text-3xl font-bold text-black mb-10 text-center border-b-4 border-red-600 inline-block"
      >
        Featured Products
      </h2>
      <div className="flex justify-center">
        <BrickButton
          to="/products"
          size="lg"
          className="mb-4"
          onClick={() => window.scrollTo(0, 0)}
        >
          View All Products
        </BrickButton>
      </div>
      {loadingSets ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {legoSets.map((set, index) => (
          <Link
            key={set.set_id}
            to={`/products/${set.slug}`}
            data-aos="fade-up"
            data-aos-delay={index * 150} // staggered animation
            className="bg-white border border-gray-200 shadow-md rounded-lg p-6
                 hover:shadow-xl hover:scale-105 transform transition"
          >
            {/* Fixed-height image box + object-contain so every product
                photo lines up the same regardless of its original size. */}
            <div className="w-full h-56 flex items-center justify-center bg-gray-50 rounded-lg mb-4 overflow-hidden shadow-sm">
              <img
                src={set.image_url}
                alt={set.set_name}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {set.set_name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Theme:{" "}
              <span className="font-semibold">{set.themes?.theme_name}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Set Number:{" "}
              <span className="font-semibold">{set.set_number}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Release Year:{" "}
              <span className="font-semibold">{set.release_year}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Stock: <span className="font-semibold">{set.stock}</span>
            </p>
            <p className="text-lg font-semibold text-red-600">R{set.price}</p>
          </Link>
        ))}
      </div>
      )}
    </section>
  );
}
