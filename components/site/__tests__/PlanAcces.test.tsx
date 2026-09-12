import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { PlanAcces } from "@/components/site/PlanAcces";

it("ne charge Google Maps qu'après la demande du visiteur", async () => {
  const { container } = render(<PlanAcces />);
  expect(container.querySelector("iframe")).toBeNull();
  await userEvent.setup().click(screen.getByRole("button", { name: /afficher le plan/i }));
  expect(screen.getByTitle(/plan —/i)).toHaveAttribute(
    "src",
    expect.stringContaining("https://www.google.com/maps")
  );
});
