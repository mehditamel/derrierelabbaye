"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRight, GlassWater, Martini, Wine } from "lucide-react";
import { MenuRow } from "@/components/MenuRow";
import {
  cocktailsClassiques,
  cocktailsCreations,
  longDrinks,
  shooters,
  softs,
  jusDeFruits,
  sirops,
  eauxMinerales,
  vins,
} from "@/data/menu";
import styles from "./BarCarte.module.css";

const categories = [
  {
    id: "cocktails",
    label: "Cocktails",
    icon: Martini,
    sections: [cocktailsClassiques, cocktailsCreations],
  },
  {
    id: "spiritueux",
    label: "Long drinks & shooters",
    icon: ArrowUpRight,
    sections: [longDrinks, shooters],
  },
  {
    id: "sans-alcool",
    label: "Sans alcool",
    icon: GlassWater,
    sections: [softs, jusDeFruits, sirops, eauxMinerales],
  },
  { id: "vins", label: "Vins", icon: Wine, sections: [vins] },
] as const;

export function BarCarte() {
  const [actif, setActif] = useState<string>("cocktails");
  const categorie = categories.find((c) => c.id === actif)!;

  return (
    <div id="carte-du-bar" className={styles.carte}>
      <div className={styles.intro}>
        <p>La carte du bar</p>
        <span>À chaque envie, son verre.</span>
      </div>
      <div
        className={styles.categories}
        role="group"
        aria-label="Choisir une catégorie de boissons"
      >
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={actif === id}
            aria-controls="boissons-selection"
            onClick={() => setActif(id)}
          >
            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="u-visually-hidden" role="status">
        {categorie.label} : {categorie.sections.reduce((n, s) => n + s.items.length, 0)} choix sur
        la carte.
      </p>
      <div id="boissons-selection" className={styles.selection}>
        <div key={actif} className={styles.grid}>
          {categorie.sections.map((section, index) => (
            <section
              key={section.id}
              className={styles.section}
              aria-labelledby={`bar-${section.id}`}
              style={{ "--card-delay": `${index * 55}ms` } as CSSProperties}
            >
              <div className={styles.head}>
                <h3 id={`bar-${section.id}`}>{section.titre}</h3>
                {section.surtitre && <span className={styles.price}>{section.surtitre}</span>}
              </div>
              <div className={styles.items}>
                {section.items.map((item) => (
                  <MenuRow key={item.nom} item={item} onDark headingLevel={4} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
