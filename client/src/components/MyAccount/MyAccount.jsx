// ================= MY ACCOUNT PAGE =================

import React, { useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { fields } from "../../common/data";

import {
  getMyAccount,
  saveMyAccount,
  uploadAvatarApi,
  deleteAvatarApi,
} from "../../common/service";

const defaultAvatar = "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=user28";

const MyAccount = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bloodType: "",
    allergies: "",
  });

  const [avatar, setAvatar] = useState(defaultAvatar);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= LOAD ACCOUNT =================
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await getMyAccount();

        if (data) {
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            bloodType: data.bloodType || "",
            allergies: data.allergies || "",
          });

          if (data.avatar) {
            setAvatar(data.avatar);
          }
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      await saveMyAccount(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= UPLOAD AVATAR =================
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await uploadAvatarApi(file);

      if (res?.avatar) {
        setAvatar(res.avatar); // 🔥 update UI instantly
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= DELETE AVATAR =================
  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarApi();
      setAvatar(defaultAvatar);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading account...
      </div>
    );
  }

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
          {/* ================= PROFILE PICTURE ================= */}
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
                {/* Upload */}
                <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 cursor-pointer">
                  <Upload size={14} />
                  Upload
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleUpload}
                  />
                </label>

                {/* Delete */}
                <button
                  onClick={handleDeleteAvatar}
                  className="flex items-center gap-2 text-sm text-red-400 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          </section>

          {/* ================= PERSONAL DETAILS ================= */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    {field.label}
                  </label>

                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name] || ""}
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
