"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Exercicio } from "@/models/exercicio";
import {
  PastaItem,
  PastaDropdownOption,
  DEFAULT_MAIN_PASTAS,
  matchesPasta,
  getExercisesForFolderAndDescendants,
  buildHierarchicalOptions,
  loadStoredPastas,
  saveStoredPastas,
} from "@/models/pasta";
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
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
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

  // Estados do Sistema de Pastas Hierárquicas e Gaveta
  const [pastas, setPastas] = useState<PastaItem[]>(DEFAULT_MAIN_PASTAS);
  const [pasta, setPasta] = useState<string>("Organização Ofensiva");
  const [expandedPastas, setExpandedPastas] = useState<Record<string, boolean>>({
    "org-ofensiva": true,
    "org-defensiva": true,
    "trans-ofensiva": true,
    "trans-defensiva": true,
    "bolas-paradas": true,
  });
  const [drawerMode, setDrawerMode] = useState<"PASTAS" | "TODOS">("PASTAS");
  const [isCreatingPasta, setIsCreatingPasta] = useState(false);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [novaPastaNome, setNovaPastaNome] = useState("");

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

  // Carregar pastas personalizadas do localStorage
  useEffect(() => {
    try {
      const savedPastas = localStorage.getItem("prancheta_pastas_hierarquia_v2");
      if (savedPastas) {
        const parsed = JSON.parse(savedPastas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingNames = new Set(parsed.map((p: any) => (p.nome || "").toLowerCase()));
          const missingDefaults = DEFAULT_MAIN_PASTAS.filter(
            (def) => !existingNames.has(def.nome.toLowerCase())
          );
          setPastas([...parsed, ...missingDefaults]);
          return;
        }
      }
    } catch (_) {}
    setPastas(DEFAULT_MAIN_PASTAS);
  }, []);

  // Preencher os campos do estúdio com os dados do exercício selecionado
  const carregarDetalhesExercicio = useCallback((ex: Exercicio) => {
    const rawObjetivos = ex.objetivosEspecificos || ex.dadosTaticos?.objetivoEspecifico || "";
    const rawCarga = ex.carga || ex.dadosTaticos?.carga || "";
    const rawDescricao = ex.descricao || ex.dadosTaticos?.descricaoMetodologica || "";
    const rawTempo = ex.dadosTaticos?.tempo || "";
    const rawPasta = ex.dadosTaticos?.pasta || ex.dadosTaticos?.pastaId || "Organização Ofensiva";

    setSelectedExercicio(ex);
    setNome(ex.nome || "Sem Nome");
    setDescricao(rawDescricao);
    setCategoria(ex.categoria || "TATICO");
    setPasta(rawPasta);
    setNivelDificuldade(ex.nivelDificuldade || 3);
    setEspaco(ex.espaco || "Meio-Campo");
    setTempo(rawTempo);
    setJogadoresEnvolvidos(ex.jogadoresEnvolvidos || 14);
    setObjetivosEspecificos(rawObjetivos);
    setCarga(rawCarga);

    // Expandir automaticamente a pasta do exercício selecionado no acordeão
    setExpandedPastas((prev) => ({ ...prev, [rawPasta]: true }));

    // Assegurar sincronização nos dados táticos internos
    const mergedTactic = ex.dadosTaticos ? { ...ex.dadosTaticos } : {};
    mergedTactic.objetivoEspecifico = rawObjetivos;
    mergedTactic.carga = rawCarga;
    mergedTactic.descricaoMetodologica = rawDescricao;
    mergedTactic.tempo = rawTempo;
    mergedTactic.pasta = rawPasta;
    setTacticData(mergedTactic);
    setErrorMsg(null);
  }, []);

  // Iniciar criação de uma nova pasta ou subpasta
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
    try {
      localStorage.setItem("prancheta_pastas_hierarquia_v2", JSON.stringify(atualizadas));
    } catch (_) {}
    setPasta(limpo);
    setNovaPastaNome("");
    setIsCreatingPasta(false);
    setCreatingParentId(null);
    setExpandedPastas((prev) => ({
      ...prev,
      [newId]: true,
      ...(creatingParentId ? { [creatingParentId]: true } : {}),
    }));
  };

  // Iniciar criação rápida de uma subpasta dentro de uma pasta específica
  const handleIniciarCriacaoSubpasta = (e: React.MouseEvent, parentId: string) => {
    e.stopPropagation();
    setCreatingParentId(parentId);
    setNovaPastaNome("");
    setIsCreatingPasta(true);
    setExpandedPastas((prev) => ({ ...prev, [parentId]: true }));
  };

  // Eliminar uma pasta personalizada
  const handleEliminarPasta = (e: React.MouseEvent, pastaId: string, nomePasta: string) => {
    e.stopPropagation();
    if (
      !confirm(
        `Tem a certeza que deseja eliminar a pasta "${nomePasta}"? As subpastas e exercícios associados permanecerão intactos na biblioteca geral.`
      )
    )
      return;

    const atualizadas = pastas.filter((p) => p.id !== pastaId && p.parentId !== pastaId);
    setPastas(atualizadas);
    try {
      localStorage.setItem("prancheta_pastas_hierarquia_v2", JSON.stringify(atualizadas));
    } catch (_) {}
  };

  // Alternar colapso de uma pasta no acordeão
  const togglePastaExpanded = (pastaId: string) => {
    setExpandedPastas((prev) => ({
      ...prev,
      [pastaId]: !prev[pastaId],
    }));
  };

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
    setPasta("Organização Ofensiva");
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
    pastaFinal,
    directTacticData,
  }: {
    isNew: boolean;
    nomeFinal: string;
    pastaFinal?: string;
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

      const finalObjetivos = (objetivosEspecificos || currentTactic?.objetivoEspecifico || "").trim();
      const finalCarga = (carga || currentTactic?.carga || "").trim();
      const finalDescricao = (descricao || currentTactic?.descricaoMetodologica || "").trim();
      const finalTempo = (tempo || currentTactic?.tempo || "").trim();
      const finalPasta = (pastaFinal || pasta || currentTactic?.pasta || "Organização Ofensiva").trim();

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
      cleanTacticData.pasta = finalPasta;

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

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNovoExercicio}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                title="Criar novo exercício na prancheta"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(false)}
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

          {/* Alternância de Modo: Pastas vs Todos + Botão Nova Pasta */}
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

          {/* Caixa de Criação de Pasta Inline */}
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
                    if (e.key === "Enter") handleCriarNovaPasta();
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
                  onClick={handleCriarNovaPasta}
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

          {/* Filtros de Categoria (apenas no modo TODOS) */}
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
          )}
        </div>

        {/* Lista de Exercícios (Pastas ou Todos) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar biblioteca...</span>
            </div>
          ) : drawerMode === "PASTAS" ? (
            /* 📂 VISTA POR PASTAS HIERÁRQUICA (ACORDEÃO E SUBPASTAS) */
            <div className="space-y-2.5">
              {(() => {
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
                              level === 0
                                ? "border-slate-800/90 bg-[#0d131f]/70"
                                : "border-slate-800/60 bg-[#090d16]/90 ml-3"
                            )}
                          >
                            {/* Cabeçalho da Pasta / Subpasta */}
                            <div
                              onClick={() => togglePastaExpanded(folder.id)}
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
                                <span className={cn(
                                  "font-bold text-slate-200 tracking-wide truncate",
                                  level === 0 ? "text-xs" : "text-[11px]"
                                )}>
                                  {folder.nome}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                                  {childFolders.length > 0 ? `${directExercises.length} (${totalExercises.length})` : directExercises.length}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Botão [+] para Criar Subpasta Imediata */}
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

                            {/* Conteúdo Expandido (Subpastas + Exercícios) */}
                            {isExpanded && (
                              <div className="p-2 space-y-2 bg-[#080c14]/90 border-t border-slate-800/80">
                                {/* Subpastas Aninhadas */}
                                {childFolders.length > 0 && renderTreeLevel(folder.id, level + 1)}

                                {/* Exercícios Diretos desta Pasta */}
                                {directExercises.length > 0 && (
                                  <div className="space-y-1.5">
                                    {directExercises.map((ex) => {
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
                                            "group relative p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5",
                                            isSelected
                                              ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                                              : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700",
                                          )}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <span
                                              className={cn(
                                                "px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border",
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
                                            <p className="text-[10px] text-slate-400 line-clamp-1">
                                              {ex.objetivosEspecificos}
                                            </p>
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
                                    Pasta vazia. Clique em [+] para criar uma subpasta ou atribua exercícios na Ficha Técnica.
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

                return renderTreeLevel(null, 0);
              })()}
            </div>
          ) : (
            /* 📋 VISTA LISTA COMPLETA ("TODOS") */
            exerciciosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400 text-xs gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">
                    Nenhum exercício encontrado
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Clique em "+ Novo" para desenhar o primeiro exercício na prancheta.
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
            )
          )}
        </div>
      </aside>

      {/* 🎨 PAINEL PRINCIPAL: Estúdio da Prancheta Tática */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
        {/* Barra Superior do Estúdio */}
        <header className="px-4 py-2.5 border-b border-slate-800 bg-[#0d131f] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Botão Menu Hambúrguer com Toggle 1-Clique */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95",
                isDrawerOpen
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-white",
              )}
              title={isDrawerOpen ? "Fechar Biblioteca (1-Clique)" : "Abrir Biblioteca (1-Clique)"}
            >
              {isDrawerOpen ? (
                <X className="w-4 h-4 text-slate-950" />
              ) : (
                <Menu className="w-4 h-4 text-cyan-400" />
              )}
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

              {/* Pasta */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  📁 Pasta
                </label>
                <select
                  value={pasta}
                  onChange={(e) => setPasta(e.target.value)}
                  className="w-full bg-[#162032] border border-amber-500/30 rounded-lg px-2.5 h-8 text-xs text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  {buildHierarchicalOptions(pastas).map((opt) => (
                    <option key={opt.id} value={opt.nome}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
              <div className="md:col-span-1 space-y-1">
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
              <div className="md:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Atletas
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
        currentPasta={pasta}
        pastaOptions={buildHierarchicalOptions(pastas)}
        isFromTreino={Boolean(treinoId)}
        isSaving={isSaving}
        onConfirmOverwrite={(novaPasta) => {
          if (novaPasta) setPasta(novaPasta);
          handleExecutarGravacao({
            isNew: false,
            nomeFinal: nome,
            pastaFinal: novaPasta || pasta,
          });
        }}
        onConfirmSaveAsNew={(novoNome, novaPasta) => {
          if (novaPasta) setPasta(novaPasta);
          handleExecutarGravacao({
            isNew: true,
            nomeFinal: novoNome,
            pastaFinal: novaPasta || pasta,
          });
        }}
      />
    </div>
  );
}
