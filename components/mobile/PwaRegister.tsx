"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UpdateToast } from "./UpdateToast";

/**
 * Enregistre le service worker (PWA installable) et détecte les mises à jour :
 * quand un nouveau worker est prêt alors qu'un autre contrôle déjà la page,
 * on propose un rechargement via UpdateToast.
 */
export function PwaRegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;
    const onControllerChange = () => {
      // Le nouveau worker a pris le contrôle → on recharge une seule fois.
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const trackWaiting = (reg: ServiceWorkerRegistration) => {
      const sw = reg.installing ?? reg.waiting;
      if (!sw) return;
      const check = () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          waitingRef.current = reg.waiting ?? sw;
          setUpdateReady(true);
        }
      };
      check();
      sw.addEventListener("statechange", check);
    };

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (reg.waiting && navigator.serviceWorker.controller) {
            waitingRef.current = reg.waiting;
            setUpdateReady(true);
          }
          reg.addEventListener("updatefound", () => trackWaiting(reg));
        })
        .catch(() => {
          /* enregistrement best-effort */
        });
    };
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const reload = useCallback(() => {
    const waiting = waitingRef.current;
    if (waiting) {
      // Le SW répond à ce message en appelant skipWaiting() → controllerchange → reload.
      waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }, []);

  if (!updateReady) return null;
  return <UpdateToast onReload={reload} />;
}
