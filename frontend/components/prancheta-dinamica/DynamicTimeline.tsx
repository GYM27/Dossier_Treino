"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  GitBranch,
  Trash2,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import { TacticalTree, TacticalFrame } from "@/models/tacticplay";
import { cn } from "@/lib/utils";

export interface DynamicTimelineProps {
  tree: TacticalTree;
  isPlaying: boolean;
  transitionSpeed: number;
  onSelectFrame: (idx: number) => void;
  onTogglePlay: () => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  onAddFrame: () => void;
  onAddAlternative: (name: string) => void;
  onDeleteFrame: () => void;
  onChangeSpeed: (speedMs: number) => void;
  onUpdateNotes?: (notes: string) => void;
}

export function DynamicTimeline({
  tree,
  isPlaying,
  transitionSpeed,
  onSelectFrame,
  onTogglePlay,
  onPrevFrame,
  onNextFrame,
  onAddFrame,
  onAddAlternative,
  onDeleteFrame,
  onChangeSpeed,
  onUpdateNotes,
}: DynamicTimelineProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);
  const [altNameInput, setAltNameInput] = useState("");

  const currentFrameId = tree.activePath[tree.currentFrameIdx] || tree.rootId;
  const currentFrame: TacticalFrame = tree.framesMap[currentFrameId] || {
    id: "root",
    name: "Início",
    elements: [],
    drawings: [],
    children: [],
    parentId: null,
    notes: "",
  };

  const handleCreateAlternative = (e: React.FormEvent) => {
    e.preventDefault();
    if (altNameInput.trim()) {
      onAddAlternative(altNameInput.trim());
      setAltNameInput("");
      setIsAltModalOpen(false);
    }
  };

  return (
    <div className="w-full bg-[#0b1120]/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2">
      {/* Barra de Navegação e Nós da Linha do Tempo */}
      <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Lista de Keyframes (Nós) */}
        <div className="flex items-center gap-1.5 min-w-0">
          {tree.activePath.map((nodeId, idx) => {
            const node = tree.framesMap[nodeId];
            if (!node) return null;

            const isActive = idx === tree.currentFrameIdx;
            const hasMultipleBranches = node.children && node.children.length > 1;

            return (
              <React.Fragment key={nodeId}>
                <button
                  type="button"
                  onClick={() => onSelectFrame(idx)}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none border",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/10 scale-105"
                      : "bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isActive ? "bg-cyan-400 animate-pulse" : "bg-slate-600 group-hover:bg-slate-400"
                    )}
                  />
                  <span className="truncate max-w-[110px]">{node.name || `Quadro ${idx + 1}`}</span>

                  {/* Indicador de Ramificações */}
                  {hasMultipleBranches && (
                    <span
                      title="Este nó possui opções/ramificações alternativas"
                      className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30"
                    >
                      <GitBranch className="w-2.5 h-2.5 mr-0.5" />
                      {node.children.length}
                    </span>
                  )}
                </button>

                {idx < tree.activePath.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Controlos de Adição de Quadros e Alternativas */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onAddFrame}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Adicionar novo quadro sequencial à jogada"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inserir Quadro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAltModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Criar alternativa ou ramificação tática a partir do quadro selecionado"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar Alternativa</span>
          </button>

          <button
            type="button"
            onClick={onDeleteFrame}
            disabled={currentFrameId === "root"}
            className={cn(
              "flex items-center justify-center p-1.5 rounded-xl border text-xs transition-all",
              currentFrameId === "root"
                ? "opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600"
                : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 hover:text-rose-300 active:scale-95"
            )}
            title="Eliminar o quadro atualmente selecionado"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Barra Inferior: Controlos de Playback, Velocidade e Anotações */}
      <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        {/* Controlo de Playback */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevFrame}
            disabled={tree.currentFrameIdx === 0}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all"
            title="Quadro Anterior"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5",
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            )}
            title={isPlaying ? "Pausar Animação" : "Reproduzir Animação"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausa</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextFrame}
            disabled={tree.currentFrameIdx >= tree.activePath.length - 1}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all"
            title="Próximo Quadro"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Velocidade e Notas */}
        <div className="flex items-center gap-2">
          {/* Seletor de Velocidade */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-xl text-xs text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <select
              value={transitionSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              aria-label="Velocidade de Transição"
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value={800} className="bg-slate-900 text-slate-200">
                0.8s (Rápido)
              </option>
              <option value={1200} className="bg-slate-900 text-slate-200">
                1.2s
              </option>
              <option value={1500} className="bg-slate-900 text-slate-200">
                1.5s (Padrão)
              </option>
              <option value={2000} className="bg-slate-900 text-slate-200">
                2.0s
              </option>
              <option value={3000} className="bg-slate-900 text-slate-200">
                3.0s (Didático)
              </option>
            </select>
          </div>

          {/* Botão de Anotações */}
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all",
              showNotes || (currentFrame.notes && currentFrame.notes.trim().length > 0)
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            )}
            title="Anotações metodológicas do quadro atual"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notas</span>
          </button>
        </div>
      </div>

      {/* Caixa de Texto Expansível para Notas Metodológicas */}
      {showNotes && (
        <div className="w-full mt-1 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Instruções & Objetivos Táticos deste Quadro ({currentFrame.name}):
          </label>
          <textarea
            value={currentFrame.notes || ""}
            onChange={(e) => onUpdateNotes && onUpdateNotes(e.target.value)}
            placeholder="Ex: 'O médio centro #8 ataca o espaço entre linhas enquanto o extremo #7 arrasta o lateral...'"
            rows={2}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
          />
        </div>
      )}

      {/* Modal / Diálogo Rápido para Criar Alternativa */}
      {isAltModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>Nova Alternativa / Ramificação</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Insere um nome descritivo para esta opção tática (ex: &quot;Passe de Rutura&quot;, &quot;Cruzamento 2º Poste&quot;).
            </p>
            <form onSubmit={handleCreateAlternative} className="flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                value={altNameInput}
                onChange={(e) => setAltNameInput(e.target.value)}
                placeholder="Ex: Opção B - Passe Interior"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAltModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!altNameInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Criar Ramificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
