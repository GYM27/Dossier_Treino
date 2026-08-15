import { apiFetch } from "@/lib/api";
import { EventoCalendario, PlaneamentoMicrociclo } from "@/models/planeamento";

export const calendarioService = {
  async getEventosByEquipa(equipaId: string): Promise<EventoCalendario[]> {
    return apiFetch(`/eventos/equipa/${equipaId}`);
  },

  async getEventosSemana(equipaId: string, startIso: string, endIso: string): Promise<EventoCalendario[]> {
    return apiFetch(`/eventos/equipa/${equipaId}/semana?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
  },

  async getUltimoNumeroTreino(equipaId: string): Promise<number> {
    const res = await apiFetch(`/eventos/equipa/${equipaId}/ultimo-numero-treino`);
    return typeof res === "number" ? res : 0;
  },

  async criarEvento(equipaId: string, evento: Omit<EventoCalendario, "id">): Promise<EventoCalendario> {
    return apiFetch(`/eventos/equipa/${equipaId}`, {
      method: "POST",
      body: JSON.stringify(evento),
    });
  },

  async atualizarEvento(id: string, evento: Partial<EventoCalendario>): Promise<EventoCalendario> {
    return apiFetch(`/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(evento),
    });
  },

  async eliminarEvento(id: string): Promise<void> {
    return apiFetch(`/eventos/${id}`, {
      method: "DELETE",
    });
  },

  async getMicrocicloSemana(equipaId: string, dataInicio: string): Promise<any> {
    return apiFetch(`/microciclos/equipa/${equipaId}/semana?dataInicio=${encodeURIComponent(dataInicio)}`);
  },

  async salvarMicrociclo(equipaId: string, payload: any): Promise<any> {
    return apiFetch(`/microciclos/equipa/${equipaId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPlaneamentoSemanal(equipaId: string, dataInicio: string): Promise<PlaneamentoMicrociclo | null> {
    try {
      return await apiFetch(`/planeamento/equipa/${equipaId}/semana?dataInicio=${encodeURIComponent(dataInicio)}`);
    } catch {
      return null;
    }
  },

  async salvarPlaneamentoSemanal(payload: PlaneamentoMicrociclo): Promise<PlaneamentoMicrociclo> {
    return apiFetch("/planeamento/semana", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
