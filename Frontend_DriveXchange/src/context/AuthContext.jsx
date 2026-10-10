// src/context/AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError, apiFetch, TOKEN_KEY, tokenStorage } from "../api/api";

const AuthContext = createContext(null);

/* Read the payload of a JWT (this only DECODES it for display purposes;
   the backend is what actually verifies the signature). */
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* token -> user object, or null if token is missing / broken / expired */
function readUser(token) {
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return null; // expired

  return {
    email: payload.sub ?? payload.email ?? "",
    roles: payload.roles ?? [], // e.g. ["ROLE_USER"]
  };
}

/* Pull the token out of the login response.
   Adjust this one line if your LoginResponse uses a different field name. */
const extractToken = (body) => {
  const d = body?.data ?? body;
  return d?.token ?? d?.accessToken ?? d?.jwtToken ?? d?.jwt ?? null;
};

export function AuthProvider({ children }) {
  // start from whatever is already stored, so a page refresh keeps you logged in
  const [token, setToken] = useState(() => tokenStorage.get());
  const user = useMemo(() => readUser(token), [token]);

  // stored token is broken or expired -> clean it up
  useEffect(() => {
    if (token && !user) {
      tokenStorage.clear();
      setToken(null);
    }
  }, [token, user]);

  // log out / in from another tab -> stay in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) setToken(tokenStorage.get());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    const body = await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const newToken = extractToken(body);
    if (!newToken) {
      throw new ApiError("Login succeeded but no token was returned.", 500);
    }

    tokenStorage.set(newToken, remember);
    setToken(newToken);
  }, []);

  // only creates the account; the user logs in separately afterwards
  const register = useCallback(async ({ name, email, password }) => {
    await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(user),
      isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}