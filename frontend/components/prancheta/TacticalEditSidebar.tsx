"use client";

import React from "react";
import {
  Square,
  Circle,
  Triangle,
  Hexagon,
  Copy,
  Trash2,
  X,
  User,
  Palette,
  Maximize2,
  RotateCw,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Sparkles,
  Layers,
  MoveUpRight,
  Split,
} from "lucide-react";
import { TacticalDrawing, TacticalElement, DrawingConfig } from "./types";
import { cn } from "@/lib/utils";

// Custom Pentagon Icon
function PentagonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 22 8.5 18 21 6 21 2 8.5 12 2" />
    </svg>
  );
}

const PRESET_STROKE_COLORS = [
  { name: "Ciano Neon", hex: "#00e5ff" },
  { name: "Amarelo", hex: "#facc15" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Vermelho", hex: "#ef4444" },
  { name: "Verde", hex: "#10b981" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Branco", hex: "#ffffff" },
  { name: "Preto", hex: "#0f172a" },
];

const PRESET_PLAYER_COLORS = [
  { name: "Amarelo (Equipa A)", hex: "#facc15" },
  { name: "Azul (Equipa B)", hex: "#3b82f6" },
  { name: "Vermelho (Coringa / Neutro)", hex: "#ef4444" },
  { name: "Verde", hex: "#10b981" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Branco", hex: "#ffffff" },
  { name: "Preto", hex: "#0f172a" },
];

const STROKE_SIZES = [1, 2, 3, 4, 6, 8, 10, 12];
const OPACITY_PRESETS = [0, 25, 50, 75, 100];

interface TacticalEditSidebarProps {
  selectedDrawing: TacticalDrawing | null;
  selectedDrawingIdx: number | null;
  selectedElement: TacticalElement | null;
  onUpdateDrawing: (index: number, updated: TacticalDrawing) => void;
  onDeleteDrawing: (index: number) => void;
  onDuplicateDrawing: (drawing: TacticalDrawing) => void;
  onUpdateElement: (updated: Partial<TacticalElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onRotateElement: (newAngle: number) => void;
  onClose: () => void;
}

export function TacticalEditSidebar({
  selectedDrawing,
  selectedDrawingIdx,
  selectedElement,
  onUpdateDrawing,
  onDeleteDrawing,
  onDuplicateDrawing,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onRotateElement,
  onClose,
}: TacticalEditSidebarProps) {
  // 1. Caso de Desenho / Forma Selecionada
  if (selectedDrawing !== null && selectedDrawingIdx !== null) {
    const config: DrawingConfig = selectedDrawing.config || {
      color: "#00e5ff",
      fillColor: "#ef4444",
      size: 2,
      opacity: 100,
      lineStyle: "solid",
    };

    const currentType = selectedDrawing.type;
    const isLine =
      currentType === "run" ||
      currentType === "pass" ||
      currentType === "pen" ||
      currentType === "line";
    const lineStyle = config.lineStyle || "solid";

    const updateConfig = (key: keyof DrawingConfig, value: any) => {
      onUpdateDrawing(selectedDrawingIdx, {
        ...selectedDrawing,
        config: {
          ...(selectedDrawing.config || {}),
          [key]: value,
        },
      });
    };

    const setDrawingType = (type: any, defaultLineStyle?: "solid" | "dashed") => {
      onUpdateDrawing(selectedDrawingIdx, {
        ...selectedDrawing,
        type,
        config: {
          ...(selectedDrawing.config || {}),
          ...(defaultLineStyle ? { lineStyle: defaultLineStyle } : {}),
        },
      });
    };

    return (
      <div className="w-72 md:w-80 bg-[#131b2f] border-r border-slate-800 flex flex-col h-full rounded-l-2xl overflow-hidden shadow-2xl z-20 animate-in slide-in-from-left-4 fade-in duration-200 select-none shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#0a0f1c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              {isLine ? <MoveUpRight className="w-4 h-4" /> : <ShapesIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                {isLine ? "Editar Linha" : "Editar Forma"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isLine
                  ? currentType === "pass"
                    ? "Passe Tracejado"
                    : currentType === "run"
                    ? "Corrida com Seta"
                    : currentType === "pen"
                    ? "Traço Livre"
                    : "Linha Tática"
                  : `Forma: ${currentType}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar / Desmarcar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-200">
          {/* Seletor de Tipo de Linha / Forma */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {isLine ? "Tipo de Linha" : "Geometria da Forma"}
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {isLine ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Estilo do Traço (Sólido vs Tracejado) */}
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

          {/* Cor do Traço / Linha */}
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

          {/* Fundo e Opacidade (Para Formas Geométricas) */}
          {!isLine && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {/* Cor de Preenchimento */}
              <div className="space-y-2">
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
                  <label className="relative flex items-center cursor-pointer ml-auto">
                    <div
                      className="w-6 h-6 rounded-full border border-slate-600 shadow-sm flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-cyan-500"
                      title="Cor Personalizada"
                    />
                    <input
                      type="color"
                      value={config.fillColor || "#ef4444"}
                      onChange={(e) => updateConfig("fillColor", e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0a0f1c] flex items-center gap-2">
          <button
            onClick={() => onDuplicateDrawing(selectedDrawing)}
            className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm hover:text-white"
            title="Duplicar Forma (Ctrl+V)"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            Duplicar
          </button>
          <button
            onClick={() => onDeleteDrawing(selectedDrawingIdx)}
            className="h-9 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm"
            title="Eliminar Forma (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar
          </button>
        </div>
      </div>
    );
  }

  // 2. Caso de Elemento Selecionado (Jogador, Baliza, Cone, Bola)
  if (selectedElement !== null) {
    const isPlayer = selectedElement.type === "home" || selectedElement.type === "away";
    const isGoal = selectedElement.type === "mini_goal";
    const isCone = selectedElement.type === "cone";
    const isBall = selectedElement.type === "ball";

    // Dados do Jogador
    const currentLabel =
      selectedElement.label !== undefined
        ? selectedElement.label
        : selectedElement.number !== undefined
        ? String(selectedElement.number)
        : "";
    const currentColor =
      selectedElement.color ||
      (selectedElement.type === "home" ? "#facc15" : "#3b82f6");
    const currentSize = selectedElement.size || "sm";

    // Dados da Baliza
    const currentRotation = selectedElement.rotation || 0;
    const currentGoalSize = selectedElement.goalSize || "mini";
    const deg = Math.round(((currentRotation % (Math.PI * 2)) * 180) / Math.PI);
    const normalizedDeg = deg < 0 ? deg + 360 : deg;

    return (
      <div className="w-72 md:w-80 bg-[#131b2f] border-r border-slate-800 flex flex-col h-full rounded-l-2xl overflow-hidden shadow-2xl z-20 animate-in slide-in-from-left-4 fade-in duration-200 select-none shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#0a0f1c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              {isPlayer ? (
                <User className="w-4 h-4" />
              ) : isGoal ? (
                <Maximize2 className="w-4 h-4" />
              ) : isCone ? (
                <Triangle className="w-4 h-4 text-orange-400" />
              ) : (
                <Circle className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                {isPlayer
                  ? "Editar Jogador"
                  : isGoal
                  ? "Editar Baliza"
                  : isCone
                  ? "Editar Cone"
                  : "Editar Bola"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isPlayer
                  ? `Camisola: ${currentLabel || "Sem número"}`
                  : isGoal
                  ? `Tamanho: ${currentGoalSize.toUpperCase()}`
                  : `ID: ${selectedElement.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar / Desmarcar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-200">
          {/* Seção Jogador */}
          {isPlayer && (
            <>
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
                    const num = parseInt(val);
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
            </>
          )}

          {/* Seção Baliza */}
          {isGoal && (
            <>
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
            </>
          )}

          {/* Seção Cone */}
          {isCone && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-orange-400" />
                Cor do Cone
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {PRESET_STROKE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateElement({ color: c.hex })}
                    title={c.name}
                    className={cn(
                      "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                      (selectedElement.color || "#f97316").toLowerCase() === c.hex.toLowerCase()
                        ? "border-orange-400 ring-2 ring-orange-400/50 scale-110"
                        : "border-slate-700"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção Bola */}
          {isBall && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
              Elemento esférico 3D com física vetorial. Pode arrastá-lo livremente pelo campo tático.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0a0f1c] flex items-center gap-2">
          <button
            onClick={onDuplicateElement}
            className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm hover:text-white"
            title="Duplicar Elemento (Ctrl+V)"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            Duplicar
          </button>
          <button
            onClick={onDeleteElement}
            className="h-9 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm"
            title="Eliminar Elemento (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ShapesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <circle cx="17.5" cy="6.5" r="3.5" />
      <polygon points="12 14 7 21 17 21 12 14" />
    </svg>
  );
}
