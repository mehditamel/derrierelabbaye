"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Leaf, Search, X } from "lucide-react";
import { MenuRow } from "@/components/MenuRow";
import { ScrollTop } from "@/components/mobile/ScrollTop";
import { haptic } from "@/lib/haptic";
import { site } from "@/data/site";
import { filtrerSections } from "@/lib/recherche";
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
  const [requete, setRequete] = useState("");
  const courant = onglets.find((o) => o.id === actif) ?? onglets[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // En recherche, on parcourt toute la carte (cuisine + cocktails + boissons),
  // pas seulement l'onglet actif.
  const recherche = requete.trim() !== "";
  const sections = filtrerSections(
    recherche ? onglets.flatMap((o) => o.sections) : courant.sections,
    requete
  );
  const nbResultats = sections.reduce((n, s) => n + s.items.length, 0);

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
        <h1 className="app-h app-h1">La carte</h1>
        <p className={styles.sub}>Bar à tapas & cocktails</p>
      </div>

      <div className={styles.search} role="search">
        <Search size={16} strokeWidth={1.5} aria-hidden="true" />
        <input
          type="search"
          value={requete}
          onChange={(e) => setRequete(e.target.value)}
          className={styles.searchInput}
          placeholder="Rechercher un plat, un cocktail…"
          aria-label="Rechercher dans la carte"
        />
        {requete && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setRequete("")}
            aria-label="Effacer la recherche"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="u-visually-hidden" role="status" aria-live="polite">
        {recherche ? `${nbResultats} résultat${nbResultats > 1 ? "s" : ""}` : ""}
      </p>

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
              onClick={() => {
                haptic(8);
                setRequete("");
                setActif(o.id);
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* key={actif} : remonte le panneau → ré-anime le contenu au changement d'onglet */}
      <div
        key={actif}
        className={`app-pad ${styles.panel}`}
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={recherche ? undefined : `tab-${actif}`}
        aria-label={recherche ? "Résultats de la recherche" : undefined}
        tabIndex={0}
      >
        {recherche && sections.length === 0 ? (
          <div className={styles.empty} role="status">
            <p className={styles.emptyTitle}>Rien à ce nom sur la carte</p>
            <p className={styles.emptyText}>
              Essayez « burrata », « poulpe » ou « mojito » — ou demandez à
              l'équipe, on a toujours une idée.
            </p>
            <button
              type="button"
              className={styles.emptyClear}
              onClick={() => {
                haptic(8);
                setRequete("");
              }}
            >
              Effacer la recherche
            </button>
          </div>
        ) : (
          sections.map((section) => (
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
          ))
        )}
        <p className={styles.legende}>
          <span aria-hidden="true">★</span> nos spécialités maison ·{" "}
          <Leaf size={11} aria-hidden="true" className={styles.legendeLeaf} />{" "}
          végétarien
        </p>
        <p className={styles.legal}>{site.legal}</p>
      </div>

      <ScrollTop />
    </div>
  );
}
