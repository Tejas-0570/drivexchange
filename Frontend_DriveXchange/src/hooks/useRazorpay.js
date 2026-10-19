// src/hooks/useRazorpay.js
// Loads Razorpay's checkout.js ONCE (only when someone is about to pay) and opens the payment popup.
import { useCallback } from "react";

const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading = null; // one shared promise: clicking twice never injects the script twice

export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(Boolean(window.Razorpay));
    s.onerror = () => {
      loading = null; // allow a retry (ad-blocker, offline ...)
      s.remove();
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return loading;
}

export default function useRazorpay() {
  /**
   * order      = response of POST /api/v1/transactions
   * onSuccess  = ({razorpay_order_id, razorpay_payment_id, razorpay_signature}) => void
   * onFailed   = (message) => void     the bank declined / wrong OTP (the buyer may retry the same order)
   * onDismiss  = () => void            the popup was closed without paying
   */
  const open = useCallback(async (order, { onSuccess, onFailed, onDismiss }) => {
    const ok = await loadRazorpay();
    if (!ok) {
      onFailed?.("Could not load the payment window. Check your internet connection or disable your ad-blocker and try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId, // PUBLIC key id. The secret never reaches the browser.
      order_id: order.razorpayOrderId,
      amount: order.amountPaise,
      currency: order.currency,
      name: "Drivexchange",
      description: `Booking: ${order.carTitle}`,
      prefill: {
        name: order.prefillName || undefined,
        email: order.prefillEmail || undefined,
        contact: order.prefillContact || undefined,
      },
      theme: { color: "#1a6bff" },
      handler: (response) => onSuccess?.(response), // called ONLY after the payment succeeded
      modal: {
        confirm_close: true, // "are you sure?" if they press X mid-payment
        ondismiss: () => onDismiss?.(),
      },
    });

    rzp.on("payment.failed", (res) => onFailed?.(res?.error?.description || "The payment failed. Please try again."));
    rzp.open();
  }, []);

  return { open };
}
