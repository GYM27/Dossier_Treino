"use client";

import React from "react";
import { 
  Square, Circle, Triangle, MousePointer2, 
  Trash2, Edit2 
} from "lucide-react";
import { TacticalState, TacticalElement, DrawingConfig } from "./types";
import { getInitialElements } from "./constants";
import { cn } from "@/lib/utils";

interface TacticalBottomBarProps {
  state: TacticalState;
  setState: React.Dispatch<React.SetStateAction<TacticalState>>;
  uiTick: number;
  setUiTick: React.Dispatch<React.SetStateAction<number>>;
  onSaveHistory?: () => void;
}

export function TacticalBottomBar({ state, setState, uiTick, setUiTick, onSaveHistory }: TacticalBottomBarProps) {
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 625;

  const getActiveFrameId = () => state.activePath[state.currentFrameIdx];
  const getActiveFrame = () => state.framesMap[getActiveFrameId()];
  const getActiveElements = () => getActiveFrame()?.elements || [];

  const updateCurrentFrameElements = (newElements: TacticalElement[]) => {
    setState(prev => {
      const frameId = prev.activePath[prev.currentFrameIdx];
      return {
        ...prev,
        framesMap: {
          ...prev.framesMap,
          [frameId]: {
            ...prev.framesMap[frameId],
            elements: newElements
          }
        }
      };
    });
    setUiTick(t => t + 1);
    if (onSaveHistory) onSaveHistory();
  };

  const updateDrawingConfig = (key: keyof DrawingConfig, value: any) => {
    setState(prev => ({
      ...prev,
      drawingConfig: {
        ...(prev.drawingConfig || {}),
        [key]: value
      }
    }));
    setUiTick(t => t + 1);
  };

  const addPlayer = (team: "home" | "away") => {
    const elements = [...getActiveElements()];
    
    const existingNumbers = elements.filter(e => e.type === team).map(e => e.number || 0);
    let num = 1;
    while(existingNumbers.includes(num)) num++;

    elements.push({
      id: (team === "home" ? "H" : "A") + Date.now() % 1000,
      type: team,
      number: num,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      color: team === "home" ? "#facc15" : "#3b82f6",
      size: "sm",
    });
    
    updateCurrentFrameElements(elements);
  };

  const addBall = () => {
    const elements = [...getActiveElements()];
    elements.push({
      id: "B" + Date.now(),
      type: "ball",
      x: CANVAS_WIDTH / 2 + (Math.random() * 40 - 20),
      y: CANVAS_HEIGHT / 2 + (Math.random() * 40 - 20)
    });
    
    updateCurrentFrameElements(elements);
  };

  const addCone = () => {
    const elements = [...getActiveElements()];
    elements.push({
      id: "C" + Date.now(),
      type: "cone",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
    
    updateCurrentFrameElements(elements);
  };

  const addMiniGoal = () => {
    const elements = [...getActiveElements()];
    elements.push({
      id: "G" + Date.now(),
      type: "mini_goal",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
    
    updateCurrentFrameElements(elements);
  };

  const setDrawingMode = (mode: TacticalState["drawingMode"]) => {
    setState(prev => ({ ...prev, drawingMode: mode }));
    setUiTick(t => t + 1);
  };

  const clearAll = () => {
    setState(prev => {
      const frameId = prev.activePath[prev.currentFrameIdx];
      const initialResetElements = getInitialElements();
      return {
        ...prev,
        drawings: [],
        framesMap: {
          ...prev.framesMap,
          [frameId]: {
            ...prev.framesMap[frameId],
            elements: initialResetElements
          }
        }
      };
    });
    setUiTick(t => t + 1);
    if (onSaveHistory) onSaveHistory();
  };

  const activeMode = state.drawingMode;
  const config = state.drawingConfig || {
    color: "#00e5ff",
    fillColor: "#ef4444",
    size: 2,
    opacity: 100
  };

  return (
    <div className="w-full bg-[#0e1626] rounded-b-2xl border-t border-slate-800/90 p-2.5 px-3 flex items-center justify-between text-xs text-slate-300 select-none gap-2.5">
      
      {/* 1. Módulo de Desenho & Formas */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl px-2.5 py-1.5 flex items-center gap-2.5 shadow-sm">
        {/* Cursor e Caneta */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setDrawingMode("select")} 
            title="Selecionar / Mover Elementos"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "select" 
                ? "bg-cyan-500 text-white shadow-sm font-semibold" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDrawingMode("pen")} 
            title="Desenho Livre (Caneta)"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "pen" 
                ? "bg-cyan-500 text-white shadow-sm font-semibold" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {/* Formas */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Forma</span>
          <button 
            onClick={() => setDrawingMode("rect")} 
            title="Desenhar Retângulo"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "rect" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setDrawingMode("circle")} 
            title="Desenhar Círculo"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "circle" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setDrawingMode("triangle")} 
            title="Desenhar Triângulo"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "triangle" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Triangle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {/* Linhas */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Linha</span>
          <button 
            onClick={() => setDrawingMode("line")} 
            title="Linha Simples"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "line" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <div className="w-3.5 h-0 border-t-2 border-solid border-current"></div>
          </button>
          <button 
            onClick={() => setDrawingMode("run")} 
            title="Linha com Seta (Deslocamento)"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "run" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <div className="w-4 h-0 border-t-2 border-solid border-current relative">
              <div className="absolute -right-0.5 -top-1 w-2 h-2 border-t-2 border-r-2 border-current rotate-45"></div>
            </div>
          </button>
          <button 
            onClick={() => setDrawingMode("pass")} 
            title="Linha Tracejada com Seta (Passe)"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all", 
              activeMode === "pass" 
                ? "bg-cyan-500 text-white shadow-sm" 
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <div className="w-4 h-0 border-t-2 border-dashed border-current relative">
              <div className="absolute -right-0.5 -top-1 w-2 h-2 border-t-2 border-r-2 border-solid border-current rotate-45"></div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Módulo de Estilos & Cores (Centro) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-sm">
        {/* Cor da Linha */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Cor</span>
          <label className="relative flex items-center cursor-pointer">
            <div 
              className="w-5 h-5 rounded-full border border-slate-500 shadow-sm"
              style={{ backgroundColor: config.color || "#00e5ff" }}
            />
            <input 
              type="color" 
              value={config.color || "#00e5ff"} 
              onChange={(e) => updateDrawingConfig("color", e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {/* Espessura */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Espessura</span>
          <input 
            type="number" 
            min={1} 
            max={20}
            value={config.size || 2} 
            onChange={(e) => updateDrawingConfig("size", Math.max(1, parseInt(e.target.value) || 1))}
            className="w-10 bg-slate-950 text-center border border-slate-700/80 rounded px-1 py-0.5 text-white font-medium focus:border-cyan-500 outline-none text-xs" 
          />
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {/* Cor de Fundo */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Fundo</span>
          <label className="relative flex items-center cursor-pointer">
            <div 
              className="w-5 h-5 rounded-full border border-slate-500 shadow-sm"
              style={{ backgroundColor: config.fillColor || "#ef4444" }}
            />
            <input 
              type="color" 
              value={config.fillColor || "#ef4444"} 
              onChange={(e) => updateDrawingConfig("fillColor", e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        <div className="w-px h-4 bg-slate-800" />
        
        {/* Opacidade */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Opacidade</span>
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              min={0} 
              max={100}
              step={5}
              value={config.opacity !== undefined ? config.opacity : 100} 
              onChange={(e) => updateDrawingConfig("opacity", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-12 bg-slate-950 text-center border border-slate-700/80 rounded px-1 py-0.5 text-white font-medium focus:border-cyan-500 outline-none text-xs" 
            />
            <span className="text-slate-500 text-[11px] font-medium">%</span>
          </div>
        </div>
      </div>

      {/* 3. Módulo de Peças Táticas (Direita) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-sm">
        <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Peças</span>
        
        <button 
          onClick={() => addPlayer("home")} 
          title="Adicionar Jogador Amarelo (Equipa A)" 
          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-[#facc15] border border-slate-950 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-950">
            A
          </div>
        </button>

        <button 
          onClick={() => addPlayer("away")} 
          title="Adicionar Jogador Azul (Equipa B)" 
          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-[#3b82f6] border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white">
            B
          </div>
        </button>

        <button 
          onClick={addCone} 
          title="Adicionar Cone" 
          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg text-orange-500 transition-colors"
        >
          <Triangle className="w-4 h-4 fill-current" />
        </button>

        <button 
          onClick={addMiniGoal} 
          title="Adicionar Mini Baliza" 
          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          {/* Mini Baliza Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="1.5" />
            <line x1="6" y1="6" x2="6" y2="18" strokeDasharray="1.5 1.5" strokeWidth="1" />
            <line x1="10" y1="6" x2="10" y2="18" strokeDasharray="1.5 1.5" strokeWidth="1" />
            <line x1="14" y1="6" x2="14" y2="18" strokeDasharray="1.5 1.5" strokeWidth="1" />
            <line x1="18" y1="6" x2="18" y2="18" strokeDasharray="1.5 1.5" strokeWidth="1" />
            <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="1.5 1.5" strokeWidth="1" />
          </svg>
        </button>

        <button 
          onClick={addBall} 
          title="Adicionar Bola" 
          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg text-white transition-colors"
        >
          <div className="w-4 h-4 rounded-full border-2 border-slate-900 bg-white shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>
        </button>
      </div>

      {/* 4. Módulo de Gestão (Limpar Campo) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl px-2 py-1.5 flex items-center shadow-sm">
        <button 
          onClick={clearAll} 
          title="Limpar Campo e Repor Jogadores" 
          className="h-7 px-2.5 flex items-center gap-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors font-medium text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>
      </div>

    </div>
  );
}
