"use client";

import { useEffect, useRef } from "react";
import { TacticalState, TacticalDrawing, TacticalElement } from "../types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";

interface UseBoardKeyboardProps {
  stateRef: React.MutableRefObject<TacticalState>;
  selectedDrawingIdxRef: React.MutableRefObject<number | null>;
  selectedElementIdRef: React.MutableRefObject<string | null>;
  setDrawingSelection: (idx: number | null) => void;
  setElementSelection: (id: string | null) => void;
  saveHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
  refreshUi: () => void;
  readOnly?: boolean;
}

export function useBoardKeyboard({
  stateRef,
  selectedDrawingIdxRef,
  selectedElementIdRef,
  setDrawingSelection,
  setElementSelection,
  saveHistorySnapshot,
  undo,
  redo,
  refreshUi,
  readOnly = false,
}: UseBoardKeyboardProps) {
  const clipboardRef = useRef<{
    type: "drawing" | "element";
    data: any;
  } | null>(null);

  const getActiveElements = () => {
    const s = stateRef.current;
    const activeFrameId = s.activePath[s.currentFrameIdx];
    return s.framesMap[activeFrameId]?.elements || [];
  };

  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl+Z (ou Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y ou Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z"))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Copiar: Ctrl+C (ou Cmd+C)
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

      // Colar / Duplicar: Ctrl+V (ou Cmd+V)
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        if (!clipboardRef.current) return;
        const s = stateRef.current;
        e.preventDefault();

        if (clipboardRef.current.type === "drawing") {
          const cloned: TacticalDrawing = JSON.parse(JSON.stringify(clipboardRef.current.data));
          cloned.points = cloned.points.map((pt) => ({
            x: Math.min(CANVAS_WIDTH - 20, pt.x + 25),
            y: Math.min(CANVAS_HEIGHT - 20, pt.y + 25),
          }));
          s.drawings.push(cloned);
          const newIdx = s.drawings.length - 1;
          setDrawingSelection(newIdx);
          setElementSelection(null);
          saveHistorySnapshot();
          refreshUi();
        } else if (clipboardRef.current.type === "element") {
          const base: TacticalElement = JSON.parse(JSON.stringify(clipboardRef.current.data));
          const elements = getActiveElements();

          let newNumber = base.number;
          if (base.type === "home" || base.type === "away") {
            const existingNumbers = elements
              .filter((el) => el.type === base.type)
              .map((el) => el.number || 0);
            let n = 1;
            while (existingNumbers.includes(n)) n++;
            newNumber = n;
          }

          const clonedElement: TacticalElement = {
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

          elements.push(clonedElement);
          setDrawingSelection(null);
          setElementSelection(clonedElement.id);
          saveHistorySnapshot();
          refreshUi();
        }
        return;
      }

      // Rotação: Tecla 'R'
      if (e.key === "r" || e.key === "R") {
        const activeElement = selectedElementIdRef.current;
        if (activeElement) {
          const elements = getActiveElements();
          const el = elements.find((item) => item.id === activeElement);
          if (el) {
            el.rotation = ((el.rotation || 0) + Math.PI / 2) % (Math.PI * 2);
            saveHistorySnapshot();
            refreshUi();
            return;
          }
        }
      }

      // Eliminar: Delete ou Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        const s = stateRef.current;
        let changed = false;

        const activeDrawing = selectedDrawingIdxRef.current;
        if (activeDrawing !== null && s.drawings[activeDrawing]) {
          s.drawings.splice(activeDrawing, 1);
          setDrawingSelection(null);
          changed = true;
        }

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
          saveHistorySnapshot();
          refreshUi();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readOnly, undo, redo, saveHistorySnapshot, refreshUi, setDrawingSelection, setElementSelection]);

  return {
    clipboardRef,
  };
}
