"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Play, Square, Circle, Triangle, PenTool, MousePointer2, 
  Trash2, RotateCcw, RotateCw, Save, Plus,
  Video, LocateFixed, GitMerge, FileText
} from "lucide-react";

// --- INTERFACES TYPESCRIPT ---

export interface Point {
  x: number;
  y: number;
}

export interface TacticalElement {
  id: string;
  type: "home" | "away" | "ball" | "cone";
  x: number;
  y: number;
  number?: number;
  color?: string;
}

export interface TacticalDrawing {
  type: "select" | "run" | "pass" | "pen" | "rect";
  points: Point[];
  config?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
}

export interface FrameNode {
  id: string;
  name: string;
  elements: TacticalElement[];
  children: string[];
  parentId: string | null;
  notes?: string;
}

export interface HistorySnapshot {
  framesMap: Record<string, FrameNode>;
  activePath: string[];
}

export interface TacticalState {
  pitchStyle: "full" | "half";
  framesMap: Record<string, FrameNode>;
  activePath: string[];
  currentFrameIdx: number;
  drawingMode: "select" | "run" | "pass" | "pen" | "rect";
  drawings: TacticalDrawing[];
  isPlaying: boolean;
  transitionSpeed: number;
  selectedElement: TacticalElement | null;
  dragOffset: Point;
  isDrawing: boolean;
  currentDrawingPoints: Point[];
  playbackFrameProgress: number;
  playbackStartTime: number;
  loadedTacticIndex: number | null;
  isEditMode: boolean;
  history: HistorySnapshot[];
  historyIndex: number;
  originalDragPos: Point | null;
  activeDrawingIndex?: number;
  drawingConfig?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
}

// --- CONSTANTES ---
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 625;
const FIELD_BG = "#1b4332";
const HOME_TEAM_COLOR = "#facc15";
const AWAY_TEAM_COLOR = "#3b82f6";

const INITIAL_STATE: TacticalState = {
  pitchStyle: "full",
  framesMap: {
    root: {
      id: "root",
      name: "Início",
      elements: [],
      children: [],
      parentId: null,
      notes: ""
    },
  },
  activePath: ["root"],
  currentFrameIdx: 0,
  drawingMode: "select",
  drawings: [],
  isPlaying: false,
  transitionSpeed: 1500,
  selectedElement: null,
  dragOffset: { x: 0, y: 0 },
  isDrawing: false,
  currentDrawingPoints: [],
  playbackFrameProgress: 0,
  playbackStartTime: 0,
  loadedTacticIndex: null,
  isEditMode: true,
  history: [],
  historyIndex: -1,
  originalDragPos: null,
};

