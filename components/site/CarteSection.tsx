"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Pill } from "@/components/Pill";
import { MenuRow } from "@/components/MenuRow";
import { cuisine } from "@/data/menu";
import { copies } from "@/data/site";
import styles from "./CarteSection.module.css";

const filtres = [
  { id: "tout", label: "Tout" },
  { id: "froid", label: "Froid" },
  { id: "chaud", label: "Chaud" },
  { id: "planches", label: "Planches" },
];

export function CarteSection() {
  const [actif, setActif] = useState("tout");
  const sections = cuisine.filter((s) => actif === "tout" || s.id === actif);

  return (
    <section id="la-carte" className={styles.section}>
      <div className="u-container">
        <div className={styles.head}>
          <SectionLabel>{copies.carteSurtitre}</SectionLabel>
          <h2 className={styles.title}>{copies.carteTitre}</h2>
          <p className={styles.sub}>{copies.carteSousTitre}</p>
        </div>

        <GoldRule className={styles.rule} />

        <div className={styles.filters} role="group" aria-label="Filtrer la carte">
          {filtres.map((f) => (
            <Pill key={f.id} active={actif === f.id} onClick={() => setActif(f.id)}>
              {f.label}
            </Pill>
          ))}
        </div>

        <div className={styles.grid}>
          {sections.map((section) => (
            <div key={section.id} className={styles.block}>
              <h3 className={styles.blockTitle}>{section.titre}</h3>
              <div>
                {section.items.map((item) => (
                  <MenuRow key={item.nom} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          À accompagner d'un verre, d'une bouteille… ou des deux.
        </p>
      </div>
    </section>
  );
}
