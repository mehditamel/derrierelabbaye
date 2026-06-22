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
    geo: { lat: 43.290, lng: 5.366 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=1+rue+de+l%27Abbaye+13007+Marseille",
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

  legal:
    "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",

  gammeDePrix: "€€",
} as const;

/** Copies éditoriales réutilisables. */
export const copies = {
  heroTitre: "Derrière l'Abbaye",
  heroAccroche: "Apéro marseillais — bar à tapas & cocktails, juste derrière l'Abbaye Saint-Victor.",
  introSurtitre: "Le lieu",
  introTitre: "Juste derrière l'Abbaye Saint-Victor",
  introTexte:
    "Une devanture en acier corten, une lumière chaude, des bouteilles qui scintillent dans la pénombre. Derrière l'Abbaye, c'est l'apéro marseillais dans ce qu'il a de plus généreux : des tapas à partager, des planches de caractère et des cocktails qui sentent le sud. À accompagner d'un verre, d'une bouteille… ou des deux.",
  carteSurtitre: "La carte",
  carteTitre: "À partager",
  carteSousTitre: "Froid, chaud & planches",
  cocktailsSurtitre: "Le bar",
  cocktailsTitre: "Cocktails & boissons",
  cocktailsTexte:
    "Classiques bien tirés, créations maison et long drinks — au comptoir comme en terrasse.",
  reservationSurtitre: "Réserver",
  reservationTitre: "Réserver une table",
  reservationTexte:
    "Indiquez la date, le nombre de couverts et l'heure souhaitée : nous vous confirmons votre table.",
  nousTrouverSurtitre: "Nous trouver",
  nousTrouverTitre: "Passez nous voir, on vous attend",
  nousTrouverTexte:
    "Juste derrière l'Abbaye Saint-Victor, à deux pas du Vieux-Port. Une envie de réserver, une question sur la carte, ou simplement l'envie de pousser la porte ? Appelez-nous, on décroche avec plaisir — ou venez directement vous installer au comptoir.",
} as const;

/** Statistiques / repères affichés en cartes sur la section « Le lieu ». */
export const reperes = [
  { valeur: "Saint-Victor", label: "Quartier" },
  { valeur: "Tapas & cocktails", label: "Bar à" },
  { valeur: "Apéro → tard", label: "Tous les soirs" },
] as const;
