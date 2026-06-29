import { site } from "@/data/site";
import styles from "./LegalLine.module.css";

type Props = {
  onDark?: boolean;
  className?: string;
};

/** Mention légale obligatoire (alcool). À afficher en pied de page. */
export function LegalLine({ onDark = false, className }: Props) {
  return (
    <p className={`${styles.legal} ${onDark ? styles.onDark : ""} ${className ?? ""}`}>
      {site.legal}
    </p>
  );
}
