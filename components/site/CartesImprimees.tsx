import Image from "next/image";
import { Download } from "lucide-react";
import { GoldRule } from "@/components/GoldRule";
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
    <section className={styles.section}>
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>Sur le comptoir</SectionLabel>
            <h2 className={styles.title}>La carte imprimée</h2>
            <p className={styles.intro}>
              Celle que l&apos;on vous tend à table — papier ivoire, filets dorés et branches
              d&apos;olivier. À feuilleter ici, ou à emporter avec vous.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <div className={styles.grid}>
          {cartes.map((carte, i) => (
            <Reveal key={carte.href} delay={i * 90}>
              <figure className={styles.figure}>
                <Image
                  src={carte.image}
                  alt={carte.alt}
                  placeholder="blur"
                  sizes="(max-width: 700px) 100vw, 420px"
                  className={styles.photo}
                />
                <figcaption className={styles.caption}>
                  <span>{carte.titre}</span>
                  <a href={carte.href} download={carte.fichier} className={styles.download}>
                    <Download size={14} strokeWidth={1.5} aria-hidden="true" />
                    Télécharger <span className="u-visually-hidden">{carte.titre} </span>(JPG)
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
