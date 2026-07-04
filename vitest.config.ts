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
      include: ["lib/**", "services/**", "components/**"],
      exclude: ["**/__tests__/**", "**/*.d.ts"],
      // Seuils-plancher calibrés sur l'existant : garde anti-régression, à
      // relever au fur et à mesure que la couverture composant progresse.
      thresholds: {
        statements: 50,
        lines: 50,
        functions: 58,
        branches: 76,
      },
    },
  },
});
