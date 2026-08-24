import { Leaf } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { CarteFiltrable } from "./CarteFiltrable";
import { copies } from "@/data/site";
import styles from "./CarteSection.module.css";

type CarteSectionProps = {
  /** Affiche le renvoi vers la page /carte — à désactiver sur la page elle-même. */
  lienCarteComplete?: boolean;
};

/** Section « La carte » : coquille rendue côté serveur autour d'une seule île
 *  interactive (`CarteFiltrable`).
 *
 *  Tout ce qui est ici est du texte statique tiré de `copies` : le garder côté
 *  serveur sort `data/site.ts` — son plus gros objet — du bundle client, et
 *  laisse SectionLabel, GoldRule et Button en composants serveur sur cette
 *  route. Les données de la carte, elles, restent côté client : le filtrage
 *  s'exécute à chaque frappe (cf. commentaire dans CarteFiltrable). */
export function CarteSection({ lienCarteComplete = true }: CarteSectionProps) {
  return (
    <section id="la-carte" className={styles.section}>
      <div className="u-container">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>{copies.carteSurtitre}</SectionLabel>
            <h2 className={styles.title}>{copies.carteTitre}</h2>
            <p className={styles.sub}>{copies.carteSousTitre}</p>
            <p className={styles.intro}>{copies.carteIntro}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <CarteFiltrable />

        <p className={styles.note}>À accompagner d'un verre, d'une bouteille… ou des deux.</p>
        <p className={styles.legende}>
          <span aria-hidden="true">★</span> nos spécialités maison ·{" "}
          <Leaf size={11} aria-hidden="true" className={styles.legendeLeaf} /> végétarien
        </p>
        {lienCarteComplete && (
          <div className={styles.lienComplet}>
            <Button href="/carte" variant="ghost">
              Voir la carte complète
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
