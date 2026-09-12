# Derrière l'Abbaye — Site & PWA

## Version finalisée le 12 septembre 2026

- **Réservations par téléphone**, au 06 44 76 91 74, à la demande de l'établissement.
  `site.reservationEnLigne = false` : les pages affichent directement un lien d'appel,
  même sans JavaScript ; l'API refuse toute demande écrite. Aucun compte Resend n'est
  nécessaire pour cette version.
- **Horaires confirmés** : mardi à dimanche, 18h00–02h00 ; fermé le lundi soir.
- **Mentions légales complètes** : SARL DERRIERE L'ABBAYE, siège au 97 rue Sauveur
  Tobelem ; établissement au 1 rue de l'Abbaye, SIRET 105 044 291 00026.
  Source : [fiche Pappers communiquée par l'établissement](https://www.pappers.fr/entreprise/derriere-labbaye-105044291).
  Responsable de publication : M. TAMELGHAGHET Mehdi, confirmé par l'établissement.
- **Instagram** : [@derrierelabbaye](https://www.instagram.com/derrierelabbaye/).
  Aucun compte Facebook n'a été communiqué.
- **Version mobile** : l'ancienne démonstration de fidélité est remplacée par
  « La maison ». L'URL `/app/fidelite` est conservée pour les liens et installations
  existantes. Aucun point ni avantage fictif n'est affiché.
- **Vie privée** : Google Maps se charge seulement après un clic explicite.
- **Hors connexion** : cache `dla-shell-v6`, actualisation des pages visitées et
  exclusion des API, des réponses RSC et des services tiers.

Les composants de réservation en ligne restent disponibles pour une activation
ultérieure explicite (`site.reservationEnLigne = true` + configuration Resend).
Ils partagent un calendrier en heure de Marseille, excluent les lundis et dates
impossibles et se mettent à jour au retour sur l'onglet. L'accusé de réception client
ne part qu'après acceptation du message au bar. Les formulaires sont vérifiés sans
envoi réel par les tests ; aucune réservation de test ne doit être envoyée à un client.
Les sections ci-dessous décrivent notamment cette capacité optionnelle.

Site internet (vitrine + réservation) et web-app mobile (PWA : carte, réservation,
fidélité) de **Derrière l'Abbaye**, bar à tapas & cocktails — 1 rue de l'Abbaye, 13007
Marseille (quartier Saint-Victor).

Construit avec **Next.js 16 (App Router, Turbopack) + React 19 + TypeScript**, sans Tailwind : les
tokens de marque vivent dans [`styles/colors_and_type.css`](styles/colors_and_type.css)
et les styles par composant en **CSS Modules**. Le design system de référence est décrit
dans [`README.md`](README.md).

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build de production (Turbopack, par défaut depuis Next 16)
npm run start    # sert le build de production
npm run lint     # ESLint CLI — `next lint` a été supprimé en Next 16
```

Node **20.9+** requis (contrainte de Next 16). La configuration ESLint est au
format « flat » (`eslint.config.mjs`) ; `.eslintrc.json` n'existe plus.

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
services/                 # réservation (envoi e-mail via /api) & fidélité (simulée)
styles/colors_and_type.css# tokens de design (couleurs, typo, espacements, ombres)
public/                   # logos optimisés, favicons & icônes PWA, photo, cartes, manifest, sw.js
```

## PWA & finitions

La PWA (`/app`) va au-delà de la simple coque hors-ligne :

- **Installation** — `InstallPrompt` capte `beforeinstallprompt` et propose un
  « Installer l'app » (rejet mémorisé). Le `manifest.webmanifest` déclare des
  **raccourcis** (Carte, Réserver, Fidélité) pour l'appui long sur l'icône.
- **Hors-ligne** — `OfflineBanner` signale la perte de réseau ; le `sw.js`
  (cache `dla-shell-v6`) pré-cache la coque et les sous-pages de l'app.
- **Mises à jour** — `PwaRegister` détecte un nouveau service worker et affiche
  un `UpdateToast` (« Recharger » → `SKIP_WAITING`).
- **Finitions** — partage natif (`ShareButton`, Web Share API + repli copie),
  retour en haut de la carte (`ScrollTop`), retour haptique (`lib/haptic.ts`),
  lien d'évitement clavier sur le site, pages 404 / erreur aux couleurs de la marque.
- **Images** — logos recompressés (1254 px → 512 px) et jeu d'icônes/favicons
  dédié et léger (cf. `public/icon-*.png`, `favicon-*.png`, `apple-touch-icon.png`).

## Réservation & fidélité

Les demandes de réservation partent **par e-mail**, il n'y a **aucune base de
données** : la boîte mail du bar fait office de registre. `services/loyalty.ts`
reste simulé (état local).

Le parcours complet :

1. Les formulaires (site et PWA) postent sur **`/api/reservations`**
   (`app/api/reservations/route.ts`). Le navigateur ne parle à aucun tiers et ne
   connaît aucun secret.
2. La route valide côté serveur (créneau appartenant à `CRENEAUX_RESERVATION`,
   couverts 1–20, date non passée, téléphone et e-mail — et **au moins l'un des
   deux**, cf. « Toujours un moyen de rappel » ci-dessous), génère la référence
   `DLA-XXXX`, puis envoie via [Resend](https://resend.com) une **notification au
   bar** (répondre écrit directement au client) et, si une adresse a été laissée,
   un **accusé de réception au client**. Les gabarits sont dans
   `lib/emailsReservation.ts` (logique pure, testée).

### Configuration

| Variable                | Rôle                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`        | **Obligatoire.** Sans elle, la route répond `503` et le formulaire invite à téléphoner.                                       |
| `RESERVATION_FROM`      | Expéditeur. Défaut : `Derrière l'Abbaye <reservations@derrierelabbaye.fr>`. Doit appartenir à un domaine vérifié dans Resend. |
| `RESERVATION_EMAIL_BAR` | Destinataire côté bar. Défaut : `site.email`.                                                                                 |
| `RESERVATION_MODE`      | `demo` court-circuite l'envoi et journalise la demande. **Développement uniquement** : ignoré si `VERCEL_ENV=production`.     |

En local : copier `.env.example` → `.env.local` (déjà ignoré par git). En
production : Vercel → Project Settings → Environment Variables, puis redéployer.

### Aucun faux succès

Le formulaire **n'affiche jamais de confirmation sans envoi réel**. Si la clé
manque, si Resend refuse, ou si le réseau tombe, l'utilisateur voit une erreur qui
l'invite à appeler le bar. Le mode démo est un **opt-in explicite**, jamais déduit
d'une variable absente — c'est précisément ce qui, auparavant, faisait croire à des
clients que leur table était réservée alors que rien n'était enregistré.

### Toujours un moyen de rappel

Le téléphone et l'e-mail sont facultatifs **pris séparément** — beaucoup de clients
ne laissent qu'un numéro, d'autres qu'une adresse — mais une demande sans aucun des
deux est refusée. Sans base de données, la boîte mail du bar est le registre : une
ligne sans contact ne peut être ni confirmée, ni rappelée en cas d'imprévu, pendant
que la table reste bloquée.

La règle vit dans `contactJoignable()` (`lib/validationReservation.ts`) et
s'applique en trois endroits, avec le même message (`MESSAGE_CONTACT_MANQUANT`) :
le formulaire du site l'affiche sous le champ téléphone à l'envoi, la PWA garde son
bouton fermé tant qu'aucun contact n'est saisi, et `/api/reservations` tranche en
dernier — la route est publique.

### Anti-spam

`/api/reservations` étant public, trois garde-fous sans dépendance :

- un **honeypot** (champ `societe`, hors écran, hors tabulation, `aria-hidden`) ;
- un **contrôle temporel** — un envoi en moins de 2 s après l'affichage du
  formulaire est écarté ;
- une **limite de débit** par IP (`lib/limiteDebit.ts`) : 5 demandes / 10 min,
  20 / jour. Elle vit en mémoire d'instance et repart à zéro au démarrage à froid
  — garde-fou contre les rafales, pas quota strict. Si du spam passait, l'étape
  suivante serait un stockage partagé (Vercel KV).

Dans les deux premiers cas la réponse est un faux succès : un robot ne doit pas
apprendre qu'il a été repéré.

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

## Contenus variables

La carte et ses prix restent ceux des cartes imprimées fournies. La sélection
de vins et les créations du moment se découvrent sur place ; aucune référence
n'est inventée. Les événements ne s'affichent que lorsqu'ils sont renseignés dans
`data/evenements.ts`. Les créneaux 18h00–22h30 ne concernent que le formulaire
optionnel désactivé et devront être validés avant sa réactivation.

## Notes de marque (rappels)

Tout en français, vouvoiement, jamais d'emoji · deux fonds seulement (ivoire **ou** noir),
l'or est le pont · angles nets sauf la pilule · filets dorés à nœud `◆` · animations lentes ·
mention légale alcool obligatoire en pied de page.
