"use client";

import React from "react";
import { RotateCw, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Copy, Trash2, Maximize2 } from "lucide-react";
import { TacticalElement } from "./types";
import { cn } from "@/lib/utils";

interface TacticalGoalFloatingBarProps {
  element: TacticalElement;
  onRotate: (newAngle: number) => void;
  onSetSize: (size: "mini" | "fut7" | "fut11") => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TacticalGoalFloatingBar({
  element,
  onRotate,
  onSetSize,
  onDuplicate,
  onDelete,
}: TacticalGoalFloatingBarProps) {
  const currentRotation = element.rotation || 0;
  const currentSize = element.goalSize || "mini";

  // Normalized rotation in degrees (0, 90, 180, 270)
  const deg = Math.round(((currentRotation % (Math.PI * 2)) * 180) / Math.PI);
  const normalizedDeg = deg < 0 ? deg + 360 : deg;

  const rotateByStep = () => {
    onRotate((currentRotation + Math.PI / 2) % (Math.PI * 2));
  };

  return (
    <div className="relative w-[380px] bg-[#1e293b] text-slate-200 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 px-3 flex flex-col gap-2 text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      {/* Bottom pointer arrow */}
      <div className="w-3 h-3 bg-[#1e293b] border-r border-b border-slate-700/80 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />

      {/* Row 1: Tamanho da Baliza (Mini / Fut 7 / Fut 11) + Ações */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            Dimensão
          </span>
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onSetSize("mini")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                currentSize === "mini"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Mini Baliza (Treino / Precisão)"
            >
              Mini
            </button>
            <button
              onClick={() => onSetSize("fut7")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                currentSize === "fut7"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Baliza Futebol 7 (6x2m)"
            >
              Fut 7
            </button>
            <button
              onClick={() => onSetSize("fut11")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                currentSize === "fut11"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Baliza Regulamentar Futebol 11 (7.32x2.44m)"
            >
              Fut 11
            </button>
          </div>
        </div>

        {/* Ações: Duplicar / Eliminar */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            title="Duplicar Baliza (Ctrl+C / Ctrl+V)"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Eliminar Baliza (Delete)"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-slate-700/60" />

      {/* Row 2: Rotação (+90° e 4 Direções) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            Orientação
          </span>
          <button
            onClick={rotateByStep}
            title="Rodar 90° no Sentido Horário (Atalho: R)"
            className="px-2 h-6 bg-slate-900 border border-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-lg transition-colors flex items-center gap-1 text-[10px]"
          >
            <RotateCw className="w-3 h-3" />
            +90°
          </button>
        </div>

        {/* 4 Direções */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => onRotate(0)}
            title="Virada para Baixo ⬇️"
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              normalizedDeg === 0 ? "bg-cyan-500 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRotate(Math.PI / 2)}
            title="Virada para a Esquerda ⬅️"
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              normalizedDeg === 90 ? "bg-cyan-500 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRotate(Math.PI)}
            title="Virada para Cima ⬆️"
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              normalizedDeg === 180 ? "bg-cyan-500 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRotate((3 * Math.PI) / 2)}
            title="Virada para a Direita ➡️"
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              normalizedDeg === 270 ? "bg-cyan-500 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
