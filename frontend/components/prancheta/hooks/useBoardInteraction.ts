"use client";

import React, { useRef } from "react";
import { TacticalState, TacticalElement, TacticalDrawing, Point } from "../types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";
import {
  DrawingHandleType,
  getDrawingBounds,
  getHoveredDrawingHandle,
  getHoveredElementHandle,
  findHoveredElement,
  findHoveredDrawing,
  rotatePoint,
} from "../utils/tacticalGeometry";

interface UseBoardInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stateRef: React.MutableRefObject<TacticalState>;
  selectedDrawingIdxRef: React.MutableRefObject<number | null>;
  selectedElementIdRef: React.MutableRefObject<string | null>;
  setDrawingSelection: (idx: number | null) => void;
  setElementSelection: (id: string | null) => void;
  saveHistorySnapshot: () => void;
  refreshUi: () => void;
  readOnly?: boolean;
}

export function useBoardInteraction({
  canvasRef,
  stateRef,
  selectedDrawingIdxRef,
  selectedElementIdRef,
  setDrawingSelection,
  setElementSelection,
  saveHistorySnapshot,
  refreshUi,
  readOnly = false,
}: UseBoardInteractionProps) {
  const drawingDragRef = useRef<{
    active: boolean;
    mode: "move" | DrawingHandleType | "rotate_element";
    drawingIndex: number;
    startCoords: Point;
    initialPoints: Point[];
  } | null>(null);

  const pointerInteractionRef = useRef<{
    downCoords: Point;
    hasMoved: boolean;
    targetElementType: "element" | "drawing" | "handle" | "canvas" | null;
    targetId: string | null;
    targetDrawingIdx: number | null;
  } | null>(null);

  const getActiveElements = () => {
    const s = stateRef.current;
    const activeFrameId = s.activePath[s.currentFrameIdx];
    return s.framesMap[activeFrameId]?.elements || [];
  };

  const getCanvasCoords = (
    e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const coords = getCanvasCoords(e);
    const s = stateRef.current;

    // 0. Handle de rotação de mini_goal
    const activeElementId = selectedElementIdRef.current;
    if (activeElementId) {
      const activeEl = getActiveElements().find((el) => el.id === activeElementId);
      const handle = getHoveredElementHandle(coords, activeEl || null);
      if (handle && activeEl) {
        pointerInteractionRef.current = {
          downCoords: coords,
          hasMoved: false,
          targetElementType: "handle",
          targetId: null,
          targetDrawingIdx: null,
        };
        drawingDragRef.current = {
          active: true,
          mode: "rotate_element",
          drawingIndex: -1,
          startCoords: coords,
          initialPoints: [{ x: activeEl.x, y: activeEl.y }],
        };
        return;
      }
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    if (s.drawingMode !== "select") {
      s.isDrawing = true;
      s.currentDrawingPoints = [coords];
      setDrawingSelection(null);
      setElementSelection(null);
      return;
    }

    // Modo Seleção
    // 1. Elementos (jogadores, cones, bolas, balizas)
    const currentFrameElements = getActiveElements();
    const hoveredEl = findHoveredElement(coords, currentFrameElements);
    if (hoveredEl) {
      s.selectedElement = hoveredEl;
      s.dragOffset.x = coords.x - hoveredEl.x;
      s.dragOffset.y = coords.y - hoveredEl.y;
      s.originalDragPos = { x: hoveredEl.x, y: hoveredEl.y };

      const idx = currentFrameElements.indexOf(hoveredEl);
      if (idx !== -1) {
        currentFrameElements.splice(idx, 1);
        currentFrameElements.push(hoveredEl);
      }

      pointerInteractionRef.current = {
        downCoords: coords,
        hasMoved: false,
        targetElementType: "element",
        targetId: hoveredEl.id,
        targetDrawingIdx: null,
      };
      return;
    }

    // 2. Handles do desenho selecionado
    const activeDrawingIdx = selectedDrawingIdxRef.current;
    if (activeDrawingIdx !== null && s.drawings[activeDrawingIdx]) {
      const bounds = getDrawingBounds(s.drawings[activeDrawingIdx]);
      const handleType = getHoveredDrawingHandle(coords, bounds);
      if (handleType) {
        pointerInteractionRef.current = {
          downCoords: coords,
          hasMoved: false,
          targetElementType: "handle",
          targetId: null,
          targetDrawingIdx: null,
        };
        drawingDragRef.current = {
          active: true,
          mode: handleType,
          drawingIndex: activeDrawingIdx,
          startCoords: coords,
          initialPoints: JSON.parse(JSON.stringify(s.drawings[activeDrawingIdx].points)),
        };
        return;
      }
    }

    // 3. Desenhos sob o cursor
    const hitDrawingIdx = findHoveredDrawing(coords, s.drawings);
    if (hitDrawingIdx !== null) {
      pointerInteractionRef.current = {
        downCoords: coords,
        hasMoved: false,
        targetElementType: "drawing",
        targetId: null,
        targetDrawingIdx: hitDrawingIdx,
      };
      drawingDragRef.current = {
        active: true,
        mode: "move",
        drawingIndex: hitDrawingIdx,
        startCoords: coords,
        initialPoints: JSON.parse(JSON.stringify(s.drawings[hitDrawingIdx].points)),
      };
      return;
    }

    // 4. Clique no vazio do campo
    pointerInteractionRef.current = {
      downCoords: coords,
      hasMoved: false,
      targetElementType: "canvas",
      targetId: null,
      targetDrawingIdx: null,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const coords = getCanvasCoords(e);
    const s = stateRef.current;

    // Registo de deslocamento
    if (pointerInteractionRef.current) {
      const distFromStart = Math.hypot(
        coords.x - pointerInteractionRef.current.downCoords.x,
        coords.y - pointerInteractionRef.current.downCoords.y
      );
      if (distFromStart > 4) {
        pointerInteractionRef.current.hasMoved = true;
      }
    }

    // A. Desenho livre em curso
    if (s.isDrawing) {
      if (s.drawingMode === "pen") {
        s.currentDrawingPoints.push(coords);
      } else {
        if (s.currentDrawingPoints.length > 1) {
          s.currentDrawingPoints[1] = coords;
        } else {
          s.currentDrawingPoints.push(coords);
        }
      }
      return;
    }

    // B. Arrastamento de elemento
    if (s.selectedElement) {
      const newX = Math.max(10, Math.min(CANVAS_WIDTH - 10, coords.x - s.dragOffset.x));
      const newY = Math.max(10, Math.min(CANVAS_HEIGHT - 10, coords.y - s.dragOffset.y));
      s.selectedElement.x = newX;
      s.selectedElement.y = newY;
      return;
    }

    // C. Manipulação de Desenho (Mover, Redimensionar, Rodar)
    if (drawingDragRef.current && drawingDragRef.current.active) {
      const { mode, drawingIndex, startCoords, initialPoints } = drawingDragRef.current;

      if (mode === "rotate_element") {
        const activeElementId = selectedElementIdRef.current;
        if (activeElementId) {
          const activeEl = getActiveElements().find((el) => el.id === activeElementId);
          if (activeEl) {
            const pointerAngle = Math.atan2(coords.y - activeEl.y, coords.x - activeEl.x);
            activeEl.rotation = pointerAngle + Math.PI / 2;
          }
        }
        return;
      }

      const d = s.drawings[drawingIndex];
      if (!d) return;

      const dx = coords.x - startCoords.x;
      const dy = coords.y - startCoords.y;

      if (mode === "move") {
        d.points = initialPoints.map((pt) => ({
          x: Math.max(10, Math.min(CANVAS_WIDTH - 10, pt.x + dx)),
          y: Math.max(10, Math.min(CANVAS_HEIGHT - 10, pt.y + dy)),
        }));
      } else if (mode === "p0") {
        d.points[0] = { ...coords };
      } else if (mode === "p1") {
        d.points[d.points.length - 1] = { ...coords };
      } else if (mode === "radius") {
        const center = d.points[0];
        let localCoords = coords;
        if (d.rotation) {
          localCoords = rotatePoint(coords, center, -d.rotation);
        }
        const newRadius = Math.hypot(localCoords.x - center.x, localCoords.y - center.y);
        d.points[1] = { x: center.x + newRadius, y: center.y };
      } else if (mode === "tl" || mode === "tr" || mode === "bl" || mode === "br") {
        const minX = Math.min(initialPoints[0].x, initialPoints[initialPoints.length - 1].x);
        const maxX = Math.max(initialPoints[0].x, initialPoints[initialPoints.length - 1].x);
        const minY = Math.min(initialPoints[0].y, initialPoints[initialPoints.length - 1].y);
        const maxY = Math.max(initialPoints[0].y, initialPoints[initialPoints.length - 1].y);

        let newMinX = minX,
          newMaxX = maxX,
          newMinY = minY,
          newMaxY = maxY;
        if (mode === "tl") {
          newMinX = coords.x;
          newMinY = coords.y;
        } else if (mode === "tr") {
          newMaxX = coords.x;
          newMinY = coords.y;
        } else if (mode === "bl") {
          newMinX = coords.x;
          newMaxY = coords.y;
        } else if (mode === "br") {
          newMaxX = coords.x;
          newMaxY = coords.y;
        }

        d.points = [
          { x: newMinX, y: newMinY },
          { x: newMaxX, y: newMaxY },
        ];
      } else if (mode === "rotate_shape") {
        const p0 = initialPoints[0];
        const p1 = initialPoints[initialPoints.length - 1];
        const cx = (p0.x + p1.x) / 2;
        const cy = (p0.y + p1.y) / 2;
        const pointerAngle = Math.atan2(coords.y - cy, coords.x - cx);
        d.rotation = pointerAngle + Math.PI / 2;
      } else if (mode === "rotate_line") {
        const p0 = initialPoints[0];
        const p1 = initialPoints[initialPoints.length - 1];
        const cx = (p0.x + p1.x) / 2;
        const cy = (p0.y + p1.y) / 2;
        const length = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const pointerAngle = Math.atan2(coords.y - cy, coords.x - cx);
        const lineAngle = pointerAngle + Math.PI / 2;
        const lineDx = (length / 2) * Math.cos(lineAngle);
        const lineDy = (length / 2) * Math.sin(lineAngle);
        d.points = [
          { x: cx - lineDx, y: cy - lineDy },
          { x: cx + lineDx, y: cy + lineDy },
        ];
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const s = stateRef.current;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Finalizar desenho novo
    if (s.isDrawing) {
      s.isDrawing = false;
      if (s.currentDrawingPoints.length >= 2) {
        const newDrawing: TacticalDrawing = {
          id: "draw_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          type: s.drawingMode,
          points: [...s.currentDrawingPoints],
          config: { ...s.drawingConfig },
        };
        s.drawings.push(newDrawing);
        saveHistorySnapshot();
        setDrawingSelection(s.drawings.length - 1);
        setElementSelection(null);
      }
      s.currentDrawingPoints = [];
      refreshUi();
      return;
    }

    // Clique estático vs Arrastamento
    const interaction = pointerInteractionRef.current;
    if (interaction && !interaction.hasMoved) {
      if (interaction.targetElementType === "element" && interaction.targetId) {
        setElementSelection(interaction.targetId);
        setDrawingSelection(null);
      } else if (
        interaction.targetElementType === "drawing" &&
        interaction.targetDrawingIdx !== null
      ) {
        setDrawingSelection(interaction.targetDrawingIdx);
        setElementSelection(null);
      } else if (interaction.targetElementType === "canvas") {
        setDrawingSelection(null);
        setElementSelection(null);
      }
    } else if (interaction?.hasMoved) {
      saveHistorySnapshot();
    }

    s.selectedElement = null;
    drawingDragRef.current = null;
    pointerInteractionRef.current = null;
    refreshUi();
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    drawingDragRef,
  };
}
