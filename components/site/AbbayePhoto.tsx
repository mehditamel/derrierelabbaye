import Image from "next/image";
import { photosAbbaye, licencePhotosAbbaye, type PhotoAbbayeId } from "@/data/photosAbbaye";
import styles from "./AbbayePhoto.module.css";

export function CreditPhotoAbbaye({
  photo,
  onDark = false,
}: {
  photo: PhotoAbbayeId;
  onDark?: boolean;
}) {
  const { author, source } = photosAbbaye[photo];
  return (
    <span className={`${styles.credit} ${onDark ? styles.onDark : ""}`}>
      <span>
        Photo :{" "}
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Photographie de l'abbaye Saint-Victor par ${author}, sur Wikimedia Commons`}
        >
          {author}
        </a>
      </span>
      <span aria-hidden="true">·</span>
      <a href={licencePhotosAbbaye} target="_blank" rel="noopener noreferrer">
        CC BY-SA 4.0
      </a>
      <span>· Cadrage adapté</span>
    </span>
  );
}

export function AbbayePhoto({
  photo,
  featured = false,
}: {
  photo: PhotoAbbayeId;
  featured?: boolean;
}) {
  const { image, alt, caption } = photosAbbaye[photo];
  return (
    <figure className={`${styles.figure} ${featured ? styles.featured : ""}`}>
      <div className={styles.frame}>
        <Image
          src={image}
          alt={alt}
          className={styles.image}
          placeholder="blur"
          preload={featured}
          sizes={featured ? "(max-width: 1180px) 100vw, 1180px" : "(max-width: 800px) 100vw, 800px"}
        />
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{caption}</span>
        <CreditPhotoAbbaye photo={photo} />
      </figcaption>
    </figure>
  );
}
