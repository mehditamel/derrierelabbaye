"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale";

type Props = {
  children: ReactNode;
  /** Délai d'apparition en ms. */
  delay?: number;
  /** Direction de l'apparition. */
  variant?: Variant;
  className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  up: "",
  left: "u-reveal--left",
  right: "u-reveal--right",
  scale: "u-reveal--scale",
};

/** Enveloppe d'apparition douce (fade + montée / glissement) au scroll. */
export function Reveal({ children, delay = 0, variant = "up", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`u-reveal ${VARIANT_CLASS[variant]} ${shown ? "is-in" : ""} ${className ?? ""}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
