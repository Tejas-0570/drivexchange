// src/api/api.js
// One place for: backend URL, token storage, and a fetch helper.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export const TOKEN_KEY = "drivexchange_token";

/* ---------------- token storage ----------------
   remember = true  -> localStorage   (survives closing the browser)
   remember = false -> sessionStorage (cleared when the tab closes)   */
export const tokenStorage = {
  get: () =>
    localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY),

  set: (token, remember = true) => {
    tokenStorage.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

/* ---------------- error type ---------------- */
export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message);
    this.name = "ApiError";
    this.status = status; // HTTP status (0 = server unreachable)
    this.body = body; // parsed JSON body, if any
  }
}

/* ---------------- fetch helper ----------------
   apiFetch("/api/v1/users/me", { auth: true })   -> adds Authorization header
   apiFetch("/api/v1/auth/login", { method: "POST", body: {...} })        */
export async function apiFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }

  // some responses (e.g. 401/403 from Spring Security) may have no JSON body
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  return data;
}