import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardKeyboard } from "../useBoardKeyboard";
import { TacticalState, TacticalElement, TacticalDrawing } from "../../types";
import { INITIAL_STATE } from "../../constants";

describe("useBoardKeyboard - Atalhos de Teclado e Clipboard (TDD)", () => {
  let mockState: TacticalState;
  let stateRef: { current: TacticalState };
  let selectedDrawingIdxRef: { current: number | null };
  let selectedElementIdRef: { current: string | null };
  let setDrawingSelection: (idx: number | null) => void;
  let setElementSelection: (id: string | null) => void;
  let saveHistorySnapshot: () => void;
  let undo: () => void;
  let redo: () => void;
  let refreshUi: () => void;

  beforeEach(() => {
    mockState = JSON.parse(JSON.stringify(INITIAL_STATE));
    stateRef = { current: mockState };
    selectedDrawingIdxRef = { current: null };
    selectedElementIdRef = { current: null };
    setDrawingSelection = vi.fn((idx) => {
      selectedDrawingIdxRef.current = idx;
    });
    setElementSelection = vi.fn((id) => {
      selectedElementIdRef.current = id;
    });
    saveHistorySnapshot = vi.fn();
    undo = vi.fn();
    redo = vi.fn();
    refreshUi = vi.fn();
  });

  it("deve rodar um elemento 90 graus (+PI/2) ao premir a tecla 'r'", () => {
    const el: TacticalElement = { id: "player-1", type: "home", x: 100, y: 100, rotation: 0 };
    mockState.framesMap[mockState.activePath[0]].elements.push(el);
    selectedElementIdRef.current = "player-1";

    renderHook(() =>
      useBoardKeyboard({
        stateRef,
        selectedDrawingIdxRef,
        selectedElementIdRef,
        setDrawingSelection,
        setElementSelection,
        saveHistorySnapshot,
        undo,
        redo,
        refreshUi,
        readOnly: false,
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
    });

    expect(el.rotation).toBeCloseTo(Math.PI / 2);
    expect(saveHistorySnapshot).toHaveBeenCalled();
    expect(refreshUi).toHaveBeenCalled();
  });

  it("deve eliminar o desenho selecionado ao premir 'Delete' ou 'Backspace'", () => {
    const drawing: TacticalDrawing = {
      id: "draw-1",
      type: "line",
      config: {
        color: "#ffff00",
        size: 3,
        lineStyle: "solid",
      },
      points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
    };
    mockState.drawings.push(drawing);
    selectedDrawingIdxRef.current = 0;

    renderHook(() =>
      useBoardKeyboard({
        stateRef,
        selectedDrawingIdxRef,
        selectedElementIdRef,
        setDrawingSelection,
        setElementSelection,
        saveHistorySnapshot,
        undo,
        redo,
        refreshUi,
        readOnly: false,
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
    });

    expect(mockState.drawings.length).toBe(0);
    expect(setDrawingSelection).toHaveBeenCalledWith(null);
    expect(saveHistorySnapshot).toHaveBeenCalled();
    expect(refreshUi).toHaveBeenCalled();
  });

  it("deve acionar o undo ao premir Ctrl+Z", () => {
    renderHook(() =>
      useBoardKeyboard({
        stateRef,
        selectedDrawingIdxRef,
        selectedElementIdRef,
        setDrawingSelection,
        setElementSelection,
        saveHistorySnapshot,
        undo,
        redo,
        refreshUi,
        readOnly: false,
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }));
    });

    expect(undo).toHaveBeenCalled();
  });
});
