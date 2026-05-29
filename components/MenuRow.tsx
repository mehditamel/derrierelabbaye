import type { MenuItem } from "@/data/menu";
import styles from "./MenuRow.module.css";

type Props = {
  item: MenuItem;
  onDark?: boolean;
};

/** Ligne de menu : nom · points de conduite · prix, description italique. */
export function MenuRow({ item, onDark = false }: Props) {
  return (
    <div className={`${styles.row} ${onDark ? styles.onDark : ""}`}>
      <div className={styles.head}>
        <h3 className={styles.nom}>
          {item.signature && (
            <span className={styles.star} aria-label="Spécialité maison" title="Spécialité maison">
              ★
            </span>
          )}
          {item.nom}
        </h3>
        <span className={styles.leaders} aria-hidden="true" />
        {item.prix && <span className={styles.prix}>{item.prix}</span>}
      </div>
      {item.description && <p className={styles.desc}>{item.description}</p>}
    </div>
  );
}
