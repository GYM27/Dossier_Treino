"use client";

import React from "react";
import { Layers, Sliders, Palette, Sparkles, Square, Circle, Triangle, Hexagon } from "lucide-react";
import { TacticalDrawing, DrawingConfig } from "../types";
import { PRESET_STROKE_COLORS, STROKE_SIZES, OPACITY_PRESETS } from "./constants";
import { cn } from "@/lib/utils";

interface ShapeEditSectionProps {
  drawing: TacticalDrawing;
  drawingIndex: number;
  onUpdateDrawing: (index: number, updated: TacticalDrawing) => void;
}

export function ShapeEditSection({
  drawing,
  drawingIndex,
  onUpdateDrawing,
}: ShapeEditSectionProps) {
  const config: DrawingConfig = drawing.config || {
    color: "#00e5ff",
    fillColor: "#ef4444",
    size: 2,
    opacity: 100,
  };

  const currentType = drawing.type;

  const updateConfig = (key: keyof DrawingConfig, value: any) => {
    onUpdateDrawing(drawingIndex, {
      ...drawing,
      config: {
        ...(drawing.config || {}),
        [key]: value,
      },
    });
  };

  const setDrawingType = (type: any) => {
    onUpdateDrawing(drawingIndex, {
      ...drawing,
      type,
    });
  };

  return (
    <div className="space-y-4">
      {/* Geometria da Forma */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Geometria da Forma
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setDrawingType("rect")}
            className={cn(
              "py-2 flex items-center justify-center rounded-lg transition-all",
              currentType === "rect"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Retângulo"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDrawingType("circle")}
            className={cn(
              "py-2 flex items-center justify-center rounded-lg transition-all",
              currentType === "circle"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Círculo"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDrawingType("triangle")}
            className={cn(
              "py-2 flex items-center justify-center rounded-lg transition-all",
              currentType === "triangle"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Triângulo"
          >
            <Triangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDrawingType("hexagon")}
            className={cn(
              "py-2 flex items-center justify-center rounded-lg transition-all",
              currentType === "hexagon"
                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            title="Hexágono"
          >
            <Hexagon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Espessura do Traço */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Espessura do Contorno
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

      {/* Cor do Contorno */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Cor do Contorno
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
        </div>
      </div>

      {/* Cor de Preenchimento */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-rose-400" />
          Cor de Preenchimento (Fundo)
        </label>
        <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
          {PRESET_STROKE_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => updateConfig("fillColor", c.hex)}
              title={c.name}
              className={cn(
                "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                (config.fillColor || "#ef4444").toLowerCase() === c.hex.toLowerCase()
                  ? "border-rose-400 ring-2 ring-rose-400/50 scale-110"
                  : "border-slate-700"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Opacidade */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Opacidade do Preenchimento
          </label>
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            {config.opacity !== undefined ? config.opacity : 100}%
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {OPACITY_PRESETS.map((op) => (
            <button
              key={op}
              onClick={() => updateConfig("opacity", op)}
              className={cn(
                "py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center",
                (config.opacity !== undefined ? config.opacity : 100) === op
                  ? "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              )}
            >
              {op}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
