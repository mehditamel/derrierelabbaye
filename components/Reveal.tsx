"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animationsReduites, observerApparition } from "@/lib/observateurReveal";

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

/** Enveloppe d'apparition douce (fade + montée / glissement) au scroll.
 *
 *  L'observation passe par `lib/observateurReveal` : un seul
 *  IntersectionObserver pour toute la page, au lieu d'un par instance — il y en
 *  a 34 sur l'accueil et 25 sur /carte. */
export function Reveal({ children, delay = 0, variant = "up", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sous « animations réduites », la CSS d'apparition ne s'applique pas : le
    // contenu est déjà visible et observer ne servirait à rien.
    if (animationsReduites()) return;
    return observerApparition(el, () => setShown(true));
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
