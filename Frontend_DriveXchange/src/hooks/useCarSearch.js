// src/hooks/useCarSearch.js
// Loads cars one page at a time and appends them (infinite scroll).
// When the filters change it starts again from page 0.
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBrowseCars } from "../api/carApi";

const INITIAL = {
  items: [],
  page: 0,
  total: 0,
  hasMore: false,
  loading: true,
  loadingMore: false,
  error: "",
};

export default function useCarSearch(filters, size = 12) {
  const key = JSON.stringify(filters); // stable "did the filters change?" check
  const [state, setState] = useState(INITIAL);
  const requestId = useRef(0);
  const controller = useRef(null);

  const load = useCallback(
    async (page, reset) => {
      controller.current?.abort(); // cancel the previous request
      const ctrl = new AbortController();
      controller.current = ctrl;
      const id = ++requestId.current;

      setState((s) => (reset ? { ...INITIAL } : { ...s, loadingMore: true, error: "" }));

      try {
        const res = await fetchBrowseCars({ ...JSON.parse(key), page, size }, ctrl.signal);
        if (id !== requestId.current) return; // a newer request took over

        setState((s) => {
          const merged = reset ? res.items : [...s.items, ...res.items];
          const seen = new Set(); // never show the same car twice
          const items = merged.filter((c) => (seen.has(c.id) ? false : seen.add(c.id)));
          return {
            items,
            page,
            total: res.total,
            hasMore: res.hasMore,
            loading: false,
            loadingMore: false,
            error: "",
          };
        });
      } catch (err) {
        if (err?.name === "AbortError" || id !== requestId.current) return;
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: err.message || "Could not load cars.",
        }));
      }
    },
    [key, size]
  );

  // filters changed (or first visit) -> start from the top
  useEffect(() => {
    load(0, true);
    return () => controller.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore || !state.hasMore || state.error) return;
    load(state.page + 1, false);
  }, [load, state]);

  const retry = useCallback(() => {
    if (state.items.length) load(state.page + 1, false);
    else load(0, true);
  }, [load, state.items.length, state.page]);

  return { ...state, loadMore, retry };
}