"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

type Props = {
  src: StaticImageData;
  alt: string;
};

/** Image de fond du hero avec parallaxe douce au défilement. */
export function HeroBackdrop({ src, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // L'image dérive plus lentement que le contenu → effet de profondeur.
      const offset = Math.min(window.scrollY * 0.3, 160);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={styles.photoWrap}>
      <Image
        src={src}
        alt={alt}
        placeholder="blur"
        priority
        fill
        sizes="100vw"
        className={styles.photo}
      />
    </div>
  );
}
