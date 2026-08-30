"use client";

import React from "react";
import {
  Copy,
  Trash2,
  X,
  User,
  Maximize2,
  MoveUpRight,
  Triangle,
  Circle,
} from "lucide-react";
import { TacticalDrawing, TacticalElement } from "./types";
import { PlayerEditSection } from "./edit-sidebar/PlayerEditSection";
import { GoalEditSection } from "./edit-sidebar/GoalEditSection";
import { LineEditSection } from "./edit-sidebar/LineEditSection";
import { ShapeEditSection } from "./edit-sidebar/ShapeEditSection";
import { EquipmentEditSection } from "./edit-sidebar/EquipmentEditSection";

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
    const isLine =
      selectedDrawing.type === "run" ||
      selectedDrawing.type === "pass" ||
      selectedDrawing.type === "pen" ||
      selectedDrawing.type === "line";

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
                {isLine ? `Tipo: ${selectedDrawing.type}` : `Forma: ${selectedDrawing.type}`}
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
          {isLine ? (
            <LineEditSection
              drawing={selectedDrawing}
              drawingIndex={selectedDrawingIdx}
              onUpdateDrawing={onUpdateDrawing}
            />
          ) : (
            <ShapeEditSection
              drawing={selectedDrawing}
              drawingIndex={selectedDrawingIdx}
              onUpdateDrawing={onUpdateDrawing}
            />
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
              <p className="text-[10px] text-slate-400">ID: {selectedElement.id}</p>
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
          {isPlayer && (
            <PlayerEditSection
              element={selectedElement}
              onUpdateElement={onUpdateElement}
            />
          )}

          {isGoal && (
            <GoalEditSection
              element={selectedElement}
              onUpdateElement={onUpdateElement}
              onRotateElement={onRotateElement}
            />
          )}

          {(isCone || selectedElement.type === "ball") && (
            <EquipmentEditSection
              element={selectedElement}
              onUpdateElement={onUpdateElement}
            />
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

export default TacticalEditSidebar;
