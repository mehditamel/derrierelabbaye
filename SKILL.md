---
name: derriere-labbaye-design
description: Use this skill to generate well-branded interfaces and assets for Derrière l'Abbaye — a bar à tapas & cocktails in Saint-Victor, Marseille — for production or for throwaway prototypes / mocks / decks / print. Contains the brand's design guidelines, colors, type, fonts, logos, and UI kit components (website + mobile app) for prototyping.
user-invocable: true
---

Read the `README.md` file in this skill first — it carries the full brand context, the
two-mood system (architectural noir minimalism + warm Mediterranean ivory/gold), the
content & visual foundations, iconography, and a file index. Then explore:

- `colors_and_type.css` — all color + type tokens (core, semantic, ready-made classes).
- `assets/` — logos (`logo-cream.png`, `logo-noir.png`), storefront photo, printed cartes.
- `preview/` — design-system reference cards (colors, type, spacing, components, brand).
- `ui_kits/website/` and `ui_kits/mobile/` — hi-fi, reusable component recreations.

If creating **visual artifacts** (slides, mocks, throwaway prototypes, social, print):
copy the assets you need out of `assets/`, link `colors_and_type.css`, and produce
static HTML files for the user to view. Lift exact hex values, type classes and the
signature devices (gold hairline rules with ◆ nodes, wide-tracked uppercase Jost, the
storefront photo treatment).

If working on **production code**: read the rules here to become an expert in the brand,
and reuse the UI kit components as cosmetic references.

Key reflexes: French copy, **vous**, never emoji; two grounds only (ivoire *or* noir),
gold is the bridge; thin + tracked + uppercase before bigger; sharp corners except the
pill; always include the legal line *« L'abus d'alcool est dangereux pour la santé, à
consommer avec modération. »*

If the user invokes this skill without other guidance, ask what they want to build,
ask a few focused questions, then act as an expert designer who outputs HTML artifacts
*or* production code depending on the need.
