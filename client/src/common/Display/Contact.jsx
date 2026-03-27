import React from "react";
import { Phone } from "lucide-react";

const Contact = () => {
  return (
    <footer id="contact" className="bg-[#0f172a] text-gray-300 px-6 md:px-16 py-8">
      
      {/* TOP ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-700 pb-6">
        
        {/* LEFT - LOGO */}
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold leading-none">+</span>
          </div>
          <span>LiveRescue</span>
        </div>

        {/* CENTER - LINKS */}
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        {/* RIGHT - PHONE */}
        <div className="flex items-center gap-2 text-sm text-white">
          <Phone size={16} />
          <span className="font-medium">1-800-RESCUE</span>
        </div>
      </div>

      {/* BOTTOM TEXT */}
      <div className="text-center text-xs text-gray-400 mt-6">
        © 2024 LiveRescue. All rights reserved. Emergency services available worldwide.
      </div>

    </footer>
  );
};

export default Contact;