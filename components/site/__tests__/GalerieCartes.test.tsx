import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalerieCartes } from "@/components/site/GalerieCartes";

const blurDataURL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const cartes = [
  {
    image: { src: "/carte-recto.jpg", width: 800, height: 1200, blurDataURL },
    titre: "La carte cuisine",
    alt: "Menu cuisine",
    href: "/carte-recto.jpg",
    fichier: "cuisine.jpg",
  },
  {
    image: { src: "/carte-verso.jpg", width: 800, height: 1200, blurDataURL },
    titre: "La carte des boissons",
    alt: "Menu boissons",
    href: "/carte-verso.jpg",
    fichier: "boissons.jpg",
  },
];
const prototype = HTMLDialogElement.prototype;
const originalShow = prototype.showModal;
const originalClose = prototype.close;

// jsdom ne fournit pas le comportement modal natif ; le focus et Échap sont
// vérifiés dans le navigateur, ces tests couvrent le choix du bon document.
beforeAll(() => {
  prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(() => {
  document.body.style.overflow = "";
});
afterAll(() => {
  prototype.showModal = originalShow;
  prototype.close = originalClose;
});

describe("GalerieCartes", () => {
  it("change de document et de téléchargement, puis restaure le défilement à la fermeture", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "auto";
    render(<GalerieCartes cartes={cartes} />);
    await user.click(screen.getByRole("button", { name: "Agrandir la carte cuisine" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(document.body.style.overflow).toBe("hidden");
    expect(dialog.getByRole("heading", { name: "La carte cuisine" })).toBeInTheDocument();
    dialog.getByRole("button", { name: "Fermer la carte agrandie" }).focus();
    await user.tab({ shift: true });
    expect(dialog.getByRole("region", { name: "Carte imprimée — zone de lecture" })).toHaveFocus();
    await user.tab();
    expect(dialog.getByRole("button", { name: "Fermer la carte agrandie" })).toHaveFocus();
    await user.click(dialog.getByRole("button", { name: "Agrandir le texte" }));
    expect(dialog.getByRole("button", { name: "Vue d’ensemble" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await user.click(dialog.getByRole("button", { name: "Boissons" }));
    expect(dialog.getByRole("heading", { name: "La carte des boissons" })).toBeInTheDocument();
    expect(dialog.getByRole("button", { name: "Agrandir le texte" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      dialog.getByRole("link", { name: "Télécharger la carte des boissons (JPG)" })
    ).toHaveAttribute("href", "/carte-verso.jpg");
    await user.click(dialog.getByRole("button", { name: "Fermer la carte agrandie" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("libère le défilement lorsque la page est quittée avec une carte ouverte", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GalerieCartes cartes={cartes} />);
    await user.click(screen.getByRole("button", { name: "Agrandir la carte des boissons" }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
