"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/usePwa";
import styles from "./OfflineBanner.module.css";

/** Bandeau d'information affiché quand l'appareil est hors connexion. */
export function OfflineBanner() {
  const online = useOnline();
  const pathname = usePathname();
  if (online) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOff size={15} strokeWidth={1.75} aria-hidden />
      <span>Hors connexion — vous consultez une version enregistrée.</span>
      {pathname !== "/app/carte" && (
        <Link href="/app/carte" className={styles.lien}>
          Voir la carte
        </Link>
      )}
    </div>
  );
}
