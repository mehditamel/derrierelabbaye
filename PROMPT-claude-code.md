# Prompt pour Claude Code — Site & App « Derrière l'Abbaye »

> Copie-colle tout ce qui suit dans Claude Code, à la racine d'un nouveau dépôt.
> Place d'abord le dossier du design system (`colors_and_type.css`, `assets/`,
> `ui_kits/`, `README.md`, `SKILL.md`) à la racine, puis lance le prompt.

---

## CONTEXTE

Tu construis les produits numériques de **Derrière l'Abbaye**, un bar à tapas &
cocktails situé **1 rue de l'Abbaye, 13007 Marseille**, juste derrière l'Abbaye
Saint-Victor. Ambiance intimiste, apéro marseillais, devanture en acier corten,
lumière chaude.

Un **design system complet existe déjà** dans ce dépôt — tu DOIS t'en servir comme
source de vérité, sans réinventer le style :

- `README.md` — contexte de marque, fondations de contenu & visuelles, iconographie.
  **Lis-le en entier avant de commencer.**
- `SKILL.md` — réflexes de marque condensés.
- `colors_and_type.css` — TOUS les tokens (couleurs, typo, espacements, ombres, radii)
  + classes utilitaires. **Réutilise ces variables CSS telles quelles.**
- `assets/` — logos (`logo-cream.png` sur fond sombre, `logo-noir.png` sur ivoire),
  photo de la devanture (`enseigne.jpeg`), cartes imprimées (`carte-recto.jpg`,
  `carte-verso.jpg`).
- `ui_kits/website/` et `ui_kits/mobile/` — **maquettes haute-fidélité en JSX** des
  deux produits. Ce sont tes références pixel-près : reprends la structure, la mise en
  page, les interactions et le contenu (le fichier `ui_kits/website/data.js` contient
  toute la carte). Ne copie pas le code tel quel (ce sont des maquettes via Babel) —
  reconstruis proprement en composants React modernes.

## OBJECTIF

Livrer **deux applications React de production** dans un monorepo :

1. **`apps/web`** — le **site internet** (vitrine + réservation).
2. **`apps/mobile-web`** — la **web-app mobile** (PWA : carte, réservation, fidélité).

> Si tu préfères, regroupe-les en une seule app Next.js responsive avec une vue mobile
> dédiée — mais garde les deux expériences distinctes telles que maquettées.

## STACK TECHNIQUE

- **Vite + React 18 + TypeScript** (ou **Next.js 14 App Router** si tu veux le SSR/SEO
  pour le site vitrine — recommandé pour la partie web).
- **CSS Modules** ou **vanilla CSS** en important `colors_and_type.css` comme couche de
  tokens globale (variables `--noir`, `--paper`, `--gold`, `--font-serif`, etc.).
  N'introduis PAS Tailwind si ça t'oblige à dupliquer les tokens — réutilise les variables.
- **lucide-react** pour les icônes (le design system utilise déjà Lucide).
- **Polices** : Jost + Cormorant Garamond + EB Garamond via `@fontsource` ou Google
  Fonts (cf. la substitution signalée dans `fonts/README.md` — garde-les en fallback,
  on remplacera par la police custom du logo si on l'obtient).
- Routing : `react-router` (Vite) ou App Router (Next).
- Pas de back-end pour l'instant : la réservation et la fidélité sont **simulées**
  (état local + faux délais), mais isole les appels dans une couche `services/` propre
  pour brancher une API plus tard.

## RÈGLES DE MARQUE À RESPECTER (non négociables)

- **Tout en français**, vouvoiement, **jamais d'emoji**.
- **Deux fonds seulement** : ivoire (`--paper`) OU noir (`--noir`). L'or est le pont.
- Hiérarchie typo : fin + lettrage espacé + majuscules AVANT d'agrandir. Serif
  (Cormorant) pour l'éditorial et les titres de plats ; sans (Jost) tracké pour les
  labels et le chrome ; EB Garamond pour le corps.
- Angles nets partout **sauf** la pilule (`--r-pill`) pour les filtres et CTA.
- Filets dorés fins avec nœud `◆` comme séparateurs signature.
- Photos : chaudes, sombres, voilées (scrim noir + cadre fin incrusté).
- Animations lentes, jamais bondissantes (fades + translateY 8–16px, ~300–500ms,
  ease-out). La seule emphase « vivante » = un halo ambré (`--shadow-glow`).
- Inclure la mention légale en pied de page :
  *« L'abus d'alcool est dangereux pour la santé, à consommer avec modération. »*

## SITE INTERNET — écrans & composants (cf. `ui_kits/website/`)

Page unique avec ancres + page de réservation dédiée :

1. **Header** sticky — transparent sur le hero, devient noir au scroll ; burger mobile.
2. **Hero** plein écran — photo devanture, scrim, cadre incrusté, lockup du logo, CTA
   « Réserver une table » + « Voir la carte ».
3. **Intro / Le lieu** — bloc éditorial sur ivoire, filet doré, cartes de stats.
4. **La Carte** — pilules de filtre (froid / chaud / planches) + lignes de menu sur
   deux colonnes avec points de conduite et prix. Données : `data.js`.
5. **Cocktails** — section noire, halo ambré, cartes de cocktails + grille de tarifs.
6. **Réservation** — formulaire (date / couverts / heure / nom) → état de confirmation.
7. **Footer** — adresse, horaires, réseaux, mention légale.

## APP MOBILE — écrans (cf. `ui_kits/mobile/`)

PWA avec barre d'onglets basse en verre (Accueil / La carte / Réserver / Fidélité) :

1. **Accueil** — hero devanture + logo, puce « Ouvert · ferme à 01h00 », actions
   rapides, cocktail « ce soir » mis en avant, scroller horizontal de tapas.
2. **La carte** — onglets segmentés scrollables (froid / chaud / planches / cocktails)
   + lignes de menu.
3. **Réserver** — bande de dates, stepper de couverts, grille d'horaires, CTA collant
   en bas → écran de succès.
4. **Fidélité** — carte de membre noire (points + barre de progression) + liste
   d'avantages.

## QUALITÉ & LIVRABLES

- Composants **petits, typés, réutilisables** ; un dossier `components/` partagé +
  `features/` par écran.
- **Responsive** et accessible (labels, focus visibles, contrastes — attention au texte
  sur photo).
- **Performances** : images optimisées (formats modernes, lazy-loading), polices
  préchargées.
- **SEO** pour le site (titres, meta, données structurées `Restaurant`/`BarOrPub`,
  Open Graph avec la photo devanture).
- README d'installation (`npm i`, `npm run dev`, build).
- Commits clairs et atomiques.

## DÉMARCHE ATTENDUE

1. Lis `README.md`, `SKILL.md`, `colors_and_type.css` et parcours `ui_kits/`.
2. Propose-moi l'architecture du monorepo + le choix de stack (Vite vs Next) AVANT de
   coder massivement, et attends ma validation.
3. Mets en place les tokens, les polices et un composant `Button` / `Pill` / `MenuRow`
   de base, montre-moi un écran (le Hero du site) pour valider le rendu.
4. Puis déroule écran par écran, en t'arrêtant pour validation visuelle régulière.

Commence par l'étape 1 et l'étape 2.
