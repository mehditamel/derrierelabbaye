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
      style={{ height: "auto", width }}
    />
  );
}
