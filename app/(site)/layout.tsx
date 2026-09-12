import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MotionProvider } from "@/components/site/MotionControl";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <a href="#contenu" className="u-skip-link">
        Aller au contenu
      </a>
      <JsonLd />
      <ScrollProgress />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
    </MotionProvider>
  );
}
