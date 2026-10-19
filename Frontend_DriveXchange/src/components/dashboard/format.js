// src/components/dashboard/format.js

// Indian rupees with lakh/crore grouping, e.g. ₹6,89,000
export const formatPrice = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatMileage = (miles) =>
  `${new Intl.NumberFormat("en-US").format(Number(miles) || 0)} mi`;

export const formatMonthYear = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const isAdminRole = (roles = []) => roles.some((r) => /ADMIN/i.test(r));

// The backend stores money in PAISE (1 rupee = 100 paise, always an integer).
// Divide by 100 only here, only for display. 50000 paise -> "₹500"
export const formatPaise = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((Number(paise) || 0) / 100);

// "19 Oct 2026, 1:30 pm" in the visitor's own time zone (the server sends UTC instants)
export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};
