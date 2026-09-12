"use client";
import { Pause, Play } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import styles from "./MotionControl.module.css";

const MotionContext = createContext({ paused: false, toggle: () => {} });

/** Un réglage partagé par les boutons de l'accueil et de la carte. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
    window.dispatchEvent(new Event("dla-motion-change"));
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);
  return (
    <MotionContext.Provider value={{ paused, toggle: () => setPaused((value) => !value) }}>
      {children}
    </MotionContext.Provider>
  );
}

export function MotionControl() {
  const { paused, toggle } = useContext(MotionContext);
  return (
    <button
      type="button"
      className={styles.control}
      onClick={toggle}
      aria-pressed={paused}
      aria-label={paused ? "Reprendre les animations" : "Mettre les animations en pause"}
    >
      {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      <span>{paused ? "Animer" : "Pause"}</span>
    </button>
  );
}
