import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarteSection } from "@/components/site/CarteSection";

/* Test composant léger : valide le harnais RTL + le branchement de la
   recherche sur l'UI (les fonctions pures sont couvertes par recherche.test). */

describe("CarteSection", () => {
  it("affiche le titre de la carte", () => {
    render(<CarteSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: /à partager/i })
    ).toBeInTheDocument();
  });

  it("filtre la carte selon la recherche", async () => {
    const user = userEvent.setup();
    render(<CarteSection />);
    const champ = screen.getByRole("searchbox", {
      name: /rechercher dans la carte/i,
    });
    await user.type(champ, "houmous");
    expect(
      screen.getByRole("heading", { name: /houmous maison/i })
    ).toBeInTheDocument();
  });

  it("affiche l'état vide quand rien ne correspond", async () => {
    const user = userEvent.setup();
    render(<CarteSection />);
    const champ = screen.getByRole("searchbox", {
      name: /rechercher dans la carte/i,
    });
    await user.type(champ, "zzzintrouvable");
    expect(screen.getByText(/rien à ce nom sur la carte/i)).toBeInTheDocument();
  });
});
