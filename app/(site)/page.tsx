import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { LeQuartier } from "@/components/site/LeQuartier";
import { CarteSection } from "@/components/site/CarteSection";
import { CocktailsSection } from "@/components/site/CocktailsSection";
import { ReservationSection } from "@/components/site/ReservationSection";
import { Faq } from "@/components/site/Faq";
import { NousTrouver } from "@/components/site/NousTrouver";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <LeQuartier />
      <CarteSection />
      <CocktailsSection />
      <ReservationSection />
      <Faq />
      <NousTrouver />
    </>
  );
}
