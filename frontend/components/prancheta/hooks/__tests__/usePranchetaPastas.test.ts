import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePranchetaPastas } from "../usePranchetaPastas";
import { DEFAULT_MAIN_PASTAS } from "@/models/pasta";

describe("usePranchetaPastas - Gestão de Pastas e Subpastas Hierárquicas (TDD)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("deve inicializar com as pastas padrão", () => {
    const { result } = renderHook(() => usePranchetaPastas());

    expect(result.current.pastas.length).toBe(DEFAULT_MAIN_PASTAS.length);
    expect(result.current.pasta).toBe("Organização Ofensiva");
    expect(result.current.drawerMode).toBe("PASTAS");
  });

  it("deve criar uma nova pasta principal", () => {
    const { result } = renderHook(() => usePranchetaPastas());

    act(() => {
      result.current.handleCriarNovaPasta("Bolas Paradas Ofensivas", null);
    });

    const criada = result.current.pastas.find((p) => p.nome === "Bolas Paradas Ofensivas");
    expect(criada).toBeDefined();
    expect(criada?.parentId).toBeNull();
    expect(result.current.pasta).toBe("Bolas Paradas Ofensivas");
  });

  it("deve criar uma subpasta associada a um parentId", () => {
    const { result } = renderHook(() => usePranchetaPastas());
    const parent = result.current.pastas[0];

    act(() => {
      result.current.handleCriarNovaPasta("1ª Fase de Construção", parent.id);
    });

    const subpasta = result.current.pastas.find((p) => p.nome === "1ª Fase de Construção");
    expect(subpasta).toBeDefined();
    expect(subpasta?.parentId).toBe(parent.id);
  });

  it("deve alternar a expansão de uma pasta no acordeão", () => {
    const { result } = renderHook(() => usePranchetaPastas());

    act(() => {
      result.current.togglePastaExpanded("org-ofensiva");
    });

    expect(result.current.expandedPastas["org-ofensiva"]).toBe(false);

    act(() => {
      result.current.togglePastaExpanded("org-ofensiva");
    });

    expect(result.current.expandedPastas["org-ofensiva"]).toBe(true);
  });
});
