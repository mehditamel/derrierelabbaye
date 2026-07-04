import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Evenement } from "@/data/evenements";
import { EnCeMoment } from "@/components/site/EnCeMoment";

const futurLointain: Evenement = {
  id: "soiree-test",
  titre: "Soirée test",
  description: "Une soirée de démonstration.",
  date: "2099-12-31",
  heure: "19:00",
};

const passe: Evenement = {
  id: "soiree-passee",
  titre: "Soirée passée",
  description: "Déjà jouée.",
  date: "2020-01-01",
};

describe("EnCeMoment", () => {
  it("affiche les événements à venir avec leur date en toutes lettres", () => {
    render(<EnCeMoment liste={[futurLointain]} />);

    expect(screen.getByRole("heading", { name: /soirée test/i })).toBeInTheDocument();
    expect(screen.getByText(/19h00/)).toBeInTheDocument();
  });

  it("ne rend rien quand tous les événements sont passés", () => {
    const { container } = render(<EnCeMoment liste={[passe]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ne rend rien avec une liste vide", () => {
    const { container } = render(<EnCeMoment liste={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
