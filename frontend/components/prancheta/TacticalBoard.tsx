"use client";

import React, { useEffect, useRef, useState } from "react";
import { TacticalState, FrameNode, HistorySnapshot, TacticalElement, TacticalDrawing, Point } from "./types";
import { INITIAL_STATE, CANVAS_WIDTH, CANVAS_HEIGHT, FIELD_BG, HOME_TEAM_COLOR, AWAY_TEAM_COLOR } from "./constants";
import { DrawingHandleType, DrawingBounds, getDrawingBounds } from "./utils/tacticalGeometry";
import { TacticalBottomBar } from "./TacticalBottomBar";
import { TacticalSidebar } from "./TacticalSidebar";
import { TacticalEditSidebar } from "./TacticalEditSidebar";
import { Clock, Users, Maximize2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TacticalBoard - Componente principal do quadro tático interativo.
 * 
 * Este componente orquestra a renderização de um canvas 2D para desenho tático de futebol,
 * permitindo arrastar jogadores, desenhar formas (linhas, passes, círculos), seleção, rotação,
 * redimensionamento e gestão de histórico (Undo/Redo). É o "motor" por trás da Prancheta Tática.
 * 
 * Responsabilidades:
 * - Renderização do campo de jogo e elementos (jogadores, balizas, bola, formas táticas)
 * - Gestão de estado de seleção, arrastamento e redimensionamento
 * - Integração com barras flutuantes laterais e inferiores
 * - Histórico de estados para Undo/Redo
 * - Atalhos de teclado (R: rotar, Delete/Backspace: apagar, Ctrl+C/V: copiar/colar)
 * 
 * Props:
 * - initialTacticData: Dados iniciais da tática (opcional), vindo da Base de Dados ou estado guardado
 * - onSave: Callback invocado quando o utilizador guarda a tática (ex: ao criar um novo exercício)
 * - readOnly: Se verdadeiro, o canvas fica em modo apenas de visualização (sem interação)
 * - thumbnail: Se verdadeiro, o componente renderiza numa vista de miniatura (usado no catálogo de exercícios)
 * 
 * Dependências de UI (components):
 * - TacticalBoardThumbnail: Versão estática/miniatura
 * - TacticalBottomBar: Controles de modo, ferramentas e ação
 * - TacticalSidebar: Metadados do exercício, histórico e operações de persistência
 * - TacticalEditSidebar: Barra lateral de edição contextual de linhas, formas, jogadores e balizas
 */
export default function TacticalBoard({ 
  initialTacticData, 
  onSave, 
  onChange,
  readOnly = false, 
  thumbnail = false 
}: { 
  initialTacticData?: any, 
  onSave?: (data: any) => void, 
  onChange?: (data: any) => void,
  readOnly?: boolean, 
  thumbnail?: boolean 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<TacticalState>(initialTacticData ? { ...INITIAL_STATE, ...initialTacticData } : JSON.parse(JSON.stringify(INITIAL_STATE)));
  const [uiTick, setUiTick] = useState(0);

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

  const drawingDragRef = useRef<{
    active: boolean;
    mode: "move" | DrawingHandleType;
    drawingIndex: number;
    startCoords: Point;
    initialPoints: Point[];
  } | null>(null);

  // Clipboard for Ctrl+C / Ctrl+V
  const clipboardRef = useRef<{
    type: "drawing" | "element";
    data: any;
  } | null>(null);

  // Interaction tracking for distinguishing Drag (Move) vs Tap/Click (Edit Sidebar)
  const pointerInteractionRef = useRef<{
    downCoords: Point;
    hasMoved: boolean;
    targetElementType: "element" | "drawing" | "handle" | "canvas" | null;
    targetId: string | null;
    targetDrawingIdx: number | null;
  } | null>(null);

  const getActiveFrameId = () => stateRef.current.activePath[stateRef.current.currentFrameIdx];
  const getActiveFrame = () => stateRef.current.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

  // Sync pitchStyle from props if updated by parent
  useEffect(() => {
    if (initialTacticData?.pitchStyle && initialTacticData.pitchStyle !== stateRef.current.pitchStyle) {
      stateRef.current.pitchStyle = initialTacticData.pitchStyle;
      setUiTick((t) => t + 1);
    }
  }, [initialTacticData?.pitchStyle]);

  const saveStateToHistory = () => {
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
    setUiTick((t) => t + 1); 

    // Notificar pai da mudança de estado em tempo real
    if (onChange) onChange(s);
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

  const restoreSnapshot = (snapshot: HistorySnapshot) => {
    const s = stateRef.current;
    s.framesMap = JSON.parse(JSON.stringify(snapshot.framesMap));
    s.activePath = JSON.parse(JSON.stringify(snapshot.activePath));
    s.drawings = JSON.parse(JSON.stringify(snapshot.drawings || []));
    s.currentFrameIdx = Math.min(s.currentFrameIdx, s.activePath.length - 1);
    setDrawingSelection(null);
    setElementSelection(null);
    setUiTick((t) => t + 1);
    if (onChange) onChange(s);
  };

  useEffect(() => {
    if (stateRef.current.history.length === 0) {
      saveStateToHistory();
    } else {
      if (onChange) onChange(stateRef.current);
    }
  }, []);

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
            setUiTick((t) => t + 1);
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

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const s = stateRef.current;
    const coords = getCanvasCoords(e);
    if (s.isPlaying || !s.isEditMode) return;

    // 0. Check if clicking on Element rotation handle
    const activeElementId = selectedElementIdRef.current;
    if (activeElementId) {
      const activeEl = getActiveElements().find(el => el.id === activeElementId);
      if (activeEl && activeEl.type === "mini_goal") {
        const selectRadius = (activeEl.goalSize === "fut11" ? 48 : activeEl.goalSize === "fut7" ? 36 : 26);
        let handleLocal = { x: activeEl.x, y: activeEl.y - selectRadius - 16 };
        
        let localCoords = { ...coords };
        if (activeEl.rotation) {
          const dx = coords.x - activeEl.x;
          const dy = coords.y - activeEl.y;
          const cos = Math.cos(-activeEl.rotation);
          const sin = Math.sin(-activeEl.rotation);
          localCoords.x = activeEl.x + dx * cos - dy * sin;
          localCoords.y = activeEl.y + dx * sin + dy * cos;
        }

        if (Math.hypot(localCoords.x - handleLocal.x, localCoords.y - handleLocal.y) <= 24) {
          pointerInteractionRef.current = {
            downCoords: coords,
            hasMoved: false,
            targetElementType: "handle",
            targetId: null,
            targetDrawingIdx: null,
          };
          drawingDragRef.current = {
            active: true,
            mode: "rotate_element" as DrawingHandleType,
            drawingIndex: -1,
            startCoords: coords,
            initialPoints: [{ x: activeEl.x, y: activeEl.y }]
          };
          return;
        }
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

    // Mode: "select"
    // 1. Check if clicking on an Element (Player, Cone, Ball, Mini Goal)
    const currentFrameElements = getActiveElements();
    for (let i = currentFrameElements.length - 1; i >= 0; i--) {
      const el = currentFrameElements[i];
      const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
      const radius = el.type === "ball" ? 12 : el.type === "cone" ? 14 : el.type === "mini_goal" ? (el.goalSize === "fut11" ? 44 : el.goalSize === "fut7" ? 32 : 22) : (el.size === "lg" ? 20 : el.size === "md" ? 16 : 13);

      if (dist <= radius) {
        s.selectedElement = el;
        s.dragOffset.x = coords.x - el.x;
        s.dragOffset.y = coords.y - el.y;
        s.originalDragPos = { x: el.x, y: el.y };
        currentFrameElements.splice(i, 1);
        currentFrameElements.push(el);
        
        pointerInteractionRef.current = {
          downCoords: coords,
          hasMoved: false,
          targetElementType: "element",
          targetId: el.id,
          targetDrawingIdx: null,
        };
        return;
      }
    }

    // 2. Check if clicking on a Handle of the currently selected drawing
    const activeDrawing = selectedDrawingIdxRef.current;
    if (activeDrawing !== null && s.drawings[activeDrawing]) {
      const bounds = getDrawingBounds(s.drawings[activeDrawing]);
      if (bounds) {
        let localCoords = { ...coords };
        if (bounds.cx !== undefined && bounds.cy !== undefined && bounds.rotation) {
          const dx = coords.x - bounds.cx;
          const dy = coords.y - bounds.cy;
          const cos = Math.cos(-bounds.rotation);
          const sin = Math.sin(-bounds.rotation);
          localCoords.x = bounds.cx + dx * cos - dy * sin;
          localCoords.y = bounds.cy + dx * sin + dy * cos;
        }

        for (const h of bounds.handles) {
          if (Math.hypot(localCoords.x - h.x, localCoords.y - h.y) <= 24) {
            pointerInteractionRef.current = {
              downCoords: coords,
              hasMoved: false,
              targetElementType: "handle",
              targetId: null,
              targetDrawingIdx: null,
            };
            drawingDragRef.current = {
              active: true,
              mode: h.type,
              drawingIndex: activeDrawing,
              startCoords: coords,
              initialPoints: JSON.parse(JSON.stringify(s.drawings[activeDrawing].points)),
            };
            return;
          }
        }
      }
    }

    // 3. Check if clicking inside/near any Drawing (topmost first) to select & move
    for (let i = s.drawings.length - 1; i >= 0; i--) {
      const d = s.drawings[i];
      if (!d.points || d.points.length < 2) continue;
      const p0 = d.points[0];
      const pLast = d.points[d.points.length - 1];

      let isHit = false;
      let shapeCoords = { ...coords };
      if (d.rotation && (d.type === "rect" || d.type === "circle" || d.type === "triangle" || d.type === "pentagon" || d.type === "hexagon")) {
        const b = getDrawingBounds(d);
        if (b && b.cx !== undefined && b.cy !== undefined) {
          const dx = coords.x - b.cx;
          const dy = coords.y - b.cy;
          const cos = Math.cos(-d.rotation);
          const sin = Math.sin(-d.rotation);
          shapeCoords.x = b.cx + dx * cos - dy * sin;
          shapeCoords.y = b.cy + dx * sin + dy * cos;
        }
      }

      if (d.type === "rect" || d.type === "triangle" || d.type === "pentagon" || d.type === "hexagon") {
        const minX = Math.min(p0.x, pLast.x);
        const maxX = Math.max(p0.x, pLast.x);
        const minY = Math.min(p0.y, pLast.y);
        const maxY = Math.max(p0.y, pLast.y);
        
        const isInside = shapeCoords.x >= minX && shapeCoords.x <= maxX && shapeCoords.y >= minY && shapeCoords.y <= maxY;
        const isNearBorder = shapeCoords.x >= minX - 8 && shapeCoords.x <= maxX + 8 && shapeCoords.y >= minY - 8 && shapeCoords.y <= maxY + 8;
        
        if (isInside || isNearBorder) {
          isHit = true;
        }
      } else if (d.type === "circle") {
        const radius = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);
        const dist = Math.hypot(shapeCoords.x - p0.x, shapeCoords.y - p0.y);
        if (dist <= radius + 8) {
          isHit = true;
        }
      } else {
        // Lines and pen
        for (let j = 0; j < d.points.length - 1; j++) {
          const ptA = d.points[j];
          const ptB = d.points[j + 1];
          const l2 = (ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2;
          if (l2 === 0) continue;
          const t = Math.max(0, Math.min(1, ((coords.x - ptA.x) * (ptB.x - ptA.x) + (coords.y - ptA.y) * (ptB.y - ptA.y)) / l2));
          const projX = ptA.x + t * (ptB.x - ptA.x);
          const projY = ptA.y + t * (ptB.y - ptA.y);
          if (Math.hypot(coords.x - projX, coords.y - projY) <= 12) {
            isHit = true;
            break;
          }
        }
      }

      if (isHit) {
        pointerInteractionRef.current = {
          downCoords: coords,
          hasMoved: false,
          targetElementType: "drawing",
          targetId: null,
          targetDrawingIdx: i,
        };
        drawingDragRef.current = {
          active: true,
          mode: "move",
          drawingIndex: i,
          startCoords: coords,
          initialPoints: JSON.parse(JSON.stringify(d.points)),
        };
        return;
      }
    }

    // 4. Clicked on empty canvas in select mode
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

    if (pointerInteractionRef.current) {
      const dist = Math.hypot(
        coords.x - pointerInteractionRef.current.downCoords.x,
        coords.y - pointerInteractionRef.current.downCoords.y
      );
      if (dist > 4) {
        pointerInteractionRef.current.hasMoved = true;
      }
    }

    if (s.isDrawing) {
      s.currentDrawingPoints.push(coords);
    }

    if (s.selectedElement) {
      s.selectedElement.x = coords.x - s.dragOffset.x;
      s.selectedElement.y = coords.y - s.dragOffset.y;
    }

    if (drawingDragRef.current && drawingDragRef.current.active) {
      const { mode, drawingIndex, startCoords, initialPoints } = drawingDragRef.current;
      const d = s.drawings[drawingIndex];
      if (!d) return;

      const dx = coords.x - startCoords.x;
      const dy = coords.y - startCoords.y;

      if (mode === "move") {
        d.points = initialPoints.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
      } else if (mode === "radius") {
        d.points[1] = coords;
      } else if (mode === "p0") {
        // Line ends (support lines with more than 2 initial points by squashing to 2)
        d.points = [coords, initialPoints[initialPoints.length - 1]];
      } else if (mode === "p1") {
        d.points = [initialPoints[0], coords];
      } else if (mode === "tl" || mode === "tr" || mode === "bl" || mode === "br") {
        let localCoords = { ...coords };
        if (d.rotation) {
          let cx = 0, cy = 0;
          if (d.type === "circle") {
             cx = initialPoints[0].x; cy = initialPoints[0].y;
          } else {
             cx = (initialPoints[0].x + initialPoints[initialPoints.length - 1].x) / 2;
             cy = (initialPoints[0].y + initialPoints[initialPoints.length - 1].y) / 2;
          }
          const drx = coords.x - cx;
          const dry = coords.y - cy;
          const cos = Math.cos(-d.rotation);
          const sin = Math.sin(-d.rotation);
          localCoords.x = cx + drx * cos - dy * sin;
          localCoords.y = cy + drx * sin + dy * cos;
        }

        if (d.type === "circle") {
          const center = initialPoints[0];
          const newRadius = Math.hypot(localCoords.x - center.x, localCoords.y - center.y);
          d.points[1] = { x: center.x + newRadius, y: center.y };
        } else if (d.type === "rect" || d.type === "triangle" || d.type === "pentagon" || d.type === "hexagon") {
          const p0 = initialPoints[0];
          const p1 = initialPoints[initialPoints.length - 1];
          const minX = Math.min(p0.x, p1.x);
          const maxX = Math.max(p0.x, p1.x);
          const minY = Math.min(p0.y, p1.y);
          const maxY = Math.max(p0.y, p1.y);

          if (mode === "tl") {
            d.points = [{ x: localCoords.x, y: localCoords.y }, { x: maxX, y: maxY }];
          } else if (mode === "tr") {
            d.points = [{ x: minX, y: localCoords.y }, { x: localCoords.x, y: maxY }];
          } else if (mode === "bl") {
            d.points = [{ x: localCoords.x, y: minY }, { x: maxX, y: localCoords.y }];
          } else if (mode === "br") {
            d.points = [{ x: minX, y: minY }, { x: localCoords.x, y: localCoords.y }];
          }
        }
      } else if (mode === "rotate_shape") {
        let cx = 0, cy = 0;
        if (d.type === "circle") {
          cx = initialPoints[0].x;
          cy = initialPoints[0].y;
        } else {
          const minX = Math.min(initialPoints[0].x, initialPoints[initialPoints.length - 1].x);
          const maxX = Math.max(initialPoints[0].x, initialPoints[initialPoints.length - 1].x);
          const minY = Math.min(initialPoints[0].y, initialPoints[initialPoints.length - 1].y);
          const maxY = Math.max(initialPoints[0].y, initialPoints[initialPoints.length - 1].y);
          cx = (minX + maxX) / 2;
          cy = (minY + maxY) / 2;
        }
        const pointerAngle = Math.atan2(coords.y - cy, coords.x - cx);
        d.rotation = pointerAngle + Math.PI / 2;
      } else if (mode === "rotate_line") {
        const p0 = initialPoints[0];
        const p1 = initialPoints[initialPoints.length - 1];
        const cx = (p0.x + p1.x) / 2;
        const cy = (p0.y + p1.y) / 2;
        const length = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        
        // Pointer angle relative to center
        const pointerAngle = Math.atan2(coords.y - cy, coords.x - cx);
        // The line should be perpendicular to the pointer angle, so we add PI/2
        const lineAngle = pointerAngle + Math.PI / 2;
        
        const dx = (length / 2) * Math.cos(lineAngle);
        const dy = (length / 2) * Math.sin(lineAngle);
        
        d.points = [
          { x: cx - dx, y: cy - dy },
          { x: cx + dx, y: cy + dy }
        ];
      } else if (mode === "rotate_element") {
        const activeElementId = selectedElementIdRef.current;
        if (activeElementId) {
          const elements = getActiveElements();
          const activeEl = elements.find(el => el.id === activeElementId);
          if (activeEl) {
            const cx = initialPoints[0].x;
            const cy = initialPoints[0].y;
            const pointerAngle = Math.atan2(coords.y - cy, coords.x - cx);
            activeEl.rotation = pointerAngle + Math.PI / 2;
          }
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const s = stateRef.current;
    const interaction = pointerInteractionRef.current;
    pointerInteractionRef.current = null;

    if (s.isDrawing) {
      if (s.currentDrawingPoints.length >= 2) {
        s.drawings.push({
          type: s.drawingMode,
          points: [...s.currentDrawingPoints],
          config: {
            color: s.drawingConfig?.color || "#00e5ff",
            fillColor: s.drawingConfig?.fillColor || "#ef4444",
            size: s.drawingConfig?.size || 2,
            opacity: s.drawingConfig?.opacity !== undefined ? s.drawingConfig.opacity : 100,
          }
        });
        saveStateToHistory();
      }
      s.isDrawing = false;
      s.currentDrawingPoints = [];
    }

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (s.selectedElement && s.originalDragPos) {
      const dx = s.selectedElement.x - s.originalDragPos.x;
      const dy = s.selectedElement.y - s.originalDragPos.y;
      if (dx !== 0 || dy !== 0) {
        saveStateToHistory();
      }
    }
    s.selectedElement = null;

    if (drawingDragRef.current && drawingDragRef.current.active) {
      if (interaction?.hasMoved) {
        saveStateToHistory();
      }
      drawingDragRef.current = null;
    }

    // Gestão de Seleção: Apenas em Clique Simples Parado (Tap / Click sem arrastar)
    if (interaction && s.drawingMode === "select") {
      if (!interaction.hasMoved) {
        // Clique parado (Tap): Intenção expressa de editar -> abre a barra lateral!
        if (interaction.targetElementType === "element" && interaction.targetId) {
          setDrawingSelection(null);
          setElementSelection(interaction.targetId);
          setUiTick((t) => t + 1);
        } else if (interaction.targetElementType === "drawing" && interaction.targetDrawingIdx !== null) {
          setElementSelection(null);
          setDrawingSelection(interaction.targetDrawingIdx);
          setUiTick((t) => t + 1);
        } else if (interaction.targetElementType === "canvas") {
          // Clique no relvado vazio -> desmarca e fecha a barra
          setDrawingSelection(null);
          setElementSelection(null);
          setUiTick((t) => t + 1);
        }
      }
      // Se interaction.hasMoved === true, foi um arrasto: o jogador moveu-se livremente e a barra NÃO abre!
    }
  };

  const handleUpdateDrawing = (index: number, updated: TacticalDrawing) => {
    const s = stateRef.current;
    if (s.drawings[index]) {
      s.drawings[index] = updated;
      saveStateToHistory();
      setUiTick((t) => t + 1);
    }
  };

  const handleDeleteDrawing = (index: number) => {
    const s = stateRef.current;
    if (s.drawings[index]) {
      s.drawings.splice(index, 1);
      setDrawingSelection(null);
      saveStateToHistory();
      setUiTick((t) => t + 1);
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
    setUiTick((t) => t + 1);
  };

  const handleUpdateElement = (updated: Partial<TacticalElement>) => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const el = elements.find((item) => item.id === activeId);
    if (el) {
      Object.assign(el, updated);
      saveStateToHistory();
      setUiTick((t) => t + 1);
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
      setUiTick((t) => t + 1);
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
      const existingNumbers = elements.filter((el) => el.type === base.type).map((el) => el.number || 0);
      let n = 1;
      while (existingNumbers.includes(n)) n++;
      newNumber = n;
    }

    const cloned: TacticalElement = {
      ...base,
      id: (base.type === "home" ? "H" : base.type === "away" ? "A" : base.type === "cone" ? "C" : base.type === "mini_goal" ? "G" : "B") + (Date.now() % 100000),
      number: newNumber,
      x: Math.min(CANVAS_WIDTH - 30, Math.max(30, base.x + 25)),
      y: Math.min(CANVAS_HEIGHT - 30, Math.max(30, base.y + 25)),
    };

    elements.push(cloned);
    setDrawingSelection(null);
    setElementSelection(cloned.id);
    saveStateToHistory();
    setUiTick((t) => t + 1);
  };

  const handleRotateElement = (newAngle: number) => {
    const activeId = selectedElementIdRef.current;
    if (!activeId) return;
    const elements = getActiveElements();
    const el = elements.find((item) => item.id === activeId);
    if (el) {
      el.rotation = newAngle;
      saveStateToHistory();
      setUiTick((t) => t + 1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const drawField = () => {
      ctx.fillStyle = FIELD_BG;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "#ffffff60";
      ctx.lineWidth = 3.5;
      const padding = 65;
      const w = CANVAS_WIDTH - padding * 2;
      const h = CANVAS_HEIGHT - padding * 2;
      ctx.strokeRect(padding, padding, w, h);

      if (stateRef.current.pitchStyle === "full") {
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, padding);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - padding);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 75, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffffa0";
        ctx.fill();

        const penW = 132;
        const penH = 322;
        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);
        ctx.strokeRect(CANVAS_WIDTH - padding - penW, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);
        
        const goalW = 44;
        const goalH = 146;
        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);
        ctx.strokeRect(CANVAS_WIDTH - padding - goalW, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);

        const gW = 16;
        const gH = 58;
        ctx.strokeRect(padding - gW, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);
        ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);

        ctx.beginPath();
        ctx.arc(padding + 88, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding - 88, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        const arcAngle = Math.acos(44 / 73);
        ctx.beginPath();
        ctx.arc(padding + 88, CANVAS_HEIGHT / 2, 73, -arcAngle, arcAngle);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding - 88, CANVAS_HEIGHT / 2, 73, Math.PI - arcAngle, Math.PI + arcAngle);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(padding, padding, 15, 0, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding, padding, 15, Math.PI / 2, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding, 15, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(padding, CANVAS_HEIGHT - padding, 15, Math.PI * 1.5, Math.PI * 2);
        ctx.stroke();
      } else if (stateRef.current.pitchStyle === "half") {
        // Half Pitch: Baliza, Grande Área, Pequena Área, Penálti e Meia-Lua (Esquerda) + Linha de Meio Campo e Meio Círculo (Direita)
        const penW = 220;
        const penH = 400;
        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);

        const goalW = 75;
        const goalH = 190;
        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);

        const gW = 20;
        const gH = 75;
        ctx.strokeRect(padding - gW, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);

        // Penalty spot
        const penSpotX = padding + 140;
        ctx.beginPath();
        ctx.arc(penSpotX, CANVAS_HEIGHT / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffffa0";
        ctx.fill();

        // Penalty Arc (Meia-lua da grande área)
        const arcRadius = 110;
        const arcAngle = Math.acos((penW - 140) / arcRadius);
        ctx.beginPath();
        ctx.arc(penSpotX, CANVAS_HEIGHT / 2, arcRadius, -arcAngle, arcAngle);
        ctx.stroke();

        // Right Side: Halfway Line (Linha de Meio-Campo) with Center Circle Arc and Center Point
        const halfwayX = CANVAS_WIDTH - padding;
        ctx.beginPath();
        ctx.arc(halfwayX, CANVAS_HEIGHT / 2, 120, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(halfwayX, CANVAS_HEIGHT / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffffa0";
        ctx.fill();
      }
      // Mode "free": only outer border is drawn (empty open canvas for free exercise drills)
    };

    const drawSingleDrawing = (drawing: TacticalDrawing) => {
      const { type, points, config, rotation } = drawing;
      if (!points || points.length < 2) return;

      const strokeColor = config?.color || "#00e5ff";
      const strokeWidth = config?.size || 2;
      const fillColor = config?.fillColor || "#ef4444";
      const fillOpacity = (config?.opacity !== undefined ? config.opacity : 100) / 100;

      const p0 = points[0];
      const pLast = points[points.length - 1];

      ctx.save();
      
      if (rotation && (type === "rect" || type === "circle" || type === "triangle" || type === "pentagon" || type === "hexagon")) {
        const bounds = getDrawingBounds(drawing);
        if (bounds && bounds.cx !== undefined && bounds.cy !== undefined) {
          ctx.translate(bounds.cx, bounds.cy);
          ctx.rotate(rotation);
          ctx.translate(-bounds.cx, -bounds.cy);
        }
      }

      if (type === "rect") {
        const x = Math.min(p0.x, pLast.x);
        const y = Math.min(p0.y, pLast.y);
        const w = Math.abs(pLast.x - p0.x);
        const h = Math.abs(pLast.y - p0.y);

        // Fill
        if (fillOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = fillOpacity;
          ctx.fillStyle = fillColor;
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }

        // Crisp border
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (config?.lineStyle === "dashed") {
          ctx.setLineDash([8, 6]);
        }
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      } else if (type === "circle") {
        const radius = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);

        // Fill
        if (fillOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = fillOpacity;
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Crisp border
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (config?.lineStyle === "dashed") {
          ctx.setLineDash([8, 6]);
        }
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (type === "triangle") {
        const topX = (p0.x + pLast.x) / 2;
        const topY = Math.min(p0.y, pLast.y);
        const bottomY = Math.max(p0.y, pLast.y);

        // Fill
        if (fillOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = fillOpacity;
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.lineTo(pLast.x, bottomY);
          ctx.lineTo(p0.x, bottomY);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Crisp border
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (config?.lineStyle === "dashed") {
          ctx.setLineDash([8, 6]);
        }
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(pLast.x, bottomY);
        ctx.lineTo(p0.x, bottomY);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      } else if (type === "pentagon" || type === "hexagon") {
        const sides = type === "pentagon" ? 5 : 6;
        const minX = Math.min(p0.x, pLast.x);
        const maxX = Math.max(p0.x, pLast.x);
        const minY = Math.min(p0.y, pLast.y);
        const maxY = Math.max(p0.y, pLast.y);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const rx = (maxX - minX) / 2;
        const ry = (maxY - minY) / 2;

        const makePolygonPath = () => {
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
            const px = cx + rx * Math.cos(angle);
            const py = cy + ry * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        };

        if (fillOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = fillOpacity;
          ctx.fillStyle = fillColor;
          makePolygonPath();
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (config?.lineStyle === "dashed") {
          ctx.setLineDash([8, 6]);
        }
        makePolygonPath();
        ctx.stroke();
        ctx.restore();
      } else if (type === "pen") {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (type === "run" || type === "pass" || type === "line") {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (type === "pass") {
          ctx.setLineDash([8, 6]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();

        if (type !== "line") {
          // Arrow head for run and pass
          ctx.setLineDash([]);
          const angle = Math.atan2(pLast.y - p0.y, pLast.x - p0.x);
          const arrowLength = Math.max(10, strokeWidth * 4);
          ctx.beginPath();
          ctx.moveTo(pLast.x, pLast.y);
          ctx.lineTo(
            pLast.x - arrowLength * Math.cos(angle - Math.PI / 6),
            pLast.y - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            pLast.x - arrowLength * Math.cos(angle + Math.PI / 6),
            pLast.y - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = strokeColor;
          ctx.fill();
        }
        ctx.restore();
      }
      
      ctx.restore(); // Restore the rotation transform
    };

    const renderLoop = (timestamp: number) => {
      drawField();
      const s = stateRef.current;
      
      // Render saved drawings
      s.drawings.forEach(d => drawSingleDrawing(d));

      // Render selection visual indicator for selected drawing
      const activeDrawingIdx = selectedDrawingIdxRef.current;
      if (activeDrawingIdx !== null && s.drawingMode === "select" && s.drawings[activeDrawingIdx]) {
        const selDrawing = s.drawings[activeDrawingIdx];
        const bounds = getDrawingBounds(selDrawing);
        if (bounds) {
          const isLine = selDrawing.type === "run" || selDrawing.type === "pass" || selDrawing.type === "pen" || selDrawing.type === "line";

          ctx.save();
          if (bounds.cx !== undefined && bounds.cy !== undefined && bounds.rotation) {
            ctx.translate(bounds.cx, bounds.cy);
            ctx.rotate(bounds.rotation);
            ctx.translate(-bounds.cx, -bounds.cy);
          }

          if (isLine) {
            // Strong neon cyan glowing aura contour along the line itself
            ctx.save();
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = Math.max(12, (selDrawing.config?.size || 2) + 14);
            ctx.globalAlpha = 0.55;
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 20;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(selDrawing.points[0].x, selDrawing.points[0].y);
            for (let i = 1; i < selDrawing.points.length; i++) {
              ctx.lineTo(selDrawing.points[i].x, selDrawing.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
          } else {
            // Strong glowing dashed bounding box around shape
            ctx.save();
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 18;
            ctx.setLineDash([7, 5]);
            ctx.strokeRect(
              bounds.minX - 6,
              bounds.minY - 6,
              bounds.maxX - bounds.minX + 12,
              bounds.maxY - bounds.minY + 12
            );
            ctx.restore();

            // Center marker
            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
          }

          // Modern circular blue handles with white border & glowing effect
          bounds.handles.forEach((h) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(h.x, h.y, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = "#0284c7";
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            ctx.restore();
          });
          ctx.restore();
        }
      }

      // Render drawing in progress
      if (s.isDrawing && s.currentDrawingPoints.length >= 2) {
        drawSingleDrawing({
          type: s.drawingMode,
          points: s.currentDrawingPoints,
          config: s.drawingConfig
        });
      }

      // Render elements
      const currentId = s.activePath[s.currentFrameIdx];
      const elementsToRender = s.framesMap[currentId]?.elements || [];

      elementsToRender.forEach(el => {
        if (el.type === "cone") {
          // Draw cone (triangle)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(el.x, el.y - 14);
          ctx.lineTo(el.x + 12, el.y + 12);
          ctx.lineTo(el.x - 12, el.y + 12);
          ctx.closePath();
          ctx.fillStyle = el.color || "#f97316";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
          ctx.restore();
        } else if (el.type === "mini_goal") {
          // Dynamic goal size: Mini vs Fut 7 vs Fut 11
          const gw = el.goalSize === "fut11" ? 82 : el.goalSize === "fut7" ? 56 : 36;
          const gd = el.goalSize === "fut11" ? 32 : el.goalSize === "fut7" ? 24 : 18;
          const postRadius = el.goalSize === "fut11" ? 3.5 : el.goalSize === "fut7" ? 3 : 2.5;
          const crossbarWidth = el.goalSize === "fut11" ? 4.5 : el.goalSize === "fut7" ? 4 : 3.5;

          ctx.save();
          ctx.translate(el.x, el.y);
          if (el.rotation) {
            ctx.rotate(el.rotation);
          }

          // 1. Sombra suave de contacto
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(0, gd / 2 + 2, gw / 2 + 4, 5, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.fill();
          ctx.restore();

          // 2. Fundo da rede semi-transparente
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.fillRect(-gw / 2, -gd / 2, gw, gd);

          // 3. Grelha da rede (Net mesh)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          for (let nx = -gw / 2 + 6; nx < gw / 2; nx += 6) {
            ctx.beginPath();
            ctx.moveTo(nx, -gd / 2);
            ctx.lineTo(nx, gd / 2);
            ctx.stroke();
          }
          for (let ny = -gd / 2 + 6; ny < gd / 2; ny += 6) {
            ctx.beginPath();
            ctx.moveTo(-gw / 2, ny);
            ctx.lineTo(gw / 2, ny);
            ctx.stroke();
          }

          // 4. Estrutura traseira de suporte metálico
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 2;
          ctx.strokeRect(-gw / 2, -gd / 2, gw, gd);

          // 5. Linha frontal de golo e postes principais
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = crossbarWidth;
          ctx.beginPath();
          ctx.moveTo(-gw / 2, gd / 2);
          ctx.lineTo(gw / 2, gd / 2);
          ctx.stroke();

          // Postes e cantoneiras brancas
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(-gw / 2, gd / 2, postRadius, 0, Math.PI * 2);
          ctx.arc(gw / 2, gd / 2, postRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (el.type === "ball") {
          // Professional 3D Vector Soccer Ball
          const r = 7.5;
          ctx.save();

          // 1. Soft realistic shadow
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(el.x, el.y + r - 1.5, r * 0.85, r * 0.32, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();

          // 2. 3D Sphere Radial Gradient Base
          const sphereGrad = ctx.createRadialGradient(
            el.x - r * 0.35,
            el.y - r * 0.35,
            r * 0.1,
            el.x,
            el.y,
            r
          );
          sphereGrad.addColorStop(0, "#ffffff");
          sphereGrad.addColorStop(0.55, "#f1f5f9");
          sphereGrad.addColorStop(0.85, "#cbd5e1");
          sphereGrad.addColorStop(1, "#64748b");

          ctx.beginPath();
          ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.fill();

          // Clip to sphere
          ctx.save();
          ctx.beginPath();
          ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
          ctx.clip();

          // 3. Center black pentagon
          const centerPentagonRadius = r * 0.42;
          const pentagonAngles: number[] = [];
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            pentagonAngles.push(angle);
            const px = el.x + centerPentagonRadius * Math.cos(angle);
            const py = el.y + centerPentagonRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1;
          ctx.stroke();

          // 4. Seams and outer 5 edge patches
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.2;

          for (let i = 0; i < 5; i++) {
            const angle = pentagonAngles[i];
            const p1x = el.x + centerPentagonRadius * Math.cos(angle);
            const p1y = el.y + centerPentagonRadius * Math.sin(angle);
            const p2x = el.x + r * 1.05 * Math.cos(angle);
            const p2y = el.y + r * 1.05 * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();

            const nextAngle = pentagonAngles[(i + 1) % 5];
            const midAngle = (angle + nextAngle) / 2 + (nextAngle < angle ? Math.PI : 0);
            const patchX = el.x + r * 1.08 * Math.cos(midAngle);
            const patchY = el.y + r * 1.08 * Math.sin(midAngle);
            ctx.beginPath();
            ctx.arc(patchX, patchY, r * 0.38, 0, Math.PI * 2);
            ctx.fillStyle = "#0f172a";
            ctx.fill();
            ctx.stroke();
          }

          // 5. Specular highlight
          const shineGrad = ctx.createRadialGradient(
            el.x - r * 0.35,
            el.y - r * 0.35,
            0,
            el.x - r * 0.35,
            el.y - r * 0.35,
            r * 0.6
          );
          shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
          shineGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.2)");
          shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.arc(el.x - r * 0.35, el.y - r * 0.35, r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = shineGrad;
          ctx.fill();

          ctx.restore(); // restore clip

          // 6. Outer border
          ctx.beginPath();
          ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else {
          // Home / Away / Neutral player (sm, md, lg)
          const pColor = el.color || (el.type === "home" ? "#facc15" : "#3b82f6");
          const pRadius = el.size === "lg" ? 19 : el.size === "md" ? 15 : 11;
          const pBorder = el.size === "lg" ? 2.5 : el.size === "md" ? 2.2 : 1.8;

          ctx.beginPath();
          ctx.arc(el.x, el.y, pRadius, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.fill();
          ctx.lineWidth = pBorder;

          // High contrast border & text logic
          const isLight = pColor.toLowerCase() === "#ffffff" || pColor.toLowerCase() === "#facc15" || pColor.toLowerCase() === "#fde047";
          ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
          ctx.stroke();
          
          const textToRender = el.label !== undefined ? el.label : el.number !== undefined ? el.number.toString() : "";
          if (textToRender) {
            const isLong = textToRender.length > 2;
            let fontSize = 9;
            if (el.size === "lg") {
              fontSize = isLong ? 11 : 15;
            } else if (el.size === "md") {
              fontSize = isLong ? 9 : 12;
            } else {
              fontSize = isLong ? 7 : 9;
            }
            ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
            ctx.fillText(textToRender, el.x, el.y);
          }
        }

        // Selection highlight ring for selected element
        if (selectedElementIdRef.current && el.id === selectedElementIdRef.current) {
          ctx.save();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 10;
          const selectRadius = el.type === "ball" ? 17 : el.type === "cone" ? 21 : el.type === "mini_goal" ? (el.goalSize === "fut11" ? 48 : el.goalSize === "fut7" ? 36 : 26) : (el.size === "lg" ? 27 : el.size === "md" ? 21 : 16);
          ctx.beginPath();
          ctx.arc(el.x, el.y, selectRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          if (el.type === "mini_goal") {
            ctx.save();
            if (el.rotation) {
              ctx.translate(el.x, el.y);
              ctx.rotate(el.rotation);
              ctx.translate(-el.x, -el.y);
            }
            ctx.beginPath();
            ctx.arc(el.x, el.y - selectRadius - 16, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = "#0284c7";
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const s = stateRef.current;

  // Miniatura ultra-leve para cards de catálogo e listas de treino
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
          selectedElement={selectedElementId !== null ? getActiveElements().find((el) => el.id === selectedElementId) || null : null}
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
            setUiTick((t) => t + 1);
          }}
        />
      )}

      {/* Main Area: Canvas + Bottom Bar */}
      <div className="flex-1 flex flex-col min-h-0 w-full h-full overflow-hidden bg-transparent rounded-2xl border border-slate-800 shadow-lg">
        <div className="w-full flex-1 min-h-0 bg-[#1b4332] flex items-center justify-center overflow-hidden relative p-1">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={cn(
              "touch-none max-w-full max-h-full aspect-[1000/625] object-contain shadow-inner rounded-sm",
              s.drawingMode === "select" ? "cursor-default" : "cursor-crosshair"
            )}
          />
        </div>
        
        {!readOnly && (
          <TacticalBottomBar 
            state={s} 
            setState={(val) => { 
              stateRef.current = typeof val === 'function' ? val(stateRef.current) : val; 
              setUiTick(t => t + 1); 
              if (onChange) onChange(stateRef.current);
            }} 
            uiTick={uiTick} 
            setUiTick={setUiTick}
            onSaveHistory={saveStateToHistory}
          />
        )}
      </div>

      {/* Sidebar Area */}
      {!readOnly && (
        <TacticalSidebar 
          state={s} 
          setState={(val) => { 
            stateRef.current = typeof val === 'function' ? val(stateRef.current) : val; 
            setUiTick(t => t + 1); 
            if (onChange) onChange(stateRef.current);
          }} 
          uiTick={uiTick} 
          setUiTick={setUiTick} 
          onSave={(data) => {
            if (onChange) onChange(data);
            if (onSave) onSave(data);
          }}
        />
      )}

    </div>
  );
}
