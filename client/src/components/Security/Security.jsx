import React, { useState } from "react";
import { Trash2, X, Eye, EyeOff } from "lucide-react";
import { changePassword, logoutUser  } from "../../common/service";

const Security = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showFields, setShowFields] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

const handlePasswordSave = async () => {
  const passwordErrors = [];

  // ✅ Required fields
  if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
    setPasswordError("All fields are required.");
    return;
  }

  // ✅ Password rules
  if (passwordForm.next.length < 8) {
    passwordErrors.push("8 characters");
  }

  if (!/[A-Z]/.test(passwordForm.next)) {
    passwordErrors.push("1 uppercase letter");
  }

  const numberCount = (passwordForm.next.match(/[0-9]/g) || []).length;
  if (numberCount < 4) {
    passwordErrors.push("at least 4 numbers");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.next)) {
    passwordErrors.push("1 special character");
  }

  if (passwordErrors.length > 0) {
    setPasswordError(
      `Password must include ${passwordErrors.join(", ")}`
    );
    return;
  }

  // ✅ Match confirm password
  if (passwordForm.next !== passwordForm.confirm) {
    setPasswordError("Passwords do not match.");
    return;
  }

  setPasswordError("");

  try {
    await changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.next,
    });

    setPasswordSaved(true);

    setTimeout(() => {
      setPasswordSaved(false);
      setShowPasswordModal(false);
      setPasswordForm({ current: "", next: "", confirm: "" });
    }, 1500);
  } catch (error) {
    setPasswordError(error.message || "Failed to update password.");
  }
};

  const handleDeleteAccount = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-20 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Privacy & Security
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your security settings and privacy controls.
          </p>
        </div>

        {/* Account Security */}
        <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-white">
          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Account Security
          </h2>

          <div className="divide-y divide-gray-100">
            {/* Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-semibold">Password</p>
                <p className="text-xs text-gray-400">
                  Last changed 3 months ago
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setPasswordError("");
                  setPasswordSaved(false);
                }}
                className="w-full sm:w-auto text-sm text-orange-500 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-300 rounded-xl p-4 sm:p-6 bg-white">
          <h2 className="text-sm font-semibold text-red-500 mb-4">
            Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Logout Account</p>
              <p className="text-xs text-gray-400">
                Logout your account from here.
              </p>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              <Trash2 size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">
                Update Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {["current", "next", "confirm"].map((key, i) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {["Current Password", "New Password", "Confirm New Password"][i]}
                  </label>
                  <div className="relative">
                    <input
                      type={showFields[key] ? "text" : "password"}
                      value={passwordForm[key]}
                      onChange={(e) => {
                        setPasswordForm((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }));
                        setPasswordError("");
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowFields((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showFields[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {passwordError && (
              <p className="text-xs text-red-500 mt-3">{passwordError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                className={`flex-1 rounded-lg py-2 text-sm ${
                  passwordSaved ? "bg-green-500" : "bg-orange-400"
                } text-white`}
              >
                {passwordSaved ? "Updated ✓" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm */}
   {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    
    {/* Modal */}
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-scaleIn">
      
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        Logout Account?
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-5">
        This action cannot be undone.
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 border border-gray-200 hover:bg-gray-100 rounded-lg py-2 text-sm transition"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteAccount}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm transition"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Security;



  // const [privacy, setPrivacy] = useState({
  //   location: true,
  //   medicalHistory: true,
  //   analytics: false,
  // });

// const Toggle = ({ enabled, onChange }) => (
//   <button
//     onClick={() => onChange(!enabled)}
//     className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//       enabled ? "bg-orange-400" : "bg-gray-200"
//     }`}
//   >
//     <span
//       className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
//         enabled ? "translate-x-6" : "translate-x-1"
//       }`}
//     />
//   </button>
// );

{/* Privacy */}
        {/* <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-white">
          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Data & Privacy
          </h2>

          <div className="divide-y divide-gray-100">
            {[
              {
                key: "location",
                title: "Location Tracking",
                desc: "Used during emergencies.",
              },
              {
                key: "medicalHistory",
                title: "Medical History",
                desc: "Shared with responders.",
              },
              {
                key: "analytics",
                title: "Analytics Data",
                desc: "Helps improve the app.",
              },
            ].map(({ key, title, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 py-4"
              >
                <div className="pr-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>

                <Toggle
                  enabled={privacy[key]}
                  onChange={(val) =>
                    setPrivacy((prev) => ({ ...prev, [key]: val }))
                  }
                />
              </div>
            ))}
          </div>
        </div> */}