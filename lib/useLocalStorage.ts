"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État synchronisé avec localStorage, sûr en SSR : rend la valeur initiale au
 * premier rendu (serveur + hydratation), puis lit la valeur stockée au montage.
 * `ready` passe à true une fois la lecture client effectuée.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // localStorage n'existe pas au rendu serveur ; l'hydratation doit partir de la valeur
      // initiale, puis rattraper la valeur stockée.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* lecture best-effort */
    }
    setReady(true);
    // On ne resynchronise que si la clé change.
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* écriture best-effort */
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* best-effort */
    }
    setValue(initial);
  }, [key, initial]);

  return { value, set, remove, ready };
}
