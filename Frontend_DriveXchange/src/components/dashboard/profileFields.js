// src/components/dashboard/profileFields.js
//
// The list of profile fields a user is ALLOWED to edit from the dashboard.
// The form, validation, payload and "profile completeness" meter are all
// generated from this array. When your backend UpdateUser DTO gets more
// fields (city, address, pincode ...), just add an entry here.
//
// NEVER add email / password / role here — those use separate secured APIs.

export const EDITABLE_FIELDS = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    icon: "user",
    placeholder: "Your full name",
    autoComplete: "name",
    validate: (v) => {
      const s = v.trim();
      if (s.length < 2) return "Enter your full name";
      if (s.length > 60) return "Name is too long (max 60 characters)";
      return "";
    },
  },
  {
    key: "mobile",
    label: "Mobile number",
    type: "tel",
    icon: "phone",
    placeholder: "+91 98765 43210",
    autoComplete: "tel",
    hint: "Buyers and sellers use this to reach you.",
    validate: (v) => {
      const s = v.trim();
      if (!s) return ""; // optional
      return /^\+?[0-9\s-]{10,15}$/.test(s) ? "" : "Enter a valid mobile number";
    },
  },

  // ---- examples for later (uncomment when the backend supports them) ----
  // { key: "city",    label: "City",    type: "text", icon: "pin", placeholder: "Aurangabad", validate: () => "" },
  // { key: "address", label: "Address", type: "text", icon: "pin", placeholder: "Street, area", validate: () => "" },
  // { key: "pincode", label: "Pincode", type: "text", icon: "pin", placeholder: "431001", validate: (v) => (!v || /^\d{6}$/.test(v.trim()) ? "" : "Enter a 6-digit pincode") },
];

const isFilled = (profile, key) => String(profile?.[key] ?? "").trim() !== "";

export function getCompleteness(profile) {
  const total = EDITABLE_FIELDS.length;
  const missing = EDITABLE_FIELDS.filter((f) => !isFilled(profile, f.key)).map((f) => f.label);
  const percent = total ? Math.round(((total - missing.length) / total) * 100) : 100;
  return { percent, missing };
}