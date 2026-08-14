"use client"

import React, { useState } from "react";
import { 
  Play, Square, Circle, Triangle, PenTool, MousePointer2, 
  Trash2, RotateCcw, RotateCw, Save, Plus,
  Video, LocateFixed, GitMerge, FileText
} from "lucide-react";

import { TacticalElement } from "./types";
import { TacticalState } from "./types";
import { cn } from "@/lib/utils";

interface TacticalToolbarProps {
  state: TacticalState;
  setState: React.Dispatch<React.SetStateAction<TacticalState>>;
  uiTick: number;
  setUiTick: React.Dispatch<React.SetStateAction<number>>;
}

export function TacticalToolbar({ state, setState, uiTick, setUiTick }: TacticalToolbarProps) {
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 625;

  const getActiveElements = () => state.elements || [];

  const addPlayer = (team: "home" | "away") => {
    const elements = getActiveElements();
    
    const existingNumbers = elements.filter(e => e.type === team).map(e => e.number || 0);
    let num = 1;
    while(existingNumbers.includes(num)) num++;

    elements.push({
      id: (team === "home" ? "H" : "A") + Date.now() % 1000,
      type: team,
      number: num,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      color: team === "home" ? "#facc15" : "#3b82f6"
    });
    
    setState(prev => ({ ...prev, elements, ...INITIAL_STATE }));
    setUiTick(t => t + 1);
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
    
    setState(prev => ({ ...prev, elements, ...INITIAL_STATE }));
    setUiTick(t => t + 1);
  };

  const addCone = () => {
    getActiveElements().push({
      id: "C" + Date.now(),
      type: "cone",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
    
    setState(prev => ({ ...prev, elements, ...INITIAL_STATE }));
    setUiTick(t => t + 1);
  };

  const setDrawingMode = (mode: "select" | "run" | "pass" | "pen" | "rect") => {
    setState(prev => ({ ...prev, drawingMode: mode }));
    setUiTick(t => t + 1);
  };

  const clearDrawings = () => {
    setState(prev => ({ ...prev, drawings: [] }));
    setUiTick(t => t + 1);
  };

  const clearAll = () => {
    setState(prev => ({ ...prev, elements: [], drawings: [] }));
    setUiTick(t => t + 1);
  };

  return (
    <div className="w-[280px] flex flex-col gap-6 flex-shrink-0">
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

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desenho Tático</h3>
        <div className="flex gap-2">
          <button onClick={() => setDrawingMode('select')} className={`flex-1 rounded-xl py-2 flex items-center justify-center gap-2 transition font-medium text-sm ${state.drawingMode === 'select' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60'}`}>
            <MousePointer2 className="w-4 h-4" /> Mover Peça
          </button>
          <button onClick={() => undo} disabled={state.historyIndex <= 0} className="w-10 rounded-xl flex items-center justify-center bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60 disabled:opacity-30 transition">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => redo} disabled={state.historyIndex >= state.history.length - 1} className="w-10 rounded-xl flex items-center justify-center bg-[#131b2f] text-slate-400 hover:text-white border border-slate-800/60 disabled:opacity-30 transition">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-1">
          <button onClick={() => setDrawingMode('pen')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${state.drawingMode === 'pen' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
            <PenTool className="w-5 h-5" />
          </button>
          <button onClick={() => setDrawingMode('rect')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${state.drawingMode === 'rect' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
            <Square className="w-5 h-5" />
          </button>
          <button onClick={() => setDrawingMode('run')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${state.drawingMode === 'run' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => setDrawingMode('pass')} className={`rounded-lg aspect-square flex items-center justify-center transition border ${state.drawingMode === 'pass' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#131b2f] border-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
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

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
          A Minha Gaveta Tática <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300 font-normal">Cloud</span>
        </h3>
        <p className="text-xs text-slate-500">Guarda a jogada final no servidor.</p>
        {state.onSave && (
          <button onClick={() => {
            state.onSave({
              framesMap: state.framesMap,
              activePath: state.activePath,
              drawings: state.drawings,
              pitchStyle: state.pitchStyle
            });
          }} className="w-full bg-indigo-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition">
            <Save className="w-4 h-4" /> Gravar Tática
          </button>
        )}
      </div>
    </div>
  );
}