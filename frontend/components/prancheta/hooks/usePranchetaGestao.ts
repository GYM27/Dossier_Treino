"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Exercicio } from "@/models/exercicio";
import { exercicioService } from "@/services/exercicioService";
import { treinoService } from "@/services/treinoService";

export interface UsePranchetaGestaoProps {
  initialExercicioId?: string;
  treinoId?: string | null;
  assocId?: string | null;
  onPastaSelect?: (pasta: string) => void;
}

export interface UsePranchetaGestaoReturn {
  exercicios: Exercicio[];
  setExercicios: React.Dispatch<React.SetStateAction<Exercicio[]>>;
  selectedExercicio: Exercicio | null;
  setSelectedExercicio: (ex: Exercicio | null) => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoriaFilter: string;
  setCategoriaFilter: (cat: string) => void;
  nome: string;
  setNome: (nome: string) => void;
  descricao: string;
  setDescricao: (desc: string) => void;
  categoria: Exercicio["categoria"];
  setCategoria: (cat: Exercicio["categoria"]) => void;
  nivelDificuldade: number;
  setNivelDificuldade: (lvl: number) => void;
  espaco: string;
  setEspaco: (esp: string) => void;
  tempo: string;
  setTempo: (tempo: string) => void;
  jogadoresEnvolvidos: number;
  setJogadoresEnvolvidos: (num: number) => void;
  objetivosEspecificos: string;
  setObjetivosEspecificos: (obj: string) => void;
  carga: string;
  setCarga: (carga: string) => void;
  tacticData: any;
  setTacticData: (data: any) => void;
  isSaving: boolean;
  saveSuccess: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  showSaveOptionsModal: boolean;
  setShowSaveOptionsModal: (show: boolean) => void;
  pendingDirectTacticData: any;
  setPendingDirectTacticData: (data: any) => void;
  reassociatedInTreino: boolean;
  exerciciosFiltrados: Exercicio[];
  carregarExercicios: () => Promise<void>;
  carregarDetalhesExercicio: (ex: Exercicio) => void;
  handleNovoExercicio: () => void;
  handleSaveTacticBoard: (data: any) => void;
  handleGuardarExercicio: (directTacticData?: any) => void;
  handleExecutarGravacao: (params: {
    isNew: boolean;
    nomeFinal: string;
    pastaFinal?: string;
    directTacticData?: any;
  }) => Promise<void>;
  handleDuplicarExercicio: () => Promise<void>;
  handleEliminarExercicioConfirmado: (exercicioId: string) => Promise<void>;
}

