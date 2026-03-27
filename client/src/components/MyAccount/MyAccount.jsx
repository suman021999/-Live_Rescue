import React, { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { fields } from "../../common/data";
const avatar = "https://i.pravatar.cc/80?img=47";



const MyAccount = () => {
  const [form, setForm] = useState({
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.jenkins@example.com",
    phone: "+1 (555) 987-6543",
    bloodType: "O Positive",
    allergies: "Penicillin, Peanuts",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-20 pb-24 md:pb-10">
        {/* Heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">My Account</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your personal details and settings.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {/* Profile Picture */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Profile Picture
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
              />

              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50">
                  <Upload size={14} />
                  Upload
                </button>

                <button className="flex items-center gap-2 text-sm text-red-400 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50">
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Personal Details
            </h2>

            {/* 🔥 Mobile Fix: 1 column → 2 column on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    {field.label}
                  </label>

                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className={`w-full sm:w-auto px-5 py-2.5 text-sm rounded-lg font-medium transition
                  ${
                    saved
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
              >
                {saved ? "Saved ✓" : "Save Changes"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
