"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import styles from "./Header.module.css";

const liens = [
  { href: "/#le-lieu", label: "Le lieu" },
  { href: "/#le-quartier", label: "Le quartier" },
  { href: "/#la-carte", label: "La carte" },
  { href: "/#cocktails", label: "Cocktails" },
  { href: "/#nous-trouver", label: "Nous trouver" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Le header transparent n'est lisible que sur le hero de l'accueil.
  // Ailleurs (fond ivoire), on le force en version pleine.
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const solid = !isHome || scrolled;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Échap ferme le drawer, et la tabulation reste captive tant qu'il est ouvert.
  //
  // Le tiroir couvre toute la page et verrouille le défilement : sans piège, on
  // tabule depuis le dernier lien vers du contenu invisible, situé derrière le
  // voile. C'est le seul élément qui manquait — Échap et le retour du focus au
  // bouton étaient déjà en place.
  useEffect(() => {
    if (!open) return;

    const focalisables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    // Le focus entre dans le tiroir : sans cela, la tabulation repartirait du
    // haut du document, derrière le voile.
    focalisables()[0]?.focus();

    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      // Le bouton burger précède le tiroir dans le DOM : il ouvre le cycle,
      // sinon la tabulation depuis le dernier lien s'échappe vers le body.
      const cibles = [burgerRef.current, ...focalisables()].filter(Boolean) as HTMLElement[];
      if (cibles.length === 0) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];

      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Toute navigation ferme le drawer (couvre le CTA « Réserver une table »,
  // dont le lien ne transmet pas de onClick).
  useEffect(() => {
    // fermeture en réaction à la navigation : il n'y a pas d'événement à écouter côté lien.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`${styles.header} ${solid ? styles.solid : ""} ${open ? styles.menuOpen : ""}`}
    >
      <div className={`u-container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label="Derrière l'Abbaye — accueil">
          <Logo tone="cream" width={148} />
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {liens.map((l) => (
            <Link key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button href="/reserver" variant="primary">
            Réserver
          </Button>
        </div>

        <button
          type="button"
          ref={burgerRef}
          className={styles.burger}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div
          id="menu-mobile"
          ref={drawerRef}
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <nav className={styles.drawerNav} aria-label="Navigation mobile">
            {liens.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={styles.drawerLink}
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button href="/reserver" variant="primary">
            Réserver une table
          </Button>
        </div>
      )}
    </header>
  );
}
