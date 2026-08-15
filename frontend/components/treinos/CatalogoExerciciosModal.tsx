"use client";

import React, { useEffect, useState } from "react";
import { Exercicio } from "@/models/exercicio";
import { apiFetch } from "@/lib/api";
import { 
  X, 
  Search, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Plus, 
  Sparkles,
  Dumbbell,
  Layers,
  Flame
} from "lucide-react";
import { NovoExercicioPranchetaModal } from "./NovoExercicioPranchetaModal";
import { TacticalBoardThumbnail } from "../prancheta/TacticalBoardThumbnail";

interface CatalogoExerciciosModalProps {
  onClose: () => void;
  onSelect: (exercicio: Exercicio) => void;
}

export function CatalogoExerciciosModal({
  onClose,
  onSelect,
}: CatalogoExerciciosModalProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Estado para edição / criação via Prancheta
  const [editingExercicio, setEditingExercicio] = useState<Exercicio | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const loadExercicios = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/exercicios");
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
      await apiFetch(`/exercicios/${id}`, {
        method: "DELETE",
      });
      setExercicios((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err) {
      console.error("Erro ao eliminar exercício:", err);
      alert("Erro ao eliminar exercício do catálogo.");
    }
  };

  const handleEdit = (e: React.MouseEvent, ex: Exercicio) => {
    e.stopPropagation();
    setEditingExercicio(ex);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEditingExercicio(null);
    setIsEditorOpen(true);
  };

  const handleEditorSaved = (savedEx: Exercicio) => {
    loadExercicios();
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
    const matchesCat = selectedCategory === "ALL" || e.categoria === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
        <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[850px] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-[#0b1120] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide uppercase">
                  Biblioteca de Exercícios
                </h2>
                <p className="text-xs text-slate-400">
                  Selecione, edite, duplique ou crie exercícios do catálogo global.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Novo</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="p-4 border-b border-slate-800 bg-[#070b14] flex flex-col md:flex-row gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar exercícios por nome, objetivos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Drills */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs gap-2">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span>A carregar catálogo de exercícios...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 text-xs gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Nenhum exercício encontrado</p>
                  <p className="text-slate-500">
                    Crie um novo exercício com a Prancheta Tática clicando em "+ Criar Novo".
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
                  <div className="relative group/thumb w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 flex flex-col items-center justify-center text-slate-400 overflow-hidden group-hover:border-cyan-500/30 transition-colors">
                    {(ex as any).dadosTaticos ? (
                      <TacticalBoardThumbnail tacticData={(ex as any).dadosTaticos} className="w-full h-full transition-opacity group-hover/thumb:opacity-50" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-cyan-400 mb-1" />
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-400 truncate max-w-[55px]">
                          {ex.categoria || "TATICO"}
                        </span>
                      </>
                    )}
                    
                    {/* Hover Edit Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEdit(e, ex)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold py-1 px-2 rounded shadow-lg flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Informação do Exercício */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {ex.nome}
                      </h4>

                      {/* Botões de Ação (Editar e Eliminar) */}
                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEdit(e, ex)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                          title="Editar / Duplicar na Prancheta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, ex.id, ex.nome)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Eliminar permanentemente da biblioteca"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {ex.objetivosEspecificos || ex.descricao || "Sem objetivos definidos."}
                    </p>

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

      {/* Modal Editor / Duplicador de Exercício */}
      {isEditorOpen && (
        <NovoExercicioPranchetaModal
          isOpen={isEditorOpen}
          initialExercicio={editingExercicio}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingExercicio(null);
          }}
          onExercicioCreated={(novoEx) => {
            handleEditorSaved(novoEx);
            onSelect(novoEx);
            onClose();
          }}
          onExercicioUpdated={(upEx) => {
            handleEditorSaved(upEx);
          }}
        />
      )}
    </>
  );
}
