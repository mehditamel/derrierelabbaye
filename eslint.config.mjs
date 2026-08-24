/* =====================================================================
   Configuration ESLint — format « flat », requis depuis Next 16
   (`next lint` a disparu, on invoque désormais l'ESLint CLI).

   Les trois briques exposent nativement des configurations plates : aucune
   couche de compatibilité `FlatCompat` n'est nécessaire.
   ===================================================================== */

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

const config = [
  // Artefacts de build : jamais analysés (node_modules l'est déjà par défaut).
  { ignores: [".next/**", "coverage/**", ".lighthouseci/**"] },

  ...nextCoreWebVitals,

  // eslint-config-next enregistre déjà le greffon jsx-a11y : on n'active que
  // ses règles « recommended », sans le redéclarer (ESLint l'interdit).
  { rules: jsxA11y.flatConfigs.recommended.rules },

  // En dernier : neutralise les règles de style qui entreraient en conflit
  // avec Prettier, seul maître du formatage ici.
  prettier,

  {
    rules: {
      // Les apostrophes et guillemets français sont écrits tels quels dans le
      // JSX : c'est du contenu éditorial, pas une coquille.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
