import { SectionLabel } from "@/components/SectionLabel";
import { Reveal } from "@/components/Reveal";
import { reperes } from "@/data/site";
import styles from "./Intro.module.css";

export function Intro() {
  return (
    <section id="le-lieu" className={styles.section}>
      <div className="u-container">
        <div className={styles.layout}>
          <Reveal>
            <div className={styles.head}>
              <SectionLabel>Le rendez-vous des belles soirées</SectionLabel>
              <h2 className={styles.title}>
                Le sud dans le verre.
                <br />
                <em>La nuit devant soi.</em>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className={styles.story}>
              <span className={styles.star} aria-hidden="true">
                ✦
              </span>
              <p className={styles.lead}>On se retrouve derrière l&apos;Abbaye.</p>
              <p>
                À Saint-Victor, Marseille a ses habitudes. Une lumière chaude, des tapas qui
                circulent, des cocktails au comptoir. Et cette envie de prolonger la soirée.
              </p>
              <p>
                Installez-vous entre amis, partagez quelques assiettes et prenez le temps. Ici, la
                nuit se vit jusqu&apos;à 02h.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={100}>
          <ul className={styles.stats}>
            {reperes.map((r, i) => (
              <li key={r.valeur} className={styles.stat}>
                <span className={styles.number}>0{i + 1}</span>
                <div>
                  <span className={styles.statValue}>{r.valeur}</span>
                  <span className={styles.statLabel}>{r.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