export default function TacticalBoard({ initialTacticData, onSave }: { initialTacticData?: any, onSave?: (data: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<TacticalState>(initialTacticData ? { ...INITIAL_STATE, ...initialTacticData } : JSON.parse(JSON.stringify(INITIAL_STATE)));
  const [uiTick, setUiTick] = useState(0);

  // --- HELPERS DE ESTADO ---
  const getActiveFrameId = () => stateRef.current.activePath[stateRef.current.currentFrameIdx];
  const getActiveFrame = () => stateRef.current.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

  // --- HISTÓRICO ---
  const saveStateToHistory = () => {
    const s = stateRef.current;
    if (s.historyIndex < s.history.length - 1) {
      s.history = s.history.slice(0, s.historyIndex + 1);
    }
    const snapshot: HistorySnapshot = {
      framesMap: JSON.parse(JSON.stringify(s.framesMap)),
      activePath: JSON.parse(JSON.stringify(s.activePath)),
    };
    s.history.push(snapshot);
    s.historyIndex++;
    setUiTick((t) => t + 1); 
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
    s.currentFrameIdx = Math.min(s.currentFrameIdx, s.activePath.length - 1);
    setUiTick((t) => t + 1);
  };

  // --- FERRAMENTAS ---
  const addPlayer = (team: "home" | "away") => {
    const s = stateRef.current;
    const id = (team === "home" ? "H" : "A") + (Date.now() % 1000);
    const elements = getActiveElements();
    
    const existingNumbers = elements.filter(e => e.type === team).map(e => e.number || 0);
    let num = 1;
    while(existingNumbers.includes(num)) num++;

    elements.push({
      id,
      type: team,
      number: num,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      color: team === "home" ? HOME_TEAM_COLOR : AWAY_TEAM_COLOR
    });
    saveStateToHistory();
  };

  const addBall = () => {
    const elements = getActiveElements();
    if (elements.some(e => e.type === "ball")) return; 
    elements.push({
      id: "B" + Date.now(),
      type: "ball",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
    saveStateToHistory();
  };

  const addCone = () => {
    getActiveElements().push({
      id: "C" + Date.now(),
      type: "cone",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
    saveStateToHistory();
  };

  const setDrawingMode = (mode: "select" | "run" | "pass" | "pen" | "rect") => {
    stateRef.current.drawingMode = mode;
    setUiTick(t => t + 1);
  };

  const clearDrawings = () => {
    stateRef.current.drawings = [];
    saveStateToHistory();
  };

  const clearAll = () => {
    const activeFrame = getActiveFrame();
    if (activeFrame) {
      activeFrame.elements = [];
      stateRef.current.drawings = [];
      saveStateToHistory();
    }
  };

  // --- TIMELINE ---
  const addFrame = () => {
    const s = stateRef.current;
    const parentId = getActiveFrameId();
    const parentFrame = s.framesMap[parentId];
    
    const newId = "f_" + Date.now();
    const newFrame: FrameNode = {
      id: newId,
      name: "Quadro " + (s.activePath.length + 1),
      elements: JSON.parse(JSON.stringify(parentFrame.elements)),
      children: [],
      parentId: parentId,
      notes: ""
    };

    s.framesMap[newId] = newFrame;
    parentFrame.children.push(newId);
    
    // Atualiza a path apagando o que vem à frente (se estavamos no meio da timeline)
    s.activePath = s.activePath.slice(0, s.currentFrameIdx + 1);
    s.activePath.push(newId);
    s.currentFrameIdx = s.activePath.length - 1;
    
    saveStateToHistory();
  };

  const deleteFrame = () => {
    const s = stateRef.current;
    const currentId = getActiveFrameId();
    if (currentId === "root") return; // não apagar a raiz
    
    const parentId = s.framesMap[currentId].parentId;
    if (parentId) {
      const parentFrame = s.framesMap[parentId];
      parentFrame.children = parentFrame.children.filter(id => id !== currentId);
    }
    
    delete s.framesMap[currentId];
    s.activePath.pop();
    s.currentFrameIdx = s.activePath.length - 1;
    
    saveStateToHistory();
  };

  const updateNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const activeFrame = getActiveFrame();
    if (activeFrame) {
      activeFrame.notes = e.target.value;
      setUiTick(t => t + 1); // Forçar UI render para textarea
    }
  };

  const playAnimation = () => {
    const s = stateRef.current;
    if (s.activePath.length <= 1) return;
    s.currentFrameIdx = 0;
    s.isPlaying = true;
    s.playbackStartTime = performance.now();
    s.playbackFrameProgress = 0;
    setUiTick(t => t + 1);
  };

  const jumpToFrame = (idx: number) => {
    const s = stateRef.current;
    s.currentFrameIdx = idx;
    s.isPlaying = false; // Stop se estivesse a tocar
    setUiTick(t => t + 1);
  };

  // Inicializa o history no início
  useEffect(() => {
    if (stateRef.current.history.length === 0) {
      saveStateToHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- EVENTOS DE PONTEIRO ---
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const coords = getCanvasCoords(e);
    if (s.isPlaying || !s.isEditMode) return;

    if (s.drawingMode !== "select") {
      s.isDrawing = true;
      s.currentDrawingPoints = [coords];
      return;
    }

    const currentFrameElements = getActiveElements();
    for (let i = currentFrameElements.length - 1; i >= 0; i--) {
      const el = currentFrameElements[i];
      const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
      const radius = el.type === "ball" ? 12 : el.type === "cone" ? 14 : 20;

      if (dist <= radius) {
        s.selectedElement = el;
        s.dragOffset.x = coords.x - el.x;
        s.dragOffset.y = coords.y - el.y;
        s.originalDragPos = { x: el.x, y: el.y };
        currentFrameElements.splice(i, 1);
        currentFrameElements.push(el);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const coords = getCanvasCoords(e);

    if (s.isDrawing) {
      const lastPoint = s.currentDrawingPoints[s.currentDrawingPoints.length - 1];
      if (!lastPoint || Math.hypot(lastPoint.x - coords.x, lastPoint.y - coords.y) > 4) {
        s.currentDrawingPoints.push(coords);
      }
      return;
    }

    if (s.selectedElement && !s.isPlaying) {
      s.selectedElement.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, coords.x - s.dragOffset.x));
      s.selectedElement.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, coords.y - s.dragOffset.y));
    }
  };

  const propagateMovement = (nodeId: string, elementId: string, dx: number, dy: number) => {
    const s = stateRef.current;
    const node = s.framesMap[nodeId];
    if (!node) return;
    node.children.forEach(childId => {
      const childNode = s.framesMap[childId];
      const el = childNode.elements.find(e => e.id === elementId);
      if (el) {
        el.x += dx;
        el.y += dy;
      }
      propagateMovement(childId, elementId, dx, dy);
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.isDrawing) {
      if (s.currentDrawingPoints.length > 2) {
        s.drawings.push({
          type: s.drawingMode,
          points: [...s.currentDrawingPoints],
        });
        saveStateToHistory();
      }
      s.isDrawing = false;
      s.currentDrawingPoints = [];
    }

    if (s.selectedElement && s.originalDragPos) {
      const dx = s.selectedElement.x - s.originalDragPos.x;
      const dy = s.selectedElement.y - s.originalDragPos.y;
      if (dx !== 0 || dy !== 0) {
        propagateMovement(getActiveFrameId(), s.selectedElement.id, dx, dy);
        saveStateToHistory();
      }
    }
    s.selectedElement = null;
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

        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 130, 110, 260);
        ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 50, 40, 100);
        ctx.strokeRect(padding - 15, CANVAS_HEIGHT / 2 - 30, 15, 60);
        ctx.beginPath();
        ctx.arc(padding + 80, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(padding + 80, CANVAS_HEIGHT / 2, 50, -0.295 * Math.PI, 0.295 * Math.PI);
        ctx.stroke();

        ctx.strokeRect(CANVAS_WIDTH - padding - 110, CANVAS_HEIGHT / 2 - 130, 110, 260);
        ctx.strokeRect(CANVAS_WIDTH - padding - 40, CANVAS_HEIGHT / 2 - 50, 40, 100);
        ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - 30, 15, 60);
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding - 80, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - padding - 80, CANVAS_HEIGHT / 2, 50, 0.705 * Math.PI, 1.295 * Math.PI);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(padding, padding, 15, 0, 0.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(padding, CANVAS_HEIGHT - padding, 15, 1.5 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - padding, padding, 15, 0.5 * Math.PI, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding, 15, Math.PI, 1.5 * Math.PI);
      ctx.stroke();
    };

    const drawArrowhead = (fromX: number, fromY: number, toX: number, toY: number, type: string, customColor?: string) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLength = 15;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = customColor || (type === "run" ? "#facc15" : "#38bdf8");
      ctx.fill();
    };

    const drawTacticalDrawings = () => {
      const { drawings, isDrawing, currentDrawingPoints, drawingMode, drawingConfig } = stateRef.current;

      drawings.forEach((drawing) => {
        if (drawing.points.length < 2) return;
        
        const color = drawing.config?.color || (drawing.type === "pen" ? "#ffffff" : drawing.type === "run" ? "#facc15" : drawing.type === "rect" ? "#fb923c" : "#38bdf8");
        const size = drawing.config?.size || 3.5;
        
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        if (drawing.type === "pass") ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        if (drawing.type !== "pen" && drawing.type !== "rect") {
          const pLen = drawing.points.length;
          drawArrowhead(
            drawing.points[pLen - 2].x,
            drawing.points[pLen - 2].y,
            drawing.points[pLen - 1].x,
            drawing.points[pLen - 1].y,
            drawing.type,
            color
          );
        }
      });

      if (isDrawing && currentDrawingPoints.length > 1) {
        const pts = currentDrawingPoints;
        const type = drawingMode;
        const color = drawingConfig?.color || (type === "pen" ? "#ffffff" : type === "run" ? "#facc15" : type === "rect" ? "#fb923c" : "#38bdf8");
        
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        if (type === "pass") ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const renderLoop = (timestamp: number) => {
      drawField();
      drawTacticalDrawings();

      const s = stateRef.current;
      let elementsToRender: TacticalElement[] = [];

      if (s.isPlaying) {
        const currentId = s.activePath[s.currentFrameIdx];
        const node = s.framesMap[currentId];

        if (s.currentFrameIdx >= s.activePath.length - 1) {
          s.isPlaying = false;
          setUiTick(t => t + 1);
          elementsToRender = node?.elements || [];
        } else {
          const elapsed = timestamp - s.playbackStartTime;
          const progress = Math.min(1.0, elapsed / s.transitionSpeed);
          s.playbackFrameProgress = progress;

          const startElements = node?.elements || [];
          const nextId = s.activePath[s.currentFrameIdx + 1];
          const endElements = s.framesMap[nextId]?.elements || [];

          startElements.forEach(startEl => {
            const endEl = endElements.find(e => e.id === startEl.id);
            if (endEl) {
              elementsToRender.push({
                ...startEl,
                x: startEl.x + (endEl.x - startEl.x) * progress,
                y: startEl.y + (endEl.y - startEl.y) * progress,
              });
            } else {
              elementsToRender.push(startEl);
            }
          });

          if (progress >= 1.0) {
            s.currentFrameIdx++;
            s.playbackStartTime = performance.now();
            setUiTick(t => t + 1);
          }
        }
      } else {
        const currentId = s.activePath[s.currentFrameIdx];
        elementsToRender = s.framesMap[currentId]?.elements || [];
      }

      elementsToRender.forEach(el => {
        if (el.type === "ball") {
          const r = 11;
          ctx.beginPath();
          ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "#000000";
          ctx.stroke();
          
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const px = el.x + r * 0.4 * Math.cos(angle);
            const py = el.y + r * 0.4 * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = "#000000";
          ctx.fill();
        } else if (el.type === "cone") {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y - 12);
          ctx.lineTo(el.x - 12, el.y + 12);
          ctx.lineTo(el.x + 12, el.y + 12);
          ctx.closePath();
          ctx.fillStyle = "#f97316";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(el.x, el.y, 19, 0, Math.PI * 2);
          ctx.fillStyle = el.color || "#000";
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2.5;
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = el.type === "home" ? "#0f172a" : "#ffffff";
          ctx.stroke();
          
          if (el.number) {
            ctx.font = "bold 15px Inter, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = el.type === "home" ? "#0f172a" : "#ffffff";
            ctx.fillText(el.number.toString(), el.x, el.y);
          }
        }
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const s = stateRef.current;
  const activeFrame = getActiveFrame();

  return (
    <div className="w-full bg-[#0a0f1c] text-slate-300 font-sans min-h-[750px] flex gap-4 p-4 rounded-xl border border-slate-800 shadow-2xl">
      
      {/* 1. COLUNA ESQUERDA (FERRAMENTAS) */}
      <div className="w-[280px] flex flex-col gap-6 flex-shrink-0">
        
        {/* Adicionar */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            Adicionar <span className="text-[10px] lowercase text-slate-600 font-normal">Duplo clique p/ editar</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addPlayer('home')} className="bg-[#131b2f] hover:bg-[#1a2542] border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition">
              <div className="w-6 h-6 rounded-full bg-[#facc15] border-2 border-slate-900 shadow-inner" />
              <span className="text-xs font-semibold text-slate-300">Equipa A</span>
            </button>
            <button onClick={() => addPlayer('away')} className="bg-[#131b2f] hover:bg-[#1a2542] border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition">
              <div className="w-6 h-6 rounded-full bg-[#3b82f6] border-2 border-slate-900 shadow-inner" />
              <span className="text-xs font-semibold text-slate-300">Equipa B</span>
            </button>
            <button onClick={addBall} className="bg-[#131b2f] hover:bg-[#1a2542] border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition">
              <Circle className="w-6 h-6 text-white stroke-[1.5]" />
              <span className="text-xs font-semibold text-slate-300">Bola</span>
            </button>
            <button onClick={addCone} className="bg-[#131b2f] hover:bg-[#1a2542] border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition">
              <Triangle className="w-6 h-6 text-orange-500 fill-orange-500 stroke-[1.5]" />
              <span className="text-xs font-semibold text-slate-300">Cone</span>
            </button>
          </div>
        </div>

        {/* Desenho Tático */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desenho Tático</h3>
          <div className="flex gap-2">
            <button onClick={() => setDrawingMode('select')} className={`flex-1 rounded-xl py-2 flex items-center justify-center gap-2 transition font-medium text-sm ${s.drawingMode === 'select' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60'}`}>
              <MousePointer2 className="w-4 h-4" /> Mover Peça
            </button>
            <button onClick={undo} disabled={s.historyIndex <= 0} className="w-10 rounded-xl flex items-center justify-center bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60 disabled:opacity-30 transition">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={s.historyIndex >= s.history.length - 1} className="w-10 rounded-xl flex items-center justify-center bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60 disabled:opacity-30 transition">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-1">
            <button onClick={() => setDrawingMode('pen')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${s.drawingMode === 'pen' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
              <PenTool className="w-5 h-5" />
            </button>
            <button onClick={() => setDrawingMode('rect')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${s.drawingMode === 'rect' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
              <Square className="w-5 h-5" />
            </button>
            <button onClick={() => setDrawingMode('run')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${s.drawingMode === 'run' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button onClick={() => setDrawingMode('pass')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${s.drawingMode === 'pass' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <button onClick={clearDrawings} className="text-left text-xs text-rose-500 hover:text-rose-400 font-medium mt-1 flex items-center gap-1.5 transition">
            <Trash2 className="w-3.5 h-3.5" /> Limpar Linhas Desenhadas
          </button>
          
          <div className="h-[1px] w-full bg-slate-800/60 my-2"></div>
          
          <button onClick={clearAll} className="w-full bg-[#131b2f] hover:bg-rose-950/40 border border-slate-800/60 hover:border-rose-900/60 text-rose-500 rounded-xl py-2 flex items-center justify-center gap-2 text-sm font-semibold transition">
            <Trash2 className="w-4 h-4" /> Limpar Tudo
          </button>
        </div>

        <div className="flex-1"></div>

        {/* Minha Gaveta Tática */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            A Minha Gaveta Tática <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300 font-normal">Cloud</span>
          </h3>
          <p className="text-xs text-slate-500">Guarda a jogada final no servidor.</p>
          {onSave && (
            <button onClick={() => {
              onSave({
                framesMap: s.framesMap,
                activePath: s.activePath,
                drawings: s.drawings,
                pitchStyle: s.pitchStyle
              });
            }} className="w-full bg-indigo-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition">
              <Save className="w-4 h-4" /> Gravar Tática
            </button>
          )}
        </div>
      </div>

      {/* 2. COLUNA CENTRAL (PALCO E TIMELINE) */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-[#131b2f] rounded-2xl p-4 border border-slate-800/60">
        
        {/* Canvas Area */}
        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden shadow-inner flex items-center justify-center" style={{ flex: '1 1 0%' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="touch-none w-full h-auto"
            style={{ maxWidth: '1000px', aspectRatio: '16/10' }}
          />
        </div>

        {/* Timeline Panel */}
        <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/60 flex flex-col gap-4">
          
          {/* Top Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={playAnimation} disabled={s.activePath.length <= 1 || s.isPlaying} className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition">
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              </button>
              
              <div className="flex items-center bg-[#131b2f] rounded-lg border border-slate-800/60 p-1">
                <button 
                  onClick={() => s.currentFrameIdx > 0 && jumpToFrame(s.currentFrameIdx - 1)}
                  disabled={s.currentFrameIdx === 0}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
                </button>
                <div className="px-3 text-xs font-bold text-white whitespace-nowrap">
                  Quadro {s.currentFrameIdx + 1}/{s.activePath.length}
                </div>
                <button 
                  onClick={() => s.currentFrameIdx < s.activePath.length - 1 && jumpToFrame(s.currentFrameIdx + 1)}
                  disabled={s.currentFrameIdx >= s.activePath.length - 1}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#131b2f] px-4 py-2 rounded-lg border border-slate-800/60">
               <Video className="w-4 h-4 text-emerald-500" />
               <span className="text-xs font-semibold text-slate-300">Vel. Transição</span>
               <input 
                 type="range" 
                 min="500" 
                 max="3000" 
                 step="100" 
                 value={s.transitionSpeed} 
                 onChange={(e) => { s.transitionSpeed = parseInt(e.target.value); setUiTick(t => t+1); }}
                 className="w-24 accent-emerald-500"
               />
               <span className="text-xs font-bold text-white w-8 text-right">{(s.transitionSpeed/1000).toFixed(1)}s</span>
            </div>
          </div>

          {/* Timeline actions */}
          <div className="flex items-center gap-2">
            <button onClick={addFrame} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-900/20">
              <Plus className="w-4 h-4" /> Adicionar Quadro (Frame)
            </button>
            <button disabled className="bg-[#131b2f] text-slate-500 border border-slate-800/60 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed">
              <GitMerge className="w-4 h-4" /> Alternativa
            </button>
            <button onClick={deleteFrame} disabled={s.currentFrameIdx === 0} className="w-9 h-9 flex items-center justify-center bg-[#131b2f] border border-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 rounded-lg disabled:opacity-30 transition ml-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline bar */}
          <div className="pt-2 border-t border-slate-800/60">
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <LocateFixed className="w-3.5 h-3.5" /> Linha do Tempo da Jogada
               </h3>
               <span className="text-[10px] text-slate-600">Clica num quadro para saltar</span>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
               {s.activePath.map((frameId, idx) => {
                 const frame = s.framesMap[frameId];
                 const isActive = idx === s.currentFrameIdx;
                 return (
                   <button 
                     key={frameId}
                     onClick={() => jumpToFrame(idx)}
                     className={`flex flex-col items-start p-2 rounded-lg border min-w-[100px] transition ${isActive ? 'bg-[#0f172a] border-emerald-500/50 shadow-md shadow-emerald-900/10' : 'bg-[#131b2f] border-slate-800/60 hover:border-slate-600'}`}
                   >
                     <div className="flex items-center justify-between w-full mb-2">
                       <span className={`text-xs font-bold ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}>{frame.name}</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                     </div>
                     <span className="text-[10px] text-slate-500">{frame.elements.length} peças</span>
                   </button>
                 );
               })}
             </div>
          </div>

        </div>

      </div>

      {/* 3. COLUNA DIREITA (NOTAS) */}
      <div className="w-[280px] bg-[#131b2f] rounded-2xl border border-slate-800/60 flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2">
           <FileText className="w-4 h-4 text-emerald-500" />
           <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Notas do Momento</h3>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <p className="text-xs text-slate-500 leading-relaxed mb-2">
            Escreve aqui o que os jogadores devem fazer neste quadro específico da jogada.
          </p>
          <textarea 
            className="flex-1 bg-[#0a0f1c] border border-slate-800/60 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none shadow-inner"
            placeholder="Ex: O extremo direito deve procurar o espaço vazio, enquanto o lateral sobe pela linha..."
            value={activeFrame?.notes || ""}
            onChange={updateNotes}
          />
        </div>
      </div>

    </div>
  );
}
