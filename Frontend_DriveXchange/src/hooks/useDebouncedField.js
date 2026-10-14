// src/hooks/useDebouncedField.js
// An input that updates instantly while typing, but only tells the parent
// (and therefore the URL / server) after the user pauses typing.
// If the parent value changes by itself (Clear all, Back button) it adopts it.
import { useEffect, useRef, useState } from "react";

export function useDebouncedField(external, commit, delay = 400) {
  const [local, setLocal] = useState(external);
  const lastExternal = useRef(external);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // parent changed the value -> follow it
  useEffect(() => {
    if (external !== lastExternal.current) {
      lastExternal.current = external;
      setLocal(external);
    }
  }, [external]);

  // user typed -> commit after a pause
  useEffect(() => {
    if (local === lastExternal.current) return;
    const t = setTimeout(() => {
      lastExternal.current = local;
      commitRef.current(local);
    }, delay);
    return () => clearTimeout(t);
  }, [local, delay]);

  return [local, setLocal];
}