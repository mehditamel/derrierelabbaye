import Link from "next/link";
import { configured } from "@/lib/ticket-or/server";
import { ArrowUpRight } from "lucide-react";
import styles from "./TicketOr.module.css";

export function TicketTeaser() {
  if (!configured()) return null;
  return (
    <section className={styles.teaser}>
      <div className={`u-container ${styles.teaserInner}`}>
        <div>
          <p className={styles.eyebrow}>Une attention de la maison</p>
          <h2>Le Ticket d’Or de l’Abbaye.</h2>
          <p>Découvrez le jeu gratuit et retrouvez vos bons personnels.</p>
        </div>
        <Link href="/ticket-or" className={styles.primary}>
          Découvrir le Ticket d’Or <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
