import { apiFetch } from "@/lib/api";
import { Atleta } from "@/models/atleta";

export interface AtletaPayload {
  nome: string;
  nacionalidade?: string;
  dataNascimento?: string;
  numeroCamisola?: number;
  posicaoPrincipal: string;
  pePreferido: string;
  alturaCm?: number;
  pesoKg?: number;
  fotoUrl?: string;
}

export const atletaService = {
  async getAtletasByEquipa(equipaId: string): Promise<any[]> {
    return apiFetch(`/atletas/equipa/${equipaId}`);
  },

  async getAtletaById(id: string): Promise<Atleta> {
    return apiFetch(`/atletas/${id}`);
  },

  async criarAtleta(equipaId: string, payload: AtletaPayload): Promise<any> {
    return apiFetch(`/atletas/equipa/${equipaId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async atualizarAtleta(id: string, payload: AtletaPayload): Promise<any> {
    return apiFetch(`/atletas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async eliminarAtleta(id: string): Promise<void> {
    return apiFetch(`/atletas/${id}`, {
      method: "DELETE",
    });
  },
};
