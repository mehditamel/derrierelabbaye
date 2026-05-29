# Derrière l'Abbaye — Site & PWA

Site internet (vitrine + réservation) et web-app mobile (PWA : carte, réservation,
fidélité) de **Derrière l'Abbaye**, bar à tapas & cocktails — 1 rue de l'Abbaye, 13007
Marseille (quartier Saint-Victor).

Construit avec **Next.js 14 (App Router) + React 18 + TypeScript**, sans Tailwind : les
tokens de marque vivent dans [`styles/colors_and_type.css`](styles/colors_and_type.css)
et les styles par composant en **CSS Modules**. Le design system de référence est décrit
dans [`README.md`](README.md).

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build de production
npm run start    # sert le build de production
npm run lint
```

## Structure

```
app/
  layout.tsx              # layout racine : <html>, polices (next/font), métadonnées globales
  (site)/                 # SITE VITRINE
    layout.tsx            #   header + footer + JSON-LD
    page.tsx              #   /  → hero, le lieu, la carte, cocktails, réservation
    reserver/page.tsx     #   /reserver
  (mobile)/app/           # PWA MOBILE (barre d'onglets basse)
    layout.tsx            #   coque app + service worker
    page.tsx              #   /app           → accueil
    carte/page.tsx        #   /app/carte
    reserver/page.tsx     #   /app/reserver
    fidelite/page.tsx     #   /app/fidelite
  sitemap.ts, robots.ts   # SEO
components/               # composants partagés (Button, Pill, MenuRow, GoldRule, Logo…)
  site/                   # composants du site vitrine
  mobile/                 # composants de la PWA
data/
  menu.ts                 # carte transcrite des cartes imprimées (plats, prix, ★)
  site.ts                 # infos établissement, copies, liens
services/                 # réservation & fidélité (SIMULÉS, sans back-end)
styles/colors_and_type.css# tokens de design (couleurs, typo, espacements, ombres)
public/                   # logos, photo de devanture, cartes scannées, manifest, sw.js
```

## Réservation & fidélité

Aucun back-end pour l'instant : `services/reservation.ts` et `services/loyalty.ts`
**simulent** les appels (faux délai, état local). Pour brancher une vraie API (ou une
base Supabase), remplacer le corps de `createReservation` — l'UI n'a pas à changer.

## Déploiement (Vercel)

Le projet Vercel `derrierelabbaye` est connecté à ce dépôt GitHub et déploie la
**production depuis `main`** ; le domaine `www.derrierelabbaye.fr` y est rattaché.
Tout push sur une autre branche génère un **déploiement preview** dédié.
`vercel.json` épingle le framework (`nextjs`).

## ⚑ À compléter (placeholders)

Ces informations ne figuraient pas dans les sources fournies et sont posées en
**valeurs provisoires** — à renseigner dans [`data/site.ts`](data/site.ts) et
[`data/menu.ts`](data/menu.ts) :

- **Horaires** d'ouverture réels (`site.horaires` + `site.horairesSchema`).
- **Téléphone** et **e-mail** de contact (`site.telephone`, `site.email`).
- **Réseaux sociaux** (`site.reseaux` — liens Instagram / Facebook).
- **Sélection de vins** (blancs / rouges / rosés) — laissée « à compléter » sur la carte
  imprimée (`vins` dans `data/menu.ts`).
- **Cocktails créations** — liste laissée vide sur la carte (`cocktailsCreations`).
- Éventuellement, les **coordonnées GPS** exactes (`site.adresse.geo`) pour le SEO local.

## Notes de marque (rappels)

Tout en français, vouvoiement, jamais d'emoji · deux fonds seulement (ivoire **ou** noir),
l'or est le pont · angles nets sauf la pilule · filets dorés à nœud `◆` · animations lentes ·
mention légale alcool obligatoire en pied de page.
