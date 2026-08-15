export interface Exercicio {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'AQUECIMENTO' | 'TECNICO' | 'TATICO' | 'FISICO' | 'GUARDA_REDES' | 'LUDICO';
  nivelDificuldade: number;
  objetivosEspecificos?: string;
  espaco?: string;
  jogadoresEnvolvidos?: number;
  dadosTaticos?: Record<string, any> | any;
}
