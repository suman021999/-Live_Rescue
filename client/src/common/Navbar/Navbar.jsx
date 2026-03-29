import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold leading-none">+</span>
          </div>
        <span className="font-semibold text-sm text-gray-800">
          LiveRescue
        </span>
      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/emergency")}
        className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
      >
        <Home size={14} />
        Back to Hub
      </button>

    </header>
  );
};

export default Navbar;