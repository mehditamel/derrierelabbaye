import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/* jsdom n'implémente pas IntersectionObserver, utilisé par <Reveal> pour
   déclencher les animations au défilement. Mock minimal : on déclenche
   immédiatement l'apparition pour que le contenu soit visible dans les tests. */
class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  constructor(private callback: IntersectionObserverCallback) {}
  observe = (target: Element) => {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
  };
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
