"use client";

import React from "react";
import { User, Maximize2, Palette } from "lucide-react";
import { TacticalElement } from "../types";
import { PRESET_PLAYER_COLORS } from "./constants";
import { cn } from "@/lib/utils";

interface PlayerEditSectionProps {
  element: TacticalElement;
  onUpdateElement: (updated: Partial<TacticalElement>) => void;
}

export function PlayerEditSection({ element, onUpdateElement }: PlayerEditSectionProps) {
  const currentLabel =
    element.label !== undefined
      ? element.label
      : element.number !== undefined
      ? String(element.number)
      : "";
  const currentColor =
    element.color || (element.type === "home" ? "#facc15" : "#3b82f6");
  const currentSize = element.size || "sm";

  return (
    <div className="space-y-4">
      {/* Número / Sigla do Jogador */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          Nº da Camisola ou Sigla
        </label>
        <input
          type="text"
          value={currentLabel}
          onChange={(e) => {
            const val = e.target.value;
            const num = parseInt(val, 10);
            onUpdateElement({
              label: val,
              number: isNaN(num) ? undefined : num,
            });
          }}
          placeholder="Ex: 7, 10, GR, C, MC..."
          maxLength={6}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-cyan-500 text-sm placeholder:text-slate-600 uppercase"
        />
      </div>

      {/* Dimensão do Marcador */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          Tamanho do Marcador
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onUpdateElement({ size: "sm" })}
            className={cn(
              "py-1.5 rounded-lg text-[11px] font-bold transition-all text-center",
              currentSize === "sm"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Pequeno (Ideal para 11x11)"
          >
            Pequeno
          </button>
          <button
            onClick={() => onUpdateElement({ size: "md" })}
            className={cn(
              "py-1.5 rounded-lg text-[11px] font-bold transition-all text-center",
              currentSize === "md"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Médio (Intermédio)"
          >
            Médio
          </button>
          <button
            onClick={() => onUpdateElement({ size: "lg" })}
            className={cn(
              "py-1.5 rounded-lg text-[11px] font-bold transition-all text-center",
              currentSize === "lg"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Grande (Destacado)"
          >
            Grande
          </button>
        </div>
      </div>

      {/* Cor da Camisola / Colete */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Cor do Equipamento / Colete
        </label>
        <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
          {PRESET_PLAYER_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdateElement({ color: c.hex })}
              title={c.name}
              className={cn(
                "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                currentColor.toLowerCase() === c.hex.toLowerCase()
                  ? "border-cyan-400 ring-2 ring-cyan-400/50 scale-110"
                  : "border-slate-700"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <label className="relative flex items-center cursor-pointer ml-auto">
            <div
              className="w-6 h-6 rounded-full border border-slate-600 shadow-sm flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-cyan-500"
              title="Cor Personalizada"
            />
            <input
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#facc15"}
              onChange={(e) => onUpdateElement({ color: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
