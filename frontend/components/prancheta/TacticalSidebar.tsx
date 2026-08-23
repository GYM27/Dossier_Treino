"use client";

import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Save,
  ChevronRight,
  ChevronLeft,
  FileText,
  Target,
  Zap,
} from "lucide-react";
import { TacticalState } from "./types";
import { cn } from "@/lib/utils";

interface TacticalSidebarProps {
  state: TacticalState;
  setState: React.Dispatch<React.SetStateAction<TacticalState>>;
  uiTick: number;
  setUiTick: React.Dispatch<React.SetStateAction<number>>;
  onSave?: (data: any) => void;
}

export function TacticalSidebar({
  state,
  setState,
  uiTick,
  setUiTick,
  onSave,
}: TacticalSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(true);

  const handleUndo = () => {
    if (state.historyIndex > 0) {
      const newIdx = state.historyIndex - 1;
      const snapshot = state.history[newIdx];
      setState((prev) => ({
        ...prev,
        historyIndex: newIdx,
        framesMap: JSON.parse(JSON.stringify(snapshot.framesMap)),
        activePath: JSON.parse(JSON.stringify(snapshot.activePath)),
        drawings: JSON.parse(JSON.stringify(snapshot.drawings || [])),
      }));
      setUiTick((t) => t + 1);
    }
  };

  const handleRedo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIdx = state.historyIndex + 1;
      const snapshot = state.history[newIdx];
      setState((prev) => ({
        ...prev,
        historyIndex: newIdx,
        framesMap: JSON.parse(JSON.stringify(snapshot.framesMap)),
        activePath: JSON.parse(JSON.stringify(snapshot.activePath)),
        drawings: JSON.parse(JSON.stringify(snapshot.drawings || [])),
      }));
      setUiTick((t) => t + 1);
    }
  };

  const handleChange = (field: keyof TacticalState, value: any) => {
    setState((prev) => ({ ...prev, [field]: value }));
    setUiTick((t) => t + 1);
  };

  return (
    <div
      className={cn(
        "bg-[#131b2f] border-l border-slate-800 flex flex-col h-full rounded-r-2xl overflow-hidden transition-all duration-300 shadow-xl",
        isMinimized ? "w-12" : "w-80",
      )}
    >
      {/* Top Header */}
      <div
        className={cn(
          "flex items-center p-3 border-b border-slate-800 bg-[#0a0f1c]",
          isMinimized ? "flex-col gap-3" : "justify-between gap-2",
        )}
      >
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          title={isMinimized ? "Expandir Painel" : "Minimizar Painel"}
        >
          {isMinimized ? (
            <ChevronLeft className="w-5 h-5 rotate-180" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        <div
          className={cn(
            "flex items-center gap-1.5",
            isMinimized ? "flex-col" : "",
          )}
        >
          <button
            onClick={handleUndo}
            disabled={state.historyIndex <= 0}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25 rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={state.historyIndex >= state.history.length - 1}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25 rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSave && onSave(state)}
            className={cn(
              "bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-lg uppercase shrink-0 flex items-center justify-center shadow-sm transition-all",
              isMinimized ? "w-7 h-7" : "px-3.5 py-1.5 ml-1.5",
            )}
            title="Guardar Tática"
          >
            {isMinimized ? <Save className="w-3.5 h-3.5" /> : "Guardar"}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs text-slate-300">
          
          {/* 1. Objetivo(s) Específico(s) */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 font-bold text-cyan-400 text-xs uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Objetivo(s) Específico(s)
            </label>
            <textarea
              rows={4}
              value={state.objetivoEspecifico || ""}
              onChange={(e) =>
                handleChange("objetivoEspecifico", e.target.value)
              }
              placeholder="Ex: Trabalho de transição ofensiva rápida, circulação em apoio e finalização no último terço..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed transition-colors text-xs"
            />
          </div>

          {/* 2. Carga / Dosagem */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Carga / Séries / Pausas
            </label>
            <textarea
              rows={3}
              value={state.carga || ""}
              onChange={(e) =>
                handleChange("carga", e.target.value)
              }
              placeholder="Ex: 4 x 6 repetições por jogador (1 minuto de pausa ativa entre séries)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed transition-colors text-xs"
            />
          </div>

          {/* 3. Descrição e Organização Metodológica */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="flex items-center gap-2 font-bold text-slate-300 text-xs uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Descrição e Organização Metodológica
            </label>
            <textarea
              rows={6}
              value={state.descricaoMetodologica || ""}
              onChange={(e) =>
                handleChange("descricaoMetodologica", e.target.value)
              }
              placeholder="Ex: Exercício em espaço reduzido com 2 equipas de 7 jogadores + 2 jokers exteriores. A equipa em posse tem de realizar 6 passes antes de poder variar o centro de jogo..."
              className="w-full flex-1 min-h-[120px] bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed transition-colors text-xs"
            />
          </div>

        </div>
      )}
    </div>
  );
}
