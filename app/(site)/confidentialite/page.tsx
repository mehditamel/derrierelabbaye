import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { site } from "@/data/site";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité de Derrière l'Abbaye : réservation par téléphone, aucun traceur publicitaire et plan chargé à votre demande.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <section className={styles.page}>
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>Informations</SectionLabel>
          <h1 className={styles.title}>Confidentialité</h1>
          <GoldRule className={styles.rule} />
          <p className={styles.updated}>Dernière mise à jour : 13 septembre 2026</p>
        </div>

        <div className={styles.prose}>
          <h2>En bref</h2>
          <p>
            La consultation du site ne demande pas de compte et ne pose aucun traceur publicitaire.
            Les réservations se font par téléphone. Le site est hébergé par Vercel, qui reçoit les
            informations techniques nécessaires à la connexion, notamment votre adresse IP. Le plan
            Google Maps ne se charge qu'après votre choix de l'afficher.
          </p>

          <h2>Réservation par téléphone</h2>
          <p>
            Le site vous permet d'appeler directement le bar au {site.telephoneAffichage}. Aucun
            formulaire de réservation en ligne n'est actuellement proposé et aucun e-mail
            automatique n'est envoyé par le site. Les informations que vous communiquez par
            téléphone servent à organiser votre venue.
          </p>
          <h2>Le Ticket d’Or</h2>
          <p>
            L’avant-première du jeu fonctionne sans inscription, sans SMS et sans lot réel. À
            l’ouverture du jeu, la participation utilisera un prénom et un mobile vérifié. Le nom et
            l’e-mail resteront facultatifs. Les accords pour recevoir les nouvelles du bar par
            e-mail ou SMS seront séparés, facultatifs et sans effet sur les gains. Les modalités,
            durées de conservation et droits figurent dans le{" "}
            <a href="/ticket-or/reglement#vos-donnees">règlement et la notice du jeu</a>.
          </p>
          <p>
            Le jeu actif utilisera uniquement des cookies nécessaires : vérification SMS pendant dix
            minutes, connexion joueur pendant sept jours et connexion équipe pendant huit heures.
            Les pages et les bons du jeu ne sont pas disponibles dans le cache hors ligne.
          </p>
          <h2>Données des anciennes versions</h2>
          <p>
            Si vous avez utilisé une ancienne version de l'application, des coordonnées de
            formulaire ou des points de démonstration peuvent encore être enregistrés sur votre
            appareil. Ils ne sont pas utilisés par la version actuelle. Vous pouvez les supprimer
            dans les réglages de stockage de votre navigateur.
          </p>

          <h2>Stockage technique</h2>
          <p>Le site mémorise sur votre appareil, sans transmission :</p>
          <ul>
            <li>votre choix de masquer l'invite d'installation de l'app ;</li>
            <li>
              une copie hors-ligne de la carte et des pages de l'app (cache du service worker), pour
              consulter la carte sans réseau.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>Aucun cookie de suivi, aucune mesure d'audience, aucune publicité.</p>

          <h2>Services tiers</h2>
          <p>
            Si vous choisissez « Afficher le plan Google Maps » ou ouvrez l'itinéraire, votre
            navigateur contacte Google et lui transmet notamment votre adresse IP — voir leur{" "}
            <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noreferrer">
              politique de confidentialité
            </a>
            . Les polices de caractères sont servies avec le site, sans requête vers un service
            externe.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question sur vos données, ou pour demander leur accès, rectification ou
            suppression, écrivez à <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
