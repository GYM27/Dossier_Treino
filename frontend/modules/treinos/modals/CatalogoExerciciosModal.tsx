"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Exercicio } from "@/models/exercicio";
import { 
  PastaItem, 
  DEFAULT_MAIN_PASTAS, 
  matchesPasta, 
  getExercisesForFolderAndDescendants, 
  loadStoredPastas, 
  saveStoredPastas 
} from "@/models/pasta";
import { exercicioService } from "@/services";
import { 
  X, 
  Search, 
  CheckCircle, 
  Trash2, 
  Sparkles,
  Dumbbell,
  Layers,
  Flame,
  RefreshCw,
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Clock,
  Users,
  MapPin
} from "lucide-react";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";
import { cn } from "@/lib/utils";

interface CatalogoExerciciosModalProps {
  onClose: () => void;
  onSelect: (exercicio: Exercicio) => void;
  replacingExerciseName?: string;
}

const CATEGORIAS = [
  { id: "ALL", label: "Todos" },
  { id: "AQUECIMENTO", label: "Aquecimento" },
  { id: "TECNICO", label: "Técnico" },
  { id: "TATICO", label: "Tático" },
  { id: "FISICO", label: "Físico" },
  { id: "GUARDA_REDES", label: "Guarda-Redes" },
  { id: "LUDICO", label: "Lúdico" },
];

