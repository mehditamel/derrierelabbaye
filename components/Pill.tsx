"use client";

import type { ReactNode } from "react";
import styles from "./Pill.module.css";

type Props = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onDark?: boolean;
};

/** Pilule de filtre / label — le seul motif arrondi de la marque. */
export function Pill({ children, active = false, onClick, onDark = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${styles.pill} ${active ? styles.active : ""} ${onDark ? styles.onDark : ""}`}
    >
      {children}
    </button>
  );
}
