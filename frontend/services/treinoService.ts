import { apiFetch } from "@/lib/api";
import { SessaoTreino, SessaoTreinoExercicio } from "@/models/sessao-treino";

export interface CriarTreinoPayload {
  eventoId?: string;
  equipaId: string;
  numeroJogadores?: number;
  objetivo: string;
  intensidadeGeral?: number;
  material?: string;
}

export interface AdicionarExercicioPayload {
  exercicioId: string;
  ordem: number;
  duracaoMinutos: number;
  observacoesDoTreinador?: string;
}

export const treinoService = {
  async getTreinosByEquipa(equipaId: string): Promise<SessaoTreino[]> {
    return apiFetch(`/treinos/equipa/${equipaId}`);
  },

  async getTreinoById(treinoId: string): Promise<SessaoTreino> {
    return apiFetch(`/treinos/${treinoId}`);
  },

  async getUltimoNumeroTreino(equipaId: string): Promise<number> {
    const res = await apiFetch(`/eventos/equipa/${equipaId}/ultimo-numero-treino`);
    return typeof res === "number" ? res : 0;
  },

  async criarTreino(payload: CriarTreinoPayload): Promise<SessaoTreino> {
    return apiFetch("/treinos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async atualizarTreino(treinoId: string, payload: Partial<CriarTreinoPayload>): Promise<SessaoTreino> {
    return apiFetch(`/treinos/${treinoId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async adicionarExercicio(treinoId: string, payload: AdicionarExercicioPayload): Promise<SessaoTreino> {
    return apiFetch(`/treinos/${treinoId}/exercicios`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async atualizarExercicio(
    treinoId: string,
    assocId: string,
    updates: Partial<SessaoTreinoExercicio>
  ): Promise<SessaoTreino> {
    return apiFetch(`/treinos/${treinoId}/exercicios/${assocId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async removerExercicio(treinoId: string, assocId: string): Promise<void> {
    return apiFetch(`/treinos/${treinoId}/exercicios/${assocId}`, {
      method: "DELETE",
    });
  },

  async reordenarExercicios(
    treinoId: string,
    ordemAssocIds: string[]
  ): Promise<SessaoTreino> {
    return apiFetch(`/treinos/${treinoId}/exercicios/reordenar`, {
      method: "PUT",
      body: JSON.stringify(ordemAssocIds),
    });
  },
};
