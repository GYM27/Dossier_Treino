/**
 * categoria-exercicio.ts — Fonte única de verdade para categorias de exercício.
 *
 * Mapeia as 6 categorias canónicas suportadas pelo backend (enum CategoriaExercicio)
 * adicionando etiquetas formatadas e classes visuais para UI/Badges.
 */

export interface CategoriaExercicioInfo {
  value: "AQUECIMENTO" | "TECNICO" | "TATICO" | "FISICO" | "GUARDA_REDES" | "LUDICO";
  label: string;
  color: string;
}

export const CATEGORIAS_EXERCICIO: readonly CategoriaExercicioInfo[] = [
  {
    value: "AQUECIMENTO",
    label: "Aquecimento",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    value: "TECNICO",
    label: "Técnico",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value: "TATICO",
    label: "Tático",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    value: "FISICO",
    label: "Físico",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    value: "GUARDA_REDES",
    label: "Guarda-Redes",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    value: "LUDICO",
    label: "Lúdico",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
] as const;

export const FILTRO_TODAS_CATEGORIAS = {
  value: "TODOS",
  label: "Todos",
  color: "bg-slate-700 text-slate-200",
} as const;

/**
 * Lista completa para filtros de UI incluindo a opção "Todos".
 */
export const CATEGORIAS_COM_TODOS = [
  FILTRO_TODAS_CATEGORIAS,
  ...CATEGORIAS_EXERCICIO,
] as const;

/**
 * Procura os metadados de uma categoria a partir da sua chave.
 */
export function getCategoriaByValue(value: string): CategoriaExercicioInfo | undefined {
  return CATEGORIAS_EXERCICIO.find((c) => c.value === value);
}
