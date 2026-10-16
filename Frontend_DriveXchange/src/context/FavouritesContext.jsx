// src/context/FavouritesContext.jsx
// Keeps the ids of the logged-in user's saved cars, so every heart in the
// app (Browse, Similar cars, Car details, Dashboard) knows its state.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { addFavourite, getFavouriteIds, removeFavourite } from "../api/dashboardApi";
import { useToast } from "../components/dashboard/ui";

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const { isLoggedIn, logout } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const { toastNode, notify } = useToast();

  // after login: load the ids once. after logout: forget them.
  useEffect(() => {
    if (!isLoggedIn) {
      setIds(new Set());
      return undefined;
    }

    let cancelled = false;
    getFavouriteIds()
      .then((list) => {
        if (!cancelled) setIds(new Set(list));
      })
      .catch((err) => {
        if (!cancelled && err.status === 401) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, logout]);

  const has = useCallback((carId) => ids.has(String(carId)), [ids]);

  // returns true when the server accepted the change
  const setFavourite = useCallback(
    async (carId, wanted) => {
      const id = String(carId);

      // 1) update the heart immediately (optimistic)
      setIds((prev) => {
        const next = new Set(prev);
        if (wanted) next.add(id);
        else next.delete(id);
        return next;
      });

      try {
        // 2) tell the server
        if (wanted) await addFavourite(id);
        else await removeFavourite(id);
        notify(wanted ? "Saved to your dashboard" : "Removed from saved cars");
        return true;
      } catch (err) {
        // 3) server said no -> put the heart back
        setIds((prev) => {
          const next = new Set(prev);
          if (wanted) next.delete(id);
          else next.add(id);
          return next;
        });
        if (err.status === 401) logout();
        else notify("Couldn't update your saved cars. Please try again.", "error");
        return false;
      }
    },
    [logout, notify]
  );

  const value = useMemo(() => ({ ids, has, setFavourite }), [ids, has, setFavourite]);

  return (
    <FavouritesContext.Provider value={value}>
      {children}
      {toastNode}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error("useFavourites must be used inside <FavouritesProvider>");
  return ctx;
}

/* What a heart button needs:
     const { isFavourite, toggle } = useFavouriteActions();
     <CarCard isFavourite={isFavourite(car.id)} onFavouriteChange={(next) => toggle(car.id, next)} />
   Logged-out users are sent to the login form first. */
export function useFavouriteActions() {
  const { isLoggedIn } = useAuth();
  const { has, setFavourite } = useFavourites();
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = useCallback(
    (carId, next) => {
      if (!isLoggedIn) {
        navigate("/login", {
          state: { from: location, notice: "Please log in to save cars." },
        });
        return;
      }
      setFavourite(carId, next ?? !has(carId));
    },
    [isLoggedIn, navigate, location, setFavourite, has]
  );

  return { isFavourite: has, toggle };
}