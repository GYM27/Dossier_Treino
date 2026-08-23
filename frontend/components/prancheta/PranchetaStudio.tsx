"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Exercicio } from "@/models/exercicio";
import { exercicioService } from "@/services/exercicioService";
import { treinoService } from "@/services/treinoService";
import { SaveExercicioOptionsModal } from "@/components/prancheta/SaveExercicioOptionsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Search,
  Save,
  Trash2,
  Copy,
  Layers,
  Users,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Menu,
  X,
  FolderKanban,
  Target,
  ArrowLeft,
} from "lucide-react";

// Importação dinâmica da Prancheta Tática para evitar erros de SSR com o Canvas HTML5
const TacticalBoard = dynamic(
  () => import("@/components/prancheta/TacticalBoard"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#070b14] text-slate-500 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>A carregar Prancheta Tática...</span>
        </div>
      </div>
    ),
  },
);

const CATEGORIAS: Array<{ value: string; label: string; color: string }> = [
  { value: "TODOS", label: "Todos", color: "bg-slate-700 text-slate-200" },
  {
    value: "AQUECIMENTO",
    label: "Aquecimento",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    value: "TECNICO",
    label: "Técnico",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value: "TATICO",
    label: "Tático",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    value: "FISICO",
    label: "Físico",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    value: "GUARDA_REDES",
    label: "Guarda-Redes",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    value: "LUDICO",
    label: "Lúdico",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

interface PranchetaStudioProps {
  initialExercicioId?: string;
}

export function PranchetaStudio({ initialExercicioId }: PranchetaStudioProps = {}) {
  const searchParams = useSearchParams();
  const targetExercicioId = initialExercicioId || searchParams?.get("id") || null;
  const treinoId = searchParams?.get("treinoId") || null;
  const assocId = searchParams?.get("assocId") || null;

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("TODOS");

  // Estados de Interface (Drawer e Ficha Técnica)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(true);

  // Estados do Formulário de Edição
  const [nome, setNome] = useState("Novo Exercício Tático");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<Exercicio["categoria"]>("TATICO");
  const [nivelDificuldade, setNivelDificuldade] = useState(3);
  const [espaco, setEspaco] = useState("Meio-Campo (50x40m)");
  const [tempo, setTempo] = useState("15 min");
  const [jogadoresEnvolvidos, setJogadoresEnvolvidos] = useState(14);
  const [objetivosEspecificos, setObjetivosEspecificos] = useState("");
  const [carga, setCarga] = useState("");
  const [tacticData, setTacticData] = useState<any>(null);

  // Estados de Operação / Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados do Modal de Opções de Gravação (Atualizar Original vs Nova Variante)
  const [showSaveOptionsModal, setShowSaveOptionsModal] = useState(false);
  const [pendingDirectTacticData, setPendingDirectTacticData] = useState<any>(null);
  const [reassociatedInTreino, setReassociatedInTreino] = useState(false);

  // Preencher os campos do estúdio com os dados do exercício selecionado
  const carregarDetalhesExercicio = useCallback((ex: Exercicio) => {
    const rawObjetivos = ex.objetivosEspecificos || ex.dadosTaticos?.objetivoEspecifico || "";
    const rawCarga = ex.carga || ex.dadosTaticos?.carga || "";
    const rawDescricao = ex.descricao || ex.dadosTaticos?.descricaoMetodologica || "";
    const rawTempo = ex.dadosTaticos?.tempo || "";

    setSelectedExercicio(ex);
    setNome(ex.nome || "Sem Nome");
    setDescricao(rawDescricao);
    setCategoria(ex.categoria || "TATICO");
    setNivelDificuldade(ex.nivelDificuldade || 3);
    setEspaco(ex.espaco || "Meio-Campo");
    setTempo(rawTempo);
    setJogadoresEnvolvidos(ex.jogadoresEnvolvidos || 14);
    setObjetivosEspecificos(rawObjetivos);
    setCarga(rawCarga);

    // Assegurar sincronização nos dados táticos internos
    const mergedTactic = ex.dadosTaticos ? { ...ex.dadosTaticos } : {};
    mergedTactic.objetivoEspecifico = rawObjetivos;
    mergedTactic.carga = rawCarga;
    mergedTactic.descricaoMetodologica = rawDescricao;
    mergedTactic.tempo = rawTempo;
    setTacticData(mergedTactic);
    setErrorMsg(null);
  }, []);

  // Carregar lista de exercícios do servidor e, se houver id alvo, carregar o detalhe
  const carregarExercicios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await exercicioService.getExercicios();
      setExercicios(data || []);

      if (targetExercicioId && data) {
        const found = data.find((e) => e.id === targetExercicioId);
        if (found) {
          carregarDetalhesExercicio(found);
        } else {
          try {
            const fetched = await exercicioService.getExercicioById(targetExercicioId);
            if (fetched) carregarDetalhesExercicio(fetched);
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo de exercícios:", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetExercicioId, carregarDetalhesExercicio]);

  useEffect(() => {
    carregarExercicios();
  }, [carregarExercicios]);

  // Iniciar criação de um novo exercício a partir do zero
  const handleNovoExercicio = () => {
    setSelectedExercicio(null);
    setNome("Novo Exercício Tático");
    setDescricao("");
    setCategoria("TATICO");
    setNivelDificuldade(3);
    setEspaco("Meio-Campo (50x40m)");
    setTempo("15 min");
    setJogadoresEnvolvidos(14);
    setObjetivosEspecificos("");
    setCarga("");
    setTacticData(null);
    setErrorMsg(null);
    setIsDrawerOpen(false);
  };

  // Callback chamado quando a prancheta desenha ou altera algo
  const handleSaveTacticBoard = (data: any) => {
    setTacticData(data);
    if (data?.objetivoEspecifico !== undefined) {
      setObjetivosEspecificos(data.objetivoEspecifico);
    }
    if (data?.carga !== undefined) {
      setCarga(data.carga);
    }
    if (data?.descricaoMetodologica !== undefined) {
      setDescricao(data.descricaoMetodologica);
    }
    if (data?.tempo !== undefined) {
      setTempo(data.tempo);
    }
  };

  // Iniciar fluxo de gravação (abre modal se o exercício já existir)
  const handleGuardarExercicio = (directTacticData?: any) => {
    let finalNome = nome.trim();
    if (!finalNome) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    // Filtrar para evitar que eventos sintéticos do React passem como dados táticos
    const isValidTactic =
      directTacticData &&
      typeof directTacticData === "object" &&
      !("nativeEvent" in directTacticData) &&
      !("_reactName" in directTacticData);
    const currentTactic = isValidTactic ? directTacticData : tacticData;
    setPendingDirectTacticData(currentTactic);

    // Se o exercício já existe na base de dados, abrimos o modal de opções
    if (selectedExercicio?.id) {
      setShowSaveOptionsModal(true);
    } else {
      // Se for um novo exercício, grava diretamente como novo
      handleExecutarGravacao({
        isNew: true,
        nomeFinal: finalNome,
        directTacticData: currentTactic,
      });
    }
  };

  // Gravar ou Atualizar o Exercício na Base de Dados
  const handleExecutarGravacao = async ({
    isNew,
    nomeFinal,
    directTacticData,
  }: {
    isNew: boolean;
    nomeFinal: string;
    directTacticData?: any;
  }) => {
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    setReassociatedInTreino(false);

    try {
      const isValidDirect =
        directTacticData &&
        typeof directTacticData === "object" &&
        !("nativeEvent" in directTacticData) &&
        !("_reactName" in directTacticData);
      const isValidPending =
        pendingDirectTacticData &&
        typeof pendingDirectTacticData === "object" &&
        !("nativeEvent" in pendingDirectTacticData) &&
        !("_reactName" in pendingDirectTacticData);
      const currentTactic = isValidDirect
        ? directTacticData
        : isValidPending
        ? pendingDirectTacticData
        : tacticData;

      const finalObjetivos = (currentTactic?.objetivoEspecifico || objetivosEspecificos || "").trim();
      const finalCarga = (currentTactic?.carga || carga || "").trim();
      const finalDescricao = (currentTactic?.descricaoMetodologica || descricao || "").trim();
      const finalTempo = (currentTactic?.tempo || tempo || "").trim();

      let cleanTacticData: any = {};
      if (currentTactic && typeof currentTactic === "object") {
        try {
          cleanTacticData = JSON.parse(JSON.stringify(currentTactic));
        } catch {
          cleanTacticData = {};
        }
      }
      cleanTacticData.objetivoEspecifico = finalObjetivos;
      cleanTacticData.carga = finalCarga;
      cleanTacticData.descricaoMetodologica = finalDescricao;
      cleanTacticData.tempo = finalTempo;

      let finalNameNormalized = nomeFinal.trim();
      if (isNew && exercicios.some((e) => e.nome.toLowerCase() === finalNameNormalized.toLowerCase())) {
        let counter = 2;
        while (exercicios.some((e) => e.nome.toLowerCase() === `${finalNameNormalized} (${counter})`.toLowerCase())) {
          counter++;
        }
        finalNameNormalized = `${finalNameNormalized} (${counter})`;
      }

      const payload: Partial<Exercicio> = {
        nome: finalNameNormalized,
        descricao: finalDescricao,
        categoria: categoria || "TATICO",
        nivelDificuldade: nivelDificuldade || 3,
        espaco: espaco || "Meio-Campo",
        jogadoresEnvolvidos: jogadoresEnvolvidos || 14,
        objetivosEspecificos: finalObjetivos,
        carga: finalCarga,
        dadosTaticos: cleanTacticData,
      };

      // Extrair minutos válidos do campo tempo (ex: "20 min" -> 20)
      const parsedMinutes = parseInt(finalTempo.replace(/\D/g, ""), 10);
      const hasValidMinutes = !isNaN(parsedMinutes) && parsedMinutes > 0;

      if (!isNew && selectedExercicio?.id) {
        // Atualizar exercício original existente (PUT)
        const atualizado = await exercicioService.atualizarExercicio(
          selectedExercicio.id,
          payload,
        );
        setSelectedExercicio(atualizado);
        setNome(atualizado.nome);
        setExercicios((prev) =>
          prev.map((e) => (e.id === atualizado.id ? atualizado : e)),
        );

        // Se veio de um plano de treino, atualiza também a duração na associação do treino!
        if (treinoId && assocId && hasValidMinutes) {
          try {
            await treinoService.atualizarExercicio(treinoId, assocId, {
              duracaoMinutos: parsedMinutes,
            });
          } catch (errTreino) {
            console.error("Erro ao sincronizar duração no treino:", errTreino);
          }
        }
      } else {
        // Criar novo exercício independente / variante (POST)
        const criado = await exercicioService.criarExercicio(payload);
        setSelectedExercicio(criado);
        setNome(criado.nome);
        setExercicios((prev) => [criado, ...prev]);

        // Se veio de um treino, re-associa apenas esta posição do treino ao novo exercício e sincroniza duração
        if (treinoId && assocId) {
          try {
            const updatePayload: any = { exercicioId: criado.id };
            if (hasValidMinutes) {
              updatePayload.duracaoMinutos = parsedMinutes;
            }
            await treinoService.atualizarExercicio(treinoId, assocId, updatePayload);
            setReassociatedInTreino(true);
          } catch (errTreino) {
            console.error("Erro ao re-associar exercício ao treino:", errTreino);
          }
        }
      }

      setShowSaveOptionsModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao gravar exercício:", err);
      setErrorMsg(err.message || "Erro ao gravar o exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicar o exercício atual como uma nova cópia
  const handleDuplicarExercicio = async () => {
    if (!selectedExercicio) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Exercicio> = {
        nome: `${nome} (Cópia)`,
        descricao: descricao,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        objetivosEspecificos: objetivosEspecificos,
        dadosTaticos: tacticData,
      };
      const copia = await exercicioService.criarExercicio(payload);
      setSelectedExercicio(copia);
      setExercicios((prev) => [copia, ...prev]);
      setNome(copia.nome);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error("Erro ao duplicar exercício:", err);
      setErrorMsg("Erro ao duplicar o exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar exercício
  const handleEliminarExercicio = async () => {
    if (!selectedExercicio?.id) return;
    if (
      !confirm(
        `Tem a certeza que deseja eliminar o exercício "${selectedExercicio.nome}"?`,
      )
    )
      return;

    try {
      await exercicioService.eliminarExercicio(selectedExercicio.id);
      const restantes = exercicios.filter((e) => e.id !== selectedExercicio.id);
      setExercicios(restantes);
      if (restantes.length > 0) {
        carregarDetalhesExercicio(restantes[0]);
      } else {
        handleNovoExercicio();
      }
    } catch (err) {
      console.error("Erro ao eliminar exercício:", err);
      alert(
        "Erro ao eliminar o exercício. Pode estar associado a um treino existente.",
      );
    }
  };

  // Filtros de Pesquisa e Categoria
  const exerciciosFiltrados = exercicios.filter((ex) => {
    const matchesSearch =
      (ex.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.objetivosEspecificos || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCat =
      categoriaFilter === "TODOS" || ex.categoria === categoriaFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-[#070b14] border border-slate-800/80 rounded-2xl shadow-2xl select-none">
      {/* 📁 DRAWER RETRÁTIL (HAMBÚRGUER): Catálogo de Exercícios */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      <aside
        className={cn(
          "absolute top-0 left-0 bottom-0 z-50 w-80 md:w-96 flex flex-col bg-[#111827] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out",
          isDrawerOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none",
        )}
      >
        {/* Topo do Catálogo com Botão Fechar e Ação Novo */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#0d131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  Biblioteca
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  {exercicios.length}{" "}
                  {exercicios.length === 1
                    ? "exercício criado"
                    : "exercícios criados"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNovoExercicio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                title="Criar novo exercício na prancheta"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Fechar Menu"
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

          {/* Filtros de Categoria */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS.map((cat) => {
              const isSelected = categoriaFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaFilter(cat.value)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold tracking-wider whitespace-nowrap transition-all",
                    isSelected
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "bg-[#1e293b]/80 text-slate-400 hover:bg-[#334155] hover:text-white",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar biblioteca...</span>
            </div>
          ) : exerciciosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400 text-xs gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">
                  Nenhum exercício encontrado
                </p>
                <p className="text-[11px] text-slate-500">
                  Clique em "+ Novo" para desenhar o primeiro exercício na
                  prancheta.
                </p>
              </div>
            </div>
          ) : (
            exerciciosFiltrados.map((ex) => {
              const isSelected = selectedExercicio?.id === ex.id;
              const catBadge =
                CATEGORIAS.find((c) => c.value === ex.categoria) ||
                CATEGORIAS[3];

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    carregarDetalhesExercicio(ex);
                    setIsDrawerOpen(false);
                  }}
                  className={cn(
                    "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                      : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border",
                        catBadge.color,
                      )}
                    >
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
                      isSelected
                        ? "text-cyan-300"
                        : "text-white group-hover:text-cyan-200",
                    )}
                  >
                    {ex.nome}
                  </h3>

                  {ex.objetivosEspecificos && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {ex.objetivosEspecificos}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                    <span className="truncate">{ex.espaco || "Campo"}</span>
                    <span>
                      {ex.jogadoresEnvolvidos
                        ? `${ex.jogadoresEnvolvidos} atletas`
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 🎨 PAINEL PRINCIPAL: Estúdio da Prancheta Tática */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
        {/* Barra Superior do Estúdio */}
        <header className="px-4 py-2.5 border-b border-slate-800 bg-[#0d131f] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Botão Menu Hambúrguer para Abrir a Biblioteca */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Abrir Biblioteca de Exercícios"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
              <span>Exercícios ({exercicios.length})</span>
            </button>

            <button
              onClick={handleNovoExercicio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all active:scale-95"
              title="Criar Novo Exercício"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>

            {treinoId && (
              <Link
                href="/treinos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Voltar ao Plano de Treino"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voltar ao Treino</span>
              </Link>
            )}

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-[340px]">
                {nome || "Novo Exercício"}
              </h1>
              {selectedExercicio ? (
                <Badge
                  variant="cyan"
                  className="text-[10px] py-0.5 hidden sm:inline-flex"
                >
                  Guardado
                </Badge>
              ) : (
                <Badge
                  variant="amber"
                  className="text-[10px] py-0.5 hidden sm:inline-flex"
                >
                  Não Gravado
                </Badge>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <Button
              variant={showMetadataPanel ? "cyan" : "dark"}
              size="sm"
              onClick={() => setShowMetadataPanel(!showMetadataPanel)}
              title="Mostrar/Esconder dados da Ficha Técnica na horizontal"
              className="h-8 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              <span>
                {showMetadataPanel ? "Ocultar Ficha" : "Ficha Técnica"}
              </span>
            </Button>

            {selectedExercicio && (
              <>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleDuplicarExercicio}
                  disabled={isSaving}
                  title="Criar uma cópia deste exercício"
                  className="h-8 text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="hidden md:inline">Duplicar</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEliminarExercicio}
                  disabled={isSaving}
                  title="Eliminar exercício do catálogo"
                  className="h-8 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden md:inline">Eliminar</span>
                </Button>
              </>
            )}

            <Button
              variant="cyan"
              size="sm"
              onClick={() => handleGuardarExercicio()}
              disabled={isSaving}
              title="Guardar alterações no catálogo"
              className="h-8 text-xs font-bold"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-1" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{saveSuccess ? "Gravado!" : "Guardar"}</span>
            </Button>
          </div>
        </header>

        {/* 📋 FICHA TÉCNICA HORIZONTAL (EXPANSÍVEL / COLAPSÁVEL - APENAS DADOS TÉCNICOS) */}
        {showMetadataPanel && (
          <div className="bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 p-2.5 px-4 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
              {/* Nome do Exercício */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nome do Exercício *
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Saída de Pressão 3v2"
                  className="text-xs h-8 bg-[#162032]"
                />
              </div>

              {/* Categoria */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full bg-[#162032] border border-slate-700/80 rounded-lg px-2.5 h-8 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="AQUECIMENTO">Aquecimento</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="TATICO">Tático</option>
                  <option value="FISICO">Físico</option>
                  <option value="GUARDA_REDES">Guarda-Redes</option>
                  <option value="LUDICO">Lúdico</option>
                </select>
              </div>

              {/* Espaço */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Espaço
                </label>
                <Input
                  value={espaco}
                  onChange={(e) => setEspaco(e.target.value)}
                  placeholder="Ex: 50x40m"
                  className="text-xs h-8 bg-[#162032]"
                />
              </div>

              {/* Tempo */}
              <div className="md:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Tempo
                </label>
                <Input
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  placeholder="Ex: 15 min"
                  className="text-xs h-8 bg-[#162032] text-cyan-200 border-cyan-500/30 font-semibold"
                />
              </div>

              {/* Nº Jogadores */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nº Atletas
                </label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={jogadoresEnvolvidos}
                  onChange={(e) =>
                    setJogadoresEnvolvidos(parseInt(e.target.value) || 14)
                  }
                  className="text-xs font-mono h-8 bg-[#162032]"
                />
              </div>

              {/* Dificuldade */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dificuldade (1-5)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNivelDificuldade(lvl)}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-xs font-bold transition-all",
                        nivelDificuldade >= lvl
                          ? "bg-cyan-500 text-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-500 hover:bg-slate-700",
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="mx-4 mt-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Banner Informativo de Re-Associação com Sucesso no Treino */}
        {reassociatedInTreino && treinoId && (
          <div className="mx-4 mt-2 p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Nova variante criada e associada a este exercício do treino com sucesso! Os restantes exercícios do treino continuam inalterados.</span>
            </div>
            <Link
              href="/treinos"
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              Voltar ao Treino
            </Link>
          </div>
        )}

        {/* 🕹️ Quadro Tático Interativo (Ocupa 100% da Área Útil) */}
        <div className="flex-1 w-full h-full min-h-0 bg-[#070b14] p-2 md:p-3 overflow-hidden flex flex-col items-center justify-center relative">
          <div className="w-full h-full flex items-center justify-center">
            <TacticalBoard
              key={selectedExercicio?.id || "novo-exercicio"}
              initialTacticData={tacticData}
              onChange={handleSaveTacticBoard}
              onSave={(data) => handleGuardarExercicio(data)}
            />
          </div>
        </div>
      </main>

      {/* Modal de Confirmação e Opções de Gravação */}
      <SaveExercicioOptionsModal
        isOpen={showSaveOptionsModal}
        onClose={() => setShowSaveOptionsModal(false)}
        currentNome={nome}
        isFromTreino={Boolean(treinoId)}
        isSaving={isSaving}
        onConfirmOverwrite={() =>
          handleExecutarGravacao({
            isNew: false,
            nomeFinal: nome,
          })
        }
        onConfirmSaveAsNew={(novoNome) =>
          handleExecutarGravacao({
            isNew: true,
            nomeFinal: novoNome,
          })
        }
      />
    </div>
  );
}
