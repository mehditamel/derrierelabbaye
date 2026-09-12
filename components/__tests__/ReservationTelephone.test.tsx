import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ReservationAccess } from "@/components/ReservationAccess";

it("propose immédiatement l'appel sans afficher ni charger le formulaire", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  render(
    <ReservationAccess mobile>
      <input aria-label="Nom" />
    </ReservationAccess>
  );
  expect(screen.getByRole("link", { name: /appeler.*06 44 76 91 74/i })).toHaveAttribute(
    "href",
    "tel:+33644769174"
  );
  expect(screen.queryByLabelText("Nom")).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
