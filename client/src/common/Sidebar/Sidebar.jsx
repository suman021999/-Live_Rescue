import React from "react";
import { NavLink } from "react-router-dom";
import { menu } from "../data";

const Sidebar = () => {
  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-50 p-4 border-r border-gray-200 flex-col">
        <div className="mt-16 flex flex-col gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${isActive ? "bg-orange-200 text-orange-500" : "text-gray-500 hover:bg-gray-100"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? "text-orange-500" : "text-gray-400"}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-stretch justify-around h-16">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-1 transition
                ${isActive ? "text-orange-500" : "text-gray-400"}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-xl transition ${isActive ? "bg-orange-100" : ""}`}
                  >
                    <Icon
                      size={19}
                      className={isActive ? "text-orange-500" : "text-gray-400"}
                    />
                  </div>
                  <span className="text-[10px] font-medium leading-none tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
