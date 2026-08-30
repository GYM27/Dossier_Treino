export const ESCALOES = [
  "Seniores",
  "Sub-22",
  "Sub-19",
  "Sub-18",
  "Sub-17",
  "Sub-16",
  "Sub-15",
  "Sub-14",
  "Sub-13",
  "Sub-12",
  "Sub-11",
  "Sub-10",
  "Traquinas",
  "Petizes",
] as const;

export type Escalao = (typeof ESCALOES)[number];

export interface Team {
  id: string;
  nome: string;
  escalao?: string;
  epocaNome?: string;
  modalidade?: string;
  duracaoJogo?: string;
  numeroJogadores?: string;
  emblemaUrl?: string;
}

