import { PlanAcces } from "./PlanAcces";
import Image from "next/image";
import { ArrowUpRight, Phone, Navigation, Mail, Footprints, Bus, Car, Bike } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { StatutOuverture } from "@/components/StatutOuverture";
import { copies, site, acces } from "@/data/site";
import { photosAbbaye } from "@/data/photosAbbaye";
import { CreditPhotoAbbaye } from "./AbbayePhoto";
import styles from "./NousTrouver.module.css";

const accesIcones = { "À pied": Footprints, "En bus": Bus, "En voiture": Car, "À vélo": Bike };

export function NousTrouver() {
  const telHref = `tel:${site.telephone.replace(/\s/g, "")}`;

  return (
    <section id="nous-trouver" className={styles.section}>
      <div className="u-container">
        <div className={styles.head}>
          <Reveal>
            <SectionLabel>{copies.nousTrouverSurtitre}</SectionLabel>
            <h2 className={styles.title}>
              Tous les chemins
              <br />
              <em>mènent à Saint-Victor.</em>
            </h2>
          </Reveal>
          <p className={styles.text}>
            Repérez l&apos;Abbaye, longez ses pierres, poussez notre porte. Votre soirée se trouve
            au 1 rue de l&apos;Abbaye, à deux pas du Vieux-Port.
          </p>
        </div>

        <Reveal className={styles.grid}>
          <PlanAcces
            preview={
              <>
                <Image
                  src={photosAbbaye.jour.image}
                  alt={photosAbbaye.jour.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 60vw"
                  placeholder="blur"
                />
                <p className={styles.mapCredit}>
                  <CreditPhotoAbbaye photo="jour" onDark />
                </p>
              </>
            }
          />

          <div className={styles.info}>
            <StatutOuverture
              className={styles.status}
              dotClassName={styles.dot}
              dotFermeClassName={styles.dotFerme}
            />

            <address className={styles.address}>
              <span>
                <strong>{site.adresse.rue}</strong>
                <span>
                  {site.adresse.codePostal} {site.adresse.ville} · {site.adresse.quartier}
                </span>
              </span>
            </address>

            <ul className={styles.hours}>
              {site.horaires.map((h) => (
                <li key={h.jours}>
                  <span>{h.jours}</span>
                  <span>{h.creneau}</span>
                </li>
              ))}
            </ul>

            <div className={styles.ctaRow}>
              <a href={telHref} className={styles.contactCall}>
                <span>
                  <Phone size={15} aria-hidden="true" /> Appeler le bar
                </span>
                <strong>
                  {site.telephoneAffichage} <ArrowUpRight size={23} aria-hidden="true" />
                </strong>
              </a>
              <Button href={site.adresse.directionsUrl} variant="ghost-dark">
                <Navigation size={18} strokeWidth={1.5} aria-hidden="true" /> Itinéraire
              </Button>
              <Button href={`mailto:${site.email}`} variant="ghost-dark" target="_self">
                <Mail size={18} strokeWidth={1.5} aria-hidden="true" /> Écrire
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className={styles.acces}>
          <h3 className={styles.accesTitre}>Comment venir</h3>
          <ul className={styles.accesList}>
            {acces.map((a) => {
              const Icone = accesIcones[a.mode as keyof typeof accesIcones];
              return (
                <li key={a.mode} className={styles.accesItem}>
                  <Icone size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <strong className={styles.accesMode}>{a.mode}</strong> — {a.detail}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
