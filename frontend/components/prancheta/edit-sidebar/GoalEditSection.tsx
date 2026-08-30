"use client";

import React from "react";
import { Maximize2, RotateCw, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";
import { TacticalElement } from "../types";
import { cn } from "@/lib/utils";

interface GoalEditSectionProps {
  element: TacticalElement;
  onUpdateElement: (updated: Partial<TacticalElement>) => void;
  onRotateElement: (newAngle: number) => void;
}

export function GoalEditSection({
  element,
  onUpdateElement,
  onRotateElement,
}: GoalEditSectionProps) {
  const currentRotation = element.rotation || 0;
  const currentGoalSize = element.goalSize || "mini";
  const deg = Math.round(((currentRotation % (Math.PI * 2)) * 180) / Math.PI);
  const normalizedDeg = deg < 0 ? deg + 360 : deg;

  return (
    <div className="space-y-4">
      {/* Dimensão da Baliza */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          Tipo de Baliza
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onUpdateElement({ goalSize: "mini" })}
            className={cn(
              "py-2 rounded-lg text-[11px] font-bold transition-all text-center",
              currentGoalSize === "mini"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Mini Baliza de Precisão"
          >
            Mini
          </button>
          <button
            onClick={() => onUpdateElement({ goalSize: "fut7" })}
            className={cn(
              "py-2 rounded-lg text-[11px] font-bold transition-all text-center",
              currentGoalSize === "fut7"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Baliza Futebol 7 (6x2m)"
          >
            Fut 7
          </button>
          <button
            onClick={() => onUpdateElement({ goalSize: "fut11" })}
            className={cn(
              "py-2 rounded-lg text-[11px] font-bold transition-all text-center",
              currentGoalSize === "fut11"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Baliza Futebol 11 (Oficial)"
          >
            Fut 11
          </button>
        </div>
      </div>

      {/* Rotação e Orientação */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            Orientação da Baliza
          </label>
          <button
            onClick={() => onRotateElement((currentRotation + Math.PI / 2) % (Math.PI * 2))}
            className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-lg transition-colors flex items-center gap-1 text-[10px]"
            title="Rodar 90° (Atalho: R)"
          >
            <RotateCw className="w-3 h-3" />
            +90° (R)
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onRotateElement(0)}
            title="Virada para Baixo ⬇️"
            className={cn(
              "py-1.5 flex items-center justify-center rounded-lg transition-all",
              normalizedDeg === 0
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRotateElement(Math.PI / 2)}
            title="Virada para a Esquerda ⬅️"
            className={cn(
              "py-1.5 flex items-center justify-center rounded-lg transition-all",
              normalizedDeg === 90
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRotateElement(Math.PI)}
            title="Virada para Cima ⬆️"
            className={cn(
              "py-1.5 flex items-center justify-center rounded-lg transition-all",
              normalizedDeg === 180
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRotateElement((3 * Math.PI) / 2)}
            title="Virada para a Direita ➡️"
            className={cn(
              "py-1.5 flex items-center justify-center rounded-lg transition-all",
              normalizedDeg === 270
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
