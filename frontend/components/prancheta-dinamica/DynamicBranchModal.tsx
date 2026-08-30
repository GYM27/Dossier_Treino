"use client";

import React from "react";
import { GitBranch, Play, Sparkles } from "lucide-react";
import { TacticalFrame, TacticalTree, getFullPath } from "@/models/tacticplay";

export interface DynamicBranchModalProps {
  decisionNode: TacticalFrame | null;
  tree: TacticalTree;
  onSelectBranch: (childId: string) => void;
  onClose: () => void;
}

export function DynamicBranchModal({
  decisionNode,
  tree,
  onSelectBranch,
  onClose,
}: DynamicBranchModalProps) {
  if (!decisionNode || !decisionNode.children || decisionNode.children.length <= 1) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/90 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Ponto de Decisão Tática</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              A jogada chegou a uma bifurcação. Seleciona qual alternativa desejas seguir:
            </p>
          </div>
        </div>

        {/* Lista de Opções de Ramificação */}
        <div className="flex flex-col gap-2 my-2">
          {decisionNode.children.map((childId, idx) => {
            const childNode = tree.framesMap[childId];
            if (!childNode) return null;

            return (
              <button
                key={childId}
                type="button"
                onClick={() => onSelectBranch(childId)}
                className="group w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-left transition-all hover:scale-[1.02] shadow-sm active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {childNode.name || `Alternativa ${idx + 1}`}
                    </h4>
                    {childNode.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {childNode.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
