import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { TicketCoupon } from "../TicketCoupon";
import type { Ticket } from "@/lib/ticket-or/types";

const ticket: Ticket = {
  id: "demo",
  won: true,
  code: "DLA-" + "A".repeat(24),
  flavour: "herbes",
  alcohol: false,
  alcohol_allowed: true,
  created_at: "2026-09-13T12:00:00Z",
  expires_at: "2099-09-27T12:00:00Z",
  redeemed_at: null,
};
const prototype = HTMLDialogElement.prototype;
const originalShow = prototype.showModal,
  originalClose = prototype.close;
beforeAll(() => {
  prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterAll(() => {
  prototype.showModal = originalShow;
  prototype.close = originalClose;
});
afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

it("agrandit le bon avec le choix enregistré et garde le clavier dans la fenêtre", () => {
  document.body.style.overflow = "auto";
  render(<TicketCoupon ticket={ticket} />);
  const trigger = screen.getByRole("button", { name: "Présenter mon bon au comptoir" });
  trigger.focus();
  fireEvent.click(trigger);
  const modal = screen.getByRole("dialog"),
    dialog = within(modal);
  expect(dialog.getByRole("heading", { name: "Jardin de nuit" })).toBeInTheDocument();
  expect(dialog.getByText("Sans alcool")).toBeInTheDocument();
  expect(document.body.style.overflow).toBe("hidden");
  const close = dialog.getByRole("button", { name: "Fermer le bon agrandi" });
  close.focus();
  fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
  const download = dialog.getByRole("link", { name: "Enregistrer le QR code" });
  expect(download).toHaveFocus();
  fireEvent.keyDown(download, { key: "Tab" });
  expect(close).toHaveFocus();
  fireEvent.click(close);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe("auto");
});

it("ferme avec Échap et conserve le caractère sans valeur de la démonstration", () => {
  render(<TicketCoupon ticket={ticket} preview />);
  const trigger = screen.getByRole("button", { name: "Agrandir le bon de démonstration" });
  fireEvent.click(trigger);
  const modal = screen.getByRole("dialog"),
    dialog = within(modal);
  expect(dialog.getByText("SPÉCIMEN · SANS VALEUR")).toBeInTheDocument();
  expect(dialog.queryByRole("link", { name: "Enregistrer le QR code" })).not.toBeInTheDocument();
  const close = dialog.getByRole("button", { name: "Fermer le bon agrandi" });
  close.focus();
  fireEvent.keyDown(close, { key: "Tab" });
  expect(close).toHaveFocus();
  fireEvent(modal, new Event("cancel", { bubbles: false, cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it.each([
  [{ ...ticket, redeemed_at: "2026-09-14T12:00:00Z" }, /bon déjà servi/],
  [{ ...ticket, expires_at: "2020-01-01T00:00:00Z" }, /Bon expiré/],
] as const)(
  "garde les anciens choix consultables sans inviter à utiliser un bon inactif",
  (old, label) => {
    render(<TicketCoupon ticket={old} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Jardin de nuit" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  }
);

it("rétablit le défilement si la page est quittée avec le bon ouvert", () => {
  const view = render(<TicketCoupon ticket={ticket} />);
  fireEvent.click(screen.getByRole("button", { name: "Présenter mon bon au comptoir" }));
  view.unmount();
  expect(document.body.style.overflow).toBe("");
});
