export interface SessaoTreinoExercicio {
  id?: string;
  exercicioId: string;
  exercicioNome: string;
  ordem: number;
  duracaoMinutos: number;
  observacoesDoTreinador?: string;
}

export interface SessaoTreino {
  id: string;
  data: string;
  hora?: string;
  morfociclo?: number;
  microciclo?: number;
  fase?: string;
  numeroJogadores?: number;
  material?: string;
  objetivo?: string;
  intensidadeGeral?: number;
  duracaoTotalMinutos: number;
  equipaId: string;
  exercicios: SessaoTreinoExercicio[];
}
