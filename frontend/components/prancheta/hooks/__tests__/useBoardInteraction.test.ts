import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardInteraction } from "../useBoardInteraction";
import { TacticalState, TacticalElement } from "../../types";
import { INITIAL_STATE } from "../../constants";

describe("useBoardInteraction - Gestão de Eventos de Pointer e Arraste (TDD)", () => {
  let mockState: TacticalState;
  let stateRef: { current: TacticalState };
  let selectedDrawingIdxRef: { current: number | null };
  let selectedElementIdRef: { current: string | null };
  let setDrawingSelection: (idx: number | null) => void;
  let setElementSelection: (id: string | null) => void;
  let saveHistorySnapshot: () => void;
  let refreshUi: () => void;
  let canvasRef: { current: HTMLCanvasElement | null };

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
    refreshUi = vi.fn();

    const mockCanvas = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 625,
      }),
    } as unknown as HTMLCanvasElement;
    canvasRef = { current: mockCanvas };
  });

  it("deve selecionar um elemento ao fazer um clique estático (sem arrasto)", () => {
    const el: TacticalElement = { id: "player-1", type: "home", x: 100, y: 100 };
    mockState.framesMap[mockState.activePath[0]].elements.push(el);

    const { result } = renderHook(() =>
      useBoardInteraction({
        canvasRef,
        stateRef,
        selectedDrawingIdxRef,
        selectedElementIdRef,
        setDrawingSelection,
        setElementSelection,
        saveHistorySnapshot,
        refreshUi,
        readOnly: false,
      })
    );

    const fakePointerDown = {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    const fakePointerUp = {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      currentTarget: { releasePointerCapture: vi.fn() },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.handlePointerDown(fakePointerDown);
      result.current.handlePointerUp(fakePointerUp);
    });

    expect(setElementSelection).toHaveBeenCalledWith("player-1");
    expect(setDrawingSelection).toHaveBeenCalledWith(null);
  });

  it("deve mover o elemento quando o ponteiro se desloca e gravar no histórico no PointerUp", () => {
    const el: TacticalElement = { id: "player-1", type: "home", x: 100, y: 100 };
    mockState.framesMap[mockState.activePath[0]].elements.push(el);

    const { result } = renderHook(() =>
      useBoardInteraction({
        canvasRef,
        stateRef,
        selectedDrawingIdxRef,
        selectedElementIdRef,
        setDrawingSelection,
        setElementSelection,
        saveHistorySnapshot,
        refreshUi,
        readOnly: false,
      })
    );

    const fakePointerDown = {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    const fakePointerMove = {
      clientX: 150,
      clientY: 130,
      pointerId: 1,
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    const fakePointerUp = {
      clientX: 150,
      clientY: 130,
      pointerId: 1,
      currentTarget: { releasePointerCapture: vi.fn() },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.handlePointerDown(fakePointerDown);
      result.current.handlePointerMove(fakePointerMove);
      result.current.handlePointerUp(fakePointerUp);
    });

    expect(el.x).toBe(150);
    expect(el.y).toBe(130);
    expect(saveHistorySnapshot).toHaveBeenCalled();
  });
});
