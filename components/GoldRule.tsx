import styles from "./GoldRule.module.css";

type Props = {
  /** Symbole du nœud central. */
  node?: "diamond" | "none";
  className?: string;
};

export function GoldRule({ node = "diamond", className }: Props) {
  return (
    <div
      className={`${styles.rule} ${className ?? ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <span className={styles.line} />
      {node === "diamond" && <span className={styles.node}>◆</span>}
      <span className={styles.line} />
    </div>
  );
}
