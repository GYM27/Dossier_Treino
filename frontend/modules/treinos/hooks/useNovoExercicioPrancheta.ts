import { useState, useEffect, useCallback } from "react";
import { Exercicio } from "@/models/exercicio";
import { exercicioService } from "@/services";

export type CategoriaExercicioType =
  | "AQUECIMENTO"
  | "TECNICO"
  | "TATICO"
  | "FISICO"
  | "GUARDA_REDES"
  | "LUDICO";

interface UseNovoExercicioPranchetaParams {
  isOpen: boolean;
  initialExercicio?: Exercicio | null;
  exercicioToEdit?: Exercicio | null;
  onClose: () => void;
  onExercicioCreated: (exercicio: Exercicio, duracaoMinutos: number, observacoes?: string) => void;
  onExercicioUpdated?: (exercicio: Exercicio) => void;
}

export function useNovoExercicioPrancheta({
  isOpen,
  initialExercicio,
  exercicioToEdit,
  onClose,
  onExercicioCreated,
  onExercicioUpdated,
}: UseNovoExercicioPranchetaParams) {
  const currentExercicio = exercicioToEdit !== undefined ? exercicioToEdit : initialExercicio;
  const isEditMode = !!currentExercicio?.id;
  const originalNome = currentExercicio?.nome || "";

  const [nome, setNome] = useState(currentExercicio?.nome || "");
  const [categoria, setCategoria] = useState<CategoriaExercicioType>(
    currentExercicio?.categoria || "TATICO"
  );
  const [duracaoMinutos, setDuracaoMinutos] = useState(15);
  const [espaco, setEspaco] = useState(currentExercicio?.espaco || "40x30m");
  const [jogadoresEnvolvidos, setJogadoresEnvolvidos] = useState(currentExercicio?.jogadoresEnvolvidos || 16);
  const [nivelDificuldade, setNivelDificuldade] = useState(currentExercicio?.nivelDificuldade || 3);
  const [descricao, setDescricao] = useState(currentExercicio?.descricao || "");
  const [objetivosEspecificos, setObjetivosEspecificos] = useState(currentExercicio?.objetivosEspecificos || "");
  const [tacticData, setTacticData] = useState<any>((currentExercicio as any)?.dadosTaticos || null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentExercicio) {
      setNome(currentExercicio.nome || "");
      setCategoria(currentExercicio.categoria || "TATICO");
      setEspaco(currentExercicio.espaco || "40x30m");
      setJogadoresEnvolvidos(currentExercicio.jogadoresEnvolvidos || 16);
      setNivelDificuldade(currentExercicio.nivelDificuldade || 3);
      setDescricao(currentExercicio.descricao || "");
      setObjetivosEspecificos(currentExercicio.objetivosEspecificos || "");
      setTacticData((currentExercicio as any)?.dadosTaticos || null);
    } else {
      setNome("");
      setCategoria("TATICO");
      setEspaco("40x30m");
      setJogadoresEnvolvidos(16);
      setNivelDificuldade(3);
      setDescricao("");
      setObjetivosEspecificos("");
      setTacticData(null);
    }
  }, [currentExercicio, isOpen]);

  const handleSaveTacticBoard = useCallback((data: any) => {
    setTacticData(data);
  }, []);

  // Gravar como NOVO exercício (Duplicação / Criação)
  const handleSaveAsNew = useCallback(async () => {
    if (!nome.trim()) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const exercicioSalvo = await exercicioService.criarExercicio({
        nome: nome.trim(),
        descricao: descricao || objetivosEspecificos || nome,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        objetivosEspecificos: objetivosEspecificos,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        dadosTaticos: tacticData,
      });

      onExercicioCreated(exercicioSalvo, duracaoMinutos, objetivosEspecificos || descricao);
      onClose();
    } catch (err: any) {
      console.error("Erro ao gravar novo exercício:", err);
      setErrorMsg(err.message || "Erro ao gravar exercício.");
    } finally {
      setIsSaving(false);
    }
  }, [
    nome,
    descricao,
    objetivosEspecificos,
    categoria,
    nivelDificuldade,
    espaco,
    jogadoresEnvolvidos,
    tacticData,
    duracaoMinutos,
    onExercicioCreated,
    onClose,
  ]);

  // Atualizar o exercício EXISTENTE (PUT)
  const handleUpdateExisting = useCallback(async () => {
    if (!currentExercicio?.id) return;
    if (!nome.trim()) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const exercicioAtualizado = await exercicioService.atualizarExercicio(currentExercicio.id, {
        id: currentExercicio.id,
        nome: nome.trim(),
        descricao: descricao || objetivosEspecificos || nome,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        objetivosEspecificos: objetivosEspecificos,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        dadosTaticos: tacticData,
      });

      if (onExercicioUpdated) {
        onExercicioUpdated(exercicioAtualizado);
      }
      onExercicioCreated(exercicioAtualizado, duracaoMinutos, objetivosEspecificos || descricao);
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar exercício:", err);
      setErrorMsg(err.message || "Erro ao atualizar exercício.");
    } finally {
      setIsSaving(false);
    }
  }, [
    currentExercicio?.id,
    nome,
    descricao,
    objetivosEspecificos,
    categoria,
    nivelDificuldade,
    espaco,
    jogadoresEnvolvidos,
    tacticData,
    duracaoMinutos,
    onExercicioUpdated,
    onExercicioCreated,
    onClose,
  ]);

  // Submissão inteligente
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditMode && nome.trim() === originalNome.trim()) {
        await handleUpdateExisting();
      } else {
        await handleSaveAsNew();
      }
    },
    [isEditMode, nome, originalNome, handleUpdateExisting, handleSaveAsNew]
  );

  const hasNameChanged = isEditMode && nome.trim().toLowerCase() !== originalNome.trim().toLowerCase();

  return {
    nome,
    setNome,
    categoria,
    setCategoria,
    duracaoMinutos,
    setDuracaoMinutos,
    espaco,
    setEspaco,
    jogadoresEnvolvidos,
    setJogadoresEnvolvidos,
    nivelDificuldade,
    setNivelDificuldade,
    descricao,
    setDescricao,
    objetivosEspecificos,
    setObjetivosEspecificos,
    tacticData,
    isEditMode,
    originalNome,
    hasNameChanged,
    isSaving,
    errorMsg,
    handleSaveTacticBoard,
    handleSubmit,
    handleSaveAsNew,
  };
}
