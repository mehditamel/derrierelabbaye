"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { haptic } from "@/lib/haptic";
import styles from "./ScrollTop.module.css";

/** Bouton flottant « haut de page », visible après défilement (pages longues). */
export function ScrollTop({ seuil = 600 }: { seuil?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > seuil);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [seuil]);

  if (!visible) return null;

  return (
    <button
      className={styles.button}
      aria-label="Revenir en haut"
      onClick={() => {
        haptic();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <ArrowUp size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
