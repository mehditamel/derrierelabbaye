import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ScrollProgress } from "@/components/ScrollProgress";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenu" className="u-skip-link">
        Aller au contenu
      </a>
      <JsonLd />
      <ScrollProgress />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
    </>
  );
}
