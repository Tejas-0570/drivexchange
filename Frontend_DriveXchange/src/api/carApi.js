// src/api/carApi.js
// Browse / search cars.
//
// NEW backend (paginated):   { content: [...], totalElements, last, ... }
// OLD backend (all cars):    [ ...every car... ]  -> we filter/sort/slice here
//                            so the page works today. Delete `clientSide`
//                            once your endpoint is paginated.

import { apiFetch } from "./api";
import { normalizeCar } from "./dashboardApi";

export const BROWSE_ENDPOINT = "/api/v1/cars/browse-cars";

const unwrap = (body) => body?.data ?? body;

function toQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v != null) sp.set(k, String(v));
  });
  return sp.toString();
}

/* ---------------- temporary: browser-side filtering ---------------- */
let legacyCache = null; // { at, cars } — avoids re-downloading everything per page

function clientSide(allCars, p) {
  const q = String(p.q ?? "").trim().toLowerCase();
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const minPrice = num(p.minPrice);
  const maxPrice = num(p.maxPrice);
  const minYear = num(p.minYear);
  const maxMileage = num(p.maxMileage);

  let list = allCars
    .map(normalizeCar)
    .filter((c) => c.status === "AVAILABLE")
    .filter((c) => !q || `${c.name} ${c.headline} ${c.color}`.toLowerCase().includes(q))
    .filter((c) => !p.fuelType || c.fuelType.toLowerCase() === p.fuelType.toLowerCase())
    .filter((c) => !p.transmission || c.transmission.toLowerCase() === p.transmission.toLowerCase())
    .filter((c) => minPrice == null || c.price >= minPrice)
    .filter((c) => maxPrice == null || c.price <= maxPrice)
    .filter((c) => minYear == null || (c.year ?? 0) >= minYear)
    .filter((c) => maxMileage == null || (c.mileage ?? 0) <= maxMileage);

  const sorters = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    mileage_asc: (a, b) => (a.mileage ?? 0) - (b.mileage ?? 0),
    year_desc: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  };
  list = [...list].sort(sorters[p.sort] ?? sorters.year_desc);

  const start = p.page * p.size;
  return {
    items: list.slice(start, start + p.size),
    total: list.length,
    hasMore: start + p.size < list.length,
  };
}

/* ---------------- main function ---------------- */
export async function fetchBrowseCars(params, signal) {
  // old backend already answered once -> reuse that list for a minute
  if (legacyCache && Date.now() - legacyCache.at < 60_000) {
    return clientSide(legacyCache.cars, params);
  }

  const body = await apiFetch(`${BROWSE_ENDPOINT}?${toQuery(params)}`, {
    auth: true, // adds the token if logged in; harmless if the endpoint is public
    signal,
  });
  const data = unwrap(body);

  // OLD: plain array of every car
  if (Array.isArray(data)) {
    legacyCache = { at: Date.now(), cars: data };
    return clientSide(data, params);
  }

  // NEW: one page from the server
  const content = data?.content ?? data?.items ?? [];
  const page = data?.page ?? data?.number ?? params.page;
  const total = data?.totalElements ?? data?.total ?? content.length;

  const hasMore =
    typeof data?.last === "boolean"
      ? !data.last
      : typeof data?.hasNext === "boolean"
      ? data.hasNext
      : data?.totalPages != null
      ? page + 1 < data.totalPages
      : content.length === params.size;

  return { items: content.map(normalizeCar), total, hasMore };
}

/* ------------------------------------------------------------------ */
/* single car (details page)                                          */
/* ------------------------------------------------------------------ */
export function normalizeCarDetails(raw = {}) {
  const base = normalizeCar(raw);

  const photoList = [raw.photoUrls, raw.photUrls, raw.photos, raw.images].find(Array.isArray) ?? [];
  const images = photoList
    .map((p) => (typeof p === "string" ? p : p?.url ?? p?.photo_url ?? p?.photoUrl))
    .filter(Boolean);

  const owner = raw.owner ?? raw.seller ?? {};

  return {
    ...base,
    brand: raw.brand ?? raw.make ?? "",
    model: raw.model ?? "",
    images,
    description: raw.description ?? "",
    vin: raw.vin ?? "",
    seller: {
      name: owner.name ?? "",
      email: owner.email ?? "",
      mobile: owner.mobile ?? owner.phone ?? "",
      memberSince: owner.createdAt ?? owner.created_at ?? null,
    },
  };
}

// GET /api/v1/cars/{id}
export async function getCarById(id, signal) {
  const body = await apiFetch(`/api/v1/cars/${encodeURIComponent(id)}`, { auth: true, signal });
  return normalizeCarDetails(unwrap(body));
}