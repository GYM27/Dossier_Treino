/**
 * constants.ts — Constantes partilhadas pelo módulo Plantel.
 *
 * Centraliza aqui todos os valores fixos (cores, opções de select, valores padrão)
 * para evitar duplicação e facilitar futuras alterações.
 */

// ── Mapa de cores por grupo posicional ──────────────────────────────────────
// Usado pelo PlayerCard para pintar o badge de posição com a cor certa.
export const CORES_POR_POSICAO: Record<string, string> = {
  "Guarda-Redes": "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  "Defesa":       "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Médio":        "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "Avançado":     "bg-rose-500/15 text-rose-500 border-rose-500/30",
}

// ── Opções para os <select> do formulário ───────────────────────────────────
// Cada objeto tem o `valor` (o enum que o Backend espera) e a `etiqueta` (o texto bonito).
export const OPCOES_POSICAO = [
  { valor: "GUARDA_REDES",      etiqueta: "Guarda-Redes" },
  { valor: "DEFESA_CENTRAL",    etiqueta: "Defesa Central" },
  { valor: "LATERAL_DIREITO",   etiqueta: "Lateral Direito" },
  { valor: "LATERAL_ESQUERDO",  etiqueta: "Lateral Esquerdo" },
  { valor: "MEDIO_DEFENSIVO",   etiqueta: "Médio Defensivo" },
  { valor: "MEDIO_CENTRO",      etiqueta: "Médio Centro" },
  { valor: "MEDIO_OFENSIVO",    etiqueta: "Médio Ofensivo" },
  { valor: "EXTREMO_DIREITO",   etiqueta: "Extremo Direito" },
  { valor: "EXTREMO_ESQUERDO",  etiqueta: "Extremo Esquerdo" },
  { valor: "AVANCADO_CENTRO",   etiqueta: "Avançado Centro" },
]

export const OPCOES_PE = [
  { valor: "DESTRO",     etiqueta: "Destro" },
  { valor: "ESQUERDO",   etiqueta: "Esquerdino" },
  { valor: "AMBIDESTRO", etiqueta: "Ambidestro" },
]

// ── Valores padrão para um Atleta novo ──────────────────────────────────────
// Usado quando abrimos o modal em modo "Criar" (campos vazios/defaults).
export const ATLETA_VAZIO = {
  nome: "",
  dataNascimento: "",
  nacionalidade: "Portugal",
  posicaoPrincipal: "GUARDA_REDES",
  pePreferido: "DESTRO",
  numeroCamisola: 1,
  alturaCm: 180,
  pesoKg: 75,
  fotoUrl: "",
}

// ── Tipo TypeScript para o formulário ───────────────────────────────────────
export type AtletaFormData = typeof ATLETA_VAZIO
