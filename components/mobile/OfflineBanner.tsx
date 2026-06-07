"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/usePwa";
import styles from "./OfflineBanner.module.css";

/** Bandeau d'information affiché quand l'appareil est hors connexion. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOff size={15} strokeWidth={1.75} aria-hidden />
      <span>Hors connexion — vous consultez une version enregistrée.</span>
    </div>
  );
}
