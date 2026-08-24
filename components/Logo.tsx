import Image from "next/image";
import logoCream from "@/public/logo-cream.png";
import logoNoir from "@/public/logo-noir.png";

type Props = {
  /** "cream" sur fond sombre, "noir" sur fond ivoire. */
  tone?: "cream" | "noir";
  width?: number;
  priority?: boolean;
  className?: string;
};

export function Logo({ tone = "noir", width = 220, priority = false, className }: Props) {
  const src = tone === "cream" ? logoCream : logoNoir;
  return (
    <Image
      src={src}
      alt="Derrière l'Abbaye — bar à tapas & cocktails, Saint-Victor, Marseille"
      width={width}
      height={width}
      priority={priority}
      className={className}
      // `width` n'est PAS repris en style en ligne : il l'emportait sur les
      // règles des CSS modules (ex. `.logo { width: min(360px, 78vw) }` dans le
      // héros), figeant le logo à sa largeur nominale sur mobile étroit.
      // L'attribut width/height suffit à réserver le ratio ; `height: auto`
      // laisse la CSS piloter la largeur réelle.
      style={{ height: "auto" }}
    />
  );
}
