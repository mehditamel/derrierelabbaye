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
