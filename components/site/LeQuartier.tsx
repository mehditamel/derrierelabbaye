import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { photosAbbaye } from "@/data/photosAbbaye";
import { CreditPhotoAbbaye } from "./AbbayePhoto";
import styles from "./LeQuartier.module.css";

export function LeQuartier() {
  return (
    <section id="le-quartier" className={styles.section} aria-labelledby="quartier-titre">
      <div className={styles.scene}>
        <div className={styles.photo}>
          <Image
            src={photosAbbaye.nuit.image}
            alt={photosAbbaye.nuit.alt}
            fill
            sizes="100vw"
            placeholder="blur"
          />
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.frame} aria-hidden="true" />
        <div className={["u-container", styles.layout].join(" ")}>
          <Reveal className={styles.head}>
            <SectionLabel onDark>Marseille, côté Saint-Victor</SectionLabel>
            <h2 id="quartier-titre" className={styles.title}>
              La ville s&apos;illumine.
              <br />
              <em>La soirée commence.</em>
            </h2>
          </Reveal>
          <div className={styles.bottom}>
            <Reveal className={styles.caption}>
              <span className={styles.arrondissement} aria-hidden="true">
                07
              </span>
              <p>
                Notre voisine
                <br />
                <strong>L&apos;Abbaye Saint-Victor</strong>
              </p>
            </Reveal>
            <Reveal delay={100} className={styles.copy}>
              <p>
                Les lumières du Vieux-Port, les pierres de Saint-Victor. Et juste derrière
                l&apos;Abbaye, votre prochaine soirée.
              </p>
              <Button href="/quartier-saint-victor" variant="ghost-dark">
                Explorer Saint-Victor <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
      <div className={["u-container", styles.footnote].join(" ")}>
        <span className={styles.landmarks}>
          Saint-Victor <i>·</i> Vieux-Port <i>·</i> Le Pharo
        </span>
        <CreditPhotoAbbaye photo="nuit" onDark />
      </div>
    </section>
  );
}
