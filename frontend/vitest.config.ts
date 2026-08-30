/// <reference types="vitest/config" />

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * vitest.config.ts — Configuração do Vitest para o projeto Dossier do Treinador.
 *
 * O Vitest é o test runner que utilizamos para testes unitários no frontend.
 * Esta configuração define:
 * - `environment: "jsdom"` — simula o DOM do browser em memória (necessário para React)
 * - `globals: true` — permite usar `describe`, `it`, `expect` sem importar
 * - `setupFiles` — carrega os matchers extra do @testing-library/jest-dom
 * - `alias @/` — replica o alias do tsconfig.json para os imports funcionarem nos testes
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Excluir node_modules e .next do scan de testes
    exclude: ["node_modules", ".next", "**/*.d.ts"],
  },
  resolve: {
    alias: {
      // Replica o alias `@/*` do tsconfig.json
      // Sem isto, os imports como `import { cn } from "@/lib/utils"` falhariam nos testes
      "@": path.resolve(__dirname, "./"),
    },
  },
});
