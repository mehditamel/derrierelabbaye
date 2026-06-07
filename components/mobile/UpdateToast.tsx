"use client";

import { RefreshCw } from "lucide-react";
import styles from "./UpdateToast.module.css";

/** Toast « Mise à jour disponible » — présentation pure, piloté par PwaRegister. */
export function UpdateToast({ onReload }: { onReload: () => void }) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.label}>Une nouvelle version est disponible.</span>
      <button className={styles.action} onClick={onReload}>
        <RefreshCw size={15} strokeWidth={1.75} aria-hidden />
        Recharger
      </button>
    </div>
  );
}
