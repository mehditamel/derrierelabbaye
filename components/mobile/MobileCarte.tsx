"use client";

import { useState } from "react";
import { MenuRow } from "@/components/MenuRow";
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

export function MobileCarte() {
  const [actif, setActif] = useState("froid");
  const courant = onglets.find((o) => o.id === actif) ?? onglets[0];

  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h" style={{ fontSize: "1.9rem" }}>
          La carte
        </h1>
        <p className={styles.sub}>Bar à tapas & cocktails</p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Sections de la carte">
        {onglets.map((o) => (
          <button
            key={o.id}
            role="tab"
            aria-selected={actif === o.id}
            className={`${styles.tab} ${actif === o.id ? styles.tabActive : ""}`}
            onClick={() => setActif(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="app-pad">
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
        <p className={styles.legal}>
          L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
        </p>
      </div>
    </div>
  );
}
