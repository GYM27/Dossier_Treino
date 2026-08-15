import { apiFetch } from "@/lib/api";
import { RegistoAssiduidade, RegistoAssiduidadeUpdate } from "@/models/assiduidade";
import { EventoCalendario } from "@/models/planeamento";

export const assiduidadeService = {
  async getEventosMes(equipaId: string, ano: number, mes: number): Promise<EventoCalendario[]> {
    return apiFetch(`/eventos/equipa/${equipaId}/mes?ano=${ano}&mes=${mes}`);
  },

  async getRegistosByEquipaEMes(equipaId: string, ano: number, mes: number): Promise<RegistoAssiduidade[]> {
    return apiFetch(`/assiduidade/equipa/${equipaId}/mes?ano=${ano}&mes=${mes}`);
  },

  async getEventosSemana(equipaId: string, startIso: string, endIso: string): Promise<EventoCalendario[]> {
    return apiFetch(`/eventos/equipa/${equipaId}/semana?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
  },

  async getRegistosSemana(equipaId: string, startIso: string, endIso: string): Promise<RegistoAssiduidade[]> {
    return apiFetch(`/assiduidade/equipa/${equipaId}/semana?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
  },

  async atualizarAssiduidade(
    eventoId: string,
    atletaId: string,
    payload: RegistoAssiduidadeUpdate
  ): Promise<void> {
    return apiFetch(`/assiduidade/evento/${eventoId}/atleta/${atletaId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
