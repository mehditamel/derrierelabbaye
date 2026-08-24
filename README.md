# Derrière l'Abbaye — Design System

> Bar à tapas & cocktails · 1 rue de l'Abbaye, 13007 Marseille — quartier Saint-Victor

An intimate Marseille apéritif bar tucked **behind** the mythic Abbaye Saint-Victor.
This design system codifies the brand for every surface the venue needs:
a **website** (site internet), a **mobile app** (application mobile), and
**print / textile / communication** material (cartes, affiches, social, merch).

---

## The brand in one breath

Derrière l'Abbaye lives at the meeting point of **two moods**:

1. **Architectural minimalism** — the wordmark is stark white-on-black: an ultra-thin,
   wide-tracked geometric sans with a signature stylised **E** rendered as three
   stacked bars (`Ξ`). It matches the corten-steel storefront on rue de l'Abbaye:
   oxidised metal, hidden warm LED strip, dark wood, bottles glowing in the dark.
2. **Mediterranean warmth** — the printed carte is the opposite register: warm ivory
   paper, antique-brass gold, an elegant high-contrast serif, hand-drawn olive
   branches and a circular crest of the Saint-Victor skyline. Apéro, tapas, the
   south of France at golden hour.

The system holds both: **noir + ivoire + or** (black, ivory, gold), candle-amber glow,
and a rust note borrowed from the facade. Geometric sans for structure; classic serif
for soul.

> Self-description: _« Apéro marseillais — bar à tapas & cocktails, juste derrière
> l'Abbaye. »_

---

## Sources used to build this system

- **Brand assets** (provided, copied into `assets/`):
  - `Logo DERRIERE L ABBAYE.jpeg` — primary wordmark, white on black
  - `Enseigne DERRIERE L ABBAYE.jpeg` — storefront photograph (corten facade, night)
  - `CARTE DERRIERE L ABBAYE RECTO.jpg` — food menu (tapas / planches)
  - `CARTE DERRIERE L ABBAYE VERSO.jpg` — drinks menu (softs, vins, cocktails)
