import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTacticalExport } from "../useTacticalExport";

describe("useTacticalExport Hook - Exportação de Vídeo da Prancheta (TDD)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar com estado de gravação inativo", () => {
    const { result } = renderHook(() => useTacticalExport());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(typeof result.current.startRecording).toBe("function");
    expect(typeof result.current.stopRecording).toBe("function");
  });

  it("deve atualizar o progresso durante o processo de gravação", () => {
    const { result } = renderHook(() => useTacticalExport());

    act(() => {
      result.current.setProgress(45);
    });

    expect(result.current.progress).toBe(45);
  });
});
