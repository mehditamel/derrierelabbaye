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
  not-found.tsx           # page 404 de marque (fond ivoire)
  error.tsx               # limite d'erreur client (« Réessayer »)
  (site)/                 # SITE VITRINE
    layout.tsx            #   skip-link + header + footer + JSON-LD
    page.tsx              #   /  → hero, le lieu, la carte, cocktails, réservation
    reserver/page.tsx     #   /reserver
  (mobile)/app/           # PWA MOBILE (barre d'onglets basse)
    layout.tsx            #   coque app + SW + bannière offline + invite d'installation
    page.tsx              #   /app           → accueil (+ partage natif)
    carte/page.tsx        #   /app/carte      (+ retour en haut de page)
    reserver/page.tsx     #   /app/reserver
    fidelite/page.tsx     #   /app/fidelite
    not-found.tsx         #   404 sombre dédiée à l'app
  sitemap.ts, robots.ts   # SEO
components/               # composants partagés (Button, Pill, MenuRow, GoldRule, Logo…)
  site/                   # composants du site vitrine
  mobile/                 # composants de la PWA :
                          #   PwaRegister (enregistrement SW + toast de mise à jour),
                          #   OfflineBanner, InstallPrompt, UpdateToast, ShareButton,
                          #   ScrollTop, LoyaltyCard, MobileCarte, MobileReserver, TabBar
lib/
  fonts.ts                # polices next/font
  usePwa.ts               # useOnline / useInstallPrompt
  useReservationForm.ts   # machine d'état + validation, partagée site/mobile
  useLocalStorage.ts      # état persisté (sûr en SSR)
  haptic.ts               # retour haptique discret (progressive enhancement)
data/
  menu.ts                 # carte transcrite des cartes imprimées (plats, prix, ★)
  site.ts                 # infos établissement, copies, liens
services/                 # réservation & fidélité (SIMULÉS, sans back-end)
styles/colors_and_type.css# tokens de design (couleurs, typo, espacements, ombres)
public/                   # logos optimisés, favicons & icônes PWA, photo, cartes, manifest, sw.js
```

## PWA & finitions

La PWA (`/app`) va au-delà de la simple coque hors-ligne :

- **Installation** — `InstallPrompt` capte `beforeinstallprompt` et propose un
  « Installer l'app » (rejet mémorisé). Le `manifest.webmanifest` déclare des
  **raccourcis** (Carte, Réserver, Fidélité) pour l'appui long sur l'icône.
- **Hors-ligne** — `OfflineBanner` signale la perte de réseau ; le `sw.js`
  (cache `dla-shell-v3`) pré-cache la coque et les sous-pages de l'app.
- **Mises à jour** — `PwaRegister` détecte un nouveau service worker et affiche
  un `UpdateToast` (« Recharger » → `SKIP_WAITING`).
- **Finitions** — partage natif (`ShareButton`, Web Share API + repli copie),
  retour en haut de la carte (`ScrollTop`), retour haptique (`lib/haptic.ts`),
  lien d'évitement clavier sur le site, pages 404 / erreur aux couleurs de la marque.
- **Images** — logos recompressés (1254 px → 512 px) et jeu d'icônes/favicons
  dédié et léger (cf. `public/icon-*.png`, `favicon-*.png`, `apple-touch-icon.png`).

## Réservation & fidélité

Aucun back-end pour l'instant : `services/reservation.ts` et `services/loyalty.ts`
**simulent** les appels (faux délai, état local). Pour brancher une vraie API (ou une
base Supabase), remplacer le corps de `createReservation` — l'UI n'a pas à changer.

- **Réservation** — la logique (machine d'état, validation du téléphone) est mutualisée
  dans `lib/useReservationForm.ts`, consommée par le formulaire site et mobile. Les
  coordonnées saisies dans l'app sont **mémorisées** (`lib/useLocalStorage.ts`) et
  pré-remplies à la visite suivante.
- **Fidélité** — `components/mobile/LoyaltyCard.tsx` rend la carte interactive : les
  points sont **persistés localement**, « Simuler une visite » crédite des points
  (aperçu du programme) et annonce les avantages débloqués.

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
