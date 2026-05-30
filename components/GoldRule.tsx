import styles from "./GoldRule.module.css";

type Props = {
  /** Symbole du nœud central. */
  node?: "diamond" | "none";
  /** Trace les filets depuis le centre à l'apparition. */
  draw?: boolean;
  className?: string;
};

export function GoldRule({ node = "diamond", draw = false, className }: Props) {
  return (
    <div
      className={`${styles.rule} ${draw ? styles.draw : ""} ${className ?? ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <span className={styles.line} />
      {node === "diamond" && <span className={styles.node}>◆</span>}
      <span className={styles.line} />
    </div>
  );
}
