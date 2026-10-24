// src/components/dashboard/orderStatus.js
// One place that explains every order status in plain words (used by the order page AND the "My Orders" tab).
// `tone` is a <Pill> colour.

export const ORDER_STATUS = {
  CREATED: {
    label: "Awaiting payment",
    tone: "amber",
    buyer: "Complete the payment before the timer ends or the car goes back on sale.",
    seller: "A buyer has started a booking.",
  },
  PAID_HELD: {
    label: "Booked",
    tone: "green",
    buyer: "Your booking is confirmed. Contact the seller to arrange the inspection and test drive.",
    seller: "A buyer has paid the booking amount. Contact them to arrange the inspection.",
  },
  DELIVERED: {
    label: "Delivery confirmed",
    tone: "blue",
    buyer: "Drivexchange confirmed the car was delivered to you. The seller will be paid shortly.",
    seller: "Drivexchange confirmed the delivery. Your payout is being processed.",
  },
  RELEASED: {
    label: "Completed",
    tone: "green",
    buyer: "This deal is complete.",
    seller: "This deal is complete and the payout was released.",
  },
  DISPUTED: {
    label: "Under review",
    tone: "amber",
    buyer: "Our team is reviewing this deal and will contact you.",
    seller: "Our team is reviewing this deal and will contact you.",
  },
  REFUNDED: {
    label: "Refunded",
    tone: "gray",
    buyer: "The money was returned to your original payment method (it can take 5–7 working days to show up).",
    seller: "This booking was refunded to the buyer.",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "gray",
    buyer: "You cancelled this booking before paying. Nothing was charged.",
    seller: "This booking was cancelled.",
  },
  EXPIRED: {
    label: "Expired",
    tone: "gray",
    buyer: "The payment window ended, so the car was released. If money was deducted it will be refunded automatically.",
    seller: "This booking expired.",
  },
};

export const statusInfo = (status) =>
  ORDER_STATUS[status] ?? { label: status || "Unknown", tone: "gray", buyer: "", seller: "" };

// states in which the buyer has really paid (contact details are visible)
export const PAID_STATUSES = ["PAID_HELD", "DELIVERED", "RELEASED", "DISPUTED"];
