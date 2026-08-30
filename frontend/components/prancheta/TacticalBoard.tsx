"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { TacticalState, HistorySnapshot, TacticalElement, TacticalDrawing } from "./types";
import {
  INITIAL_STATE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HOME_TEAM_COLOR,
  AWAY_TEAM_COLOR,
} from "./constants";
import { getDrawingBounds } from "./utils/tacticalGeometry";
import { drawPitch, drawSingleDrawing, drawDrawingSelection, drawElement } from "./utils/canvasDrawers";
import { useBoardKeyboard } from "./hooks/useBoardKeyboard";
import { useBoardInteraction } from "./hooks/useBoardInteraction";
import { TacticalBottomBar } from "./TacticalBottomBar";
import { TacticalSidebar } from "./TacticalSidebar";
import { TacticalEditSidebar } from "./TacticalEditSidebar";
import { Clock, Users, Maximize2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TacticalBoard - Componente principal do quadro tático interativo.
 *
 * Decomposto em arquitetura modular:
 * - `tacticalGeometry`: Funções puras de geometria afim, rotação e colisões
 * - `canvasDrawers`: Renderizadores gráficos dedicados do HTML5 Canvas 2D
 * - `useBoardInteraction`: Gestão de eventos de pointer/touch e distinção Tap vs Drag
 * - `useBoardKeyboard`: Atalhos de teclado (R, Delete, Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V)
 */
export default function TacticalBoard({
  initialTacticData,
  onSave,
  onChange,
  readOnly = false,
  thumbnail = false,
}: {
  initialTacticData?: any;
  onSave?: (data: any) => void;
  onChange?: (data: any) => void;
  readOnly?: boolean;
  thumbnail?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<TacticalState>(
    initialTacticData
      ? { ...INITIAL_STATE, ...initialTacticData }
      : JSON.parse(JSON.stringify(INITIAL_STATE))
  );
  const [uiTick, setUiTick] = useState(0);

  // Estados de Seleção
  const [selectedDrawingIdx, setSelectedDrawingIdx] = useState<number | null>(null);
  const selectedDrawingIdxRef = useRef<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElementIdRef = useRef<string | null>(null);

  const refreshUi = useCallback(() => {
    setUiTick((t) => t + 1);
  }, []);

  const setDrawingSelection = useCallback((idx: number | null) => {
    selectedDrawingIdxRef.current = idx;
    setSelectedDrawingIdx(idx);
  }, []);

  const setElementSelection = useCallback((id: string | null) => {
    selectedElementIdRef.current = id;
    setSelectedElementId(id);
  }, []);

  const getActiveFrameId = () => stateRef.current.activePath[stateRef.current.currentFrameIdx];
  const getActiveFrame = () => stateRef.current.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

  // Sincronizar pitchStyle das props se alterado exteriormente
  useEffect(() => {
    if (initialTacticData?.pitchStyle && initialTacticData.pitchStyle !== stateRef.current.pitchStyle) {
      stateRef.current.pitchStyle = initialTacticData.pitchStyle;
      refreshUi();
    }
  }, [initialTacticData?.pitchStyle, refreshUi]);

  // Gestão de Histórico (Undo / Redo)
  const saveStateToHistory = useCallback(() => {
    const s = stateRef.current;
    const snapshot: HistorySnapshot = {
      framesMap: JSON.parse(JSON.stringify(s.framesMap)),
      activePath: JSON.parse(JSON.stringify(s.activePath)),
      drawings: JSON.parse(JSON.stringify(s.drawings || [])),
    };

    if (s.history.length > 0 && s.historyIndex < s.history.length - 1) {
      s.history = s.history.slice(0, s.historyIndex + 1);
    }
    s.history.push(snapshot);
    if (s.history.length > 50) {
      s.history.shift();
    }
    s.historyIndex = s.history.length - 1;
    refreshUi();

    if (onChange) onChange(s);
  }, [onChange, refreshUi]);

  const restoreSnapshot = useCallback(
    (snapshot: HistorySnapshot) => {
      const s = stateRef.current;
      s.framesMap = JSON.parse(JSON.stringify(snapshot.framesMap));
      s.activePath = JSON.parse(JSON.stringify(snapshot.activePath));
      s.drawings = JSON.parse(JSON.stringify(snapshot.drawings || []));
      s.currentFrameIdx = Math.min(s.currentFrameIdx, s.activePath.length - 1);
      setDrawingSelection(null);
      setElementSelection(null);
      refreshUi();
      if (onChange) onChange(s);
    },
    [onChange, refreshUi, setDrawingSelection, setElementSelection]
  );

  const undo = useCallback(() => {
    const s = stateRef.current;
    if (s.historyIndex > 0) {
      s.historyIndex--;
      restoreSnapshot(s.history[s.historyIndex]);
    }
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    const s = stateRef.current;
    if (s.historyIndex < s.history.length - 1) {
      s.historyIndex++;
      restoreSnapshot(s.history[s.historyIndex]);
    }
  }, [restoreSnapshot]);

  useEffect(() => {
    if (stateRef.current.history.length === 0) {
      saveStateToHistory();
    } else {
      if (onChange) onChange(stateRef.current);
    }
  }, []);

  // Hook de Atalhos de Teclado (Fase 3)
  useBoardKeyboard({
    stateRef,
    selectedDrawingIdxRef,
    selectedElementIdRef,
    setDrawingSelection,
    setElementSelection,
    saveHistorySnapshot: saveStateToHistory,
    undo,
    redo,
    refreshUi,
    readOnly,
  });

  // Hook de Interação e Arraste (Fase 2)
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useBoardInteraction({
    canvasRef,
    stateRef,
    selectedDrawingIdxRef,
    selectedElementIdRef,
    setDrawingSelection,
    setElementSelection,
    saveHistorySnapshot: saveStateToHistory,
    refreshUi,
    readOnly,
  });

  // Handlers para Barra Lateral de Edição Contextual
  const handleUpdateDrawing = (index: number, updated: TacticalDrawing) => {
    const s = stateRef.current;
    if (s.drawings[index]) {
      s.drawings[index] = updated;
      saveStateToHistory();
    }
  };

  const handleDeleteDrawing = (index: number) => {
    const s = stateRef.current;
    if (s.drawings[index]) {
      s.drawings.splice(index, 1);
      setDrawingSelection(null);
      saveStateToHistory();
    }
  };

  const handleDuplicateDrawing = (drawing: TacticalDrawing) => {
    const s = stateRef.current;
    const cloned: TacticalDrawing = JSON.parse(JSON.stringify(drawing));
    cloned.points = cloned.points.map((pt) => ({
      x: Math.min(CANVAS_WIDTH - 20, pt.x + 25),
      y: Math.min(CANVAS_HEIGHT - 20, pt.y + 25),
    }));
    s.drawings.push(cloned);
    const newIdx = s.drawings.length - 1;
    setDrawingSelection(newIdx);
    setElementSelection(null);
    saveStateToHistory();
  };

  const handleUpdateElement = (updated: Partial<TacticalElement>) => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const el = elements.find((item) => item.id === activeId);
    if (el) {
      Object.assign(el, updated);
      saveStateToHistory();
    }
  };

  const handleDeleteElement = () => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const idx = elements.findIndex((item) => item.id === activeId);
    if (idx !== -1) {
      elements.splice(idx, 1);
      setElementSelection(null);
      saveStateToHistory();
    }
  };

  const handleDuplicateElement = () => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const base = elements.find((item) => item.id === activeId);
    if (!base) return;

    let newNumber = base.number;
    if (base.type === "home" || base.type === "away") {
      const existingNumbers = elements
        .filter((el) => el.type === base.type)
        .map((el) => el.number || 0);
      let n = 1;
      while (existingNumbers.includes(n)) n++;
      newNumber = n;
    }

    const cloned: TacticalElement = {
      ...base,
      id:
        (base.type === "home"
          ? "H"
          : base.type === "away"
          ? "A"
          : base.type === "cone"
          ? "C"
          : base.type === "mini_goal"
          ? "G"
          : "B") + (Date.now() % 100000),
      number: newNumber,
      x: Math.min(CANVAS_WIDTH - 30, Math.max(30, base.x + 25)),
      y: Math.min(CANVAS_HEIGHT - 30, Math.max(30, base.y + 25)),
    };

    elements.push(cloned);
    setDrawingSelection(null);
    setElementSelection(cloned.id);
    saveStateToHistory();
  };

  const handleRotateElement = (newAngle: number) => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const el = elements.find((item) => item.id === activeId);
    if (el) {
      el.rotation = newAngle;
      saveStateToHistory();
    }
  };

  // Motor de Renderização Gráfica do HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const renderLoop = () => {
      const s = stateRef.current;

      // 1. Relvado
      drawPitch(ctx, s.pitchStyle);

      // 2. Desenhos guardados
      s.drawings.forEach((d) => drawSingleDrawing(ctx, d));

      // 3. Seleção do desenho ativo
      const activeDrawingIdx = selectedDrawingIdxRef.current;
      if (activeDrawingIdx !== null && s.drawingMode === "select" && s.drawings[activeDrawingIdx]) {
        const selDrawing = s.drawings[activeDrawingIdx];
        const bounds = getDrawingBounds(selDrawing);
        if (bounds) {
          drawDrawingSelection(ctx, selDrawing, bounds);
        }
      }

      // 4. Desenho dinâmico em curso
      if (s.isDrawing && s.currentDrawingPoints.length >= 2) {
        drawSingleDrawing(ctx, {
          type: s.drawingMode,
          points: s.currentDrawingPoints,
          config: s.drawingConfig,
        });
      }

      // 5. Elementos (jogadores, cones, bolas, balizas)
      const currentId = s.activePath[s.currentFrameIdx];
      const elementsToRender = s.framesMap[currentId]?.elements || [];

      elementsToRender.forEach((el) => {
        const isSelected = selectedElementIdRef.current === el.id;
        drawElement(ctx, el, isSelected);
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const setState: React.Dispatch<React.SetStateAction<TacticalState>> = useCallback(
    (action) => {
      if (typeof action === "function") {
        stateRef.current = action(stateRef.current);
      } else {
        stateRef.current = action;
      }
      refreshUi();
      if (onChange) onChange(stateRef.current);
    },
    [onChange, refreshUi]
  );

  const s = stateRef.current;

  // Vista de miniatura estática
  if (thumbnail) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#1b4332]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 bg-[#0a0f1c] text-slate-300 font-sans flex gap-2.5 p-2 md:p-3 rounded-xl border border-slate-800 shadow-2xl">
      {/* Left Edit Sidebar for Selected Item */}
      {!readOnly && (selectedDrawingIdx !== null || selectedElementId !== null) && (
        <TacticalEditSidebar
          selectedDrawing={selectedDrawingIdx !== null ? s.drawings[selectedDrawingIdx] || null : null}
          selectedDrawingIdx={selectedDrawingIdx}
          selectedElement={
            selectedElementId !== null
              ? getActiveElements().find((el) => el.id === selectedElementId) || null
              : null
          }
          onUpdateDrawing={handleUpdateDrawing}
          onDeleteDrawing={handleDeleteDrawing}
          onDuplicateDrawing={handleDuplicateDrawing}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onRotateElement={handleRotateElement}
          onClose={() => {
            setDrawingSelection(null);
            setElementSelection(null);
            refreshUi();
          }}
        />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2 relative">
        <div className="flex-1 relative flex items-center justify-center min-h-0 w-full rounded-xl overflow-hidden border border-slate-800/80 bg-[#0d1527]">
          {/* Header Metadata Chips */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 shadow-lg text-xs font-semibold text-slate-200">
              <LayoutDashboard className="size-3.5 text-cyan-400" />
              <span>{(s as any).meta?.name || s.objetivoEspecifico || "Exercício Tático"}</span>
            </div>
            {((s as any).meta?.duration || s.tempo) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 shadow-lg text-xs font-medium text-amber-300">
                <Clock className="size-3.5" />
                <span>{(s as any).meta?.duration || s.tempo} min</span>
              </div>
            )}
            {((s as any).meta?.playersCount || s.numeroJogadores) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 shadow-lg text-xs font-medium text-emerald-300">
                <Users className="size-3.5" />
                <span>{(s as any).meta?.playersCount || s.numeroJogadores} atletas</span>
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={cn(
              "w-full h-full max-h-full object-contain touch-none select-none",
              readOnly ? "cursor-default" : s.drawingMode === "select" ? "cursor-default" : "cursor-crosshair"
            )}
          />
        </div>

        {/* Floating Bottom Control Bar */}
        {!readOnly && (
          <div className="shrink-0">
            <TacticalBottomBar
              state={s}
              setState={setState}
              uiTick={uiTick}
              setUiTick={setUiTick}
              onSaveHistory={saveStateToHistory}
            />
          </div>
        )}
      </div>

      {/* Right Metadata & History Sidebar */}
      {!readOnly && (
        <TacticalSidebar
          state={s}
          setState={setState}
          uiTick={uiTick}
          setUiTick={setUiTick}
          onSave={() => {
            if (onSave) onSave(s);
          }}
        />
      )}
    </div>
  );
}
