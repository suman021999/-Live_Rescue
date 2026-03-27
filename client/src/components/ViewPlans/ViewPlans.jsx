import React, { useState } from "react";
import { Check, X, Zap, Star } from "lucide-react";
import Navbar from "../../common/Navbar/Navbar";
import { plans, perks } from "../../common/data";

const ViewPlans = () => {
  const [billing, setBilling] = useState("monthly");

  return (
    <div className="min-h-screen bg-white font-sans pt-16">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <div className="text-center px-6 pt-12 pb-8">
        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <Star size={12} fill="currentColor" /> Simple, transparent pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          Choose your rescue plan
        </h1>
        <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
          Get the help you need, when you need it most. Upgrade anytime, cancel
          anytime.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 mt-6">
          {["monthly", "yearly"].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                billing === b
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Yearly"}
              {b === "yearly" && (
                <span className="ml-1.5 text-xs text-orange-500 font-semibold">
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-5 pb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 flex flex-col ${
              plan.highlighted
                ? "border-orange-400 shadow-lg shadow-orange-100"
                : "border-gray-200"
            }`}
          >
            {/* Badge */}
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-4">
              <p
                className={`text-sm font-bold mb-1 ${plan.highlighted ? "text-orange-500" : "text-gray-700"}`}
              >
                {plan.name}
              </p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price[billing] === 0 ? "$0" : `$${plan.price[billing]}`}
                </span>
                <span className="text-xs text-gray-400 mb-1.5">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs">
                  {f.included ? (
                    <Check size={14} className="text-orange-400 shrink-0" />
                  ) : (
                    <X size={14} className="text-gray-300 shrink-0" />
                  )}
                  <span
                    className={f.included ? "text-gray-600" : "text-gray-300"}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.ctaDisabled ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-orange-200 text-orange-400 bg-white cursor-default"
              >
                {plan.cta}
              </button>
            ) : (
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold bg-orange-400 hover:bg-orange-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-orange-100">
                <Zap size={14} />
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Perks Strip */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-10">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Everything included in Premium
        </p>
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {perks.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon size={18} className="text-orange-500" />
              </div>
              <p className="text-xs font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-300 py-6">
        No contracts. Cancel anytime. All prices in USD.
      </p>
    </div>
  );
};

export default ViewPlans;
