"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/usePwa";
import styles from "./InstallPrompt.module.css";

/** Invite maison « Installer l'app » (apparaît si le navigateur le permet). */
export function InstallPrompt() {
  const { canInstall, iosHint, promptInstall, dismiss } = useInstallPrompt();

  if (canInstall) {
    return (
      <div className={styles.card} role="dialog" aria-label="Installer l'application">
        <div className={styles.text}>
          <strong className={styles.title}>Installer l'app</strong>
          <span className={styles.sub}>La carte et la réservation, dans votre poche.</span>
        </div>
        <button className={styles.install} onClick={promptInstall}>
          <Download size={16} strokeWidth={1.75} aria-hidden />
          Installer
        </button>
        <button className={styles.close} onClick={dismiss} aria-label="Plus tard">
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    );
  }

  // iOS Safari : pas d'invite native, on explique le geste.
  if (iosHint) {
    return (
      <div className={styles.card} role="dialog" aria-label="Installer l'application">
        <div className={styles.text}>
          <strong className={styles.title}>Installer l'app</strong>
          <span className={styles.steps}>
            Touchez <Share size={14} aria-hidden="true" />
            <span className="u-visually-hidden">Partager</span> puis « Sur
            l'écran d'accueil <SquarePlus size={14} aria-hidden="true" /> »
          </span>
        </div>
        <button className={styles.close} onClick={dismiss} aria-label="J'ai compris">
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    );
  }

  return null;
}
