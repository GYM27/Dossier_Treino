"use client"

import React from "react";
import { 
  Square, Circle, Triangle, Hexagon, ChevronDown, Trash2
} from "lucide-react";
import { TacticalDrawing, DrawingConfig } from "./types";
import { cn } from "@/lib/utils";

interface TacticalShapeFloatingBarProps {
  drawing: TacticalDrawing;
  drawingIndex: number;
  onUpdate: (index: number, updated: TacticalDrawing) => void;
  onDelete: (index: number) => void;
}

// Custom Pentagon Icon
function PentagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 22 8.5 18 21 6 21 2 8.5 12 2" />
    </svg>
  );
}

export function TacticalShapeFloatingBar({
  drawing,
  drawingIndex,
  onUpdate,
  onDelete,
}: TacticalShapeFloatingBarProps) {
  const config: DrawingConfig = drawing.config || {
    color: "#000000",
    fillColor: "#ef4444",
    size: 2,
    opacity: 100,
    lineStyle: "solid",
  };

  const setShapeType = (type: any) => {
    onUpdate(drawingIndex, {
      ...drawing,
      type,
    });
  };

  const updateConfig = (key: keyof DrawingConfig, value: any) => {
    onUpdate(drawingIndex, {
      ...drawing,
      config: {
        ...(drawing.config || {}),
        [key]: value,
      },
    });
  };

  const currentType = drawing.type;
  const lineStyle = config.lineStyle || "solid";

  const isLine = currentType === "run" || currentType === "pass" || currentType === "pen" || currentType === "line";

  return (
    <div className="relative w-[380px] bg-[#1e293b] text-slate-200 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 px-3 flex flex-col gap-2 text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      
      {/* Bottom pointer arrow */}
      <div className="w-3 h-3 bg-[#1e293b] border-r border-b border-slate-700/80 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />

      {/* Row 1: Forma / Tipo, Linha, Cor de linha */}
      <div className="flex items-center justify-between gap-2">
        {/* Forma / Tipo */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px]">
            {isLine ? "Tipo" : "Forma"}
          </span>
          <div className="flex items-center gap-1">
            {isLine ? (
              <>
                <button
                  onClick={() => {
                    onUpdate(drawingIndex, {
                      ...drawing,
                      type: "line",
                      config: { ...(drawing.config || {}), lineStyle: "solid" },
                    });
                  }}
                  className={cn(
                    "px-2 h-6 flex items-center justify-center rounded transition-colors text-[11px] font-medium",
                    currentType === "line"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Linha Simples"
                >
                  Simples
                </button>
                <button
                  onClick={() => {
                    onUpdate(drawingIndex, {
                      ...drawing,
                      type: "run",
                      config: { ...(drawing.config || {}), lineStyle: "solid" },
                    });
                  }}
                  className={cn(
                    "px-2 h-6 flex items-center justify-center rounded transition-colors text-[11px] font-medium",
                    currentType === "run"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Deslocamento com Seta"
                >
                  Seta
                </button>
                <button
                  onClick={() => {
                    onUpdate(drawingIndex, {
                      ...drawing,
                      type: "pass",
                      config: { ...(drawing.config || {}), lineStyle: "dashed" },
                    });
                  }}
                  className={cn(
                    "px-2 h-6 flex items-center justify-center rounded transition-colors text-[11px] font-medium",
                    currentType === "pass"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Passe com Seta Tracejada"
                >
                  Passe
                </button>
                <button
                  onClick={() => {
                    onUpdate(drawingIndex, {
                      ...drawing,
                      type: "pen",
                      config: { ...(drawing.config || {}), lineStyle: "solid" },
                    });
                  }}
                  className={cn(
                    "px-2 h-6 flex items-center justify-center rounded transition-colors text-[11px] font-medium",
                    currentType === "pen"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Desenho Livre"
                >
                  Livre
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShapeType("rect")}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded transition-colors",
                    currentType === "rect"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Quadrado / Retângulo"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShapeType("circle")}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded transition-colors",
                    currentType === "circle"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Círculo"
                >
                  <Circle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShapeType("triangle")}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded transition-colors",
                    currentType === "triangle"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Triângulo"
                >
                  <Triangle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShapeType("pentagon")}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded transition-colors",
                    currentType === "pentagon"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Pentágono"
                >
                  <PentagonIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShapeType("hexagon")}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded transition-colors",
                    currentType === "hexagon"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-700 text-slate-400"
                  )}
                  title="Hexágono"
                >
                  <Hexagon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* Linha */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px]">Linha</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateConfig("lineStyle", "solid")}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded transition-colors",
                lineStyle === "solid"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "hover:bg-slate-700 text-slate-400"
              )}
              title="Linha Contínua"
            >
              <div className="w-3.5 h-0 border-t-2 border-solid border-current" />
            </button>
            <button
              onClick={() => updateConfig("lineStyle", "dashed")}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded transition-colors",
                lineStyle === "dashed"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "hover:bg-slate-700 text-slate-400"
              )}
              title="Linha Tracejada"
            >
              <div className="w-3.5 h-0 border-t-2 border-dashed border-current" />
            </button>
          </div>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* Cor de linha */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px]">Cor</span>
          <label className="relative flex items-center cursor-pointer">
            <div
              className="w-5 h-5 rounded-full border border-slate-500 shadow-sm"
              style={{ backgroundColor: config.color || "#000000" }}
            />
            <input
              type="color"
              value={config.color || "#000000"}
              onChange={(e) => updateConfig("color", e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Row 2: Espessura, Cor de fundo (ou N/A), Opacidade, Eliminar */}
      <div className="flex items-center justify-between gap-2">
        {/* Espessura */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px]">Espessura</span>
          <div className="relative">
            <select
              value={config.size || 2}
              onChange={(e) => updateConfig("size", parseInt(e.target.value) || 1)}
              className="appearance-none bg-slate-900 border border-slate-700 rounded px-2 py-0.5 pr-5 text-white font-medium outline-none focus:border-cyan-500 text-xs"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* Cor de fundo */}
        <div className={cn("flex items-center gap-1.5", isLine && "opacity-30 pointer-events-none")}>
          <span className="font-semibold text-slate-300 text-[11px]">Fundo</span>
          <label className="relative flex items-center cursor-pointer">
            <div
              className="w-5 h-5 rounded-full border border-slate-500 shadow-sm"
              style={{ backgroundColor: config.fillColor || "#ef4444" }}
            />
            <input
              type="color"
              disabled={isLine}
              value={config.fillColor || "#ef4444"}
              onChange={(e) => updateConfig("fillColor", e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* Opacidade */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-300 text-[11px]">Opacidade</span>
          <div className="relative">
            <select
              value={config.opacity !== undefined ? config.opacity : 100}
              onChange={(e) => updateConfig("opacity", parseInt(e.target.value) || 0)}
              className="appearance-none bg-slate-900 border border-slate-700 rounded px-2 py-0.5 pr-5 text-white font-medium outline-none focus:border-cyan-500 text-xs"
            >
              <option value={100}>100</option>
              <option value={75}>75</option>
              <option value={50}>50</option>
              <option value={25}>25</option>
              <option value={0}>0</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(drawingIndex)}
          className="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
          title="Eliminar Objeto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
