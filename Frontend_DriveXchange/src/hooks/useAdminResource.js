// src/hooks/useAdminResource.js
// Loads ONE thing (a listing, an order, a user) and lets the page reload it after an action.
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function useAdminResource(fetcher, id) {
  const { logout } = useAuth();
  const [state, setState] = useState({ data: null, loading: true, error: "", status: 0 });
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: "" }));
    fetcherRef
      .current(id, ctrl.signal)
      .then((data) => setState({ data, loading: false, error: "", status: 200 }))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        if (e?.status === 401) return logoutRef.current();
        setState({ data: null, loading: false, error: e?.message || "Something went wrong.", status: e?.status ?? 0 });
      });
    return () => ctrl.abort();
  }, [id, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
