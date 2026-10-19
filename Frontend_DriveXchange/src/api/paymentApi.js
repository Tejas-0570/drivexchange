// src/api/paymentApi.js
// Every payment-related call lives here. The browser NEVER decides an amount: it only says
// "which car" - the server calculates the price, creates the Razorpay order and tells us what to open.
import { apiFetch } from "./api";

export const PAYMENT_ENDPOINTS = {
  quote: (carId) => `/api/v1/transactions/quote/${encodeURIComponent(carId)}`, // GET
  create: "/api/v1/transactions", // POST { carId }
  mine: "/api/v1/transactions/my", // GET
  one: (id) => `/api/v1/transactions/${encodeURIComponent(id)}`, // GET, DELETE (cancel)
  verify: "/api/v1/payments/verify", // POST
};

const unwrap = (body) => body?.data ?? body;

// all money fields are PAISE (integers), exactly as stored by the backend
export const getQuote = async (carId) => unwrap(await apiFetch(PAYMENT_ENDPOINTS.quote(carId), { auth: true }));

export const createOrder = async (carId) =>
  unwrap(await apiFetch(PAYMENT_ENDPOINTS.create, { method: "POST", auth: true, body: { carId } }));

// Razorpay's checkout gives snake_case names; our API uses camelCase
export const verifyPayment = async (response) =>
  unwrap(
    await apiFetch(PAYMENT_ENDPOINTS.verify, {
      method: "POST",
      auth: true,
      body: {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      },
    })
  );

export const cancelOrder = (id) => apiFetch(PAYMENT_ENDPOINTS.one(id), { method: "DELETE", auth: true });

export const getMyTransactions = async () => {
  const data = unwrap(await apiFetch(PAYMENT_ENDPOINTS.mine, { auth: true }));
  return Array.isArray(data) ? data : [];
};

export const getTransaction = async (id) => unwrap(await apiFetch(PAYMENT_ENDPOINTS.one(id), { auth: true }));