export function usePranchetaGestao({
  initialExercicioId,
  treinoId,
  assocId,
  onPastaSelect,
}: UsePranchetaGestaoProps): UsePranchetaGestaoReturn {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("TODOS");

  // Manter referência estável da função onPastaSelect para não quebrar memoização
  const onPastaSelectRef = useRef(onPastaSelect);
  useEffect(() => {
    onPastaSelectRef.current = onPastaSelect;
  }, [onPastaSelect]);

  // Campos do formulário
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

  // Estados de feedback / modal
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSaveOptionsModal, setShowSaveOptionsModal] = useState(false);
  const [pendingDirectTacticData, setPendingDirectTacticData] = useState<any>(null);
  const [reassociatedInTreino, setReassociatedInTreino] = useState(false);

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
    setNivelDificuldade(ex.nivelDificuldade || 3);
    setEspaco(ex.espaco || "Meio-Campo");
    setTempo(rawTempo);
    setJogadoresEnvolvidos(ex.jogadoresEnvolvidos || 14);
    setObjetivosEspecificos(rawObjetivos);
    setCarga(rawCarga);

    if (onPastaSelectRef.current) {
      onPastaSelectRef.current(rawPasta);
    }

    const mergedTactic = ex.dadosTaticos ? { ...ex.dadosTaticos } : {};
    mergedTactic.objetivoEspecifico = rawObjetivos;
    mergedTactic.carga = rawCarga;
    mergedTactic.descricaoMetodologica = rawDescricao;
    mergedTactic.tempo = rawTempo;
    mergedTactic.pasta = rawPasta;
    setTacticData(mergedTactic);
    setErrorMsg(null);
  }, []);

  const carregarExercicios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await exercicioService.getExercicios();
      setExercicios(data || []);

      if (initialExercicioId && data) {
        const found = data.find((e) => e.id === initialExercicioId);
        if (found) {
          carregarDetalhesExercicio(found);
        } else {
          try {
            const fetched = await exercicioService.getExercicioById(initialExercicioId);
            if (fetched) carregarDetalhesExercicio(fetched);
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo de exercícios:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initialExercicioId, carregarDetalhesExercicio]);

  useEffect(() => {
    carregarExercicios();
  }, [carregarExercicios]);

  const handleNovoExercicio = useCallback(() => {
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
  }, []);

  const handleSaveTacticBoard = useCallback((data: any) => {
    setTacticData(data);
    if (data?.objetivoEspecifico !== undefined) setObjetivosEspecificos(data.objetivoEspecifico);
    if (data?.carga !== undefined) setCarga(data.carga);
    if (data?.descricaoMetodologica !== undefined) setDescricao(data.descricaoMetodologica);
    if (data?.tempo !== undefined) setTempo(data.tempo);
  }, []);

  const handleGuardarExercicio = useCallback(
    (directTacticData?: any) => {
      const finalNome = nome.trim();
      if (!finalNome) {
        setErrorMsg("O nome do exercício é obrigatório.");
        return;
      }

      const isValidTactic =
        directTacticData &&
        typeof directTacticData === "object" &&
        !("nativeEvent" in directTacticData) &&
        !("_reactName" in directTacticData);
      const currentTactic = isValidTactic ? directTacticData : tacticData;
      setPendingDirectTacticData(currentTactic);

      if (selectedExercicio?.id) {
        setShowSaveOptionsModal(true);
      } else {
        handleExecutarGravacao({
          isNew: true,
          nomeFinal: finalNome,
          directTacticData: currentTactic,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nome, selectedExercicio, tacticData]
  );

  const handleExecutarGravacao = useCallback(
    async ({
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
        const finalPasta = (pastaFinal || currentTactic?.pasta || "Organização Ofensiva").trim();

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
          while (
            exercicios.some(
              (e) => e.nome.toLowerCase() === `${finalNameNormalized} (${counter})`.toLowerCase()
            )
          ) {
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

        const parsedMinutes = parseInt(finalTempo.replace(/\D/g, ""), 10);
        const hasValidMinutes = !isNaN(parsedMinutes) && parsedMinutes > 0;

        if (!isNew && selectedExercicio?.id) {
          const atualizado = await exercicioService.atualizarExercicio(selectedExercicio.id, payload);
          setSelectedExercicio(atualizado);
          setNome(atualizado.nome);
          setExercicios((prev) => prev.map((e) => (e.id === atualizado.id ? atualizado : e)));

          if (treinoId && assocId && hasValidMinutes) {
            try {
              await treinoService.atualizarExercicio(treinoId, assocId, { duracaoMinutos: parsedMinutes });
            } catch (errTreino) {
              console.error("Erro ao sincronizar duração no treino:", errTreino);
            }
          }
        } else {
          const criado = await exercicioService.criarExercicio(payload);
          setSelectedExercicio(criado);
          setNome(criado.nome);
          setExercicios((prev) => [criado, ...prev]);

          if (treinoId && assocId) {
            try {
              const updatePayload: any = { exercicioId: criado.id };
              if (hasValidMinutes) updatePayload.duracaoMinutos = parsedMinutes;
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
    },
    [
      pendingDirectTacticData,
      tacticData,
      objetivosEspecificos,
      carga,
      descricao,
      tempo,
      exercicios,
      categoria,
      nivelDificuldade,
      espaco,
      jogadoresEnvolvidos,
      selectedExercicio,
      treinoId,
      assocId,
    ]
  );

  const handleDuplicarExercicio = useCallback(async () => {
    if (!selectedExercicio) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Exercicio> = {
        nome: `${nome} (Cópia)`,
        descricao,
        categoria,
        nivelDificuldade,
        espaco,
        jogadoresEnvolvidos,
        objetivosEspecificos,
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
  }, [selectedExercicio, nome, descricao, categoria, nivelDificuldade, espaco, jogadoresEnvolvidos, objetivosEspecificos, tacticData]);

  const handleEliminarExercicioConfirmado = useCallback(async (exercicioId: string) => {
    try {
      await exercicioService.eliminarExercicio(exercicioId);
      setExercicios((prev) => {
        const restantes = prev.filter((e) => e.id !== exercicioId);
        if (restantes.length > 0) {
          carregarDetalhesExercicio(restantes[0]);
        } else {
          handleNovoExercicio();
        }
        return restantes;
      });
      toast.success("Exercício eliminado com sucesso!");
    } catch (err) {
      console.error("Erro ao eliminar exercício:", err);
      toast.error("Erro ao eliminar o exercício. Pode estar associado a um treino existente.");
    }
  }, [carregarDetalhesExercicio, handleNovoExercicio]);

  // Filtros com useMemo para performance e renderizações suaves
  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter((ex) => {
      const matchesSearch =
        (ex.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.objetivosEspecificos || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoriaFilter === "TODOS" || ex.categoria === categoriaFilter;
      return matchesSearch && matchesCat;
    });
  }, [exercicios, searchTerm, categoriaFilter]);

  return {
    exercicios,
    setExercicios,
    selectedExercicio,
    setSelectedExercicio,
    isLoading,
    searchTerm,
    setSearchTerm,
    categoriaFilter,
    setCategoriaFilter,
    nome,
    setNome,
    descricao,
    setDescricao,
    categoria,
    setCategoria,
    nivelDificuldade,
    setNivelDificuldade,
    espaco,
    setEspaco,
    tempo,
    setTempo,
    jogadoresEnvolvidos,
    setJogadoresEnvolvidos,
    objetivosEspecificos,
    setObjetivosEspecificos,
    carga,
    setCarga,
    tacticData,
    setTacticData,
    isSaving,
    saveSuccess,
    errorMsg,
    setErrorMsg,
    showSaveOptionsModal,
    setShowSaveOptionsModal,
    pendingDirectTacticData,
    setPendingDirectTacticData,
    reassociatedInTreino,
    exerciciosFiltrados,
    carregarExercicios,
    carregarDetalhesExercicio,
    handleNovoExercicio,
    handleSaveTacticBoard,
    handleGuardarExercicio,
    handleExecutarGravacao,
    handleDuplicarExercicio,
    handleEliminarExercicioConfirmado,
  };
}
