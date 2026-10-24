// src/hooks/useAdminList.js
// Everything a filterable, paged admin table needs:
//   - the filters, search text and page number live in the URL  (/admin/listings?approval=PENDING&page=1)
//     so refresh / back button / sharing a link all keep working
//   - fetches whenever they change, cancelling the previous request
//   - keeps the old rows on screen while the next page loads (no flicker)
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function useAdminList(fetcher, { keys = [], defaults = {}, size = 15 } = {}) {
  const { logout } = useAuth();
  const [sp, setSp] = useSearchParams();

  const filters = {};
  keys.forEach((k) => {
    filters[k] = sp.get(k) ?? defaults[k] ?? "";
  });
  const page = Math.max(0, Number(sp.get("page")) || 0);
  const search = sp.get("search") ?? "";

  const query = { ...filters, search, page, size };
  const queryKey = JSON.stringify(query);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const [state, setState] = useState({ data: null, loading: true, error: "", status: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: "", status: 0 }));
    fetcherRef
      .current(JSON.parse(queryKey), ctrl.signal)
      .then((data) => setState({ data, loading: false, error: "", status: 200 }))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        if (e?.status === 401) return logoutRef.current();
        setState({ data: null, loading: false, error: e?.message || "Something went wrong.", status: e?.status ?? 0 });
      });
    return () => ctrl.abort();
  }, [queryKey, tick]);

  // change one URL parameter; always go back to the first page
  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(sp);
      if (value === "" || value === undefined || value === null || value === defaults[key]) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      setSp(next, { replace: true });
    },
    [sp, setSp, defaults]
  );

  const setPage = useCallback(
    (p) => {
      const next = new URLSearchParams(sp);
      if (p > 0) next.set("page", String(p));
      else next.delete("page");
      setSp(next, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [sp, setSp]
  );

  const setSearch = useCallback((v) => setParam("search", v), [setParam]);

  return {
    ...state,
    filters,
    search,
    page,
    size,
    setParam,
    setSearch,
    setPage,
    reload: () => setTick((t) => t + 1),
  };
}
