export default function Landingpage() {
  return (
    <section className="bg-white min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-red-500 mb-6 text-center">
        Explore our available themes and sets and start building your dream
        collection!
      </h1>
      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
        Choose a theme or search for your favorite LEGO set.
      </p>

      {/* Theme Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <button className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transform transition">
          <span className="text-xl font-semibold text-gray-800">Star Wars</span>
        </button>
        <button className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transform transition">
          <span className="text-xl font-semibold text-gray-800">Technic</span>
        </button>
        <button className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transform transition">
          <span className="text-xl font-semibold text-gray-800">City</span>
        </button>
        <button className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transform transition">
          <span className="text-xl font-semibold text-gray-800">Friends</span>
        </button>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search for a theme or set number..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </section>
  );
}
