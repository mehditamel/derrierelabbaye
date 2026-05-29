import Image from "next/image";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { copies, site } from "@/data/site";
import enseigne from "@/public/enseigne.jpeg";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src={enseigne}
        alt="Devanture en acier corten de Derrière l'Abbaye, illuminée le soir"
        placeholder="blur"
        priority
        fill
        sizes="100vw"
        className={styles.photo}
      />
      <div className={styles.scrim} />
      <div className={styles.frame} aria-hidden="true" />

      <div className={styles.inner}>
        <Logo tone="cream" width={360} priority className={styles.logo} />
        <h1 className={styles.accroche}>{copies.heroAccroche}</h1>
        <p className={styles.address}>
          {site.adresse.rue} · {site.adresse.codePostal} {site.adresse.ville}
          {" — "}quartier {site.adresse.quartier}
        </p>
        <div className={styles.cta}>
          <Button href="/reserver" variant="primary">
            Réserver une table
          </Button>
          <Button href="/#la-carte" variant="ghost-dark">
            Voir la carte
          </Button>
        </div>
      </div>
    </section>
  );
}
