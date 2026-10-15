// src/hooks/useCarDetails.js
import { useCallback, useEffect, useState } from "react";
import { getCarById } from "../api/carApi";

const INITIAL = { car: null, loading: true, error: "", notFound: false, unauthorized: false };

export default function useCarDetails(id) {
  const [state, setState] = useState(INITIAL);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState(INITIAL);

    getCarById(id, ctrl.signal)
      .then((car) => setState({ ...INITIAL, car, loading: false }))
      .catch((err) => {
        if (err?.name === "AbortError") return; // user navigated away

        // Spring answers 401/403 when the token is missing, invalid or expired
        const unauthorized = err.status === 401 || err.status === 403;
        const notFound = err.status === 404 || err.status === 400;

        setState({
          ...INITIAL,
          loading: false,
          unauthorized,
          notFound,
          error: unauthorized || notFound ? "" : err.message || "Could not load this car.",
        });
      });

    return () => ctrl.abort();
  }, [id, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
}