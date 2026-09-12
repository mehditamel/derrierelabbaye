"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Phone } from "lucide-react";
import { site } from "@/data/site";
import styles from "./ReservationAccess.module.css";

export function ReservationEnLigne({
  children,
  mobile = false,
}: {
  children: ReactNode;
  mobile?: boolean;
}) {
  const [etat, setEtat] = useState<"chargement" | "disponible" | "indisponible" | "erreur">(
    "chargement"
  );
  const [demo, setDemo] = useState(false);
  const [tentative, setTentative] = useState(0);
  useEffect(() => {
    const controle = new AbortController();
    const delai = window.setTimeout(() => controle.abort(), 8_000);
    let actif = true;
    fetch("/api/reservations", { cache: "no-store", signal: controle.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Indisponible");
        const donnees = await r.json();
        if (typeof donnees.disponible !== "boolean") throw new Error("Réponse invalide");
        if (actif) {
          setDemo(donnees.demonstration === true);
          setEtat(donnees.disponible ? "disponible" : "indisponible");
        }
      })
      .catch(() => {
        if (actif) setEtat("erreur");
      })
      .finally(() => window.clearTimeout(delai));
    return () => {
      actif = false;
      controle.abort();
      window.clearTimeout(delai);
    };
  }, [tentative]);

  if (etat === "disponible")
    return (
      <>
        {demo && (
          <p role="status" className={styles.demo}>
            Mode démonstration : aucune demande ne sera envoyée au bar.
          </p>
        )}
        {children}
      </>
    );

  return (
    <div className={`${styles.wrap} ${mobile ? styles.mobile : ""}`}>
      {mobile && <h1 className="app-h app-h1">Réserver</h1>}
      <p role="status">
        {etat === "chargement"
          ? "Chargement du formulaire… Vous pouvez aussi nous appeler."
          : "Pour réserver votre table, appelez-nous. Nous prenons votre demande directement par téléphone."}
      </p>
      <a className={styles.call} href={`tel:${site.telephone.replace(/\s/g, "")}`}>
        <Phone size={18} aria-hidden="true" />
        {site.telephoneAffichage}
      </a>
      <p>Du mardi au dimanche, de 18h00 à 02h00.</p>
      {etat === "erreur" && (
        <button
          className={styles.retry}
          onClick={() => {
            setEtat("chargement");
            setTentative((n) => n + 1);
          }}
        >
          Réessayer le formulaire
        </button>
      )}
    </div>
  );
}
