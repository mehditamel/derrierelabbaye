"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/Button";
import { site } from "@/data/site";
import styles from "./NousTrouver.module.css";

/** Google n'est contacté qu'après le choix explicite du visiteur. */
export function PlanAcces() {
  const [charge, setCharge] = useState(false);
  return (
    <div className={styles.mapWrap}>
      {charge ? (
        <iframe
          className={styles.map}
          src={site.adresse.embedUrl}
          title={`Plan — ${site.nom}, ${site.adresse.rue}, ${site.adresse.codePostal} ${site.adresse.ville}`}
          referrerPolicy="no-referrer"
          allowFullScreen
        />
      ) : (
        <div className={styles.mapPlaceholder}>
          <MapPin size={32} strokeWidth={1.25} aria-hidden="true" />
          <h3>Juste derrière l&apos;Abbaye</h3>
          <p>
            {site.adresse.rue}
            <br />
            {site.adresse.codePostal} {site.adresse.ville}
          </p>
          <Button onClick={() => setCharge(true)} variant="primary">
            Afficher le plan Google Maps
          </Button>
          <p className={styles.mapNotice}>
            Le plan se charge avec Google uniquement à votre demande.
          </p>
          <a href={site.adresse.directionsUrl} target="_blank" rel="noreferrer">
            Ouvrir l&apos;itinéraire
          </a>
        </div>
      )}
    </div>
  );
}
