import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/* Harnais de tests — Vitest + Testing Library.
   L'alias « @/ » reproduit celui de tsconfig.json (paths). */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // On mesure le code applicatif : logique (lib), services et composants.
      include: ["app/api/**", "lib/**", "services/**", "components/**"],
      exclude: ["**/__tests__/**", "**/*.d.ts"],
      // Seuils-plancher calibrés sur l'existant : garde anti-régression, à
      // relever au fur et à mesure que la couverture composant progresse.
      //
      // ⚑ RECALIBRÉS lors de la montée en Vitest 4, qui réécrit la couverture V8
      // en remapping AST. Le même code, mesuré plus rigoureusement, donne :
      // instructions 64,6 → 65,7 et lignes 64,6 → 67,2 (en hausse), mais
      // branches 84,6 → 67,2 et fonctions 72,1 → 62,7 (en baisse — l'ancienne
      // mesure était optimiste sur les fichiers non testés). Baisser ces deux
      // nombres n'abaisse donc PAS l'exigence : c'est la métrique qui a changé,
      // pas la couverture du code.
      thresholds: {
        statements: 65,
        lines: 67,
        functions: 62,
        branches: 67,
      },
    },
  },
});
