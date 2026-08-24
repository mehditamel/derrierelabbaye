import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { StatutOuverture } from "@/components/StatutOuverture";

/* Le contrat testé ici est celui qui empêche un mensonge dans le HTML
   pré-rendu : avant le montage, la pastille occupe la place mais reste
   masquée. Sans lui, une page mise en cache 24 h afficherait « Ouvert » en
   pleine nuit — et le composant qui le garantit n'était pas couvert. */

const classes = {
  className: "pastille",
  dotClassName: "point",
  dotFermeClassName: "point-ferme",
};

afterEach(() => vi.useRealTimers());

describe("StatutOuverture", () => {
  it("affiche l'état réel une fois monté", () => {
    // Mardi 20h00 à Paris : ouvert.
    vi.setSystemTime(new Date("2026-06-09T18:00:00Z"));
    const { container } = render(<StatutOuverture {...classes} />);

    const pastille = container.querySelector(".pastille") as HTMLElement;
    expect(pastille).not.toBeNull();
    // Plus masquée : l'état client a remplacé le gabarit.
    expect(pastille.style.visibility).toBe("");
    expect(pastille.textContent).toMatch(/ouvert/i);
    expect(container.querySelector(".point-ferme")).toBeNull();
  });

  it("marque la pastille de fermeture quand le bar est fermé", () => {
    // Lundi 20h00 à Paris : jour de fermeture.
    vi.setSystemTime(new Date("2026-06-08T18:00:00Z"));
    const { container } = render(<StatutOuverture {...classes} />);

    expect(container.querySelector(".pastille")?.textContent).toMatch(/fermé/i);
    expect(container.querySelector(".point-ferme")).not.toBeNull();
  });

  it("réserve la place sans rien affirmer avant le montage", () => {
    // Le rendu serveur ne connaît ni l'heure ni le fuseau du visiteur : le
    // gabarit doit être présent (pas de saut de mise en page) mais invisible,
    // donc retiré de l'arbre d'accessibilité.
    const html = require("react-dom/server").renderToStaticMarkup(
      <StatutOuverture {...classes} />
    ) as string;
    expect(html).toContain("visibility:hidden");
  });

  it("se rafraîchit chaque minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T14:59:30Z")); // mardi 16h59 : fermé
    const { container } = render(<StatutOuverture {...classes} />);
    expect(container.querySelector(".pastille")?.textContent).toMatch(/fermé/i);

    // Une minute plus tard on a passé 17h00 : la pastille doit suivre.
    // `act` laisse React traiter le setState déclenché par l'intervalle.
    vi.setSystemTime(new Date("2026-06-09T15:00:30Z"));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.querySelector(".pastille")?.textContent).toMatch(/ouvert/i);
  });
});