- **GitHub:** [`mehditamel/derrierelabbaye`](https://github.com/mehditamel/derrierelabbaye)
  — le dépôt héberge désormais le **site + la PWA** (Next.js 16) qui appliquent ce
  design system. Détails d'architecture et de mise en route : [`DEVELOPMENT.md`](DEVELOPMENT.md).
- **Local codebase mount:** `DERRIERE L'ABBAYE/` (brand assets + admin PDFs).

No Figma file or existing front-end code was provided, so the visual foundations below
are derived directly from the logo, storefront, and printed menus.

---

## CONTENT FUNDAMENTALS

**Language.** French first, always. Marseille-proud but not caricatural. English only
where it's already common bar vocabulary (_Long Drinks, Shooters, London Mule_).

**Voice & tone.** Warm, convivial, a little literary. The bar speaks like a generous
host, not a corporation. Short, sensory phrases. It invites rather than instructs.

**Person.** Mostly impersonal / collective ("à partager", "à accompagner") and the
warm imperative-suggestion ("À accompagner d'un verre, d'une bouteille… ou des deux.").
When addressing the guest directly, use **vous** — courteous, never stiff.

**Casing.**

- Wordmark and section labels: **ALL CAPS**, widely letter-spaced
  (`À PARTAGER — FROID`, `SÉLECTION DE VINS`, `BAR À TAPAS & COCKTAILS`).
- Dish names: **ALL CAPS** serif (`HOUMOUS MAISON`, `VITELLO TONNATO`).
- Descriptions: **lower-case** italic serif (`huile d'olive & paprika fumé, pain grillé`).
- Display titles: Title-case / caps serif (`CARTE DES BOISSONS`).

**Punctuation & style.**

- Uses the ampersand `&` liberally in pairings (`jambon & comté`, `câpres & pickles`).
- Em-dashes and ellipses set a relaxed, spoken rhythm (`… ou des deux.`).
- Prices are bare numerals + `€` with no decimals unless needed (`7€`, `3,50€`).
- French typography: accents respected (`À`, `É`, `Ô`), `À` not `A`.

**Emoji:** never. The brand expresses warmth through illustration, light and type —
not emoji. Decorative separators are small diamonds `◆`, bullets `•`, or olive sprigs.

**Signature lines (reusable copy):**

- _« À partager — froid / chaud »_ (menu section framing)
- _« À accompagner d'un verre, d'une bouteille… ou des deux. »_
- _« Apéro marseillais »_ · _« Bar à tapas & cocktails »_
- Legal footer (required, FR): _« L'abus d'alcool est dangereux pour la santé,
  à consommer avec modération. »_

**What to avoid:** start-up speak, exclamation spam, hashtags in body copy, anglicisms
where a French word exists, hard-sell CTAs ("BUY NOW"). Prefer _« Réserver une table »_,
_« Voir la carte »_, _« Nous trouver »_.

---

## VISUAL FOUNDATIONS

**Colors.** A warm, candle-lit palette — see `colors_and_type.css`.

- **Noir** `#14110D` (warm near-black; pure `#000` reserved for the logo lockup).
- **Ivoire / Crème** `#F2ECDB` / `#F8F3E9` — the default paper, sampled from the carte.
- **Or / Laiton** `#A8884C` (antique brass) with `#C7A86A` highlight and `#856A38` deep —
  the single metallic accent; used for hairlines, prices, labels, the crest.
- **Corten** `#794E35` and **Ambre** `#E9C892` — secondary warmth from the storefront,
  used sparingly (glows, photographic overlays, merch).
- Pairing rule: **two grounds only** — ivoire paper _or_ noir. Gold is the bridge.
  Never put corten and gold large side-by-side; corten is a seasoning.

**Type.** Two-voice system (Google Fonts substitutes — see flag below):

- **Jost** — geometric sans → wordmark, uppercase labels, UI chrome, micro-text.
  Weights 300/400/500. Always tracked: `0.12em` labels, `0.24em` wordmark.
- **Cormorant Garamond** — high-contrast serif → display, headings, dish names, prices.
- **EB Garamond** — quiet serif → long-form body and italic descriptors.
- The brand's whole signature is **generous letter-spacing + thin weight + caps**.
  When in doubt, add tracking and reduce weight before adding size.

**Spacing & layout.** 8-pt rhythm. Generous, airy, symmetrical. The carte centres
content with wide margins and a thin framing rule inset from the edge — echo this with
a hairline "frame" inset ~16–24px on hero/print surfaces. Two-column menu layouts;
centred crest at top. Let white(ivory)space breathe.

**Backgrounds.** Flat ivory paper, _very_ subtly warm — **no gradients** on paper
surfaces. On noir surfaces, an almost-imperceptible vignette or candle-amber radial
glow (`--shadow-glow`) is allowed to suggest low light. Photography (storefront,
cocktails, interior) is warm, dark, moody — amber highlights on deep shadow, shallow
depth of field. Treat photos as windows, not patterns. Optional faint paper grain on
print; never loud textures.

**Illustration.** Fine single-weight **line drawings** (≈1px), monochrome ink or gold:
olive/laurel branches, the Saint-Victor abbey skyline, cocktail glassware, wine bottles,
charcuterie/cheese planches. These are the brand's decorative engine — corners,
dividers, the circular crest. (Provided illustrations live on the cartes; recreate in
the same fine-line register — **do not** swap for clip-art or filled icons.)

**Corner radii.** Mostly **square / sharp** (architectural). The one soft motif is the
**pill** (`999px`) used for menu section labels and primary buttons. Cards use small
radii (`4–8px`) or none. Avoid big bubbly rounding.

**Cards.** Ivory or cream fill, **hairline border** (`--hairline` on paper,
`--hairline-gold` for emphasis), minimal shadow (`--shadow-sm`/`md`). No heavy drop
shadows on paper. On noir, cards are a slightly lifted dark surface with a 1px
`rgba(cream,.16)` border. Generous interior padding.

**Borders & rules.** The hero device is the **thin gold rule** — single hairline,
sometimes with a centred diamond `◆` node or an arrow `‹—›` terminal, exactly as the
carte separates sections. Inset frames on print/hero.

**Shadows & elevation.** Restrained on paper (soft, warm-tinted, low). The dramatic
elevation is _light_, not shadow: the amber glow (`--shadow-glow`) behind a CTA or
around a featured cocktail mimics the storefront's hidden LED strip.

**Transparency & blur.** Sparingly. A noir scrim (`rgba(20,17,13,.55)`) over warm
photography for legible overlaid type; light backdrop-blur is acceptable on sticky
nav over imagery. Avoid frosted-glass everywhere — it's a seasoning.

**Animation.** Slow, candle-lit, never bouncy. Fades and gentle rises
(`opacity` + 8–16px `translateY`), 300–500ms, ease-out (`cubic-bezier(.22,.61,.36,1)`).
A faint glow pulse is the most "alive" the brand gets. No spring/overshoot, no spin.

**Hover states.** Gold-shift and quiet lift: links go `--gold` → `--gold-light`; buttons
warm/brighten ~6–8% and gain a soft amber glow; underlines grow from a hairline. On
photos, a slow zoom (scale 1.03) + scrim lighten.

**Press states.** Subtle darken to `--gold-deep` (no big scale change); a 1–2px nudge
down at most. Keeps the refined, still feeling.

---

## ICONOGRAPHY

The brand has **no icon font and no UI icon set of its own** — its iconographic language
is **fine-line illustration**: single-weight (~1px) pen drawings of olive/laurel
branches, the Abbaye Saint-Victor skyline, cocktail glassware, wine bottles and
charcuterie/cheese planches, plus a circular hand-drawn **crest**. These are decorative,
not functional, and live on the printed cartes (`assets/carte-*.jpg`).

**Functional UI icons** (menu, search, map pin, calendar, arrows) are **not present** in
the source. For the website/app we therefore substitute **Lucide**
(<https://lucide.dev>) — a thin, open, single-weight outline set whose **1px stroke
matches the illustration register** far better than filled/duotone icons. Load from CDN:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<!-- then: lucide.createIcons(); -->
```

Rules:

- Stroke icons only, weight ~1.5px, color `--ink-700` or `--gold-deep`. **Never filled.**
- Keep them small and quiet; the brand's "hero" graphics are the line illustrations and
  the gold rules, not UI glyphs.
- **Unicode separators are part of the identity** — diamond `◆`, bullet `•`, em-dash `—`,
  arrow terminals `‹ ›`. Use these for menu dividers and section nodes.
- **Emoji: never.**
- ⚑ _Substitution flagged:_ Lucide is a stand-in. If a bespoke line-icon set is
  commissioned, match the carte's hand-drawn weight and drop the SVGs into `assets/icons/`.

---

## Files in this system (index)

| File / folder         | What's inside                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `README.md`           | This document — context, content & visual foundations, manifest.                         |
| `SKILL.md`            | Agent-Skill front-matter so this can be used in Claude Code.                             |
| `colors_and_type.css` | All color + type tokens (core, semantic, type classes).                                  |
| `assets/`             | Logos (`logo-cream.png`, `logo-noir.png`, original JPEG), storefront photo, both cartes. |
| `fonts/`              | Note on the Google-Fonts-loaded families (Jost, Cormorant Garamond, EB Garamond).        |
| `preview/`            | Design-system cards rendered in the Design System tab (colors, type, components).        |
| `ui_kits/website/`    | Hi-fi recreation of the **site internet** (hero, menu, réservation…).                    |
| `ui_kits/mobile/`     | Hi-fi recreation of the **application mobile** (carte, réservation, fidélité).           |

### Print, textile & communication

No separate kit yet — these surfaces (cartes, affiches, social posts, merch / textile)
build directly on the foundations above: the `assets/` logos (`logo-cream.png` for dark
grounds, `logo-noir.png` for ivoire), `colors_and_type.css` tokens, the gold-rule +
illustration language, and the two-mood system. The printed `assets/carte-*.jpg` are the
canonical reference for the warm print register. (Happy to spin this into a dedicated
print/social template kit on request.)

### ⚑ Font substitution (please confirm / replace)

The original logo uses a **custom/licensed thin geometric sans**. The nearest free
match is **Jost** (a Futura-style geometric). The menu's serifs are matched with
**Cormorant Garamond** + **EB Garamond**. If you own the real typefaces, drop the
`.woff2`/`.ttf` files into `fonts/` and update the `@font-face`/`@import` in
`colors_and_type.css`.
