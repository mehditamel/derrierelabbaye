"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.css";

/** Fine barre dorée indiquant la progression de lecture. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    // Hauteur de défilement mise en cache : la lire dans la boucle rAF forçait
    // un recalcul de mise en page synchrone à CHAQUE frame de défilement. Elle
    // ne bouge qu'au redimensionnement ou quand le contenu change.
    let max = 0;
    const mesurer = () => {
      const doc = document.documentElement;
      max = doc.scrollHeight - doc.clientHeight;
    };

    const update = () => {
      raf = 0;
      const progress = max > 0 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      mesurer();
      onScroll();
    };

    mesurer();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Le contenu peut grandir après coup (images, sections révélées au
    // défilement) : on remesure alors, sans repasser par le défilement.
    const observer = new ResizeObserver(mesurer);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={ref} className={styles.bar} />
    </div>
  );
}
