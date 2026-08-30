import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../useDashboardData";
import { atletaService } from "@/services/atletaService";
import { calendarioService } from "@/services/calendarioService";
import { assiduidadeService } from "@/services/assiduidadeService";
import { EventoCalendario } from "@/models/planeamento";
import { RegistoAssiduidade } from "@/models/assiduidade";

vi.mock("@/services/atletaService", () => ({
  atletaService: {
    getAtletasByEquipa: vi.fn(),
  },
}));

vi.mock("@/services/calendarioService", () => ({
  calendarioService: {
    getEventosSemana: vi.fn(),
    getEventosByEquipa: vi.fn(),
  },
}));

vi.mock("@/services/assiduidadeService", () => ({
  assiduidadeService: {
    getRegistosByEquipaEMes: vi.fn(),
  },
}));

describe("useDashboardData - Agregação de Indicadores e Métricas Reais (TDD)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar estado inicial vazio quando equipaId não é fornecido", () => {
    const { result } = renderHook(() => useDashboardData(undefined));

    expect(result.current.loading).toBe(false);
    expect(result.current.totalAtletas).toBe(0);
    expect(result.current.proximosEventos).toEqual([]);
    expect(result.current.aniversariosMes).toEqual([]);
  });

  it("deve carregar e calcular métricas de atletas, assiduidade e eventos reais", async () => {
    const mockAtletas = [
      { id: "1", nome: "Cristiano Silva", posicaoPrincipal: "AVANCADO", dataNascimento: "2008-08-15" },
      { id: "2", nome: "Bernardo Costa", posicaoPrincipal: "MEDIO", dataNascimento: "2008-08-20" },
      { id: "3", nome: "Rúben Dias", posicaoPrincipal: "DEFESA", dataNascimento: "2008-05-10" },
      { id: "4", nome: "Diogo Costa", posicaoPrincipal: "GUARDA_REDES", dataNascimento: "2008-09-12" },
    ];

    const mockEventos: EventoCalendario[] = [
      {
        id: "ev-1",
        descricao: "Treino Tático",
        tipoEvento: "TREINO",
        dataHoraInicio: "2026-08-30T18:00:00",
        dataHoraFim: "2026-08-30T19:30:00",
        local: "Campo Nº 1",
      },
      {
        id: "ev-2",
        descricao: "Jogo vs FC Porto",
        tipoEvento: "JOGO",
        dataHoraInicio: "2026-08-31T10:00:00",
        dataHoraFim: "2026-08-31T12:00:00",
        local: "Estádio Municipal",
      },
    ];

    const mockRegistos: RegistoAssiduidade[] = [
      { id: "r-1", eventoId: "ev-1", atletaId: "1", tipoAssiduidade: "PRESENTE" },
      { id: "r-2", eventoId: "ev-1", atletaId: "2", tipoAssiduidade: "PRESENTE" },
      { id: "r-3", eventoId: "ev-1", atletaId: "3", tipoAssiduidade: "ATRASADO" },
      { id: "r-4", eventoId: "ev-1", atletaId: "4", tipoAssiduidade: "FALTA_INJUSTIFICADA" },
    ];

    vi.mocked(atletaService.getAtletasByEquipa).mockResolvedValue(mockAtletas);
    vi.mocked(calendarioService.getEventosSemana).mockResolvedValue(mockEventos);
    vi.mocked(assiduidadeService.getRegistosByEquipaEMes).mockResolvedValue(mockRegistos);

    const { result } = renderHook(() => useDashboardData("team-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalAtletas).toBe(4);
    expect(result.current.distribuicaoPosicoes.guardaRedes).toBe(1);
    expect(result.current.distribuicaoPosicoes.defesas).toBe(1);
    expect(result.current.distribuicaoPosicoes.medios).toBe(1);
    expect(result.current.distribuicaoPosicoes.avancados).toBe(1);

    // Taxa de Assiduidade: 2 PRESENTES + 1 ATRASADO de 4 = 75%
    expect(result.current.taxaAssiduidade).toBe("75%");
    expect(result.current.totalAtrasos).toBe(1);
    expect(result.current.proximosEventos.length).toBe(2);
  });
});
