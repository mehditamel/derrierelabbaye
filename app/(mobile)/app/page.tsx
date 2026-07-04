import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed, CalendarHeart, Leaf, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { StatutOuverture } from "@/components/StatutOuverture";
import { ShareButton } from "@/components/mobile/ShareButton";
import { aPartagerFroid, cocktailVedette } from "@/data/menu";
import { site, copies } from "@/data/site";
import { evenements } from "@/data/evenements";
import { evenementsAVenir } from "@/lib/evenements";
import { dateLongueFr } from "@/lib/creneaux";
import enseigne from "@/public/enseigne.jpeg";
import styles from "./home.module.css";

/* Revalidation quotidienne : le filtre des événements « à venir » est figé
   à la génération de la page — voir lib/evenements.ts. */
export const revalidate = 86400;

export default function AppHome() {
  const evenementsAffiches = evenementsAVenir(evenements);
  return (
    <div>
      <h1 className="u-visually-hidden">
        Derrière l&apos;Abbaye — bar à tapas &amp; cocktails, Saint-Victor, Marseille
      </h1>
      <header className={styles.hero}>
        <Image
          src={enseigne}
          alt="Devanture de Derrière l'Abbaye le soir, derrière l'Abbaye Saint-Victor à Marseille"
          placeholder="blur"
          fill
          sizes="480px"
          priority
          className={styles.heroPhoto}
        />
        <div className={styles.heroScrim} />
        <ShareButton
          url={site.url}
          title={site.nom}
          text="Apéro marseillais — bar à tapas & cocktails, dans une rue calme juste derrière l'Abbaye Saint-Victor."
        />
        <div className={styles.heroInner}>
          <Logo tone="cream" width={210} priority />
          <StatutOuverture
            className={styles.status}
            dotClassName={styles.dot}
            dotFermeClassName={styles.dotFerme}
          />
        </div>
      </header>

      <div className="app-pad">
        <div className={styles.actions}>
          <Link href="/app/carte" className={styles.action}>
            <UtensilsCrossed size={20} strokeWidth={1.5} />
            <span>La carte</span>
          </Link>
          <Link href="/app/reserver" className={styles.action}>
            <CalendarHeart size={20} strokeWidth={1.5} />
            <span>Réserver</span>
          </Link>
          <a href={site.adresse.mapsUrl} target="_blank" rel="noreferrer" className={styles.action}>
            <MapPin size={20} strokeWidth={1.5} />
            <span>Y aller</span>
          </a>
          <a href={`tel:${site.telephone.replace(/\s/g, "")}`} className={styles.action}>
            <Phone size={20} strokeWidth={1.5} />
            <span>Appeler</span>
          </a>
        </div>

        <section className={styles.feature}>
          <span className="app-section-label">Le cocktail du soir</span>
          <h2 className={styles.featureName}>{cocktailVedette.nom}</h2>
          <p className={styles.featureDesc}>{cocktailVedette.description}</p>
          <span className={styles.featurePrice}>{cocktailVedette.prix}</span>
        </section>

        {evenementsAffiches.length > 0 && (
          <section className={styles.evenements}>
            <span className="app-section-label">En ce moment</span>
            {evenementsAffiches.map((evt) => (
              <article key={evt.id} className={styles.evenement}>
                <p className={styles.evenementQuand}>
                  {evt.date ? (
                    <>
                      {dateLongueFr(evt.date)}
                      {evt.heure ? ` · ${evt.heure.replace(":", "h")}` : ""}
                    </>
                  ) : (
                    evt.recurrence
                  )}
                </p>
                <h3 className={styles.evenementTitre}>{evt.titre}</h3>
                <p className={styles.evenementDesc}>{evt.description}</p>
              </article>
            ))}
          </section>
        )}

        <section className={styles.scrollerBlock}>
          <div className={styles.scrollerHead}>
            <span className="app-section-label">À partager — froid</span>
            <Link href="/app/carte" className={styles.seeAll}>
              Tout voir
            </Link>
          </div>
          <div className={styles.scroller}>
            {aPartagerFroid.items.map((item) => (
              <div key={item.nom} className={styles.tapas}>
                <div className={styles.tapasTop}>
                  {item.signature && (
                    <span className={styles.tapasStar}>
                      <span aria-hidden="true">★</span>
                      <span className="u-visually-hidden">Spécialité maison</span>
                    </span>
                  )}
                  {item.vege && (
                    <span className={styles.tapasVege}>
                      <Leaf size={12} aria-hidden="true" />
                      <span className="u-visually-hidden">Végétarien</span>
                    </span>
                  )}
                  <span className={styles.tapasPrice}>{item.prix}</span>
                </div>
                <h3 className={styles.tapasName}>{item.nom}</h3>
                <p className={styles.tapasDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.quartier}>
          <span className="app-section-label">{copies.quartierSurtitre}</span>
          <h2 className={styles.quartierTitle}>{copies.quartierTitre}</h2>
          <p className={styles.quartierText}>{copies.quartierTexte}</p>
          <a
            href={site.adresse.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.quartierLink}
          >
            Nous situer
          </a>
        </section>
      </div>
    </div>
  );
}
