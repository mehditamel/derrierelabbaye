import type { ReactNode } from "react";
import styles from "./SectionLabel.module.css";

type Props = {
  children: ReactNode;
  onDark?: boolean;
  as?: "span" | "p" | "h2";
  className?: string;
};

export function SectionLabel({ children, onDark = false, as = "span", className }: Props) {
  const Tag = as;
  return (
    <Tag className={`${styles.label} ${onDark ? styles.onDark : ""} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
