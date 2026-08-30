"use client";

import React from "react";
import {
  MousePointer,
  ArrowRight,
  TrendingUp,
  Square,
  Circle,
  Triangle,
  CircleDot,
  Cone,
  Eraser,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  LayoutTemplate,
  Grid,
} from "lucide-react";
import { DrawingMode, PitchStyle } from "./hooks/useTacticalPlay";
import { cn } from "@/lib/utils";

export interface DynamicToolbarProps {
  drawingMode: DrawingMode;
  pitchStyle: PitchStyle;
  isEditMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSetDrawingMode: (mode: DrawingMode) => void;
  onSetPitchStyle: (style: PitchStyle) => void;
  onToggleEditMode: () => void;
  onAddPlayer: (team: "home" | "away") => void;
  onAddBall: () => void;
  onAddCone: () => void;
  onClearDrawings: () => void;
  onLoadPreset: (preset: "bench" | "4-3-3" | "4-4-2") => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function DynamicToolbar({
  drawingMode,
  pitchStyle,
  isEditMode,
  canUndo,
  canRedo,
  onSetDrawingMode,
  onSetPitchStyle,
  onToggleEditMode,
  onAddPlayer,
  onAddBall,
  onAddCone,
  onClearDrawings,
  onLoadPreset,
  onUndo,
  onRedo,
}: DynamicToolbarProps) {
  return (
    <aside className="w-full lg:w-48 bg-[#0b1120]/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl flex flex-row lg:flex-col gap-3 justify-between lg:justify-start shrink-0 overflow-x-auto">
      {/* Secção: Ferramentas de Seleção e Traço */}
      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Ferramentas
        </span>
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onSetDrawingMode("select")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "select"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Modo Seleção"
          >
            <MousePointer className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Mover</span>
          </button>

          <button
            type="button"
            onClick={() => onSetDrawingMode("pass")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "pass"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Traçar Linha de Passe"
          >
            <ArrowRight className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Passe</span>
          </button>

          <button
            type="button"
            onClick={() => onSetDrawingMode("run")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "run"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Traçar Linha de Corrida"
          >
            <TrendingUp className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Corrida</span>
          </button>

          <button
            type="button"
            onClick={() => onSetDrawingMode("rect")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "rect"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Quadrado / Retângulo"
          >
            <Square className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Quadrado</span>
          </button>

          <button
            type="button"
            onClick={() => onSetDrawingMode("circle")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "circle"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Círculo"
          >
            <Circle className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Círculo</span>
          </button>

          <button
            type="button"
            onClick={() => onSetDrawingMode("triangle")}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border",
              drawingMode === "triangle"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Triângulo"
          >
            <Triangle className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Triângulo</span>
          </button>

          <button
            type="button"
            onClick={onClearDrawings}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold transition-all"
            title="Limpar Linhas e Formas Táticas"
          >
            <Eraser className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Limpar</span>
          </button>
        </div>
      </div>

      {/* Secção: Peças no Campo */}
      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Peças
        </span>
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onAddPlayer("home")}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-xs font-semibold transition-all hover:bg-slate-800"
            title="Adicionar Jogador Equipa Principal (Amarelo)"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-slate-900 shrink-0" />
            <span className="text-[10px]">Casa</span>
          </button>

          <button
            type="button"
            onClick={() => onAddPlayer("away")}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 text-slate-300 text-xs font-semibold transition-all hover:bg-slate-800"
            title="Adicionar Jogador Equipa Adversária (Azul)"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-slate-900 shrink-0" />
            <span className="text-[10px]">Fora</span>
          </button>

          <button
            type="button"
            onClick={onAddBall}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 text-slate-300 text-xs font-semibold transition-all hover:bg-slate-800"
            title="Adicionar Bola de Futebol"
          >
            <CircleDot className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-[10px]">Bola</span>
          </button>

          <button
            type="button"
            onClick={onAddCone}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 text-slate-300 text-xs font-semibold transition-all hover:bg-slate-800"
            title="Adicionar Cone / Obstáculo"
          >
            <Cone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-[10px]">Cone</span>
          </button>
        </div>
      </div>

      {/* Secção: Campo & Predefinições */}
      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Campo & Táticas
        </span>
        <div className="flex flex-col gap-1">
          <select
            value={pitchStyle}
            onChange={(e) => onSetPitchStyle(e.target.value as PitchStyle)}
            aria-label="Tipo de Campo"
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="full">Campo Completo</option>
            <option value="half">Meio Campo</option>
          </select>

          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onLoadPreset(e.target.value as "bench" | "4-3-3" | "4-4-2");
                e.target.value = "";
              }
            }}
            aria-label="Carregar Predefinição Tática"
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="" disabled>
              Tática Predefinida...
            </option>
            <option value="bench">Banco Lateral (22)</option>
            <option value="4-3-3">Disposição 4-3-3</option>
          </select>
        </div>
      </div>

      {/* Secção: Histórico Undo / Redo */}
      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all text-xs"
          title="Desfazer Ação (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5 mr-1" />
          <span className="text-[10px]">Undo</span>
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all text-xs"
          title="Refazer Ação (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5 mr-1" />
          <span className="text-[10px]">Redo</span>
        </button>
      </div>
    </aside>
  );
}
