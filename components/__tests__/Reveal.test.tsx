import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Reveal } from "@/components/Reveal";
import { nombreAbonnes, reinitialiserObservateur } from "@/lib/observateurReveal";

/* Le contrat DOM de Reveal est consommé par la CSS (styles/colors_and_type.css)
   et par plusieurs appelants qui se servent du conteneur comme boîte de mise en
   page. Ces tests le figent : classes, propriété de délai, et conteneur. */

afterEach(() => {
  reinitialiserObservateur();
  vi.unstubAllGlobals();
});

describe("Reveal — contrat DOM", () => {
  it("porte u-reveal et bascule is-in à l'apparition", () => {
    // Le mock global révèle immédiatement depuis observe().
    const { container } = render(<Reveal>contenu</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.classList.contains("u-reveal")).toBe(true);
    expect(el.classList.contains("is-in")).toBe(true);
  });

  it("applique la classe de variante", () => {
    const { container } = render(<Reveal variant="left">x</Reveal>);
    expect(container.firstElementChild?.classList.contains("u-reveal--left")).toBe(true);
  });

  it("conserve le className de l'appelant — plusieurs s'en servent comme conteneur", () => {
    // cf. NousTrouver : <Reveal className={styles.grid}> — le conteneur EST la grille.
    const { container } = render(<Reveal className="ma-grille">x</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("ma-grille")).toBe(true);
    expect(el.classList.contains("u-reveal")).toBe(true);
  });

  it("pose --reveal-delay seulement quand un délai est demandé", () => {
    const { container: avec } = render(<Reveal delay={140}>x</Reveal>);
    expect((avec.firstElementChild as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe(
      "140ms"
    );

    const { container: sans } = render(<Reveal>x</Reveal>);
    expect((sans.firstElementChild as HTMLElement).getAttribute("style")).toBeNull();
  });
});

describe("Reveal — animations réduites", () => {
  it("n'observe rien du tout quand l'utilisateur les refuse", () => {
    // Toute la CSS d'apparition est sous « prefers-reduced-motion:
    // no-preference » : sous « reduce » le contenu est déjà visible, observer
    // 34 éléments ne produirait rien.
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), media: q }));
    render(<Reveal>x</Reveal>);
    expect(nombreAbonnes()).toBe(0);
  });
});
