import { MapPin, Clock, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GoldRule } from "@/components/GoldRule";
import { LegalLine } from "@/components/LegalLine";
import { site } from "@/data/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer id="nous-trouver" className={styles.footer}>
      <div className="u-container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo tone="cream" width={220} />
            <p className={styles.accroche}>{site.accroche} · {site.baseline}</p>
          </div>

          <div className={styles.cols}>
            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                <MapPin size={15} strokeWidth={1.5} /> Adresse
              </h3>
              <a className={styles.line} href={site.adresse.mapsUrl} target="_blank" rel="noreferrer">
                {site.adresse.rue}
                <br />
                {site.adresse.codePostal} {site.adresse.ville}
                <br />
                quartier {site.adresse.quartier}
              </a>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                <Clock size={15} strokeWidth={1.5} /> Horaires
              </h3>
              <ul className={styles.hours}>
                {site.horaires.map((h) => (
                  <li key={h.jours}>
                    <span>{h.jours}</span>
                    <span>{h.creneau}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                <Phone size={15} strokeWidth={1.5} /> Contact
              </h3>
              <a className={styles.line} href={`tel:${site.telephone.replace(/\s/g, "")}`}>
                {site.telephoneAffichage}
              </a>
              <a className={styles.line} href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <div className={styles.social}>
                {site.reseaux.map((r) => (
                  <a key={r.nom} href={r.url} target="_blank" rel="noreferrer">
                    {r.nom}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <GoldRule className={styles.rule} />

        <div className={styles.bottom}>
          <LegalLine onDark />
          <p className={styles.copy}>
            © {new Date().getFullYear()} {site.nom} — {site.adresse.ville}
          </p>
        </div>
      </div>
    </footer>
  );
}
