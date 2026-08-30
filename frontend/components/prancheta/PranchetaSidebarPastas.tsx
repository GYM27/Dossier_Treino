"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Exercicio } from "@/models/exercicio";
import {
  PastaItem,
  DEFAULT_MAIN_PASTAS,
  matchesPasta,
  getExercisesForFolderAndDescendants,
} from "@/models/pasta";
import { CATEGORIAS_COM_TODOS as CATEGORIAS } from "@/models/categoria-exercicio";
import { Spinner } from "@/components/ui/Spinner";
import {
  FolderKanban,
  Plus,
  X,
  Search,
  Folder,
  Layers,
  FolderPlus,
  FolderOpen,
  CornerDownRight,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface PranchetaSidebarPastasProps {
  isOpen: boolean;
  onClose: () => void;
  exercicios: Exercicio[];
  exerciciosFiltrados: Exercicio[];
  selectedExercicio: Exercicio | null;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoriaFilter: string;
  setCategoriaFilter: (cat: string) => void;
  pastas: PastaItem[];
  expandedPastas: Record<string, boolean>;
  drawerMode: "PASTAS" | "TODOS";
  setDrawerMode: (mode: "PASTAS" | "TODOS") => void;
  isCreatingPasta: boolean;
  setIsCreatingPasta: (val: boolean) => void;
  creatingParentId: string | null;
  setCreatingParentId: (id: string | null) => void;
  novaPastaNome: string;
  setNovaPastaNome: (nome: string) => void;
  onNovoExercicio: () => void;
  onSelectExercicio: (ex: Exercicio) => void;
  onCreatePasta: () => void;
  onStartCreateSubpasta: (e: React.MouseEvent, parentId: string) => void;
  onDeletePasta: (e: React.MouseEvent, pastaId: string, nomePasta: string) => void;
  onTogglePasta: (pastaId: string) => void;
}

export function PranchetaSidebarPastas({
  isOpen,
  onClose,
  exercicios,
  exerciciosFiltrados,
  selectedExercicio,
  isLoading,
  searchTerm,
  setSearchTerm,
  categoriaFilter,
  setCategoriaFilter,
  pastas,
  expandedPastas,
  drawerMode,
  setDrawerMode,
  isCreatingPasta,
  setIsCreatingPasta,
  creatingParentId,
  setCreatingParentId,
  novaPastaNome,
  setNovaPastaNome,
  onNovoExercicio,
  onSelectExercicio,
  onCreatePasta,
  onStartCreateSubpasta,
  onDeletePasta,
  onTogglePasta,
}: PranchetaSidebarPastasProps) {
  const renderTreeLevel = (parentId: string | null = null, level = 0): React.ReactNode => {
    const currentLevelPastas = pastas.filter((p) => (p.parentId || null) === parentId);
    if (currentLevelPastas.length === 0) return null;

    return (
      <div className={cn("space-y-2", level > 0 && "space-y-1.5 mt-1.5")}>
        {currentLevelPastas.map((folder) => {
          const isExpanded = !!expandedPastas[folder.id];
          const childFolders = pastas.filter((p) => p.parentId === folder.id);
          const directExercises = exerciciosFiltrados.filter((ex) => matchesPasta(ex, folder));
          const totalExercises = getExercisesForFolderAndDescendants(folder.id, pastas, exerciciosFiltrados);
          const isDefaultMain = DEFAULT_MAIN_PASTAS.some((d) => d.id === folder.id);

          return (
            <div
              key={folder.id}
              className={cn(
                "border rounded-xl overflow-hidden transition-all",
                level === 0 ? "border-slate-800/90 bg-[#0d131f]/70" : "border-slate-800/60 bg-[#090d16]/90 ml-3"
              )}
            >
              {/* Cabeçalho da Pasta */}
              <div
                onClick={() => onTogglePasta(folder.id)}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors",
                  level === 0 ? "bg-[#131b2e] hover:bg-[#18223a]" : "bg-[#101726] hover:bg-[#162035]"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {level > 0 && <CornerDownRight className="w-3 h-3 text-amber-500/70 shrink-0" />}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "font-bold text-slate-200 tracking-wide truncate",
                      level === 0 ? "text-xs" : "text-[11px]"
                    )}
                  >
                    {folder.nome}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                    {childFolders.length > 0 ? `${directExercises.length} (${totalExercises.length})` : directExercises.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => onStartCreateSubpasta(e, folder.id)}
                    className="p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
                    title={`Adicionar subpasta dentro de "${folder.nome}"`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {!isDefaultMain && (
                    <button
                      type="button"
                      onClick={(e) => onDeletePasta(e, folder.id, folder.nome)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Eliminar pasta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="p-2 space-y-2 bg-[#080c14]/90 border-t border-slate-800/80">
                  {childFolders.length > 0 && renderTreeLevel(folder.id, level + 1)}

                  {directExercises.length > 0 && (
                    <div className="space-y-1.5">
                      {directExercises.map((ex) => {
                        const isSelected = selectedExercicio?.id === ex.id;
                        const catBadge = CATEGORIAS.find((c) => c.value === ex.categoria) || CATEGORIAS[3];

                        return (
                          <div
                            key={ex.id}
                            onClick={() => {
                              onSelectExercicio(ex);
                              onClose();
                            }}
                            className={cn(
                              "group relative p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5",
                              isSelected
                                ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                                : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={cn("px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border", catBadge.color)}>
                                {catBadge.label}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                                <span>★</span>
                                <span>{ex.nivelDificuldade || 3}/5</span>
                              </div>
                            </div>

                            <h3
                              className={cn(
                                "text-xs font-semibold truncate transition-colors",
                                isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-200"
                              )}
                            >
                              {ex.nome}
                            </h3>

                            {ex.objetivosEspecificos && (
                              <p className="text-[10px] text-slate-400 line-clamp-1">{ex.objetivosEspecificos}</p>
                            )}

                            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                              <span className="truncate">{ex.espaco || "Campo"}</span>
                              <span>{ex.dadosTaticos?.tempo || "15 min"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {directExercises.length === 0 && childFolders.length === 0 && (
                    <p className="text-[11px] text-slate-500 italic text-center py-2 px-1">
                      Pasta vazia. Clique em [+] para criar uma subpasta.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      <aside
        className={cn(
          "absolute top-0 left-0 bottom-0 z-50 w-80 md:w-96 flex flex-col bg-[#111827] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* Topo do Catálogo */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#0d131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">Biblioteca</h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  {exercicios.length} {exercicios.length === 1 ? "exercício criado" : "exercícios criados"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onNovoExercicio}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                title="Criar novo exercício na prancheta"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Fechar Menu (1-Clique)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar exercícios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b]/70 border border-slate-700/60 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Alternância de Modo */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center bg-[#162032] p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setDrawerMode("PASTAS")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5",
                  drawerMode === "PASTAS"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Pastas</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerMode("TODOS")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5",
                  drawerMode === "TODOS"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingPasta(!isCreatingPasta)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[11px] transition-all active:scale-95"
              title="Criar nova pasta de exercícios"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Pasta</span>
            </button>
          </div>

          {/* Criação de Pasta Inline */}
          {isCreatingPasta && (
            <div className="p-2.5 bg-[#162032] border border-amber-500/40 rounded-xl space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block truncate">
                  {creatingParentId
                    ? `Nova Subpasta em "${pastas.find((p) => p.id === creatingParentId)?.nome || "Pasta"}"`
                    : "Nova Pasta Principal"}
                </span>
                {creatingParentId && (
                  <button
                    type="button"
                    onClick={() => setCreatingParentId(null)}
                    className="text-[10px] text-slate-400 hover:text-white underline shrink-0 ml-1"
                  >
                    (tornar principal)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder={creatingParentId ? "Ex: Construção / 1ª Fase..." : "Ex: Organização Ofensiva..."}
                  value={novaPastaNome}
                  onChange={(e) => setNovaPastaNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCreatePasta();
                    if (e.key === "Escape") {
                      setIsCreatingPasta(false);
                      setCreatingParentId(null);
                    }
                  }}
                  autoFocus
                  className="flex-1 bg-[#0b1120] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={onCreatePasta}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingPasta(false);
                    setCreatingParentId(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Filtros no Modo Todos */}
          {drawerMode === "TODOS" && (
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIAS.map((cat) => {
                const isSelected = categoriaFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoriaFilter(cat.value)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold tracking-wider whitespace-nowrap transition-all",
                      isSelected ? "bg-cyan-500 text-slate-950 shadow-sm" : "bg-[#1e293b]/80 text-slate-400 hover:bg-[#334155] hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <Spinner size="md" color="cyan" />
              <span>A carregar biblioteca...</span>
            </div>
          ) : drawerMode === "PASTAS" ? (
            <div className="space-y-2.5">{renderTreeLevel(null, 0)}</div>
          ) : (
            exerciciosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400 text-xs gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Nenhum exercício encontrado</p>
                  <p className="text-[11px] text-slate-500">Clique em "+ Novo" para desenhar o primeiro exercício.</p>
                </div>
              </div>
            ) : (
              exerciciosFiltrados.map((ex) => {
                const isSelected = selectedExercicio?.id === ex.id;
                const catBadge = CATEGORIAS.find((c) => c.value === ex.categoria) || CATEGORIAS[3];

                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      onSelectExercicio(ex);
                      onClose();
                    }}
                    className={cn(
                      "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                      isSelected
                        ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                        : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border", catBadge.color)}>
                        {catBadge.label}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                        <span>★</span>
                        <span>{ex.nivelDificuldade || 3}/5</span>
                      </div>
                    </div>
                    <h3 className={cn("text-xs font-semibold truncate transition-colors", isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-200")}>
                      {ex.nome}
                    </h3>
                    {ex.objetivosEspecificos && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ex.objetivosEspecificos}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                      <span className="truncate">{ex.espaco || "Campo"}</span>
                      <span>{ex.jogadoresEnvolvidos ? `${ex.jogadoresEnvolvidos} atletas` : ""}</span>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </aside>
    </>
  );
}
