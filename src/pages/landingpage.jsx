import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Link } from "react-router-dom";
import FetchThemes from "../components/fetchThemes";
import Hero from "../assets/herobg.png";
import SearchBoxWithFilters from "../components/searchBoxWithFilters";

export default function Landingpage() {
  const [legoSets, setLegoSets] = useState([]);

  useEffect(() => {
    async function loadSets() {
      const { data, error } = await supabase
        .from("lego_sets")
        .select("*")
        .limit(5)
        .gt("stock", 0)
        .order("release_year", { ascending: false });

      if (error) {
        console.error("Error fetching sets: ", error);
      } else {
        setLegoSets(data);
      }
    }
    loadSets();
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
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

          {/* Modular Search + Filters */}
          <div data-aos="zoom-in" className="w-full max-w-md relative">
            <SearchBoxWithFilters onResults={setLegoSets} />
          </div>

          {/* Feature Icons */}
          <div
            data-aos="fade-up"
            className="flex space-x-8 text-sm font-semibold mt-6"
          >
            <span>100% Authentic Sets</span>
            <span>Curated Collections</span>
            <span>Fast & Secure Shipping</span>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div
        data-aos="fade-up"
        className="py-10 px-6 rounded-lg shadow-md max-w-3xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-blue-500 mb-6 text-center">
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
          <Link
            to="/contact"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold 
                 hover:bg-blue-600 transition-colors shadow-md"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Theme Options */}
      <div data-aos="fade-up" className="w-full px-6 py-10">
        <FetchThemes />
      </div>

      {/* Featured Sets Grid */}
      <h2
        data-aos="fade-up"
        className="text-3xl font-bold text-black mb-10 text-center border-b-4 border-blue-500 inline-block"
      >
        Featured Products
      </h2>
      <div className="flex justify-center">
        <Link
          to="/products"
          onClick={() => window.scrollTo(0, 0)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold 
                 hover:bg-blue-600 transition-colors shadow-md mb-4"
        >
          View All Products
        </Link>
      </div>
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
            <img
              src={set.image_url}
              alt={set.set_name}
              className="w-full max-h-92 object-cover rounded-lg mb-4 shadow-sm"
            />
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
            <p className="text-lg font-semibold text-blue-600">R{set.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
