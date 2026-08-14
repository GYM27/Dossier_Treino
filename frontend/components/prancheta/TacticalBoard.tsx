"use client";

import React, { useEffect, useRef, useState } from "react";
import { TacticalState, FrameNode, HistorySnapshot, TacticalElement, TacticalDrawing, Point } from "./types";
import { INITIAL_STATE, CANVAS_WIDTH, CANVAS_HEIGHT, FIELD_BG, HOME_TEAM_COLOR, AWAY_TEAM_COLOR } from "./constants";
import { TacticalToolbar } from "./TacticalToolbar";
import { TacticalTimeline } from "./TacticalTimeline";
import { TacticalNotes } from "./TacticalNotes";

export default function TacticalBoard({ initialTacticData, onSave }: { initialTacticData?: any, onSave?: (data: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<TacticalState>(initialTacticData ? { ...INITIAL_STATE, ...initialTacticData } : JSON.parse(JSON.stringify(INITIAL_STATE)));
  const [uiTick, setUiTick] = useState(0);

  const getActiveFrameId = () => stateRef.current.activePath[stateRef.current.currentFrameIdx];
  const getActiveFrame = () => stateRef.current.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

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

  useEffect(() => {
    if (stateRef.current.history.length === 0) {
      saveStateToHistory();
    }
  }, []);

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
      }
    };

    const renderLoop = (timestamp: number) => {
      drawField();
      const s = stateRef.current;
      const currentId = s.activePath[s.currentFrameIdx];
      const elementsToRender = s.framesMap[currentId]?.elements || [];

      elementsToRender.forEach(el => {
        ctx.beginPath();
        ctx.arc(el.x, el.y, 19, 0, Math.PI * 2);
        ctx.fillStyle = el.color || "#000";
        ctx.fill();
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
      <TacticalToolbar 
        state={{ ...s, onSave }} 
        setState={(val) => { stateRef.current = typeof val === 'function' ? val(stateRef.current) : val; setUiTick(t => t + 1); }} 
        uiTick={uiTick} 
        setUiTick={setUiTick} 
      />

      <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-[#131b2f] rounded-2xl p-4 border border-slate-800/60">
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

        <TacticalTimeline 
          state={s} 
          setState={(val) => { stateRef.current = typeof val === 'function' ? val(stateRef.current) : val; setUiTick(t => t + 1); }} 
        />
      </div>

      <TacticalNotes 
        notes={activeFrame?.notes || ""} 
        onChange={(e) => {
          if (activeFrame) {
            activeFrame.notes = e.target.value;
            setUiTick(t => t + 1);
          }
        }} 
      />
    </div>
  );
}