export function CatalogoExerciciosModal({
  onClose,
  onSelect,
  replacingExerciseName,
}: CatalogoExerciciosModalProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [drawerMode, setDrawerMode] = useState<"PASTAS" | "TODOS">("PASTAS");

  // Sistema de Pastas
  const [pastas, setPastas] = useState<PastaItem[]>(loadStoredPastas);
  const [expandedPastas, setExpandedPastas] = useState<Record<string, boolean>>({
    "org-ofensiva": true,
    "org-defensiva": true,
    "trans-ofensiva": true,
    "trans-defensiva": true,
    "bolas-paradas": true,
  });

  // Criação de Nova Pasta / Subpasta
  const [isCreatingPasta, setIsCreatingPasta] = useState(false);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [novaPastaNome, setNovaPastaNome] = useState("");

  const loadExercicios = async () => {
    setLoading(true);
    try {
      const data = await exercicioService.getExercicios();
      setExercicios(data || []);
    } catch (err) {
      console.error("Erro ao carregar exercícios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercicios();
    setPastas(loadStoredPastas());
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, nome: string) => {
    e.stopPropagation();
    if (!confirm(`Tem a certeza que deseja eliminar permanentemente o exercício "${nome}" da biblioteca?`)) {
      return;
    }

    try {
      await exercicioService.eliminarExercicio(id);
      setExercicios((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err) {
      console.error("Erro ao eliminar exercício:", err);
      alert("Erro ao eliminar exercício do catálogo.");
    }
  };

  // Alternar expansão de pasta no acordeão
  const togglePastaExpanded = (pastaId: string) => {
    setExpandedPastas((prev) => ({
      ...prev,
      [pastaId]: !prev[pastaId],
    }));
  };

  // Iniciar criação de subpasta
  const handleIniciarCriacaoSubpasta = (e: React.MouseEvent, parentId: string) => {
    e.stopPropagation();
    setCreatingParentId(parentId);
    setNovaPastaNome("");
    setIsCreatingPasta(true);
    setExpandedPastas((prev) => ({ ...prev, [parentId]: true }));
  };

  // Guardar nova pasta ou subpasta
  const handleCriarNovaPasta = () => {
    const limpo = novaPastaNome.trim();
    if (!limpo) return;
    if (
      pastas.some(
        (p) =>
          p.nome.toLowerCase() === limpo.toLowerCase() &&
          (p.parentId || null) === (creatingParentId || null)
      )
    ) {
      alert("Já existe uma pasta com esse nome neste nível.");
      return;
    }
    const newId = `pasta-${Date.now()}`;
    const novaPasta: PastaItem = {
      id: newId,
      nome: limpo,
      parentId: creatingParentId || null,
    };
    const atualizadas = [...pastas, novaPasta];
    setPastas(atualizadas);
    saveStoredPastas(atualizadas);
    setNovaPastaNome("");
    setIsCreatingPasta(false);
    setCreatingParentId(null);
    setExpandedPastas((prev) => ({
      ...prev,
      [newId]: true,
      ...(creatingParentId ? { [creatingParentId]: true } : {}),
    }));
  };

  // Eliminar pasta personalizada
  const handleEliminarPasta = (e: React.MouseEvent, pastaId: string, nomePasta: string) => {
    e.stopPropagation();
    if (!confirm(`Deseja eliminar a pasta "${nomePasta}"? Os exercícios permanecerão no catálogo geral.`)) {
      return;
    }
    const atualizadas = pastas.filter((p) => p.id !== pastaId && p.parentId !== pastaId);
    setPastas(atualizadas);
    saveStoredPastas(atualizadas);
  };

  // Filtragem de exercícios
  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter((e) => {
      const matchesSearch =
        search === "" ||
        e.nome.toLowerCase().includes(search.toLowerCase()) ||
        (e.objetivosEspecificos || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.descricao || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || e.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [exercicios, search, selectedCategory]);

  // Se estiver a pesquisar, expandir automaticamente pastas com correspondências
  useEffect(() => {
    if (search.trim()) {
      const toExpand: Record<string, boolean> = {};
      pastas.forEach((p) => {
        const matches = getExercisesForFolderAndDescendants(p.id, pastas, exerciciosFiltrados);
        if (matches.length > 0) {
          toExpand[p.id] = true;
          if (p.parentId) toExpand[p.parentId] = true;
        }
      });
      setExpandedPastas((prev) => ({ ...prev, ...toExpand }));
    }
  }, [search, pastas, exerciciosFiltrados]);

  // Renderização Recursiva da Árvore de Pastas
  const renderTreeLevel = (parentId: string | null = null, level = 0): React.ReactNode => {
    const currentLevelPastas = pastas.filter((p) => (p.parentId || null) === parentId);
    if (currentLevelPastas.length === 0) return null;

    return (
      <div className={cn("space-y-2.5", level > 0 && "space-y-2 mt-2")}>
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
                "border rounded-xl overflow-hidden transition-all shadow-sm",
                level === 0
                  ? "border-slate-800/90 bg-[#0d131f]/70"
                  : "border-slate-800/60 bg-[#090d16]/90 ml-3 md:ml-4"
              )}
            >
              {/* Cabeçalho da Pasta */}
              <div
                onClick={() => togglePastaExpanded(folder.id)}
                className={cn(
                  "group flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors",
                  level === 0 ? "bg-[#131b2e] hover:bg-[#18223a]" : "bg-[#101726] hover:bg-[#162035]"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {level > 0 && <CornerDownRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={cn(
                    "font-bold text-slate-200 tracking-wide truncate",
                    level === 0 ? "text-xs md:text-sm" : "text-xs"
                  )}>
                    {folder.nome}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold shrink-0">
                    {childFolders.length > 0 ? `${directExercises.length} (${totalExercises.length})` : directExercises.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Botão [+] Adicionar Subpasta */}
                  <button
                    type="button"
                    onClick={(e) => handleIniciarCriacaoSubpasta(e, folder.id)}
                    className="p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
                    title={`Adicionar subpasta dentro de "${folder.nome}"`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {!isDefaultMain && (
                    <button
                      type="button"
                      onClick={(e) => handleEliminarPasta(e, folder.id, folder.nome)}
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

              {/* Conteúdo da Pasta Aberta */}
              {isExpanded && (
                <div className="p-2.5 md:p-3 space-y-2.5 bg-[#080c14]/90 border-t border-slate-800/80">
                  {/* Subpastas Aninhadas */}
                  {childFolders.length > 0 && renderTreeLevel(folder.id, level + 1)}

                  {/* Exercícios Diretos desta Pasta */}
                  {directExercises.length > 0 ? (
                    <div className="space-y-2">
                      {directExercises.map((ex) => renderExerciseCard(ex))}
                    </div>
                  ) : childFolders.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      Nenhum exercício associado a esta pasta.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizador do Cartão de Exercício
  const renderExerciseCard = (ex: Exercicio) => (
    <div
      key={ex.id}
      onClick={() => onSelect(ex)}
      className="group relative flex items-center gap-3.5 p-3 rounded-xl bg-[#111827]/90 border border-slate-800 hover:border-cyan-500/70 hover:bg-[#162032] cursor-pointer transition-all shadow-sm"
    >
      {/* Thumbnail Tática */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex flex-col items-center justify-center text-slate-400 overflow-hidden group-hover:border-cyan-500/30 transition-colors">
        {(ex as any).dadosTaticos ? (
          <TacticalBoardThumbnail tacticData={(ex as any).dadosTaticos} className="w-full h-full transition-opacity group-hover:opacity-90" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[8px] font-mono font-bold uppercase text-slate-400 truncate max-w-[50px]">
              {ex.categoria || "TATICO"}
            </span>
          </>
        )}
      </div>

      {/* Informação do Exercício */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
            {ex.nome}
          </h4>

          {/* Botão Eliminar */}
          <button
            onClick={(e) => handleDelete(e, ex.id, ex.nome)}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar da biblioteca"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {ex.carga ? (
          <p className="text-[11px] text-amber-300 font-medium line-clamp-1 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{ex.carga}</span>
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">
            {ex.objetivosEspecificos || ex.descricao || "Sem objetivos definidos."}
          </p>
        )}

        {/* Badges de Metadados */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
          {ex.categoria && (
            <span className="bg-slate-800/90 text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-slate-700/60 uppercase text-[9px]">
              {ex.categoria}
            </span>
          )}
          {ex.espaco && (
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <MapPin className="w-2.5 h-2.5" />
              {ex.espaco}
            </span>
          )}
          {ex.jogadoresEnvolvidos && (
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Users className="w-2.5 h-2.5" />
              {ex.jogadoresEnvolvidos}
            </span>
          )}
          {ex.nivelDificuldade && (
            <span className="flex items-center gap-0.5 font-mono text-amber-400">
              <Flame className="w-2.5 h-2.5" />
              {ex.nivelDificuldade}/5
            </span>
          )}
        </div>
      </div>

      {/* Ícone de Seleção Rápida */}
      <div className="shrink-0 text-slate-600 group-hover:text-cyan-400 transition-colors p-1">
        <CheckCircle className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0b1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
              replacingExerciseName 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}>
              {replacingExerciseName ? <RefreshCw className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-2">
                {replacingExerciseName ? "Substituir Exercício da Sessão" : "Biblioteca de Exercícios"}
              </h3>
              <p className="text-[11px] md:text-xs text-slate-400">
                {replacingExerciseName ? (
                  <span>
                    A substituir <strong className="text-amber-300">{replacingExerciseName}</strong> (mantém o mesmo lugar no treino).
                  </span>
                ) : (
                  "Selecione um exercício por pastas ou catálogo geral para adicionar ao treino."
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra Superior de Controlos (Pesquisa, Alternador Pastas/Todos, Nova Pasta) */}
        <div className="p-3.5 bg-[#0d131f] border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            {/* Campo de Pesquisa */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar exercícios por nome, objetivos ou palavras-chave..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#162032] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Alternador de Modo (Pastas vs Todos) */}
            <div className="flex bg-[#162032] p-0.5 rounded-xl border border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerMode("PASTAS")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  drawerMode === "PASTAS"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pastas</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerMode("TODOS")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  drawerMode === "TODOS"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Todos</span>
              </button>
            </div>

            {/* Botão Nova Pasta */}
            {drawerMode === "PASTAS" && (
              <button
                type="button"
                onClick={() => {
                  setCreatingParentId(null);
                  setNovaPastaNome("");
                  setIsCreatingPasta(!isCreatingPasta);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0",
                  isCreatingPasta
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-[#162032] border-slate-700/60 text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
                )}
                title="Criar nova pasta raiz"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Nova Pasta</span>
              </button>
            )}
          </div>

          {/* Formulário Inline de Criação de Pasta */}
          {isCreatingPasta && (
            <div className="p-2.5 bg-[#131b2e] border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>
                  {creatingParentId
                    ? `Criar subpasta dentro de "${pastas.find((p) => p.id === creatingParentId)?.nome}"`
                    : "Criar Nova Pasta Principal"}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da pasta (ex: Finalização, Transição Lateral...)"
                  value={novaPastaNome}
                  onChange={(e) => setNovaPastaNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCriarNovaPasta();
                    if (e.key === "Escape") {
                      setIsCreatingPasta(false);
                      setCreatingParentId(null);
                    }
                  }}
                  autoFocus
                  className="flex-1 bg-[#090d16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleCriarNovaPasta}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingPasta(false);
                    setCreatingParentId(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Categorias (Apenas no Modo TODOS) */}
          {drawerMode === "TODOS" && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIAS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 shadow-sm"
                        : "bg-[#162032] text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Corpo Principal da Biblioteca */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs gap-3">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar catálogo de exercícios...</span>
            </div>
          ) : exerciciosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-400 text-xs gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">
                  Nenhum exercício encontrado
                </p>
                <p className="text-slate-500 text-[11px]">
                  Crie novos exercícios na Prancheta Tática ou ajuste os filtros de pesquisa.
                </p>
              </div>
            </div>
          ) : drawerMode === "PASTAS" ? (
            /* 📂 VISTA HIERÁRQUICA POR PASTAS */
            <div className="space-y-3">
              {renderTreeLevel(null, 0)}
            </div>
          ) : (
            /* 📋 VISTA PLANA DE TODOS OS EXERCÍCIOS */
            <div className="space-y-2.5">
              {exerciciosFiltrados.map((ex) => renderExerciseCard(ex))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
