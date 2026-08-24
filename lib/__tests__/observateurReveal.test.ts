import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  animationsReduites,
  nombreAbonnes,
  observerApparition,
  reinitialiserObservateur,
} from "@/lib/observateurReveal";

/* Le mock global de vitest.setup.ts déclenche le rappel SYNCHRONIQUEMENT depuis
   observe(). C'est le comportement le plus contraignant : il valide que
   l'élément est inscrit dans la table avant l'appel à observe(), faute de quoi
   plus rien ne se révélerait. Certains tests ci-dessous posent au contraire un
   mock inerte, pour observer l'état intermédiaire. */

/** Observateur qui n'appelle jamais son rappel : permet d'inspecter les
 *  abonnements avant toute intersection. */
function poserObservateurInerte() {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  let rappelGlobal: IntersectionObserverCallback | undefined;
  class Inerte {
    constructor(cb: IntersectionObserverCallback) {
      rappelGlobal = cb;
    }
    observe = observe;
    unobserve = unobserve;
    disconnect = disconnect;
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  vi.stubGlobal("IntersectionObserver", Inerte);
  return {
    observe,
    unobserve,
    disconnect,
    declencher: (cibles: Element[]) =>
      rappelGlobal?.(
        cibles.map((target) => ({ isIntersecting: true, target }) as IntersectionObserverEntry),
        {} as IntersectionObserver
      ),
    nbInstances: () => observe.mock.instances.length,
  };
}

beforeEach(() => reinitialiserObservateur());
afterEach(() => {
  reinitialiserObservateur();
  vi.unstubAllGlobals();
});

describe("observerApparition", () => {
  it("révèle l'élément dès qu'il entre à l'écran", () => {
    const el = document.createElement("div");
    const rappel = vi.fn();
    observerApparition(el, rappel);
    // Le mock global appelle le rappel depuis observe().
    expect(rappel).toHaveBeenCalledTimes(1);
  });

  it("n'utilise qu'UN observateur pour de nombreux éléments", () => {
    const o = poserObservateurInerte();
    const elements = Array.from({ length: 30 }, () => document.createElement("div"));
    elements.forEach((el) => observerApparition(el, vi.fn()));

    expect(nombreAbonnes()).toBe(30);
    expect(o.observe).toHaveBeenCalledTimes(30);
    // C'est tout l'objet du module : 30 éléments, un seul objet observateur.
    expect(new Set(o.observe.mock.instances).size).toBe(1);
  });

  it("ne révèle chaque élément qu'une fois, et cesse de l'observer", () => {
    const o = poserObservateurInerte();
    const el = document.createElement("div");
    const rappel = vi.fn();
    observerApparition(el, rappel);

    o.declencher([el]);
    o.declencher([el]);

    expect(rappel).toHaveBeenCalledTimes(1);
    expect(o.unobserve).toHaveBeenCalledWith(el);
    expect(nombreAbonnes()).toBe(0);
  });

  it("ne révèle que l'élément concerné", () => {
    const o = poserObservateurInerte();
    const a = document.createElement("div");
    const b = document.createElement("div");
    const rappelA = vi.fn();
    const rappelB = vi.fn();
    observerApparition(a, rappelA);
    observerApparition(b, rappelB);

    o.declencher([a]);

    expect(rappelA).toHaveBeenCalledTimes(1);
    expect(rappelB).not.toHaveBeenCalled();
    expect(nombreAbonnes()).toBe(1);
  });

  it("libère l'élément au désabonnement, sans retenir de nœud détaché", () => {
    const o = poserObservateurInerte();
    const el = document.createElement("div");
    const rappel = vi.fn();

    const desabonner = observerApparition(el, rappel);
    expect(nombreAbonnes()).toBe(1);
    desabonner();

    expect(nombreAbonnes()).toBe(0);
    expect(o.unobserve).toHaveBeenCalledWith(el);
    // Plus aucun abonné : l'observateur est relâché.
    expect(o.disconnect).toHaveBeenCalled();
    // Désabonnement répété : sans effet, pas d'erreur.
    expect(() => desabonner()).not.toThrow();
  });

  it("accepte de nouveaux éléments après que tous ont été révélés", () => {
    // Cas réel : CarteSection remonte sa grille via key={actif} au filtrage.
    const o = poserObservateurInerte();
    const premier = document.createElement("div");
    observerApparition(premier, vi.fn());
    o.declencher([premier]);
    expect(nombreAbonnes()).toBe(0);

    const frais = document.createElement("div");
    const rappel = vi.fn();
    observerApparition(frais, rappel);
    expect(nombreAbonnes()).toBe(1);
    o.declencher([frais]);
    expect(rappel).toHaveBeenCalledTimes(1);
  });

  it("révèle immédiatement si l'API n'existe pas", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const rappel = vi.fn();
    const desabonner = observerApparition(document.createElement("div"), rappel);
    expect(rappel).toHaveBeenCalledTimes(1);
    expect(() => desabonner()).not.toThrow();
  });
});

describe("animationsReduites", () => {
  it("est vrai quand l'utilisateur demande à réduire les animations", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
      media: q,
    }));
    expect(animationsReduites()).toBe(true);
  });

  it("est faux sinon", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q }));
    expect(animationsReduites()).toBe(false);
  });

  it("ne suppose pas que matchMedia existe", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(animationsReduites()).toBe(false);
  });
});
