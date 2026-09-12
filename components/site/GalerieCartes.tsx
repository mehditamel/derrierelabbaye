"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Download, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import styles from "./CartesImprimees.module.css";

type Carte = {
  image: StaticImageData;
  titre: string;
  alt: string;
  href: string;
  fichier: string;
};

export function GalerieCartes({ cartes }: { cartes: readonly Carte[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const carte = cartes[actif];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!ouvert || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [ouvert]);

  const choisir = (index: number) => {
    setActif(index);
    setZoom(false);
    if (stageRef.current) {
      stageRef.current.scrollTop = 0;
      stageRef.current.scrollLeft = 0;
    }
  };

  return (
    <>
      <div className={styles.grid}>
        {cartes.map((item, i) => (
          <Reveal key={item.href} delay={i * 90}>
            <figure className={styles.figure}>
              <button
                type="button"
                className={styles.preview}
                aria-label={`Agrandir ${item.titre.toLowerCase()}`}
                aria-haspopup="dialog"
                onClick={() => {
                  choisir(i);
                  setOuvert(true);
                }}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  placeholder="blur"
                  sizes="(max-width: 700px) 90vw, 520px"
                  className={styles.photo}
                />
                <span className={styles.expand} aria-hidden="true">
                  <Expand size={18} /> Agrandir
                </span>
              </button>
              <figcaption className={styles.caption}>
                <span>{item.titre}</span>
                <a href={item.href} download={item.fichier} className={styles.download}>
                  <Download size={15} aria-hidden="true" />
                  Télécharger <span className="u-visually-hidden">{item.titre} </span>(JPG)
                </a>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="menu-imprime-titre"
        onClose={() => setOuvert(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const targets = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], [tabindex="0"]'
            )
          );
          const first = targets[0];
          const last = targets[targets.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        {ouvert && (
          <div className={styles.viewer}>
            <div className={styles.viewerHead}>
              <h3 id="menu-imprime-titre">{carte.titre}</h3>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setOuvert(false)}
                aria-label="Fermer la carte agrandie"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.viewerTools}>
              <div className={styles.switcher} role="group" aria-label="Choisir la carte imprimée">
                {cartes.map((item, i) => (
                  <button
                    key={item.href}
                    type="button"
                    aria-pressed={actif === i}
                    onClick={() => choisir(i)}
                  >
                    {i === 0 ? "Cuisine" : "Boissons"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.zoomButton}
                aria-pressed={zoom}
                onClick={() => setZoom((value) => !value)}
              >
                {zoom ? (
                  <ZoomOut size={18} aria-hidden="true" />
                ) : (
                  <ZoomIn size={18} aria-hidden="true" />
                )}
                {zoom ? "Vue d’ensemble" : "Agrandir le texte"}
              </button>
              <a
                href={carte.href}
                download={carte.fichier}
                className={styles.viewerDownload}
                aria-label={`Télécharger ${carte.titre.toLowerCase()} (JPG)`}
              >
                <Download size={19} aria-hidden="true" />
              </a>
            </div>
            {/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- La zone défilante doit être accessible au clavier pour lire la carte agrandie. */}
            <div
              ref={stageRef}
              className={`${styles.stage} ${zoom ? styles.zoomed : ""}`}
              tabIndex={0}
              role="region"
              aria-label="Carte imprimée — zone de lecture"
            >
              <Image
                key={carte.href}
                src={carte.image}
                alt={carte.alt}
                sizes="1100px"
                className={styles.fullImage}
              />
            </div>
            {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
          </div>
        )}
      </dialog>
    </>
  );
}
