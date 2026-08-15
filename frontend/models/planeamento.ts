export interface EventoCalendario {
  id?: string;
  equipaId?: string;
  tipoEvento: 'TREINO' | 'JOGO' | 'FOLGA' | 'OUTRO';
  dataHoraInicio: string;
  dataHoraFim: string;
  descricao: string;
  local?: string;
  numeroTreino?: number;
  equipaCasa?: string;
  equipaFora?: string;
}

export interface PlaneamentoMicrociclo {
  id?: string;
  equipaId?: string;
  dataInicio: string;
  dataFim: string;
  numeroMicrociclo: number;
  numeroMorfociclo: number;
}
