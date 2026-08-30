"use client";

import React from "react";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  Layers,
  CornerDownRight,
  Trash2,
} from "lucide-react";
import { PastaItem, matchesPasta, getExercisesForFolderAndDescendants } from "@/models/pasta";
import { Exercicio } from "@/models/exercicio";
import { cn } from "@/lib/utils";

interface CatalogoSidebarPastasProps {
  pastas: PastaItem[];
  exercicios: Exercicio[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  drawerMode: "PASTAS" | "TODOS";
  setDrawerMode: (mode: "PASTAS" | "TODOS") => void;
  expandedPastas: Record<string, boolean>;
  togglePastaExpanded: (pastaId: string) => void;
  isCreatingPasta: boolean;
  setIsCreatingPasta: (is: boolean) => void;
  creatingParentId: string | null;
  setCreatingParentId: (id: string | null) => void;
  novaPastaNome: string;
  setNovaPastaNome: (nome: string) => void;
  onCriarPasta: () => void;
  onIniciarCriacaoSubpasta: (e: React.MouseEvent, parentId: string) => void;
  onPedirEliminarPasta: (e: React.MouseEvent, pastaId: string, nomePasta: string) => void;
}

export function CatalogoSidebarPastas({
  pastas,
  exercicios,
  selectedCategory,
  setSelectedCategory,
  drawerMode,
  setDrawerMode,
  expandedPastas,
  togglePastaExpanded,
  isCreatingPasta,
  setIsCreatingPasta,
  creatingParentId,
  setCreatingParentId,
  novaPastaNome,
  setNovaPastaNome,
  onCriarPasta,
  onIniciarCriacaoSubpasta,
  onPedirEliminarPasta,
}: CatalogoSidebarPastasProps) {
  const mainPastas = pastas.filter((p) => !p.parentId);

  const renderPastaItem = (p: PastaItem, depth = 0) => {
    const isSelected = selectedCategory === p.nome || selectedCategory === p.id;
    const isExpanded = !!expandedPastas[p.id];
    const subpastas = pastas.filter((sub) => sub.parentId === p.id);
    const count = getExercisesForFolderAndDescendants(p.id, pastas, exercicios).length;

    return (
      <div key={p.id} className="flex flex-col">
        <div
          onClick={() => setSelectedCategory(p.nome)}
          className={cn(
            "group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold transition-all select-none",
            depth > 0 ? "ml-3 border-l border-slate-800/80 pl-2.5 my-0.5" : "my-0.5",
            isSelected
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {subpastas.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePastaExpanded(p.id);
                }}
                className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : depth > 0 ? (
              <CornerDownRight className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
            ) : (
              <div className="w-4" />
            )}

            {isSelected ? (
              <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
            )}

            <span className="truncate">{p.nome}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-slate-900 text-slate-500 group-hover:text-slate-400"
              )}
            >
              {count}
            </span>

            {/* Ações Rápidas */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                onClick={(e) => onIniciarCriacaoSubpasta(e, p.id)}
                title="Criar Subpasta"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => onPedirEliminarPasta(e, p.id, p.nome)}
                title="Eliminar Pasta"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Subpastas recursivas */}
        {isExpanded && subpastas.length > 0 && (
          <div className="flex flex-col">
            {subpastas.map((sub) => renderPastaItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 md:w-72 bg-[#090e1a] border-r border-slate-800/80 p-3 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toggle de Modos: Pastas vs Todos */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
          <button
            onClick={() => {
              setDrawerMode("PASTAS");
              setSelectedCategory("Organização Ofensiva");
            }}
            className={cn(
              "py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
              drawerMode === "PASTAS"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Folder className="w-3.5 h-3.5" />
            Pastas
          </button>
          <button
            onClick={() => {
              setDrawerMode("TODOS");
              setSelectedCategory("TODOS");
            }}
            className={cn(
              "py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
              drawerMode === "TODOS"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos
          </button>
        </div>

        {/* Árvore de Pastas */}
        {drawerMode === "PASTAS" && (
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {mainPastas.map((p) => renderPastaItem(p, 0))}
          </div>
        )}
      </div>

      {/* Formulário de Criação de Pasta */}
      {drawerMode === "PASTAS" && (
        <div className="pt-3 border-t border-slate-800/80">
          {isCreatingPasta ? (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <FolderPlus className="w-3.5 h-3.5" />
                {creatingParentId ? "Nova Subpasta" : "Nova Pasta Principal"}
              </span>
              <input
                type="text"
                value={novaPastaNome}
                onChange={(e) => setNovaPastaNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCriarPasta();
                  if (e.key === "Escape") setIsCreatingPasta(false);
                }}
                placeholder="Nome da pasta..."
                autoFocus
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => setIsCreatingPasta(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={onCriarPasta}
                  className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setCreatingParentId(null);
                setNovaPastaNome("");
                setIsCreatingPasta(true);
              }}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Nova Pasta
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
