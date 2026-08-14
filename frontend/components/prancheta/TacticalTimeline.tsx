"use client"

import React from "react";
import { Play, LocateFixed, GitMerge, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TacticalTimelineProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

export function TacticalTimeline({ state, setState }: TacticalTimelineProps) {
  const addFrame = () => {
    // Logic to add a new frame
    setState(prev => ({ ...prev }));
  };

  const deleteFrame = () => {
    // Logic to delete current frame
    setState(prev => ({ ...prev }));
  };

  const playAnimation = () => {
    setState(prev => ({ 
      ...prev, 
      isPlaying: true,
      currentFrameIdx: 0,
      playbackStartTime: performance.now()
    }));
  };

  return (
    <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/60 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={playAnimation} disabled={state.activePath.length <= 1 || state.isPlaying} className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </button>
          
          <div className="flex items-center bg-[#131b2f] rounded-lg border border-slate-800/60 p-1">
            <button 
              onClick={() => setState(prev => ({ ...prev, currentFrameIdx: prev.currentFrameIdx > 0 ? prev.currentFrameIdx - 1 : 0 }))}
              disabled={state.currentFrameIdx === 0}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
            </button>
            <div className="px-3 text-xs font-bold text-white whitespace-nowrap">
              Quadro {state.currentFrameIdx + 1}/{state.activePath.length}
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, currentFrameIdx: prev.currentFrameIdx < state.activePath.length - 1 ? prev.currentFrameIdx + 1 : prev.activePath.length - 1 }))}
              disabled={state.currentFrameIdx >= state.activePath.length - 1}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Vel. Transição</span>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={state.transitionSpeed}
            onChange={(e) => setState(prev => ({ ...prev, transitionSpeed: parseInt(e.target.value) }))}
            className="w-24 accent-emerald-500"
          />
          <span className="text-right w-8">{((state.transitionSpeed||1500)/1000).toFixed(1)}s</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={addFrame} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-900/20">
          <Plus className="w-4 h-4" /> Adicionar Quadro (Frame)
        </button>
        <button disabled className="bg-[#131b2f] text-slate-500 border border-slate-800/60 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed">
          <GitMerge className="w-4 h-4" /> Alternativa
        </button>
        <button onClick={deleteFrame} disabled={state.currentFrameIdx === 0} className="w-9 h-9 flex items-center justify-center bg-[#131b2f] border border-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 rounded-lg disabled:opacity-30 transition ml-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <LocateFixed className="w-3.5 h-3.5" /> Linha do Tempo da Jogada
          </h3>
          <span className="text-[10px] text-slate-600">Clica num quadro para saltar</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {/* Timeline frames would be rendered here */}
        </div>
      </div>
    </div>
  );
}