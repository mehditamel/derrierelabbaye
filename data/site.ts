/* =====================================================================
   Derrière l'Abbaye — Données du site (informations, copies, liens)
   ⚑ PLACEHOLDERS : les valeurs marquées « À CONFIRMER » ne figurent pas
   dans les sources fournies. À renseigner par l'établissement.
   ===================================================================== */

export const site = {
  nom: "Derrière l'Abbaye",
  baseline: "Bar à tapas & cocktails",
  accroche: "Apéro marseillais",
  url: "https://www.derrierelabbaye.fr",

  adresse: {
    rue: "1 rue de l'Abbaye",
    codePostal: "13007",
    ville: "Marseille",
    quartier: "Saint-Victor",
    pays: "France",
    // Coordonnées approximatives du quartier Saint-Victor (À CONFIRMER si besoin de précision)
    geo: { lat: 43.29, lng: 5.366 },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=1+rue+de+l%27Abbaye+13007+Marseille",
    // Ouvre Google Maps en mode itinéraire (l'app native sur mobile)
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=1+rue+de+l%27Abbaye+13007+Marseille",
    // Plan intégré (iframe) sans clé API — libellés en français.
    // Pour migrer vers l'API officielle Maps Embed (clé requise), remplacer par :
    // https://www.google.com/maps/embed/v1/place?key=CLE&q=...&language=fr
    embedUrl:
      "https://www.google.com/maps?q=1%20rue%20de%20l%27Abbaye%2013007%20Marseille&hl=fr&output=embed",
  },

  // Téléphone de l'établissement (source de vérité — voir public/offline.html à synchroniser)
  telephone: "+33 4 91 92 18 62",
  telephoneAffichage: "04 91 92 18 62",
  email: "info@derrierelabbaye.fr",

  // ⚑ À CONFIRMER — horaires réels.
  // La maquette mobile évoque « Ouvert · ferme à 01h00 ».
  horaires: [
    { jours: "Mardi – Jeudi", creneau: "17h00 – 01h00" },
    { jours: "Vendredi – Samedi", creneau: "17h00 – 02h00" },
    { jours: "Dimanche", creneau: "17h00 – 00h00" },
    { jours: "Lundi", creneau: "Fermé" },
  ],
  // Format schema.org (OpeningHoursSpecification simplifié) — aligné sur ci-dessus
  horairesSchema: [
    { jours: ["Tuesday", "Wednesday", "Thursday"], ouvre: "17:00", ferme: "01:00" },
    { jours: ["Friday", "Saturday"], ouvre: "17:00", ferme: "02:00" },
    { jours: ["Sunday"], ouvre: "17:00", ferme: "00:00" },
  ],
  fermeture: "ferme à 01h00",

  // ⚑ À CONFIRMER — liens réseaux sociaux
  reseaux: [
    { nom: "Instagram", url: "https://www.instagram.com/" },
    { nom: "Facebook", url: "https://www.facebook.com/" },
  ],

  // ⚑ À CONFIRMER — informations légales de l'établissement
  legales: {
    raisonSociale: "À CONFIRMER",
    formeJuridique: "À CONFIRMER",
    siret: "À CONFIRMER",
    directeurPublication: "À CONFIRMER",
    hebergeur: { nom: "À CONFIRMER", adresse: "À CONFIRMER" },
  },

  legal: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",

  gammeDePrix: "€€",
} as const;

