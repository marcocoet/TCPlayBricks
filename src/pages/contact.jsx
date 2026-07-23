import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build mailto link
    const subject = encodeURIComponent("LEGO Inquiry from " + formData.name);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
    );

    window.location.href = `mailto:tanijac4@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div
        data-aos="fade-up"
        className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8"
      >
        <h1 className="text-3xl font-bold text-blue-500 mb-6 text-center">
          Contact Us
        </h1>
        <p className="text-gray-700 mb-8 text-center">
          Have a question about our retired LEGO sets or want to check if we
          have a pre‑built set available? Fill out the form below and your email
          client will open with the details ready to send.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message
            </label>
            <textarea
              name="message"
              placeholder="Enter the details(name, number) of the set you are looking for or any other questions you have."
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold 
                       hover:bg-blue-600 transition-colors shadow-md"
          >
            Send Email
          </button>
        </form>
      </div>
      {/* Fallback Contact Info */}
      <div className="mt-8 text-center text-gray-600">
        <p>If your email client doesn’t open, please reach us directly:</p>
        <p className="mt-2">
          <span className="font-semibold">Email:</span>{" "}
          <a
            href="mailto:tanijac4@gmail.com"
            className="text-blue-500 hover:underline"
          >
            tanijac4@gmail.com
          </a>
        </p>
        <p>
          <span className="font-semibold">Phone:</span>{" "}
          <a href="tel:+27123456789" className="text-blue-500 hover:underline">
            +27 12 345 6789
          </a>
        </p>
      </div>
    </section>
  );
}
