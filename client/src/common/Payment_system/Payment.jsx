import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState(4999);
  const [timeLeft, setTimeLeft] = useState(300);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Dynamic UPI QR value
  const upiLink = `upi://pay?pa=demo@upi&pn=DemoStore&am=${amount}&cu=INR`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/view_plans")}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 
                   bg-white shadow-md rounded-lg hover:bg-gray-100 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-225 bg-white rounded-xl shadow-lg flex overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-[#f6efe4] p-6">
          <h2 className="text-gray-700 text-sm mb-2">PAYMENT TO</h2>
          <h1 className="text-lg font-semibold mb-6">DemoStore Inc.</h1>

          <h2 className="text-gray-700 text-sm">AMOUNT TO PAY</h2>

          {/* INPUT FIELD */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-2xl font-bold mt-1 mb-4 px-3 py-2 border rounded-md outline-none no-spinner"
          />

          <h2 className="text-gray-700 text-sm mb-2">
            SELECT PAYMENT METHOD
          </h2>

          <div className="border-2 border-yellow-400 rounded-lg p-4 bg-white flex items-center gap-3 cursor-pointer">
            <div className="bg-yellow-100 p-2 rounded-md">
              <CheckCircle className="text-yellow-500 w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Scan QR Code</p>
              <p className="text-xs text-gray-500">Any UPI App</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/3 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Scan QR to Pay</h2>

          <p className="text-lg font-medium text-gray-700 mb-6">
            Pay ₹{amount || 0}
          </p>

          {/* QR CODE */}
          <div className="flex justify-center mb-4">
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <QRCodeCanvas value={upiLink} size={180} />
            </div>
          </div>

          {/* TIMER */}
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full w-fit mx-auto mb-6">
            <Clock className="w-4 h-4" />
            <span>QR expires in {formatTime()}</span>
          </div>

          {/* UPI APPS */}
          <div className="flex justify-center gap-4 mb-6">
            {["G Pay", "PhonePe", "Razorpay"].map((app, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2 rounded-lg 
                 bg-[#f5efe6] border border-[#e2c9a6] 
                 text-gray-700 text-sm font-medium"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-green-500">
                  <CheckCircle className="text-green-500 w-3 h-3" />
                </div>
                {app}
              </div>
            ))}
          </div>

          {/* MANUAL UPI */}
          <p className="text-gray-400 text-sm mb-2">OR</p>

          <div className="flex justify-center gap-2">
            <input
              type="text"
              placeholder="username@bankname"
              className="border px-4 py-2 rounded-md w-64 outline-none"
            />
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
              Verify & Pay
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Payments are processed securely by Razorpay infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;