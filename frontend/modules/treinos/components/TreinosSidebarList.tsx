"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Dumbbell, 
  Layers,
  MapPin
} from "lucide-react";
import { SessaoTreino } from "@/models/sessao-treino";
import { cn } from "@/lib/utils";

interface TreinosSidebarListProps {
  treinos: SessaoTreino[];
  selectedTreinoId: string | null;
  onSelectTreino: (treino: SessaoTreino) => void;
  onNewTreino: () => void;
  isLoading: boolean;
}

export function TreinosSidebarList({
  treinos,
  selectedTreinoId,
  onSelectTreino,
  onNewTreino,
  isLoading,
}: TreinosSidebarListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTreinos = treinos.filter((t) => {
    const term = searchTerm.toLowerCase();
    const obj = (t.objetivo || "").toLowerCase();
    const dataStr = (t.data || "").toLowerCase();
    const micro = `microciclo ${t.microciclo || ""}`.toLowerCase();
    const numTreino = `treino #${t.microciclo || ""}`.toLowerCase();
    return obj.includes(term) || dataStr.includes(term) || micro.includes(term) || numTreino.includes(term);
  });

  return (
    <aside className="w-80 md:w-88 flex flex-col bg-[#111827] border-r border-slate-800 h-full select-none shrink-0">
      {/* Header do Sidebar com Ação Novo Treino */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#0d131f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Treinos
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {treinos.length} {treinos.length === 1 ? "sessão registada" : "sessões registadas"}
              </p>
            </div>
          </div>

          <button
            onClick={onNewTreino}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            title="Criar Nova Sessão de Treino"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo</span>
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por objetivo, data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/70 border border-slate-700/60 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Lista de Treinos */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>A carregar treinos...</span>
          </div>
        ) : filteredTreinos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400 text-xs gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
              <Layers className="w-5 h-5" />
            </div>
            {searchTerm ? (
              <p>Nenhum treino encontrado para "{searchTerm}".</p>
            ) : (
              <div>
                <p className="font-semibold text-slate-300 mb-1">Sem treinos registados</p>
                <p className="text-[11px] text-slate-500">
                  Clique em "+ Novo" para criar a primeira sessão.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredTreinos.map((t) => {
            const isSelected = t.id === selectedTreinoId;
            const exCount = t.exercicios?.length || 0;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTreino(t)}
                className={cn(
                  "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                  isSelected
                    ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                    : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700"
                )}
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20">
                      #{t.microciclo || "1"}
                    </span>
                    <h3 className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-200"
                    )}>
                      {t.objetivo ? t.objetivo.split("\n")[0] : `Treino #${t.microciclo || 1}`}
                    </h3>
                  </div>

                  <ChevronRight className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    isSelected ? "text-cyan-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"
                  )} />
                </div>

                {/* Detalhes de Data, Hora e Local */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{t.data || "Sem data"}</span>
                  </div>
                  {t.hora && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{t.hora}</span>
                    </div>
                  )}
                  {t.local && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400/80" />
                      <span className="truncate max-w-[110px]">{t.local}</span>
                    </div>
                  )}
                </div>

                {/* Rodapé com Exercícios e Duração */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60 font-medium">
                  <span className="text-slate-400">
                    {exCount} {exCount === 1 ? "exercício" : "exercícios"}
                  </span>
                  <span className="font-mono text-slate-300">
                    {t.duracaoTotalMinutos || 0} min
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
