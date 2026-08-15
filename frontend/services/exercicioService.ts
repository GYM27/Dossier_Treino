import { apiFetch } from "@/lib/api";
import { Exercicio } from "@/models/exercicio";

export const exercicioService = {
  async getExercicios(categoria?: string): Promise<Exercicio[]> {
    const endpoint = categoria && categoria !== "TODOS" 
      ? `/exercicios?categoria=${encodeURIComponent(categoria)}`
      : "/exercicios";
    return apiFetch(endpoint);
  },

  async getExercicioById(id: string): Promise<Exercicio> {
    return apiFetch(`/exercicios/${id}`);
  },

  async criarExercicio(exercicio: Partial<Exercicio>): Promise<Exercicio> {
    return apiFetch("/exercicios", {
      method: "POST",
      body: JSON.stringify(exercicio),
    });
  },

  async atualizarExercicio(id: string, exercicio: Partial<Exercicio>): Promise<Exercicio> {
    return apiFetch(`/exercicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(exercicio),
    });
  },

  async eliminarExercicio(id: string): Promise<void> {
    return apiFetch(`/exercicios/${id}`, {
      method: "DELETE",
    });
  },
};
