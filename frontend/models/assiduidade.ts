export type TipoAssiduidade = 
  | "PRESENTE" 
  | "AUSENTE" 
  | "FALTA_INJUSTIFICADA" 
  | "FALTA_JUSTIFICADA" 
  | "FALTA_AUTORIZADA"
  | "ATRASADO" 
  | "LESIONADO" 
  | "AO_SERVICO_SELECAO" 
  | "DISPENSADO"
  | "TREINO_CONDICIONADO"
  | "OUTRO";

export interface RegistoAssiduidade {
  id: string;
  eventoId: string;
  atletaId: string;
  tipoAssiduidade: TipoAssiduidade;
  minutosAtraso?: number;
  justificacao?: string;
}

export interface RegistoAssiduidadeUpdate {
  tipoAssiduidade: TipoAssiduidade;
  minutosAtraso?: number;
  justificacao?: string;
}
