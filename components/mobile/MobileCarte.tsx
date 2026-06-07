"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { MenuRow } from "@/components/MenuRow";
import { ScrollTop } from "@/components/mobile/ScrollTop";
import { site } from "@/data/site";
import {
  aPartagerFroid,
  aPartagerChaud,
  planches,
  barSections,
  boissonsDouces,
  type MenuSection,
} from "@/data/menu";
import styles from "./MobileCarte.module.css";

const onglets: { id: string; label: string; sections: MenuSection[] }[] = [
  { id: "froid", label: "Froid", sections: [aPartagerFroid] },
  { id: "chaud", label: "Chaud", sections: [aPartagerChaud] },
  { id: "planches", label: "Planches", sections: [planches] },
  { id: "cocktails", label: "Cocktails", sections: barSections },
  { id: "boissons", label: "Boissons", sections: boissonsDouces },
];

const PANEL_ID = "carte-panel";

export function MobileCarte() {
  const [actif, setActif] = useState("froid");
  const courant = onglets.find((o) => o.id === actif) ?? onglets[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onTabsKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = onglets.findIndex((o) => o.id === actif);
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % onglets.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + onglets.length) % onglets.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = onglets.length - 1;
    else return;
    e.preventDefault();
    setActif(onglets[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h" style={{ fontSize: "1.9rem" }}>
          La carte
        </h1>
        <p className={styles.sub}>Bar à tapas & cocktails</p>
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Sections de la carte"
        onKeyDown={onTabsKeyDown}
      >
        {onglets.map((o, i) => {
          const selected = actif === o.id;
          return (
            <button
              key={o.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${o.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={PANEL_ID}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
              onClick={() => setActif(o.id)}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div
        className="app-pad"
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={`tab-${actif}`}
        tabIndex={0}
      >
        {courant.sections.map((section) => (
          <section key={section.id} className={styles.block}>
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle}>{section.titre}</h2>
              {section.surtitre && (
                <span className={styles.blockPrice}>{section.surtitre}</span>
              )}
            </div>
            <div>
              {section.items.map((item) => (
                <MenuRow key={item.nom} item={item} onDark />
              ))}
            </div>
          </section>
        ))}
        <p className={styles.legal}>{site.legal}</p>
      </div>

      <ScrollTop />
    </div>
  );
}
