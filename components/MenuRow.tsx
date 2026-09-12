import { Leaf } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import styles from "./MenuRow.module.css";

type Props = {
  item: MenuItem;
  onDark?: boolean;
  headingLevel?: 3 | 4;
};

/** Ligne de menu : nom · points de conduite · prix, description italique. */
export function MenuRow({ item, onDark = false, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 4 ? "h4" : "h3";
  return (
    <div className={`${styles.row} ${onDark ? styles.onDark : ""}`}>
      <div className={styles.head}>
        <Heading className={styles.nom}>
          {item.signature && (
            <>
              {/* aria-label sur un <span> nu est peu fiable : texte masqué dédié aux lecteurs d'écran */}
              <span className={styles.star} aria-hidden="true" title="Spécialité maison">
                ★
              </span>
              <span className="u-visually-hidden">Spécialité maison — </span>
            </>
          )}
          {item.nom}
          {item.vege && (
            <>
              <span className={styles.vege} aria-hidden="true" title="Végétarien">
                <Leaf size={12} strokeWidth={2} />
              </span>
              <span className="u-visually-hidden"> — végétarien</span>
            </>
          )}
        </Heading>
        <span className={styles.leaders} aria-hidden="true" />
        {item.prix && <span className={styles.prix}>{item.prix}</span>}
      </div>
      {item.description && <p className={styles.desc}>{item.description}</p>}
    </div>
  );
}
