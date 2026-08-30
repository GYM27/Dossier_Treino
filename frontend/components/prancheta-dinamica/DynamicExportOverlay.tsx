"use client";

import React from "react";
import { Video, Square, Sparkles } from "lucide-react";

export interface DynamicExportOverlayProps {
  isRecording: boolean;
  progress: number;
  onCancel?: () => void;
}

export function DynamicExportOverlay({
  isRecording,
  progress,
  onCancel,
}: DynamicExportOverlayProps) {
  if (!isRecording) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Indicador pulsante de gravação */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30">
          <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-30 animate-ping" />
          <Video className="w-6 h-6 text-rose-400 animate-pulse" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
            <span>A Renderizar e Gravar Vídeo</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Por favor, aguarda enquanto a animação completa é compilada em alta definição (.webm).
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 px-1">
          <span>Progresso</span>
          <span className="text-emerald-400 font-mono text-sm">{progress}%</span>
        </div>

        {/* Botão de Cancelar */}
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelar Gravação</span>
          </button>
        )}
      </div>
    </div>
  );
}
