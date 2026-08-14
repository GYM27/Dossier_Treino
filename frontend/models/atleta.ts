export interface Atleta {
  id: string;
  nome: string;
  idade: number;
  nacionalidade: string;
  posicaoPrincipal: string;
  numeroCamisola?: number;
  fotoUrl?: string;
  pePreferido: string;
  nomeEquipa: string;
}