/** Copies éditoriales réutilisables. */
export const copies = {
  heroTitre: "Derrière l'Abbaye",
  heroAccroche:
    "Apéro marseillais — bar à tapas & cocktails, niché dans une rue calme, juste derrière l'Abbaye Saint-Victor.",
  introSurtitre: "Le lieu",
  introTitre: "Une parenthèse derrière l'Abbaye",
  introTexte:
    "Une devanture en acier corten, une lumière chaude, des bouteilles qui scintillent dans la pénombre. Derrière l'Abbaye, c'est l'apéro marseillais dans ce qu'il a de plus généreux : des tapas à partager, des planches de caractère et des cocktails qui sentent le sud. À accompagner d'un verre, d'une bouteille… ou des deux.",

  quartierSurtitre: "Le quartier",
  quartierTitre: "Saint-Victor, juste derrière le monument",
  quartierTexte:
    "On nous trouve au pied de l'Abbaye Saint-Victor, l'une des plus anciennes abbayes de France et l'un des monuments les plus célèbres de Marseille. La foule remonte vers le Vieux-Port ; nous, on reste là, dans une petite rue tranquille, à l'abri du tumulte.",
  quartierTexte2:
    "C'est tout le charme du lieu : un repaire d'initiés à deux pas des grands repères marseillais. Après la visite de l'Abbaye, une balade sur le Vieux-Port ou un coucher de soleil au Pharo, poussez la porte — la rue est calme, l'accueil chaleureux, et le sud dans le verre.",

  carteSurtitre: "La carte",
  carteTitre: "À partager",
  carteSousTitre: "Froid, chaud & planches",
  carteIntro:
    "Une cuisine du sud pensée pour le partage : produits de saison, huile d'olive et herbes fraîches, des petites assiettes qui passent de main en main au fil de la soirée.",
  cocktailsSurtitre: "Le bar",
  cocktailsTitre: "Cocktails & boissons",
  cocktailsTexte:
    "Des classiques bien tirés aux créations maison, en passant par les long drinks : glace pilée, agrumes et amers, le sud dans le verre. À siroter au comptoir ou sous le ciel de Saint-Victor, au crépuscule.",
  reservationSurtitre: "Réserver",
  reservationTitre: "Réserver une table",
  reservationTexte:
    "Indiquez la date, le nombre de couverts et l'heure souhaitée : nous vous confirmons votre table.",
  nousTrouverSurtitre: "Nous trouver",
  nousTrouverTitre: "Passez nous voir, on vous attend",
  nousTrouverTexte:
    "Repérez l'Abbaye Saint-Victor : on est juste derrière, dans une rue calme, à deux pas du Vieux-Port. Une envie de réserver, une question sur la carte, ou simplement l'envie de pousser la porte ? Appelez-nous, on décroche avec plaisir — ou venez directement vous installer au comptoir.",
} as const;

/** Accès & transports — bloc « Comment venir » (section Nous trouver).
 *  Repères volontairement génériques (distances / quartiers vérifiables) ;
 *  ⚑ À CONFIRMER : lignes de bus exactes et noms de parkings par l'établissement. */
export const acces = [
  { mode: "À pied", detail: "à une dizaine de minutes du Vieux-Port par les quais" },
  { mode: "En bus", detail: "arrêt Saint-Victor, à proximité immédiate" },
  { mode: "En voiture", detail: "parkings publics du Pharo et du Vieux-Port" },
  { mode: "À vélo", detail: "stationnements le long des quais" },
] as const;

/** Statistiques / repères affichés en cartes sur la section « Le lieu ». */
export const reperes = [
  { valeur: "Abbaye St-Victor", label: "Juste derrière" },
  { valeur: "Vieux-Port", label: "À deux pas" },
  { valeur: "Apéro → tard", label: "Tous les soirs" },
] as const;

/** Questions fréquentes — affichées (section FAQ) ET balisées (JSON-LD FAQPage).
 *  Le contenu visible et le balisage doivent rester identiques (règle Google). */
export const faq = [
  {
    question: "Où se trouve Derrière l'Abbaye ?",
    reponse:
      "Au 1 rue de l'Abbaye, dans le 7e arrondissement de Marseille, au cœur du quartier Saint-Victor. On est juste derrière l'Abbaye Saint-Victor, dans une petite rue calme à deux pas du Vieux-Port.",
  },
  {
    question: "C'est près de l'Abbaye Saint-Victor et du Vieux-Port ?",
    reponse:
      "Oui : on est littéralement derrière l'Abbaye Saint-Victor, l'un des monuments les plus célèbres de Marseille, et à quelques minutes à pied du Vieux-Port et du jardin du Pharo. L'endroit idéal pour un verre après la visite.",
  },
  {
    question: "Comment venir ? Y a-t-il un parking ou un métro ?",
    reponse:
      "À pied depuis le Vieux-Port en une dizaine de minutes par les quais. En bus, l'arrêt Saint-Victor est tout proche. En voiture, plusieurs parkings publics desservent le quartier du Pharo et du Vieux-Port ; la rue de l'Abbaye, elle, reste tranquille.",
  },
  {
    question: "Quels sont les horaires ?",
    reponse:
      "On vous accueille du mardi au dimanche à partir de 17h00, pour l'apéro et jusque tard dans la soirée. Fermé le lundi.",
  },
  {
    question: "Faut-il réserver une table ?",
    reponse:
      "Ce n'est pas obligatoire — vous pouvez toujours vous installer au comptoir. Mais pour une table, surtout le week-end, mieux vaut réserver en ligne ou nous appeler : on vous confirme avec plaisir.",
  },
] as const;
