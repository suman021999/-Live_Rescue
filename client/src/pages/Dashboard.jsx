import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../common/Sidebar/Sidebar";
import Navbar from "../common/Navbar/Navbar";
import MyAccount from "../components/MyAccount/MyAccount";
import EmContact from "../components/EmContact/EmContact";
import Security from "../components/Security/Security";


const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col">

      {/* Top Navbar */}
      <Navbar />

      {/* Layout */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <Sidebar />

        {/* Page Content — offset by sidebar width so content is centered in remaining space */}
        <div className="flex-1 ml-0 md:ml-64 p-4 sm:p-6">
          <Routes>
            <Route path="my_account" element={<MyAccount />} />
            <Route path="emergency_contact" element={<EmContact/>} />
            <Route path="privacy" element={<Security/>} />
            
          </Routes>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
