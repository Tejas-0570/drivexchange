// src/api/dashboardApi.js
// Everything the dashboard needs from the backend lives here.
// If your Spring controllers use different URLs / field names, change them
// in this ONE file and the rest of the dashboard keeps working.

import { ApiError, apiFetch } from "./api";

/* ⚠️  CHANGE THESE to match your Spring controllers */
export const ENDPOINTS = {
  profile: "/api/v1/users/me", // GET -> CurrentUserProfile, PUT -> UpdateUser
  myListings: "/api/v1/cars/my", // GET -> cars created by the logged-in user
  savedCars: "/api/v1/users/me/favourites", // GET -> cars the user saved
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
    createdAt: raw.createdAt ?? raw.joinedAt ?? null,
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
/* ------------------------------------------------------------------ */
export function normalizeCar(raw = {}) {
  const c = raw.car ?? raw; // favourites may wrap the car: { id, car: {...} }
  const first = Array.isArray(c.images) ? c.images[0] : null;

  return {
    id: c.id,
    name:
      c.name ??
      c.title ??
      ([c.make ?? c.brand, c.model].filter(Boolean).join(" ") || "Untitled listing"),
    price: Number(c.price ?? 0),
    year: c.year ?? c.manufactureYear ?? null,
    location: c.location ?? c.city ?? "",
    mileage: c.mileage ?? c.kmDriven ?? null,
    fuelType: c.fuelType ?? c.fuel ?? "",
    transmission: c.transmission ?? c.gear ?? "",
    image:
      c.image ?? c.imageUrl ?? (typeof first === "string" ? first : first?.url) ?? null,
    status: String(c.status ?? "ACTIVE").toUpperCase(),
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

export const getMyListings = () => fetchCars(ENDPOINTS.myListings);
export const getSavedCars = () => fetchCars(ENDPOINTS.savedCars);