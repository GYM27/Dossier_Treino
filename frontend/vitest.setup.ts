/**
 * vitest.setup.ts — Ficheiro de setup que é executado ANTES de cada teste.
 *
 * Importa os matchers extra do @testing-library/jest-dom,
 * que adicionam métodos como:
 * - `expect(element).toBeInTheDocument()`
 * - `expect(element).toHaveClass("...")`
 * - `expect(element).toBeVisible()`
 *
 * Estes matchers tornam as asserções sobre o DOM mais expressivas e legíveis.
 */
import "@testing-library/jest-dom/vitest";
