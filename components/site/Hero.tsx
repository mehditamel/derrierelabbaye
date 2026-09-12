import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/Button";
import { HeroBackdrop } from "./HeroBackdrop";
import { MotionControl } from "./MotionControl";
import { site } from "@/data/site";
import enseigne from "@/public/enseigne.jpeg";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="accueil-titre">
        <HeroBackdrop
          src={enseigne}
          alt="La devanture de Derrière l'Abbaye illuminée le soir, à Saint-Victor, Marseille"
        />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.halo} aria-hidden="true" />
        <div className={styles.frame} aria-hidden="true" />
        <div className={[styles.inner, "u-container"].join(" ")}>
          <p className={styles.eyebrow}>
            <span /> Marseille · Saint-Victor
          </p>
          <h1 id="accueil-titre" className={styles.title}>
            <span className="u-visually-hidden">Derrière l&apos;Abbaye — </span>
            La nuit a<br />
            <em>son adresse.</em>
          </h1>
          <p className={styles.description}>
            Des cocktails, des tapas, et la soirée devant vous.
            <br />
            Juste derrière l&apos;Abbaye. Au cœur de Marseille.
          </p>
          <div className={styles.cta}>
            <Button href="/reserver">
              Réserver une table <ArrowUpRight size={17} aria-hidden="true" />
            </Button>
            <Button href="/#la-carte" variant="ghost-dark">
              Explorer la carte
            </Button>
          </div>
        </div>
        <div className={styles.hours}>
          <span>Du mardi au dimanche</span>
          <strong>
            18h <i>—</i> 02h
          </strong>
          <span>Tapas · Cocktails · Nuits marseillaises</span>
        </div>
        <div className={[styles.bottom, "u-container"].join(" ")}>
          <a href="#le-lieu" className={styles.discover}>
            <ArrowDown size={17} aria-hidden="true" /> Entrez dans la soirée
          </a>
          <a href="#nous-trouver" className={styles.address}>
            {site.adresse.rue} · Marseille 7e <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <MotionControl />
        </div>
      </section>
      <div className={styles.ribbon}>
        <p className="u-visually-hidden">
          Saint-Victor, Marseille. Tapas à partager, cocktails et soirées jusqu&apos;à 02h.
        </p>
        <div className={styles.track} aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy}>
              Saint-Victor <i>✦</i> Cocktails <i>✦</i> Marseille la nuit <i>✦</i> Tapas à partager{" "}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
