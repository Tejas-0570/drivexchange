// src/api/dashboardApi.js
// Everything the dashboard needs from the backend lives here.
// If your Spring controllers use different URLs / field names, change them
// in this ONE file and the rest of the dashboard keeps working.

import { ApiError, apiFetch } from "./api";

/* ⚠️  CHANGE THESE to match your Spring controllers */
export const ENDPOINTS = {
  profile: "/api/v1/users/me", // GET -> CurrentUserProfile, PUT -> UpdateUser
  myListings: "/api/v1/cars/my-listings", // GET -> cars owned by the logged-in user
  savedCars: "/api/v1/favourites", // GET = my saved cars, GET /ids, PUT|DELETE /{carId}
  listCar: "/api/v1/cars/list-car", // POST -> create a new listing (your working Postman URL)
  car: (id) => `/api/v1/cars/${encodeURIComponent(id)}`, // PUT -> update, DELETE -> remove (owner only)
  carPhotos: (id) => `/api/v1/cars/${encodeURIComponent(id)}/photos`, // POST multipart (not built yet)
  changeEmail: "/api/v1/users/me/email", // PUT { newEmail, currentPassword }
  changePassword: "/api/v1/users/me/password", // PUT { currentPassword, newPassword }
};

// Your ApiResponse wrapper puts the payload in `data`
const unwrap = (body) => body?.data ?? body;

/* ------------------------------------------------------------------ */
/* profile                                                            */
/* ------------------------------------------------------------------ */
export function normalizeProfile(raw = {}) {
  const roleSource = raw.roles ?? raw.role ?? [];
  const { password, ...safe } = raw; // never keep a password in the UI state

  return {
    ...safe, // keeps any extra fields (city, address, ...) you add later
    id: raw.id ?? null,
    name: raw.name ?? raw.fullName ?? "",
    email: raw.email ?? "",
    mobile: raw.mobile ?? raw.mobileNo ?? raw.phone ?? "",
    roles: Array.isArray(roleSource) ? roleSource : [roleSource].filter(Boolean),
    createdAt: raw.createdAt ?? raw.created_at ?? raw.joinedAt ?? null,
  };
}

export async function getProfile() {
  const body = await apiFetch(ENDPOINTS.profile, { auth: true });
  return normalizeProfile(unwrap(body));
}

// payload = ONLY the editable fields (name, mobile, ...). Never email/password/role.
export async function updateProfile(payload) {
  return apiFetch(ENDPOINTS.profile, { method: "PUT", auth: true, body: payload });
}

/* ------------------------------------------------------------------ */
/* credentials (separate APIs, as planned)                            */
/* ------------------------------------------------------------------ */
export const changeEmail = ({ newEmail, currentPassword }) =>
  apiFetch(ENDPOINTS.changeEmail, {
    method: "PUT",
    auth: true,
    body: { newEmail, currentPassword },
  });

export const changePassword = ({ currentPassword, newPassword }) =>
  apiFetch(ENDPOINTS.changePassword, {
    method: "PUT",
    auth: true,
    body: { currentPassword, newPassword },
  });

/* ------------------------------------------------------------------ */
/* cars                                                               */
/* Accepts BOTH snake_case (car_id, fuel_type ...) and camelCase      */
/* (carId, fuelType ...), matching your car_listings table & Postman. */
/* ------------------------------------------------------------------ */
export function normalizeCar(raw = {}) {
  const c = raw.car ?? raw; // favourites may wrap the car: { id, car: {...} }

  // browse API currently names it "photUrls" (typo) — accept both spellings
  const photoList = [c.photUrls, c.photoUrls, c.photos, c.images].find(Array.isArray) ?? [];
  const first = photoList[0];
  const photo =
    typeof first === "string" ? first : first?.url ?? first?.photo_url ?? first?.photoUrl ?? null;

  const brandModel = [c.brand ?? c.make, c.model].filter(Boolean).join(" ");

  return {
    id: c.car_id ?? c.carId ?? c.id,
    name: brandModel || c.title_header || c.titleHeader || c.name || "Untitled listing",
    headline: c.title_header ?? c.titleHeader ?? "",
    price: Number(c.price ?? 0),
    year: c.manufactured_year ?? c.manufacturedYear ?? c.year ?? null,
    color: c.color ?? "",
    location: c.location ?? c.city ?? "",
    mileage: c.mileage ?? c.kmDriven ?? null,
    fuelType: c.fuel_type ?? c.fuelType ?? c.fuel ?? "",
    transmission: c.transmission_type ?? c.transmissionType ?? c.transmission ?? "",
    image: c.image ?? c.imageUrl ?? c.image_url ?? photo,
    status: String(c.status ?? "AVAILABLE").toUpperCase(),
    verified: Boolean(c.verified ?? c.isVerified), // badge only shows if the backend says so
  };
}

async function fetchCars(path) {
  try {
    const data = unwrap(await apiFetch(path, { auth: true }));
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.content) // Spring Page<>
      ? data.content
      : [];
    return list.map(normalizeCar);
  } catch (err) {
    // endpoint not built yet -> treat as "no cars" instead of an error
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

// INACTIVE = removed by the owner (kept in the DB only for transaction history) -> never show it
export const getMyListings = async () =>
  (await fetchCars(ENDPOINTS.myListings)).filter((c) => c.status !== "INACTIVE");

// no favourites API yet -> empty list (shows the friendly empty state)
export const getSavedCars = () =>
  ENDPOINTS.savedCars ? fetchCars(ENDPOINTS.savedCars) : Promise.resolve([]);

// payload keys are snake_case, exactly like your Postman request
export const createCar = (payload) =>
  apiFetch(ENDPOINTS.listCar, { method: "POST", auth: true, body: payload });

// PUT /api/v1/cars/{id} — same snake_case body as create (the server ignores `status`)
export const updateCar = (id, payload) =>
  apiFetch(ENDPOINTS.car(id), { method: "PUT", auth: true, body: payload });

// DELETE /api/v1/cars/{id} — the server decides: hard delete, or INACTIVE if the car has order history
export const deleteCar = (id) => apiFetch(ENDPOINTS.car(id), { method: "DELETE", auth: true });

// Photos are optional. Flip this to true once POST /api/v1/cars/{id}/photos exists.
export const PHOTO_UPLOAD_ENABLED = false;

// files: File[] (already validated) — sent as multipart under the field name "photos"
export function uploadCarPhotos(carId, files) {
  const form = new FormData();
  files.forEach((f) => form.append("photos", f));
  return apiFetch(ENDPOINTS.carPhotos(carId), { method: "POST", auth: true, body: form });
}

/* ------------------------------------------------------------------ */
/* favourites (saved cars)                                            */
/* ------------------------------------------------------------------ */
// ids of every car the logged-in user has saved
export async function getFavouriteIds() {
  try {
    const data = unwrap(await apiFetch(`${ENDPOINTS.savedCars}/ids`, { auth: true }));
    return Array.isArray(data) ? data.map(String) : [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return []; // API not built yet
    throw err;
  }
}

export const addFavourite = (carId) =>
  apiFetch(`${ENDPOINTS.savedCars}/${encodeURIComponent(carId)}`, { method: "PUT", auth: true });

export const removeFavourite = (carId) =>
  apiFetch(`${ENDPOINTS.savedCars}/${encodeURIComponent(carId)}`, { method: "DELETE", auth: true });
