"use client"

import { useRef, useState, useEffect } from "react";
import { TacticalState, TacticalDrawing, Point, TacticalElement, DrawingHandleType } from "@/components/prancheta/types";
import { useTacticalCanvasRenderer } from "./useTacticalCanvasRenderer";
import { INITIAL_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/components/prancheta/constants";

interface TacticalActionsProps {
  initialTacticData?: Partial<TacticalState>;
  onSave?: (data: any) => void;
}

export function useTacticalActions({ initialTacticData, onSave }: TacticalActionsProps) {
  const stateRef = useRef<TacticalState>(initialTacticData ? { ...INITIAL_STATE, ...initialTacticData } : JSON.parse(JSON.stringify(INITIAL_STATE)));
  const canvasRenderer = useTacticalCanvasRenderer(stateRef);

  // Selection & Drag State for Drawings & Elements
  const [selectedDrawingIdx, setSelectedDrawingIdx] = useState<number | null>(null);
  const selectedDrawingIdxRef = useRef<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElementIdRef = useRef<string | null>(null);

  const setDrawingSelection = (idx: number | null) => {
    selectedDrawingIdxRef.current = idx;
    setSelectedDrawingIdx(idx);
  };

  const setElementSelection = (id: string | null) => {
    selectedElementIdRef.current = id;
    setSelectedElementId(id);
  };

  // Clipboard for Ctrl+C / Ctrl+V
  const clipboardRef = useRef<{
    type: "drawing" | "element";
    data: any;
  } | null>(null);

  // Helper functions for bounds and selection
  const getActiveFrameId = () => stateRef.current.activePath[stateRef.current.currentFrameIdx];
  const getActiveFrame = () => stateRef.current.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

  // History management
  const saveStateToHistory = () => {
    const s = stateRef.current;
    const snapshot: any = {
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
  };

  const undo = () => {
    const s = stateRef.current;
    if (s.historyIndex > 0) {
      s.historyIndex--;
      restoreSnapshot(s.history[s.historyIndex]);
    }
  };

  const redo = () => {
    const s = stateRef.current;
    if (s.historyIndex < s.history.length - 1) {
      s.historyIndex++;
      restoreSnapshot(s.history[s.historyIndex]);
    }
  };

  const restoreSnapshot = (snapshot: any) => {
    const s = stateRef.current;
    s.framesMap = JSON.parse(JSON.stringify(snapshot.framesMap));
    s.activePath = JSON.parse(JSON.stringify(snapshot.activePath));
    s.drawings = JSON.parse(JSON.stringify(snapshot.drawings || []));
    s.currentFrameIdx = Math.min(s.currentFrameIdx, s.activePath.length - 1);
    setDrawingSelection(null);
    setElementSelection(null);
  };

  // Keyboard Shortcuts: Delete/Backspace, Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+C (Copy), Ctrl+V (Paste)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Undo: Ctrl+Z (or Cmd+Z on Mac) without Shift
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Shift+Z on Mac)
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) ||
        ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Copy: Ctrl+C (or Cmd+C on Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        const s = stateRef.current;
        const activeDrawing = selectedDrawingIdxRef.current;
        const activeElement = selectedElementIdRef.current;

        if (activeDrawing !== null && s.drawings[activeDrawing]) {
          clipboardRef.current = {
            type: "drawing",
            data: JSON.parse(JSON.stringify(s.drawings[activeDrawing])),
          };
        } else if (activeElement) {
          const elements = getActiveElements();
          const el = elements.find((item) => item.id === activeElement);
          if (el) {
            clipboardRef.current = {
              type: "element",
              data: JSON.parse(JSON.stringify(el)),
            };
          }
        }
        return;
      }

      // Paste: Ctrl+V (or Cmd+V on Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        if (!clipboardRef.current) return;
        const s = stateRef.current;
        e.preventDefault();

        if (clipboardRef.current.type === "drawing") {
          const cloned: TacticalDrawing = JSON.parse(JSON.stringify(clipboardRef.current.data));
          // Offset cloned points slightly by +25px so it doesn't overlap identically
          cloned.points = cloned.points.map((pt) => ({
            x: Math.min(CANVAS_WIDTH - 20, pt.x + 25),
            y: Math.min(CANVAS_HEIGHT - 20, pt.y + 25),
          }));
          s.drawings.push(cloned);
          const newIdx = s.drawings.length - 1;
          setDrawingSelection(newIdx);
          setElementSelection(null);
          saveStateToHistory();
        } else if (clipboardRef.current.type === "element") {
          const base: TacticalElement = JSON.parse(JSON.stringify(clipboardRef.current.data));
          const elements = getActiveElements();

          let newNumber = base.number;
          if (base.type === "home" || base.type === "away") {
            const existingNumbers = elements.filter((el) => el.type === base.type).map((el) => el.number || 0);
            let n = 1;
            while (existingNumbers.includes(n)) n++;
            newNumber = n;
          }

          const clonedElement: TacticalElement = {
            ...base,
            id: (base.type === "home" ? "H" : base.type === "away" ? "A" : base.type === "cone" ? "C" : base.type === "mini_goal" ? "G" : "B") + (Date.now() % 100000),
            number: newNumber,
            x: Math.min(CANVAS_WIDTH - 30, Math.max(30, base.x + 25)),
            y: Math.min(CANVAS_HEIGHT - 30, Math.max(30, base.y + 25)),
          };

          elements.push(clonedElement);
          setDrawingSelection(null);
          setElementSelection(clonedElement.id);
          saveStateToHistory();
        }
        return;
      }

      // Rotate: 'R' key for selected mini_goal or element
      if (e.key === "r" || e.key === "R") {
        const activeElement = selectedElementIdRef.current;
        if (activeElement) {
          const elements = getActiveElements();
          const el = elements.find((item) => item.id === activeElement);
          if (el) {
            el.rotation = ((el.rotation || 0) + Math.PI / 2) % (Math.PI * 2);
            saveStateToHistory();
            return;
          }
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const s = stateRef.current;
        let changed = false;

        // 1. Delete selected drawing
        const activeDrawing = selectedDrawingIdxRef.current;
        if (activeDrawing !== null && s.drawings[activeDrawing]) {
          s.drawings.splice(activeDrawing, 1);
          setDrawingSelection(null);
          changed = true;
        }

        // 2. Delete selected element (player, cone, ball, mini_goal)
        const activeElement = selectedElementIdRef.current;
        if (activeElement) {
          const elements = getActiveElements();
          const idx = elements.findIndex((el) => el.id === activeElement);
          if (idx !== -1) {
            elements.splice(idx, 1);
            setElementSelection(null);
            changed = true;
          }
        }

        if (changed) {
          e.preventDefault();
          saveStateToHistory();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDrawingIdx, selectedElementId]);

  // Pointer events handlers using canvas renderer utilities
  const getCanvasCoords = (e: any) => {
    const canvas = canvasRenderer.canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    return { x, y };
  };

  // ... rest of pointer event handlers would be here, simplified

  return {
    // State
    stateRef,
    selectedDrawingIdx,
    selectedElementId,
    setDrawingSelection,
    setElementSelection,
    
    // Canvas ref for the main component
    canvasRef: canvasRenderer.canvasRef,
    
    // Rendering functions
    drawField: canvasRenderer.drawField,
    drawSingleDrawing: canvasRenderer.drawSingleDrawing,
    getDrawingBounds: canvasRenderer.getDrawingBounds,
    
    // Action functions
    undo,
    redo,
    saveStateToHistory,
    restoreSnapshot,
    clipboardRef,
    
    // Helper functions
    getCanvasCoords,
    getActiveElements,
    setSelectedDrawingIdx,
    setSelectedElementId,
  };
}