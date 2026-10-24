// src/api/adminApi.js
// Every call the Admin Console makes. The server decides who may call these (ADMIN role only);
// the frontend only hides the screens for normal users.
//
// List endpoints return a "page":  { content: [...], page, size, totalElements, totalPages }
// (page numbers start at 0, like your browse-cars endpoint).
import { apiFetch } from "./api";

const BASE = "/api/v1/admin";
const unwrap = (body) => body?.data ?? body;

// { a: 1, b: "", c: undefined } -> "?a=1"   (empty values are left out)
const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

const get = async (path, params, signal) => unwrap(await apiFetch(`${BASE}${path}${qs(params)}`, { auth: true, signal }));
const post = async (path, body) => unwrap(await apiFetch(`${BASE}${path}`, { method: "POST", auth: true, body }));

// accept a real page OR a plain array (so a half-finished backend still shows something)
const asPage = (d) => {
  if (Array.isArray(d)) return { content: d, page: 0, size: d.length, totalElements: d.length, totalPages: 1 };
  return {
    content: d?.content ?? [],
    page: d?.page ?? d?.number ?? 0,
    size: d?.size ?? 0,
    totalElements: d?.totalElements ?? d?.content?.length ?? 0,
    totalPages: d?.totalPages ?? 1,
  };
};

/* ---- overview ---- */
export const getOverview = (signal) => get("/overview", {}, signal);

/* ---- listings ---- */
export const listListings = async (q, signal) => asPage(await get("/listings", q, signal));
export const getListing = (id, signal) => get(`/listings/${encodeURIComponent(id)}`, {}, signal);
export const approveListing = (id) => post(`/listings/${encodeURIComponent(id)}/approve`);
export const rejectListing = (id, reason) => post(`/listings/${encodeURIComponent(id)}/reject`, { reason });
export const takedownListing = (id, reason) => post(`/listings/${encodeURIComponent(id)}/takedown`, { reason });

/* ---- users ---- */
export const listUsers = async (q, signal) => asPage(await get("/users", q, signal));
export const getUser = (id, signal) => get(`/users/${encodeURIComponent(id)}`, {}, signal);
export const suspendUser = (id, reason) => post(`/users/${encodeURIComponent(id)}/suspend`, { reason });
export const reactivateUser = (id) => post(`/users/${encodeURIComponent(id)}/reactivate`);

/* ---- orders (transactions) ---- */
export const listTransactions = async (q, signal) => asPage(await get("/transactions", q, signal));
export const getTransaction = (id, signal) => get(`/transactions/${encodeURIComponent(id)}`, {}, signal);
export const confirmDelivery = (id) => post(`/transactions/${encodeURIComponent(id)}/confirm-delivery`);
export const releasePayout = (id, payoutReference) =>
  post(`/transactions/${encodeURIComponent(id)}/release-payout`, { payoutReference });
export const refundTransaction = (id, reason) => post(`/transactions/${encodeURIComponent(id)}/refund`, { reason });

/* ---- activity log ---- */
export const listAuditLog = async (q, signal) => asPage(await get("/audit-log", q, signal));
