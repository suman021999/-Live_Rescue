import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Phone, Mail, X } from "lucide-react";
import { contactFormFields } from "../../common/data";
import toast from "react-hot-toast";

// ✅ API IMPORT
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "../../common/service";

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const EmContact = () => {
  const [contacts, setContacts] = useState([]); // ✅ always array
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await getEmergencyContacts();

      // console.log("API RESPONSE:", res);

      // ✅ HANDLE ALL POSSIBLE BACKEND STRUCTURES
      const contactsArray = Array.isArray(res)
        ? res
        : res.contacts || res.data || [];

      setContacts(contactsArray);
    } catch (err) {
      console.error(err.message);
      setContacts([]); // fallback safety
    }
  };

  // ================= OPEN MODALS =================
  const openAdd = () => {
    setEditContact(null);
    setForm({ name: "", relation: "", phone: "", email: "" });
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setEditContact(contact._id);
    setForm(contact);
    setShowModal(true);
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      if (editContact) {
        await updateEmergencyContact(editContact, form);
      } else {
        await createEmergencyContact(form);
      }

      await fetchContacts(); // refresh
      setShowModal(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteEmergencyContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-20 pb-24 md:pb-10">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Emergency Contacts
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage who gets notified during emergencies.
          </p>
        </div>

        {/* Contacts */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">
              Primary Contacts
            </h2>

            <button
              onClick={openAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white text-sm px-4 py-2 rounded-lg"
            >
              + Add Contact
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {Array.isArray(contacts) && contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">
                      {getInitials(contact.name)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {contact.name}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {contact.relation}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone size={11} /> {contact.phone}
                        </span>
                        {contact.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail size={11} /> {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button onClick={() => openEdit(contact)}>
                      <Pencil size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(contact._id)}>
                      <Trash2 size={16} className="text-red-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No contacts found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-800">
                {editContact ? "Edit Contact" : "Add Contact"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {contactFormFields.map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[field] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white rounded-lg py-2 text-sm font-medium transition"
              >
                {editContact ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmContact;




//  const [notifications, setNotifications] = useState({
//     medical: true,
//     disaster: true,
//     location: false,
//   });

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

{/* Notifications */}
        {/* <div className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-white">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-5">
            Notification Settings
          </h2>

          <div className="divide-y divide-gray-100">
            {emergencyActions.map(({ key, title, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between py-4 gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>

                <Toggle
                  enabled={notifications[key]}
                  onChange={(val) =>
                    setNotifications((prev) => ({ ...prev, [key]: val }))
                  }
                />
              </div>
            ))}
          </div>
        </div> */}