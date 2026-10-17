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
