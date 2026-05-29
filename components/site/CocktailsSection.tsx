import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { MenuRow } from "@/components/MenuRow";
import { Reveal } from "@/components/Reveal";
import { barSections, boissonsDouces, cocktailVedette } from "@/data/menu";
import { copies } from "@/data/site";
import styles from "./CocktailsSection.module.css";

export function CocktailsSection() {
  return (
    <section id="cocktails" className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />
      <div className="u-container">
        <div className={styles.head}>
          <SectionLabel onDark>{copies.cocktailsSurtitre}</SectionLabel>
          <h2 className={styles.title}>{copies.cocktailsTitre}</h2>
          <p className={styles.sub}>{copies.cocktailsTexte}</p>
        </div>

        <GoldRule className={styles.rule} />

        <Reveal>
          <article className={styles.feature}>
            <SectionLabel onDark>Le cocktail du moment</SectionLabel>
            <h3 className={styles.featureName}>{cocktailVedette.nom}</h3>
            <p className={styles.featureDesc}>{cocktailVedette.description}</p>
            <span className={styles.featurePrice}>{cocktailVedette.prix}</span>
          </article>
        </Reveal>

        <div className={styles.grid}>
          {barSections.map((section) => (
            <div key={section.id} className={styles.card}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{section.titre}</h3>
                {section.surtitre && (
                  <span className={styles.cardPrice}>{section.surtitre}</span>
                )}
              </div>
              <ul className={styles.list}>
                {section.items.map((item) => (
                  <li key={item.nom} className={styles.listItem}>
                    {item.nom}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.softGrid}>
          {boissonsDouces.map((section) => (
            <div key={section.id} className={styles.softBlock}>
              <h3 className={styles.softTitle}>
                {section.titre}
                {section.surtitre ? ` · ${section.surtitre}` : ""}
              </h3>
              <div>
                {section.items.map((item) => (
                  <MenuRow key={item.nom} item={item} onDark />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
