"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, CalendarHeart, Star } from "lucide-react";
import { haptic } from "@/lib/haptic";
import styles from "./TabBar.module.css";

const tabs = [
  { href: "/app", label: "Accueil", icon: Home },
  { href: "/app/carte", label: "Carte", icon: UtensilsCrossed },
  { href: "/app/reserver", label: "Réserver", icon: CalendarHeart },
  { href: "/app/fidelite", label: "Fidélité", icon: Star },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label="Navigation de l'application">
      {tabs.map((tab) => {
        const active = tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={() => haptic(8)}
          >
            <Icon size={21} strokeWidth={1.5} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
