export interface SessaoTreinoExercicio {
  id?: string;
  exercicioId: string;
  exercicioNome: string;
  descricao?: string;
  objetivosEspecificos?: string;
  carga?: string;
  categoria?: string;
  nivelDificuldade?: number;
  espaco?: string;
  jogadoresEnvolvidos?: number;
  ordem: number;
  duracaoMinutos: number;
  observacoesDoTreinador?: string;
  dadosTaticos?: any;
}

export interface SessaoTreino {
  id: string;
  eventoId?: string;
  data: string;
  hora?: string;
  local?: string;
  morfociclo?: number;
  mesociclo?: number;
  microciclo?: number;
  unidadeTreino?: number;
  periodo?: "PREPARATORIO" | "COMPETITIVO" | "TRANSICAO" | string;
  fase?: string;
  numeroJogadores?: number;
  material?: string;
  objetivo?: string;
  intensidadeGeral?: number;
  duracaoTotalMinutos: number;
  equipaId: string;
  exercicios: SessaoTreinoExercicio[];
}
