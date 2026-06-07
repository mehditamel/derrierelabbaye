"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { haptic } from "@/lib/haptic";
import styles from "./ShareButton.module.css";

type Props = {
  /** URL à partager (par défaut : la page courante). */
  url?: string;
  title: string;
  text: string;
};

/** Bouton de partage natif (Web Share API) avec repli copie du lien. */
export function ShareButton({ url, title, text }: Props) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    haptic();
    const cible = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: cible });
      } catch {
        /* partage annulé : on n'affiche rien */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(cible);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <button
      className={styles.button}
      onClick={partager}
      aria-label={copie ? "Lien copié" : "Partager"}
    >
      {copie ? (
        <Check size={17} strokeWidth={1.75} aria-hidden />
      ) : (
        <Share2 size={17} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
