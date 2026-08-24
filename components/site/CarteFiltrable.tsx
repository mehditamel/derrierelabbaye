"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Pill } from "@/components/Pill";
import { MenuRow } from "@/components/MenuRow";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { cuisine } from "@/data/menu";
import { filtrerSections } from "@/lib/recherche";
import styles from "./CarteSection.module.css";

/* Île interactive de la section carte : filtres, recherche et grille de plats.
   Tout ce qui l'entoure (titres, filet doré, note, légende, lien) est rendu
   côté serveur par CarteSection.

   À noter, pour ne pas s'illusionner sur le gain : les données de `cuisine`
   restent nécessairement ici. Le filtrage s'exécute à chaque frappe, côté
   client, sur l'ensemble des plats — les passer en props ne ferait que les
   déplacer du bundle vers la charge utile RSC. Ce qui sort réellement du
   bundle client, c'est `copies` (le plus gros objet de data/site.ts) et les
   composants de présentation restés côté serveur. */

const filtres = [
  { id: "tout", label: "Tout" },
  { id: "froid", label: "Froid" },
  { id: "chaud", label: "Chaud" },
  { id: "planches", label: "Planches" },
];

export function CarteFiltrable() {
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
    <>
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
    </>
  );
}
