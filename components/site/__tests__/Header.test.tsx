import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* En test on n'a pas de routeur App Router monté : on neutralise
   usePathname et next/link (rendu en simple ancre). */
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { Header } from "@/components/site/Header";

describe("Header — menu mobile", () => {
  it("ouvre et ferme le drawer via le bouton burger", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const burger = screen.getByRole("button", { name: /ouvrir le menu/i });
    expect(burger).toHaveAttribute("aria-expanded", "false");

    await user.click(burger);
    expect(screen.getByRole("button", { name: /fermer le menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("navigation", { name: /navigation mobile/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fermer le menu/i }));
    expect(
      screen.queryByRole("navigation", { name: /navigation mobile/i })
    ).not.toBeInTheDocument();
  });

  it("ferme le drawer sur Échap et rend le focus au burger", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const burger = screen.getByRole("button", { name: /ouvrir le menu/i });
    await user.click(burger);
    expect(screen.getByRole("navigation", { name: /navigation mobile/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("navigation", { name: /navigation mobile/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ouvrir le menu/i })).toHaveFocus();
  });
});

describe("Header — tiroir mobile", () => {
  it("piège la tabulation et s'annonce comme dialogue modal", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const burger = screen.getByRole("button", { name: /menu/i });
    await user.click(burger);

    const tiroir = screen.getByRole("dialog", { name: /menu/i });
    expect(tiroir).toHaveAttribute("aria-modal", "true");

    // Le focus entre dans le tiroir dès l'ouverture.
    const cibles = Array.from(
      tiroir.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
    );
    expect(cibles.length).toBeGreaterThan(0);
    expect(document.activeElement).toBe(cibles[0]);

    // Depuis le dernier élément, Tab revient au premier au lieu de partir
    // dans le contenu masqué derrière le voile.
    const dernier = cibles[cibles.length - 1];
    dernier.focus();
    await user.tab();
    expect(document.activeElement).toBe(burger);

    // Et Maj+Tab depuis le premier repart vers la fin de la boucle.
    cibles[0].focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(burger);
  });

  it("Échap referme et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const burger = screen.getByRole("button", { name: /menu/i });
    await user.click(burger);
    expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /menu/i })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(burger);
  });
});
