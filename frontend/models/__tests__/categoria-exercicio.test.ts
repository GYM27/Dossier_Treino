import { describe, it, expect } from "vitest";
import {
  CATEGORIAS_EXERCICIO,
  FILTRO_TODAS_CATEGORIAS,
  getCategoriaByValue,
  type CategoriaExercicioInfo,
} from "../categoria-exercicio";

describe("Constantes e Helpers de Categorias de Exercício", () => {
  it("deve conter exatamente as 6 categorias canónicas do domínio desportivo", () => {
    expect(CATEGORIAS_EXERCICIO).toHaveLength(6);
    const values = CATEGORIAS_EXERCICIO.map((c) => c.value);
    expect(values).toEqual([
      "AQUECIMENTO",
      "TECNICO",
      "TATICO",
      "FISICO",
      "GUARDA_REDES",
      "LUDICO",
    ]);
  });

  it("cada categoria deve ter value, label e classe de cor Tailwind válida", () => {
    CATEGORIAS_EXERCICIO.forEach((cat: CategoriaExercicioInfo) => {
      expect(cat.value).toBeDefined();
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.color).toContain("text-");
    });
  });

  it("FILTRO_TODAS_CATEGORIAS deve ter o valor 'TODOS' e label 'Todos'", () => {
    expect(FILTRO_TODAS_CATEGORIAS.value).toBe("TODOS");
    expect(FILTRO_TODAS_CATEGORIAS.label).toBe("Todos");
  });

  it("getCategoriaByValue deve retornar a categoria correta ou undefined se não existir", () => {
    const tatico = getCategoriaByValue("TATICO");
    expect(tatico).toBeDefined();
    expect(tatico?.label).toBe("Tático");

    const inexistente = getCategoriaByValue("CATEGORIA_INEXISTENTE");
    expect(inexistente).toBeUndefined();
  });
});
