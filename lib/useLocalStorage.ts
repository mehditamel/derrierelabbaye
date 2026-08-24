"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État synchronisé avec localStorage, sûr en SSR : rend la valeur initiale au
 * premier rendu (serveur + hydratation), puis lit la valeur stockée au montage.
 * `ready` passe à true une fois la lecture client effectuée.
 *
 * `valider` filtre les valeurs stockées de mauvaise forme. Sans lui, un JSON
 * syntaxiquement correct mais structurellement faux (clé écrite par une
 * ancienne version, bidouillée à la main, corrompue) était accepté tel quel :
 * un consommateur qui fait `contact.nom.trim()` lève alors à chaque rendu, et
 * comme la valeur fautive est relue à chaque montage, l'utilisateur reste
 * bloqué jusqu'à effacement manuel des données du site. On retombe désormais
 * sur la valeur initiale.
 */
export function useLocalStorage<T>(key: string, initial: T, valider?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const stocke: unknown = JSON.parse(raw);
        if (!valider || valider(stocke)) {
          // localStorage n'existe pas au rendu serveur ; l'hydratation doit partir de la
          // valeur initiale, puis rattraper la valeur stockée.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setValue(stocke as T);
        } else {
          // Valeur inexploitable : on la purge plutôt que de la relire à chaque montage.
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* lecture best-effort */
    }
    setReady(true);
    // On ne resynchronise que si la clé change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
