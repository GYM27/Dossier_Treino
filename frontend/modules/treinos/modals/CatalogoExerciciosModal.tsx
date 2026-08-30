"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Exercicio } from "@/models/exercicio";
import {
  PastaItem,
  loadStoredPastas,
  saveStoredPastas,
  matchesPasta,
} from "@/models/pasta";
import { exercicioService } from "@/services/exercicioService";
import { X, Search } from "lucide-react";
import { CATEGORIAS_COM_TODOS } from "@/models/categoria-exercicio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CatalogoSidebarPastas } from "./catalogo/CatalogoSidebarPastas";
import { CatalogoExerciseGrid } from "./catalogo/CatalogoExerciseGrid";
import { cn } from "@/lib/utils";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [selectedTag, setSelectedTag] = useState<string>("TODOS");
  const [drawerMode, setDrawerMode] = useState<"PASTAS" | "TODOS">("PASTAS");

  // Pastas
  const [pastas, setPastas] = useState<PastaItem[]>(loadStoredPastas);
  const [expandedPastas, setExpandedPastas] = useState<Record<string, boolean>>({
    "org-ofensiva": true,
    "org-defensiva": true,
    "trans-ofensiva": true,
    "trans-defensiva": true,
    "bolas-paradas": true,
  });

  const [isCreatingPasta, setIsCreatingPasta] = useState(false);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [novaPastaNome, setNovaPastaNome] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const loadExercicios = async () => {
    try {
      setLoading(true);
      const data = await exercicioService.getExercicios();
      setExercicios(data || []);
    } catch (err) {
      console.error("Erro ao carregar catálogo de exercícios:", err);
      toast.error("Erro ao carregar exercícios do catálogo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercicios();
    setPastas(loadStoredPastas());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string, nome: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Exercício",
      description: `Tem a certeza que deseja eliminar permanentemente o exercício "${nome}" da biblioteca?`,
      onConfirm: async () => {
        try {
          await exercicioService.eliminarExercicio(id);
          setExercicios((prev) => prev.filter((ex) => ex.id !== id));
          toast.success("Exercício eliminado com sucesso!");
        } catch (err) {
          console.error("Erro ao eliminar exercício:", err);
          toast.error("Erro ao eliminar exercício do catálogo.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const togglePastaExpanded = (pastaId: string) => {
    setExpandedPastas((prev) => ({ ...prev, [pastaId]: !prev[pastaId] }));
  };

  const handleIniciarCriacaoSubpasta = (e: React.MouseEvent, parentId: string) => {
    e.stopPropagation();
    setCreatingParentId(parentId);
    setNovaPastaNome("");
    setIsCreatingPasta(true);
    setExpandedPastas((prev) => ({ ...prev, [parentId]: true }));
  };

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
      toast.warning("Já existe uma pasta com esse nome neste nível.");
      return;
    }

    const newId = `pasta-${Date.now()}`;
    const nova: PastaItem = { id: newId, nome: limpo, parentId: creatingParentId || null };
    const atualizadas = [...pastas, nova];
    setPastas(atualizadas);
    saveStoredPastas(atualizadas);
    setSelectedCategory(limpo);
    setNovaPastaNome("");
    setIsCreatingPasta(false);
    setCreatingParentId(null);
    setExpandedPastas((prev) => ({
      ...prev,
      [newId]: true,
      ...(creatingParentId ? { [creatingParentId]: true } : {}),
    }));
    toast.success(`Pasta "${limpo}" criada com sucesso!`);
  };

  const handlePedirEliminarPasta = (e: React.MouseEvent, pastaId: string, nomePasta: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Pasta",
      description: `Tem a certeza que deseja eliminar a pasta "${nomePasta}"?`,
      onConfirm: () => {
        const filtradas = pastas.filter((p) => p.id !== pastaId && p.parentId !== pastaId);
        setPastas(filtradas);
        saveStoredPastas(filtradas);
        if (selectedCategory === nomePasta) setSelectedCategory("Organização Ofensiva");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        toast.success(`Pasta "${nomePasta}" eliminada.`);
      },
    });
  };

  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter((ex) => {
      if (drawerMode === "PASTAS") {
        const pastaObj = pastas.find(
          (p) => p.nome === selectedCategory || p.id === selectedCategory
        );
        if (pastaObj && !matchesPasta(ex, pastaObj)) return false;
      }
      if (selectedTag !== "TODOS") {
        if ((ex.categoria || "").toLowerCase() !== selectedTag.toLowerCase()) return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchNome = (ex.nome || "").toLowerCase().includes(query);
        const matchDesc = (ex.descricao || "").toLowerCase().includes(query);
        const matchCat = (ex.categoria || "").toLowerCase().includes(query);
        if (!matchNome && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [exercicios, drawerMode, selectedCategory, selectedTag, search, pastas]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <header className="p-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-[#070b14]/80">
          <div>
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              {replacingExerciseName ? (
                <>Substituir <span className="text-cyan-400">"{replacingExerciseName}"</span></>
              ) : (
                "Catálogo de Exercícios"
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Selecione um exercício da sua biblioteca para adicionar ao treino.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Barra de Filtros e Busca */}
        <div className="px-4 md:px-6 py-3 border-b border-slate-800/80 bg-[#070b14]/50 flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, objetivo..."
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 placeholder:text-slate-600"
            />
          </div>

          {/* Tags de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {CATEGORIAS_COM_TODOS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedTag(cat.value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  selectedTag === cat.value
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Corpo: Sidebar de Pastas + Grelha de Exercícios */}
        <div className="flex-1 flex overflow-hidden">
          <CatalogoSidebarPastas
            pastas={pastas}
            exercicios={exercicios}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            drawerMode={drawerMode}
            setDrawerMode={setDrawerMode}
            expandedPastas={expandedPastas}
            togglePastaExpanded={togglePastaExpanded}
            isCreatingPasta={isCreatingPasta}
            setIsCreatingPasta={setIsCreatingPasta}
            creatingParentId={creatingParentId}
            setCreatingParentId={setCreatingParentId}
            novaPastaNome={novaPastaNome}
            setNovaPastaNome={setNovaPastaNome}
            onCriarPasta={handleCriarNovaPasta}
            onIniciarCriacaoSubpasta={handleIniciarCriacaoSubpasta}
            onPedirEliminarPasta={handlePedirEliminarPasta}
          />

          <main className="flex-1 overflow-y-auto bg-[#070b14]/30">
            <CatalogoExerciseGrid
              exercicios={exerciciosFiltrados}
              isLoading={loading}
              onSelect={onSelect}
              onDelete={handleDelete}
            />
          </main>
        </div>

        {/* Dialogo de Confirmação */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}

export default CatalogoExerciciosModal;
