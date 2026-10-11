// src/hooks/useDashboardData.js
// Loads the logged-in user's listings + saved cars once, shared by all tabs.
import { useCallback, useEffect, useState } from "react";
import { getMyListings, getSavedCars } from "../api/dashboardApi";
import { useAuth } from "../context/AuthContext";

export default function useDashboardData() {
  const { logout } = useAuth();
  const [state, setState] = useState({
    listings: [],
    saved: [],
    loading: true,
    errors: { listings: "", saved: "" },
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));

    // allSettled: if one request fails the other still shows
    const [listings, saved] = await Promise.allSettled([
      getMyListings(),
      getSavedCars(),
    ]);

    // expired / invalid token -> log out
    if ([listings, saved].some((r) => r.status === "rejected" && r.reason?.status === 401)) {
      logout();
      return;
    }

    setState({
      listings: listings.status === "fulfilled" ? listings.value : [],
      saved: saved.status === "fulfilled" ? saved.value : [],
      loading: false,
      errors: {
        listings: listings.status === "rejected" ? listings.reason?.message || "Failed to load" : "",
        saved: saved.status === "rejected" ? saved.reason?.message || "Failed to load" : "",
      },
    });
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}