"use client";

import { useState } from "react";
import { Leaf, Search, X } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Pill } from "@/components/Pill";
import { MenuRow } from "@/components/MenuRow";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { cuisine } from "@/data/menu";
import { copies } from "@/data/site";
import { filtrerSections } from "@/lib/recherche";
import styles from "./CarteSection.module.css";

const filtres = [
  { id: "tout", label: "Tout" },
  { id: "froid", label: "Froid" },
  { id: "chaud", label: "Chaud" },
  { id: "planches", label: "Planches" },
];

type CarteSectionProps = {
  /** Affiche le renvoi vers la page /carte — à désactiver sur la page elle-même. */
  lienCarteComplete?: boolean;
};

export function CarteSection({ lienCarteComplete = true }: CarteSectionProps) {
  const [actif, setActif] = useState("tout");
  const [requete, setRequete] = useState("");
  const sections = filtrerSections(
    cuisine.filter((s) => actif === "tout" || s.id === actif),
    requete
  );
  const enRecherche = requete.trim() !== "";
  const nbResultats = sections.reduce((n, s) => n + s.items.length, 0);
  const aucunResultat = enRecherche && sections.length === 0;

  return (
    <section id="la-carte" className={styles.section}>
      <div className="u-container">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>{copies.carteSurtitre}</SectionLabel>
            <h2 className={styles.title}>{copies.carteTitre}</h2>
            <p className={styles.sub}>{copies.carteSousTitre}</p>
            <p className={styles.intro}>{copies.carteIntro}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <Reveal delay={120}>
          <div className={styles.filters} role="group" aria-label="Filtrer la carte">
            {filtres.map((f) => (
              <Pill key={f.id} active={actif === f.id} onClick={() => setActif(f.id)}>
                {f.label}
              </Pill>
            ))}
          </div>
          <div className={styles.search} role="search">
            <Search size={16} strokeWidth={1.5} aria-hidden="true" />
            <input
              type="search"
              value={requete}
              onChange={(e) => setRequete(e.target.value)}
              className={styles.searchInput}
              placeholder="Rechercher un plat…"
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
            {enRecherche ? `${nbResultats} résultat${nbResultats > 1 ? "s" : ""}` : ""}
          </p>
        </Reveal>

        {aucunResultat ? (
          <div className={styles.empty} role="status">
            <p className={styles.emptyTitle}>Rien à ce nom sur la carte</p>
            <p className={styles.emptyText}>
              Essayez « burrata », « poulpe » ou « planche » — ou demandez à l'équipe, on a toujours
              une idée.
            </p>
            <Button variant="ghost" onClick={() => setRequete("")}>
              Effacer la recherche
            </Button>
          </div>
        ) : (
          /* key={actif} : remonte la grille → ré-anime les blocs au filtrage */
          <div key={actif} className={styles.grid}>
            {sections.map((section, i) => (
              <Reveal key={section.id} delay={i * 70}>
                <div className={styles.block}>
                  <h3 className={styles.blockTitle}>{section.titre}</h3>
                  <div>
                    {section.items.map((item) => (
                      <MenuRow key={item.nom} item={item} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <p className={styles.note}>À accompagner d'un verre, d'une bouteille… ou des deux.</p>
        <p className={styles.legende}>
          <span aria-hidden="true">★</span> nos spécialités maison ·{" "}
          <Leaf size={11} aria-hidden="true" className={styles.legendeLeaf} /> végétarien
        </p>
        {lienCarteComplete && (
          <div className={styles.lienComplet}>
            <Button href="/carte" variant="ghost">
              Voir la carte complète
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
