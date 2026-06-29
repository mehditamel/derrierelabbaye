/* =====================================================================
   Derrière l'Abbaye — Données de la carte
   Transcrites fidèlement depuis les cartes imprimées
   (public/carte-recto.jpg = cuisine, public/carte-verso.jpg = boissons).
   ★ = spécialité maison (signature).

   Convention typographique des prix : espace fine insécable (U+202F)
   avant le symbole €, décimales à la virgule uniquement si nécessaires
   (« 7 € », « 3,50 € », fourchettes « 12 – 15 € »).
   ===================================================================== */

export type MenuItem = {
  nom: string;
  description?: string;
  prix?: string;
  signature?: boolean;
  /* ⚑ Badge « végé » : déduit des descriptions (aucune mention sur les
     cartes imprimées) — à faire confirmer par l'établissement.
     Dans le doute, ne pas tagger. */
  vege?: boolean;
};

export type MenuSection = {
  id: string;
  titre: string;
  surtitre?: string;
  items: MenuItem[];
};

/* ----------------------------- CUISINE ------------------------------ */

export const aPartagerFroid: MenuSection = {
  id: "froid",
  titre: "À partager — froid",
  items: [
    {
      nom: "Houmous maison",
      description: "huile d'olive & paprika fumé, pain grillé",
      prix: "7 €",
      vege: true,
    },
    {
      nom: "Aubergines rôties",
      description: "yaourt citronné & zaatar",
      prix: "8 €",
      vege: true,
    },
    {
      nom: "Burrata crémeuse",
      description: "tomates confites & pesto, focaccia grillée",
      prix: "12 €",
      vege: true,
    },
    {
      nom: "Poulpe mariné",
      description: "citron confit & herbes fraîches",
      prix: "14 €",
      signature: true,
    },
    {
      nom: "Vitello tonnato",
      description: "câpres & pickles d'oignon rouge",
      prix: "13 €",
      signature: true,
    },
    {
      nom: "Anchois marinés",
      description: "huile d'olive & zestes de citron",
      prix: "10 €",
    },
  ],
};

export const aPartagerChaud: MenuSection = {
  id: "chaud",
  titre: "À partager — chaud",
  items: [
    {
      nom: "Croque-monsieur",
      description: "jambon & comté, croustillant, coupé en tapas",
      prix: "9 €",
    },
    {
      nom: "Poivrons del piquillo farcis",
      description: "préparation du moment, inspiration du chef",
      prix: "9 €",
    },
    {
      nom: "Focaccia toastée",
      description: "mortadelle & stracciatella",
      prix: "10 €",
    },
    {
      nom: "Moules gratinées",
      description: "beurre persillé & chapelure croustillante",
      prix: "14 €",
      signature: true,
    },
    {
      nom: "Couteaux en persillade",
      description: "ail, persil & citron",
      prix: "13 €",
    },
  ],
};

export const planches: MenuSection = {
  id: "planches",
  titre: "Planches à partager",
  items: [
    {
      nom: "Planche de charcuterie",
      description: "sélection de jambons & saisons",
      prix: "18 €",
    },
    {
      nom: "Planche de fromages",
      description: "affinés & de caractère",
      prix: "18 €",
      vege: true,
    },
    {
      nom: "Planche mixte",
      description: "charcuterie & fromages",
      prix: "24 €",
    },
  ],
};

export const cuisine: MenuSection[] = [aPartagerFroid, aPartagerChaud, planches];

/* ----------------------------- BOISSONS ----------------------------- */

export const cocktailsClassiques: MenuSection = {
  id: "cocktails",
  titre: "Cocktails classiques",
  surtitre: "12 €",
  items: [
    { nom: "Mojito" },
    { nom: "Aperol Spritz" },
    { nom: "London Mule" },
    { nom: "Moscow Mule" },
    { nom: "Long Island" },
  ],
};

export const cocktailsCreations: MenuSection = {
  id: "creations",
  titre: "Cocktails créations",
  surtitre: "12 – 15 €",
  // PLACEHOLDER : la carte imprimée laisse cette liste « à compléter ».
  // Renseigner les créations maison ici.
  items: [{ nom: "Création du moment", description: "demandez à l'équipe" }],
};

export const longDrinks: MenuSection = {
  id: "long-drinks",
  titre: "Long drinks",
  surtitre: "10 €",
  items: [{ nom: "Whisky Coca" }, { nom: "Gin Tonic" }, { nom: "Vodka Red Bull" }],
};

export const shooters: MenuSection = {
  id: "shooters",
  titre: "Shooters",
  surtitre: "5 €",
  items: [{ nom: "Sélection de shooters" }],
};

export const softs: MenuSection = {
  id: "softs",
  titre: "Softs",
  surtitre: "5 €",
  items: [
    { nom: "Coca-Cola" },
    { nom: "Coca-Cola Zéro" },
    { nom: "Limonade" },
    { nom: "Schweppes" },
    { nom: "Fever-Tree" },
    { nom: "Orangina" },
  ],
};

export const jusDeFruits: MenuSection = {
  id: "jus",
  titre: "Jus de fruits",
  surtitre: "5 €",
  items: [{ nom: "Orange, Ananas, Pomme, Tomate, Abricot, ACE…" }],
};

export const sirops: MenuSection = {
  id: "sirops",
  titre: "Sirops",
  surtitre: "3 €",
  items: [
    {
      nom: "Grenadine, Menthe, Fraise, Citron, Pêche, Orgeat, Violette, Vanille, Caramel, Cerise, Banane, Kiwi",
    },
  ],
};

export const eauxMinerales: MenuSection = {
  id: "eaux",
  titre: "Eaux minérales",
  items: [
    { nom: "Grande bouteille", prix: "5 €" },
    { nom: "Demi bouteille", prix: "3,50 €" },
  ],
};

export const vins: MenuSection = {
  id: "vins",
  titre: "Sélection de vins",
  items: [
    { nom: "Verre de vin", prix: "5 €" },
    { nom: "Verre de vin supérieur", prix: "7 €" },
    // PLACEHOLDER : la carte laisse les références blancs / rouges / rosés
    // « à compléter ». Renseigner les bouteilles ici.
    { nom: "Vins blancs", description: "sélection à découvrir sur place" },
    { nom: "Vins rouges", description: "sélection à découvrir sur place" },
    { nom: "Vins rosés", description: "sélection à découvrir sur place" },
  ],
};

/** Sections cocktails / spiritueux mises en avant sur la section noire. */
export const barSections: MenuSection[] = [
  cocktailsClassiques,
  cocktailsCreations,
  longDrinks,
  shooters,
];

/** Sections « bar sans alcool & vins ». */
export const boissonsDouces: MenuSection[] = [softs, jusDeFruits, sirops, eauxMinerales, vins];

/** Cocktail mis en avant (PWA « ce soir » / site). */
export const cocktailVedette: MenuItem = {
  nom: "Aperol Spritz",
  description: "l'apéro marseillais par excellence — amer, vif, ensoleillé",
  prix: "12 €",
  signature: true,
};
