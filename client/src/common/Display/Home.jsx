import { useNavigate } from "react-router-dom";
import calls from "/backround UI/calls.jpeg";
import { Sparkle } from "lucide-react";

export default function Home() {
  const navigate=useNavigate()
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div id="home" className="w-full min-h-screen bg-white">
      {/* ─── Navbar ───────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold leading-none">+</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">LiveRescue</h1>
        </div>

        {/* Links */}
        <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
          <li
            onClick={() => scrollToSection("home")}
            className="hover:text-black cursor-pointer"
          >
            Home
          </li>
          <li
            onClick={() => scrollToSection("services")}
            className="hover:text-black cursor-pointer"
          >
            Services
          </li>
          <li
            onClick={() => scrollToSection("workflow")}
            className="hover:text-black cursor-pointer"
          >
            How It Works
          </li>
          <li
            onClick={() => scrollToSection("contact")}
            className="hover:text-black cursor-pointer"
          >
            Contact
          </li>
        </ul>

        {/* CTA */}
        <div className="flex gap-4"> 
 <button
          onClick={() => navigate("/auth")}
          className="bg-orange-500 cursor-pointer text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
        >
          Log In
        </button>

        <button
            onClick={() => navigate("/view_plans")}
            className="text-sm text-white bg-orange-500 rounded-lg px-3 py-1.5 flex items-center gap-1.5 font-medium transition-all duration-200 hover:bg-orange-600 hover:shadow-md hover:scale-105"
          >
            <Sparkle className="w-4 h-4" />
            View Plans 
          </button>
        </div>
       

     
      </nav>

      {/* ─── Hero Section ───────────────────────── */}
      <div className="grid md:grid-cols-2 items-center px-8 md:px-16 lg:px-24 py-12 gap-10">
        {/* Left Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Emergency Help <br />
            When You Need <br />
            It Most
          </h1>

          <p className="mt-6 text-gray-500 text-lg max-w-md">
            Connect with emergency responders instantly through secure video
            calls, 24/7
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
              Start Video Call
            </button>

            <button className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full h-100 md:h-125">
          <img
            src={calls}
            alt="Emergency Support"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
