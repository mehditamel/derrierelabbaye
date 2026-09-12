import { GalerieCartes } from "./GalerieCartes";
import { SectionLabel } from "@/components/SectionLabel";
import { Reveal } from "@/components/Reveal";
import carteRecto from "@/public/carte-recto.jpg";
import carteVerso from "@/public/carte-verso.jpg";
import styles from "./CartesImprimees.module.css";

/* Les deux cartes imprimées photographiées — celles que l'on tient en main
   au comptoir. Elles servent de référence : la carte en ligne les transcrit. */
const cartes = [
  {
    image: carteRecto,
    titre: "La carte cuisine",
    alt: "Carte imprimée de Derrière l'Abbaye — tapas à partager, planches et desserts",
    href: "/carte-recto.jpg",
    fichier: "derriere-labbaye-carte-cuisine.jpg",
  },
  {
    image: carteVerso,
    titre: "La carte des boissons",
    alt: "Carte imprimée de Derrière l'Abbaye — softs, vins, cocktails et long drinks",
    href: "/carte-verso.jpg",
    fichier: "derriere-labbaye-carte-boissons.jpg",
  },
] as const;

export function CartesImprimees() {
  return (
    <section id="cartes-imprimees" className={styles.section} aria-labelledby="cartes-titre">
      <div className="u-container">
        <Reveal>
          <div className={styles.head}>
            <div>
              <SectionLabel>Sur le comptoir</SectionLabel>
              <h2 id="cartes-titre" className={styles.title}>
                Comme à table.
              </h2>
            </div>
            <p className={styles.intro}>
              La carte imprimée, à feuilleter du bout des doigts. Ouvrez la cuisine ou les boissons,
              agrandissez le texte ou téléchargez-les pour les garder sous la main.
            </p>
          </div>
        </Reveal>

        <GalerieCartes cartes={cartes} />
      </div>
    </section>
  );
}
