"use client";

import { useEffect, useState } from "react";
import { etatOuverture, type EtatOuverture } from "@/lib/horaires";
import { site } from "@/data/site";

type Props = {
  className: string;
  dotClassName: string;
  dotFermeClassName: string;
};

/**
 * Pastille « Ouvert · ferme à 01h00 » / « Fermé · ouvre mardi à 17h00 »,
 * calculée en heure de Paris et rafraîchie chaque minute.
 * Les classes viennent du parent : la pastille s'habille selon son contexte.
 */
export function StatutOuverture({ className, dotClassName, dotFermeClassName }: Props) {
  const [etat, setEtat] = useState<EtatOuverture | null>(null);

  useEffect(() => {
    const sync = () => setEtat(etatOuverture());
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Avant montage : même gabarit mais masqué — ni mensonge pré-rendu,
  // ni saut de mise en page à l'hydratation.
  return (
    <span className={className} style={etat ? undefined : { visibility: "hidden" }}>
      <span className={`${dotClassName} ${etat && !etat.ouvert ? dotFermeClassName : ""}`} />{" "}
      {etat ? etat.libelle : `Ouvert · ${site.fermeture}`}
    </span>
  );
}
