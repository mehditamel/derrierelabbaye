import { MapPin, Phone, Navigation, Mail, Footprints, Bus, Car, Bike } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { StatutOuverture } from "@/components/StatutOuverture";
import { copies, site, acces } from "@/data/site";
import styles from "./NousTrouver.module.css";

const accesIcones = { "À pied": Footprints, "En bus": Bus, "En voiture": Car, "À vélo": Bike };

export function NousTrouver() {
  const telHref = `tel:${site.telephone.replace(/\s/g, "")}`;

  return (
    <section id="nous-trouver" className={styles.section}>
      <div className="u-container">
        <div className={styles.head}>
          <SectionLabel>{copies.nousTrouverSurtitre}</SectionLabel>
          <h2 className={styles.title}>{copies.nousTrouverTitre}</h2>
          <Reveal delay={60}>
            <GoldRule className={styles.rule} draw />
          </Reveal>
          <p className={styles.text}>{copies.nousTrouverTexte}</p>
        </div>

        <Reveal className={styles.grid}>
          {/* Le plan intègre Google Maps sans clé API (cf. data/site.ts).
              loading="lazy" : on ne contacte Google qu'au défilement (perf + vie privée). */}
          <div className={styles.mapWrap}>
            <iframe
              className={styles.map}
              src={site.adresse.embedUrl}
              title={`Plan — ${site.nom}, ${site.adresse.rue}, ${site.adresse.codePostal} ${site.adresse.ville}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className={styles.info}>
            <StatutOuverture
              className={styles.status}
              dotClassName={styles.dot}
              dotFermeClassName={styles.dotFerme}
            />

            <address className={styles.address}>
              <MapPin size={18} strokeWidth={1.5} />
              <span>
                {site.adresse.rue}
                <br />
                {site.adresse.codePostal} {site.adresse.ville}
                <br />
                quartier {site.adresse.quartier}
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
              <Button href={telHref} variant="primary" target="_self">
                <Phone size={18} strokeWidth={1.5} /> Appeler · {site.telephoneAffichage}
              </Button>
              <Button href={site.adresse.directionsUrl} variant="ghost">
                <Navigation size={18} strokeWidth={1.5} /> Itinéraire
              </Button>
              <Button href={`mailto:${site.email}`} variant="ghost" target="_self">
                <Mail size={18} strokeWidth={1.5} /> Écrire
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
