import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { CarteSection } from "@/components/site/CarteSection";
import { CocktailsSection } from "@/components/site/CocktailsSection";
import { ReservationSection } from "@/components/site/ReservationSection";
import { NousTrouver } from "@/components/site/NousTrouver";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <CarteSection />
      <CocktailsSection />
      <ReservationSection />
      <NousTrouver />
    </>
  );
}
