"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import styles from "./Header.module.css";

const liens = [
  { href: "/#le-lieu", label: "Le lieu" },
  { href: "/#la-carte", label: "La carte" },
  { href: "/#cocktails", label: "Cocktails" },
  { href: "/#nous-trouver", label: "Nous trouver" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  return (
    <header
      className={`${styles.header} ${solid ? styles.solid : ""} ${
        open ? styles.menuOpen : ""
      }`}
    >
      <div className={`u-container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label="Derrière l'Abbaye — accueil">
          <Logo tone="cream" width={148} priority />
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
          className={styles.burger}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className={styles.drawer}>
          <nav className={styles.drawerNav} aria-label="Navigation mobile">
            {liens.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={styles.drawerLink}
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
