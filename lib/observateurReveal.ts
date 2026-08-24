/* =====================================================================
   Observateur d'apparition — un seul pour toute la page.

   `Reveal` créait auparavant un IntersectionObserver ET un useState par
   instance : 34 sur l'accueil, 25 sur /carte. Chacun observait un unique
   élément, avec exactement les mêmes options. Un observateur partagé, qui
   distribue les entrées par élément, fait le même travail pour un seul objet.

   Deux détails ont leur importance :

   - L'observateur est créé PARESSEUSEMENT, au premier abonnement, jamais au
     chargement du module : sinon il s'instancierait avant que les tests aient
     posé leur IntersectionObserver simulé, et hors navigateur il n'existe pas
     du tout.
   - L'élément est inscrit dans la table AVANT `observe()`. Le mock de tests
     déclenche le rappel de façon synchrone depuis `observe()` : dans l'ordre
     inverse, l'entrée n'existerait pas encore et plus rien ne se révélerait.
   ===================================================================== */

/** Mêmes réglages que la version par instance : ne pas les modifier sans
 *  revoir le rendu de toutes les sections. */
const OPTIONS: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
};

type Rappel = () => void;

let observateur: IntersectionObserver | null = null;
const abonnes = new Map<Element, Rappel>();

function traiter(entrees: IntersectionObserverEntry[]) {
  for (const entree of entrees) {
    if (!entree.isIntersecting) continue;
    const rappel = abonnes.get(entree.target);
    if (!rappel) continue;
    // On se désabonne AVANT d'appeler : l'apparition ne se joue qu'une fois,
    // et l'observateur ne doit pas retenir de nœud détaché.
    desabonner(entree.target);
    rappel();
  }
}

/**
 * Observe `element` et appelle `rappel` à sa première apparition à l'écran.
 * Renvoie la fonction de désabonnement, à appeler au démontage.
 */
export function observerApparition(element: Element, rappel: Rappel): () => void {
  if (typeof IntersectionObserver === "undefined") {
    // Environnement sans observateur : on révèle tout de suite plutôt que de
    // laisser le contenu invisible.
    rappel();
    return () => {};
  }

  observateur ??= new IntersectionObserver(traiter, OPTIONS);
  abonnes.set(element, rappel);
  observateur.observe(element);

  return () => desabonner(element);
}

function desabonner(element: Element) {
  if (!abonnes.delete(element)) return;
  observateur?.unobserve(element);
  // Plus personne à observer : on libère l'observateur. Le suivant en recréera
  // un — c'est le cas d'une navigation vers une page sans apparition.
  if (abonnes.size === 0) {
    observateur?.disconnect();
    observateur = null;
  }
}

/**
 * Vrai si l'utilisateur demande à réduire les animations.
 *
 * Toute la CSS d'apparition vit sous `@media (prefers-reduced-motion:
 * no-preference)` : sous `reduce`, le contenu est visible dès le premier rendu
 * et observer quoi que ce soit ne sert à rien. On économise alors la totalité
 * des inscriptions.
 */
export function animationsReduites(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Remet l'observateur à zéro — réservé aux tests. */
export function reinitialiserObservateur(): void {
  observateur?.disconnect();
  observateur = null;
  abonnes.clear();
}

/** Nombre d'éléments actuellement observés — réservé aux tests. */
export function nombreAbonnes(): number {
  return abonnes.size;
}
