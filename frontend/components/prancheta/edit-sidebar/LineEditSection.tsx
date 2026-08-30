"use client";

import React from "react";
import { Layers, Split, Sliders, Palette } from "lucide-react";
import { TacticalDrawing, DrawingConfig } from "../types";
import { PRESET_STROKE_COLORS, STROKE_SIZES } from "./constants";
import { cn } from "@/lib/utils";

interface LineEditSectionProps {
  drawing: TacticalDrawing;
  drawingIndex: number;
  onUpdateDrawing: (index: number, updated: TacticalDrawing) => void;
}

export function LineEditSection({
  drawing,
  drawingIndex,
  onUpdateDrawing,
}: LineEditSectionProps) {
  const config: DrawingConfig = drawing.config || {
    color: "#00e5ff",
    size: 2,
    lineStyle: "solid",
  };

  const currentType = drawing.type;
  const lineStyle = config.lineStyle || "solid";

  const updateConfig = (key: keyof DrawingConfig, value: any) => {
    onUpdateDrawing(drawingIndex, {
      ...drawing,
      config: {
        ...(drawing.config || {}),
        [key]: value,
      },
    });
  };

  const setDrawingType = (type: any, defaultLineStyle?: "solid" | "dashed") => {
    onUpdateDrawing(drawingIndex, {
      ...drawing,
      type,
      config: {
        ...(drawing.config || {}),
        ...(defaultLineStyle ? { lineStyle: defaultLineStyle } : {}),
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tipo de Linha */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Tipo de Linha
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setDrawingType("line", "solid")}
            className={cn(
              "py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center",
              currentType === "line"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Linha Simples"
          >
            Simples
          </button>
          <button
            onClick={() => setDrawingType("pass", "dashed")}
            className={cn(
              "py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center",
              currentType === "pass"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Passe Tracejado com Seta"
          >
            Passe
          </button>
          <button
            onClick={() => setDrawingType("run", "solid")}
            className={cn(
              "py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center",
              currentType === "run"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Deslocamento / Corrida"
          >
            Seta
          </button>
          <button
            onClick={() => setDrawingType("pen", "solid")}
            className={cn(
              "py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center",
              currentType === "pen"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Desenho Livre"
          >
            Livre
          </button>
        </div>
      </div>

      {/* Estilo da Linha (Contínua vs Tracejada) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Split className="w-3.5 h-3.5 text-cyan-400" />
          Estilo da Linha
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => updateConfig("lineStyle", "solid")}
            className={cn(
              "py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-2",
              lineStyle === "solid"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <div className="w-4 h-0 border-t-2 border-solid border-current" />
            <span>Contínua</span>
          </button>
          <button
            onClick={() => updateConfig("lineStyle", "dashed")}
            className={cn(
              "py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-2",
              lineStyle === "dashed"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <div className="w-4 h-0 border-t-2 border-dashed border-current" />
            <span>Tracejada</span>
          </button>
        </div>
      </div>

      {/* Espessura do Traço */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Espessura do Traço
          </label>
          <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            {config.size || 2}px
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {STROKE_SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => updateConfig("size", sz)}
              className={cn(
                "py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5",
                (config.size || 2) === sz
                  ? "bg-cyan-500 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              )}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(8, sz + 2), height: Math.min(8, sz + 2) }}
              />
              <span>{sz}px</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cor do Traço */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Cor do Traço
        </label>
        <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
          {PRESET_STROKE_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => updateConfig("color", c.hex)}
              title={c.name}
              className={cn(
                "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                (config.color || "#00e5ff").toLowerCase() === c.hex.toLowerCase()
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
              value={config.color || "#00e5ff"}
              onChange={(e) => updateConfig("color", e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
