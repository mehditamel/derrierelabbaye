import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { BarCarte } from "./BarCarte";
import { Reveal } from "@/components/Reveal";
import { cocktailVedette } from "@/data/menu";
import { copies } from "@/data/site";
import styles from "./CocktailsSection.module.css";
import { MotionControl } from "./MotionControl";

export function CocktailsSection() {
  return (
    <section id="cocktails" className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />
      <div className="u-container">
        <div className={styles.head}>
          <SectionLabel onDark>{copies.cocktailsSurtitre}</SectionLabel>
          <h2 className={styles.title}>
            Le goût des <em>belles soirées.</em>
          </h2>
          <p className={styles.sub}>{copies.cocktailsTexte}</p>
          <div className={styles.motion}>
            <MotionControl />
          </div>
        </div>

        <Reveal delay={60}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <Reveal variant="scale">
          <article className={styles.feature}>
            <div className={styles.cocktailArt} aria-hidden="true">
              <span className={styles.orbit} />
              <svg viewBox="0 0 360 420" fill="none">
                <ellipse cx="180" cy="367" rx="100" ry="16" fill="#d0b478" opacity=".07" />
                <path
                  d="M116 81h128l-12 134c-3 40-24 66-52 66s-49-26-52-66L116 81Z"
                  fill="#f8f3e9"
                  fillOpacity=".04"
                  stroke="#d0b478"
                  strokeWidth="1.5"
                />
                <path
                  d="m126 133 8 78c4 35 19 55 46 55s42-20 46-55l8-78Z"
                  fill="#b85b28"
                  fillOpacity=".72"
                />
                <ellipse cx="180" cy="133" rx="54" ry="8" fill="#e9c892" fillOpacity=".24" />
                <path
                  d="M180 281v74m-48 7c20-10 76-10 96 0"
                  stroke="#d0b478"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="145"
                  y="125"
                  width="32"
                  height="32"
                  rx="5"
                  transform="rotate(18 145 125)"
                  fill="#f8f3e9"
                  fillOpacity=".18"
                  stroke="#f8f3e9"
                  strokeOpacity=".35"
                />
                <rect
                  x="188"
                  y="162"
                  width="36"
                  height="36"
                  rx="5"
                  transform="rotate(-12 188 162)"
                  fill="#f8f3e9"
                  fillOpacity=".12"
                  stroke="#f8f3e9"
                  strokeOpacity=".25"
                />
                <g className={styles.citrus}>
                  <circle cx="236" cy="92" r="43" fill="#b86632" stroke="#e9c892" strokeWidth="3" />
                  <circle cx="236" cy="92" r="34" stroke="#e9c892" strokeOpacity=".6" />
                  <path
                    d="M236 58v68m-34-34h68m-58-24 48 48m0-48-48 48"
                    stroke="#e9c892"
                    strokeOpacity=".6"
                  />
                </g>
                <g className={styles.bubbles} fill="#e9c892">
                  <circle cx="162" cy="207" r="2" />
                  <circle cx="181" cy="230" r="2.5" />
                  <circle cx="207" cy="218" r="1.5" />
                  <circle cx="172" cy="178" r="1.5" />
                </g>
              </svg>
              <span className={styles.artCaption}>Agrumes · Bulles · Saint-Victor</span>
            </div>
            <div className={styles.featureCopy}>
              <SectionLabel onDark>Le cocktail du moment</SectionLabel>
              <h3 className={styles.featureName}>{cocktailVedette.nom}</h3>
              <p className={styles.featureDesc}>{cocktailVedette.description}</p>
              <span className={styles.featurePrice}>{cocktailVedette.prix}</span>
              <a href="#carte-du-bar" className={styles.featureLink}>
                Choisir vos boissons <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>
        </Reveal>

        <BarCarte />
      </div>
    </section>
  );
}
