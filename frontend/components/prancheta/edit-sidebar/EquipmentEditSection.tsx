"use client";

import React from "react";
import { Palette } from "lucide-react";
import { TacticalElement } from "../types";
import { PRESET_STROKE_COLORS } from "./constants";
import { cn } from "@/lib/utils";

interface EquipmentEditSectionProps {
  element: TacticalElement;
  onUpdateElement: (updated: Partial<TacticalElement>) => void;
}

export function EquipmentEditSection({
  element,
  onUpdateElement,
}: EquipmentEditSectionProps) {
  const isCone = element.type === "cone";
  const isBall = element.type === "ball";

  if (isCone) {
    return (
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
                (element.color || "#f97316").toLowerCase() === c.hex.toLowerCase()
                  ? "border-orange-400 ring-2 ring-orange-400/50 scale-110"
                  : "border-slate-700"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isBall) {
    return (
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
        Elemento esférico 3D com física vetorial. Pode arrastá-lo livremente pelo campo tático.
      </div>
    );
  }

  return null;
}
