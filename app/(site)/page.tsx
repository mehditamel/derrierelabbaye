import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { LeQuartier } from "@/components/site/LeQuartier";
import { EnCeMoment } from "@/components/site/EnCeMoment";
import { CarteSection } from "@/components/site/CarteSection";
import { CocktailsSection } from "@/components/site/CocktailsSection";
import { ReservationSection } from "@/components/site/ReservationSection";
import { Faq } from "@/components/site/Faq";
import { NousTrouver } from "@/components/site/NousTrouver";

/* Revalidation quotidienne : le filtre des événements « à venir » est figé
   à la génération de la page — voir lib/evenements.ts. */
export const revalidate = 86400;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <LeQuartier />
      <EnCeMoment />
      <CarteSection />
      <CocktailsSection />
      <ReservationSection />
      <Faq />
      <NousTrouver />
    </>
  );
}
