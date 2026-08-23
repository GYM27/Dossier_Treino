"use client";

import React, { useEffect, useState } from "react";
import { Exercicio } from "@/models/exercicio";
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
  RefreshCw
} from "lucide-react";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";

interface CatalogoExerciciosModalProps {
  onClose: () => void;
  onSelect: (exercicio: Exercicio) => void;
  replacingExerciseName?: string;
}

export function CatalogoExerciciosModal({
  onClose,
  onSelect,
  replacingExerciseName,
}: CatalogoExerciciosModalProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

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

  const categories = [
    { id: "ALL", label: "Todos" },
    { id: "AQUECIMENTO", label: "Aquecimento" },
    { id: "TECNICO", label: "Técnico" },
    { id: "TATICO", label: "Tático" },
    { id: "FISICO", label: "Físico" },
    { id: "GUARDA_REDES", label: "Guarda-Redes" },
    { id: "LUDICO", label: "Lúdico" },
  ];

  const filtered = exercicios.filter((e) => {
    const matchesSearch =
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      (e.objetivosEspecificos || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.descricao || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || e.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#0b1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header do Catálogo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              replacingExerciseName 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}>
              {replacingExerciseName ? <RefreshCw className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                {replacingExerciseName ? "Substituir Exercício da Sessão" : "Biblioteca de Exercícios"}
              </h3>
              <p className="text-xs text-slate-400">
                {replacingExerciseName ? (
                  <span>
                    A substituir <strong className="text-amber-300">{replacingExerciseName}</strong> (mantém o mesmo lugar/ordem no treino).
                  </span>
                ) : (
                  "Selecione um exercício do catálogo para adicionar à sessão de treino."
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="p-4 bg-[#0d131f] border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar exercícios por nome, objetivos ou palavras-chave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#162032] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Categorias */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
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
        </div>

        {/* Lista de Exercícios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs gap-3">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar catálogo de exercícios...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-400 text-xs gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">
                  Nenhum exercício encontrado
                </p>
                <p className="text-slate-500 text-[11px]">
                  Crie novos exercícios na página dedicada da Prancheta Tática.
                </p>
              </div>
            </div>
          ) : (
            filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="group relative flex items-start gap-4 p-4 rounded-xl bg-[#111827]/80 border border-slate-800/90 hover:border-cyan-500/70 hover:bg-[#162032] cursor-pointer transition-all shadow-sm"
              >
                {/* Thumbnail / Category Badge */}
                <div className="relative w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 shrink-0 flex flex-col items-center justify-center text-slate-400 overflow-hidden group-hover:border-cyan-500/30 transition-colors">
                  {(ex as any).dadosTaticos ? (
                    <TacticalBoardThumbnail tacticData={(ex as any).dadosTaticos} className="w-full h-full transition-opacity group-hover:opacity-90" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400 truncate max-w-[55px]">
                        {ex.categoria || "TATICO"}
                      </span>
                    </>
                  )}
                </div>

                {/* Informação do Exercício */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {ex.nome}
                    </h4>

                    {/* Botão de Eliminar */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(e, ex.id, ex.nome)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar permanentemente da biblioteca"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {ex.carga ? (
                    <p className="text-xs text-cyan-400 font-medium line-clamp-1 mb-1.5 flex items-center gap-1.5">
                      <span className="text-xs">⏱️</span>
                      <span>{ex.carga}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {ex.objetivosEspecificos || ex.descricao || "Sem objetivos definidos."}
                    </p>
                  )}

                  {/* Metadados adicionais */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    {ex.espaco && (
                      <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                        {ex.espaco}
                      </span>
                    )}
                    {ex.jogadoresEnvolvidos && (
                      <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                        {ex.jogadoresEnvolvidos} jogadores
                      </span>
                    )}
                    {ex.nivelDificuldade && (
                      <span className="flex items-center gap-1 font-mono text-amber-400/90">
                        <Flame className="w-3 h-3" />
                        {ex.nivelDificuldade}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicador de Seleção no Hover */}
                <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
