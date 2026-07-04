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

`services/reservation.ts` enregistre les demandes dans **Supabase** si l'app est
configurée, sinon **simule** l'appel (faux délai). `services/loyalty.ts` reste simulé
(état local). L'UI ne change pas selon le mode.

### Brancher Supabase (réservations)

Sans variables d'environnement, le formulaire fonctionne en démonstration. Pour
activer l'enregistrement réel :

1. Créer un projet Supabase (région Paris `eu-west-3` recommandée).
2. Appliquer la migration `supabase/migrations/0001_reservations.sql` (CLI
   `supabase db push`, ou éditeur SQL du tableau de bord). Elle crée la table
   `reservations` avec **RLS** : le rôle `anon` ne peut qu'**insérer** une demande.
3. Copier `.env.example` → `.env.local` et renseigner :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Sur Vercel, ajouter ces deux variables (Project Settings → Environment Variables)
   puis redéployer.

`lib/supabase.ts` n'initialise le client que si les deux variables sont présentes
(`getSupabase()` renvoie `null` sinon → repli simulé). `.env*.local` et `.env` sont
déjà ignorés par git.

### Notifications e-mail (Edge Function `notifier-reservation`)

Une fois Supabase branché, chaque nouvelle demande peut déclencher deux e-mails
via [Resend](https://resend.com) : une **notification au bar** (avec les
coordonnées du client en réponse directe) et un **accusé de réception au
client** s'il a laissé une adresse. Le code vit dans
`supabase/functions/notifier-reservation/` (gabarits purs testés par vitest,
entrée Deno exclue du tsc/eslint du site).

Mise en route :

1. Créer une clé API sur Resend (et vérifier le domaine d'envoi pour ne pas
   rester sur `onboarding@resend.dev`).
2. Déployer la fonction et poser les secrets :

   ```bash
   supabase functions deploy notifier-reservation --no-verify-jwt
   supabase secrets set \
     RESEND_API_KEY=re_xxx \
     RESERVATION_EMAIL_BAR=info@derrierelabbaye.fr \
     "RESERVATION_FROM=Derrière l'Abbaye <reservations@derrierelabbaye.fr>" \
     WEBHOOK_SECRET=une-longue-chaine-aleatoire
   ```

3. Dans le tableau de bord Supabase — **Database → Webhooks** — créer un
   webhook sur la table `reservations`, événement **INSERT**, cible
   **Edge Function** `notifier-reservation`, avec l'en-tête HTTP
   `x-webhook-secret` = la valeur de `WEBHOOK_SECRET`.

Sans configuration, rien ne change : l'INSERT aboutit, aucun e-mail ne part.
En cas d'échec Resend, la fonction répond 500 et le webhook retente.

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
