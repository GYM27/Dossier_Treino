export interface Exercicio {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'AQUECIMENTO' | 'TECNICO' | 'TATICO' | 'FISICO' | 'GUARDA_REDES' | 'LUDICO';
  nivelDificuldade: number;
  objetivosEspecificos?: string;
  carga?: string;
  espaco?: string;
  jogadoresEnvolvidos?: number;
  dadosTaticos?: Record<string, any> | any;
  pasta?: string;
  tempo?: number;
  tacticData?: Record<string, any> | any;
}
