import { apiFetch } from "@/lib/api";

export interface Adversario {
  id?: string;
  nome: string;
  escudoUrl?: string;
  sistemaTaticoPref?: string;
  pontosFortes?: string;
  pontosFracos?: string;
  observacoesGerais?: string;
  eventoCalendarioId?: string;
}

export const adversarioService = {
  async listarTodos(): Promise<Adversario[]> {
    return apiFetch("/adversarios");
  },

  async criar(adversario: Adversario): Promise<Adversario> {
    return apiFetch("/adversarios", {
      method: "POST",
      body: JSON.stringify(adversario),
    });
  },

  async atualizar(id: string, adversario: Adversario): Promise<Adversario> {
    return apiFetch(`/adversarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(adversario),
    });
  },

  async eliminar(id: string): Promise<void> {
    return apiFetch(`/adversarios/${id}`, {
      method: "DELETE",
    });
  },
};
