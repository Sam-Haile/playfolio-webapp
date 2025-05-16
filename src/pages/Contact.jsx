import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("https://formspree.io/f/xvgalrvr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    if (response.ok) {
      alert("Thanks for your message!");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    } else {
      alert("Something went wrong. Please try again later.");
    }
  } catch (error) {
    console.error("Error sending form:", error);
    alert("There was an error sending your message.");
  }
};


  return (
    <div className="relative min-h-screen">
      <Header
        showSearchBar={true}
        showNavButtons={true}
        showLoginButtons={true}
        zIndex={1000}
      />

      <div className="md:mx-[15%] mx-[5%] pt-36 pb-52 max-w-3xl text-white">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p className="mb-6">
          Have a question, found a bug, or want to suggest a feature? Fill out the form below or email us directly at{" "}
          <a
            href="mailto:playfolio.contact@gmail.com"
            className="text-primaryPurple-500 underline"
          >
            playfolio.contact@gmail.com
          </a>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Hidden subject override field (Formspree supports this) */}
  <input
    type="hidden"
    name="_subject"
    value="New message from Playfolio Contact Form"
/>

          <div>
            <label className="block text-sm mb-1" htmlFor="name">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-customBlack border border-customGray-800 rounded text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Your Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-customBlack border border-customGray-800 rounded text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="subject">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-customBlack border border-customGray-800 rounded text-white focus:outline-none"
            >
              <option value="general">General Inquiry</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-customBlack border border-customGray-800 rounded text-white focus:outline-none resize-y"
            />
          </div>

          <button
            type="submit"
            className=" px-6 py-2 bg-primaryPurple-500 hover:bg-primaryPurple-700 rounded text-white"
          >
            Send Message
          </button>
        </form>

        {/*
        // Optional Social Media Links
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Connect with Us</h2>
          <ul className="flex space-x-4">
            <li><a href="#" className="text-primaryPurple-500 hover:underline">Twitter</a></li>
            <li><a href="#" className="text-primaryPurple-500 hover:underline">Discord</a></li>
            <li><a href="#" className="text-primaryPurple-500 hover:underline">GitHub</a></li>
          </ul>
        </div>
        */}
      </div>

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
