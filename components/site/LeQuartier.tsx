import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import enseigne from "@/public/enseigne.jpeg";
import styles from "./LeQuartier.module.css";

export function LeQuartier() {
  return (
    <section id="le-quartier" className={styles.section}>
      <div className={["u-container", styles.layout].join(" ")}>
        <Reveal variant="left">
          <div className={styles.visual}>
            <div className={styles.photo}>
              <Image
                src={enseigne}
                alt="L'enseigne en acier corten de Derrière l'Abbaye, au 1 rue de l'Abbaye"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                placeholder="blur"
              />
            </div>
            <span className={styles.arrondissement} aria-hidden="true">
              07
            </span>
            <div className={styles.caption}>
              <span>Une adresse à garder</span>
              <strong>1, rue de l&apos;Abbaye</strong>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className={styles.copy}>
            <SectionLabel onDark>Marseille, côté Saint-Victor</SectionLabel>
            <h2 className={styles.title}>
              Le bon quartier.
              <br />
              <em>La bonne adresse.</em>
            </h2>
            <p>
              À deux pas du Vieux-Port, juste derrière l&apos;Abbaye Saint-Victor : un quartier qui
              vit, une petite rue à découvrir, et votre prochain rendez-vous.
            </p>
            <p>
              Après les quais ou un coucher de soleil au Pharo, la soirée continue ici. Poussez la
              porte.
            </p>
            <div className={styles.landmarks}>
              <span>Saint-Victor</span>
              <span>Vieux-Port</span>
              <span>Le Pharo</span>
            </div>
            <Button href="/quartier-saint-victor" variant="ghost-dark">
              Explorer Saint-Victor <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
