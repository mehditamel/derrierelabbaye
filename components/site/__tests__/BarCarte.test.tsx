import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BarCarte } from "@/components/site/BarCarte";

describe("BarCarte", () => {
  it("permet de parcourir les boissons au clavier en conservant leurs tarifs", async () => {
    const user = userEvent.setup();
    render(<BarCarte />);
    expect(screen.getByRole("button", { name: "Cocktails" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("heading", { name: "Mojito" })).toBeInTheDocument();

    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Long drinks & shooters" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByRole("heading", { name: "Mojito" })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Long drinks" })).getByText("10 €")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sans alcool" }));
    expect(screen.getByRole("heading", { name: "Coca-Cola" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Eaux minérales" })).getByText("3,50 €")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Vins" }));
    expect(screen.getByRole("heading", { name: "Verre de vin" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Sélection de vins" })).getByText("7 €")
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Vins : 5 choix");
    expect(screen.getByRole("button", { name: "Cocktails" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
