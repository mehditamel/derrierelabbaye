import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { site } from "@/data/site";
import { ReservationEnLigne } from "./ReservationEnLigne";
import styles from "./ReservationAccess.module.css";

/** Le choix de l'établissement est rendu côté serveur : appel direct, même sans JavaScript. */
export function ReservationAccess({
  children,
  mobile = false,
}: {
  children: ReactNode;
  mobile?: boolean;
}) {
  if (site.reservationEnLigne)
    return <ReservationEnLigne mobile={mobile}>{children}</ReservationEnLigne>;
  return (
    <div className={`${styles.wrap} ${mobile ? styles.mobile : ""}`}>
      {mobile && <h1 className="app-h app-h1">Réserver une table</h1>}
      <p>
        Un apéro à deux, une soirée entre amis ou une grande tablée ? Appelez-nous pour réserver.
      </p>
      <a className={styles.call} href={`tel:${site.telephone.replace(/\s/g, "")}`}>
        <Phone size={18} aria-hidden="true" />
        <span>
          Appeler le bar<strong>{site.telephoneAffichage}</strong>
        </span>
      </a>
      <p>
        Du mardi au dimanche, de 18h00 à 02h00.
        <br />
        Fermé le lundi soir.
      </p>
      <p>Nous vous confirmons votre table directement par téléphone.</p>
    </div>
  );
}
