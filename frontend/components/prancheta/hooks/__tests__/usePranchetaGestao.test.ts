import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePranchetaGestao } from "../usePranchetaGestao";
import { exercicioService } from "@/services/exercicioService";

vi.mock("@/services/exercicioService", () => ({
  exercicioService: {
    getExercicios: vi.fn(),
    getExercicioById: vi.fn(),
    criarExercicio: vi.fn(),
    atualizarExercicio: vi.fn(),
    eliminarExercicio: vi.fn(),
  },
}));

vi.mock("@/services/treinoService", () => ({
  treinoService: {
    atualizarExercicio: vi.fn(),
  },
}));

describe("usePranchetaGestao - Gestão do Ciclo de Vida e CRUD de Exercícios (TDD)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar com valores padrão para um novo exercício", () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([]);

    const { result } = renderHook(() => usePranchetaGestao({}));

    expect(result.current.nome).toBe("Novo Exercício Tático");
    expect(result.current.categoria).toBe("TATICO");
    expect(result.current.selectedExercicio).toBeNull();
  });

  it("deve carregar os detalhes de um exercício selecionado", () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([]);

    const mockEx = {
      id: "ex-1",
      nome: "Pressão 4v2",
      categoria: "TECNICO" as const,
      nivelDificuldade: 4,
      espaco: "20x20m",
      jogadoresEnvolvidos: 6,
      descricao: "Manutenção da posse",
      objetivosEspecificos: "Linhas de passe",
      carga: "Alta",
      dadosTaticos: { tempo: "12 min", pasta: "Transição Defensiva" },
    };

    const { result } = renderHook(() => usePranchetaGestao({}));

    act(() => {
      result.current.carregarDetalhesExercicio(mockEx);
    });

    expect(result.current.selectedExercicio?.id).toBe("ex-1");
    expect(result.current.nome).toBe("Pressão 4v2");
    expect(result.current.categoria).toBe("TECNICO");
    expect(result.current.nivelDificuldade).toBe(4);
    expect(result.current.espaco).toBe("20x20m");
    expect(result.current.tempo).toBe("12 min");
  });

  it("deve resetar o formulário ao chamar handleNovoExercicio", () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([]);

    const { result } = renderHook(() => usePranchetaGestao({}));

    act(() => {
      result.current.setNome("Exercício Temporário");
      result.current.handleNovoExercicio();
    });

    expect(result.current.nome).toBe("Novo Exercício Tático");
    expect(result.current.selectedExercicio).toBeNull();
  });

  it("deve criar um novo exercício com sucesso via handleExecutarGravacao", async () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([]);
    const mockCriado = {
      id: "ex-novo",
      nome: "Saída de Bola 3v2",
      descricao: "Treino de saída de bola sob pressão",
      categoria: "TATICO" as const,
      nivelDificuldade: 3,
    };
    vi.mocked(exercicioService.criarExercicio).mockResolvedValue(mockCriado);

    const { result } = renderHook(() => usePranchetaGestao({}));

    await act(async () => {
      await result.current.handleExecutarGravacao({
        isNew: true,
        nomeFinal: "Saída de Bola 3v2",
        pastaFinal: "Organização Ofensiva",
      });
    });

    expect(exercicioService.criarExercicio).toHaveBeenCalledTimes(1);
    expect(result.current.selectedExercicio?.id).toBe("ex-novo");
  });
});
