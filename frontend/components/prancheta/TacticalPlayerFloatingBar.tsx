"use client";

import React from "react";
import { Copy, Trash2, User, Palette, Maximize2 } from "lucide-react";
import { TacticalElement } from "./types";
import { cn } from "@/lib/utils";

interface TacticalPlayerFloatingBarProps {
  element: TacticalElement;
  onUpdate: (updated: Partial<TacticalElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const PRESET_COLORS = [
  { name: "Amarelo", hex: "#facc15" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Vermelho (Coringa/Neutro)", hex: "#ef4444" },
  { name: "Verde", hex: "#10b981" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Branco", hex: "#ffffff" },
  { name: "Preto", hex: "#0f172a" },
];

export function TacticalPlayerFloatingBar({
  element,
  onUpdate,
  onDuplicate,
  onDelete,
}: TacticalPlayerFloatingBarProps) {
  const currentLabel = element.label !== undefined ? element.label : element.number !== undefined ? String(element.number) : "";
  const currentColor = element.color || (element.type === "home" ? "#facc15" : "#3b82f6");
  const currentSize = element.size || "lg";

  return (
    <div className="relative w-[400px] bg-[#1e293b] text-slate-200 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 px-3 flex flex-col gap-2 text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      {/* Bottom pointer arrow */}
      <div className="w-3 h-3 bg-[#1e293b] border-r border-b border-slate-700/80 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />

      {/* Row 1: Nome/Nº + Tamanho + Ações */}
      <div className="flex items-center justify-between gap-2">
        {/* Nome / Nº input */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1 shrink-0">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Nº/Sigla
          </span>
          <input
            type="text"
            value={currentLabel}
            onChange={(e) => {
              const val = e.target.value;
              const num = parseInt(val);
              onUpdate({
                label: val,
                number: isNaN(num) ? undefined : num,
              });
            }}
            placeholder="7, GR, C..."
            maxLength={6}
            className="w-20 bg-slate-950 border border-slate-700/90 rounded-lg px-2 py-0.5 text-slate-200 font-bold outline-none focus:border-cyan-500 text-xs placeholder:text-slate-600 uppercase"
          />
        </div>

        {/* Tamanho do Jogador (Pequeno / Médio / Grande) */}
        <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => onUpdate({ size: "sm" })}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all",
              currentSize === "sm"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Pequeno (Ideal para 11x11 ou muitos jogadores)"
          >
            Pequeno
          </button>
          <button
            onClick={() => onUpdate({ size: "md" })}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all",
              currentSize === "md"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Médio (Intermédio)"
          >
            Médio
          </button>
          <button
            onClick={() => onUpdate({ size: "lg" })}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all",
              currentSize === "lg"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Grande (Padrão tático destacado)"
          >
            Grande
          </button>
        </div>

        {/* Ações: Duplicar / Eliminar */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            title="Duplicar Jogador (Ctrl+C / Ctrl+V)"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Eliminar Jogador (Delete)"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-slate-700/60" />

      {/* Row 2: Cores Rápidas + Color Picker */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1 shrink-0">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Cor / Colete
        </span>

        {/* Preset color swatches */}
        <div className="flex items-center gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdate({ color: c.hex })}
              title={c.name}
              className={cn(
                "w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                currentColor.toLowerCase() === c.hex.toLowerCase()
                  ? "border-cyan-400 ring-2 ring-cyan-400/50 scale-110"
                  : "border-slate-600"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}

          {/* Custom color picker */}
          <label className="relative flex items-center cursor-pointer ml-1">
            <div
              className="w-5 h-5 rounded-full border border-slate-500 shadow-sm flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-cyan-500"
              title="Cor Personalizada"
            />
            <input
              type="color"
              value={currentColor.startsWith("#") ? currentColor : "#facc15"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
