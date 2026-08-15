import { useState, useEffect, useCallback } from "react";
import { SessaoTreino, SessaoTreinoExercicio } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Exercicio } from "@/models/exercicio";
import { treinoService, exercicioService } from "@/services";

interface UseTreinoDetailStudioParams {
  treino: SessaoTreino;
  activeTeam: Team;
  onTreinoUpdated: (treino: SessaoTreino) => void;
  onReloadTreino: (treinoId: string) => void;
}

export function useTreinoDetailStudio({
  treino,
  activeTeam,
  onTreinoUpdated,
  onReloadTreino,
}: UseTreinoDetailStudioParams) {
  const [isEditing, setIsEditing] = useState(false);

  // Estados locais dos metadados do treino
  const [objetivo, setObjetivo] = useState(treino.objetivo || "");
  const [data, setData] = useState(treino.data || "");
  const [hora, setHora] = useState(treino.hora || "19:00");
  const [local, setLocal] = useState("Arregaça");
  const [numeroJogadores, setNumeroJogadores] = useState(treino.numeroJogadores || 20);
  const [intensidade, setIntensidade] = useState(treino.intensidadeGeral || 3);
  const [material, setMaterial] = useState(treino.material || "Bolas, cones, coletes.");

  // Modais
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showPranchetaModal, setShowPranchetaModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exercicioToEdit, setExercicioToEdit] = useState<Exercicio | null>(null);

  // Estados de gravação
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar quando o treino selecionado mudar
  useEffect(() => {
    setObjetivo(treino.objetivo || "");
    setData(treino.data || "");
    setHora(treino.hora || "19:00");
    setNumeroJogadores(treino.numeroJogadores || 20);
    setIntensidade(treino.intensidadeGeral || 3);
    setMaterial(treino.material || "Bolas, cones, coletes.");
  }, [treino.id]);

  // Gravar alterações no cabeçalho do treino
  const handleSaveMetadata = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const atualizado = await treinoService.atualizarTreino(treino.id, {
        eventoId: (treino as any).eventoId || "00000000-0000-0000-0000-000000000000",
        equipaId: activeTeam.id,
        objetivo: objetivo,
        material: material,
        numeroJogadores: numeroJogadores,
        intensidadeGeral: intensidade,
      });

      onTreinoUpdated(atualizado);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
      alert("Erro ao gravar metadados do treino.");
    } finally {
      setIsSaving(false);
    }
  }, [treino.id, activeTeam.id, objetivo, material, numeroJogadores, intensidade, onTreinoUpdated]);

  // Adicionar exercício selecionado da Biblioteca
  const handleSelectFromLibrary = useCallback(
    async (exercicio: Exercicio) => {
      setShowCatalogModal(false);
      try {
        const sessaoAtualizada = await treinoService.adicionarExercicio(treino.id, {
          exercicioId: exercicio.id,
          ordem: (treino.exercicios?.length || 0) + 1,
          duracaoMinutos: 15,
          observacoesDoTreinador:
            exercicio.objetivosEspecificos || exercicio.descricao || exercicio.nome,
        });

        onTreinoUpdated(sessaoAtualizada);
      } catch (err) {
        console.error("Erro ao adicionar exercício do catálogo:", err);
        alert("Erro ao adicionar exercício.");
      }
    },
    [treino.id, treino.exercicios?.length, onTreinoUpdated]
  );

  // Adicionar novo exercício criado na Prancheta
  const handleCreatedFromPrancheta = useCallback(
    async (exercicio: Exercicio, duracao: number, obs?: string) => {
      setShowPranchetaModal(false);
      try {
        const sessaoAtualizada = await treinoService.adicionarExercicio(treino.id, {
          exercicioId: exercicio.id,
          ordem: (treino.exercicios?.length || 0) + 1,
          duracaoMinutos: duracao,
          observacoesDoTreinador: obs || exercicio.objetivosEspecificos || exercicio.nome,
        });

        onTreinoUpdated(sessaoAtualizada);
      } catch (err) {
        console.error("Erro ao anexar exercício criado:", err);
        alert("Erro ao associar exercício à sessão.");
      }
    },
    [treino.id, treino.exercicios?.length, onTreinoUpdated]
  );

  // Remover exercício da sessão
  const handleRemoveExercicio = useCallback(
    async (assocId?: string) => {
      if (!assocId) return;
      if (!confirm("Tem a certeza que deseja remover este exercício da sessão?")) return;

      try {
        await treinoService.removerExercicio(treino.id, assocId);
        onReloadTreino(treino.id);
      } catch (err) {
        console.error("Erro ao remover exercício:", err);
        alert("Erro ao remover exercício.");
      }
    },
    [treino.id, onReloadTreino]
  );

  // Atualizar dados de um exercício associado
  const handleUpdateExercicioAssoc = useCallback(
    async (assocId: string, updates: Partial<SessaoTreinoExercicio>) => {
      try {
        await treinoService.atualizarExercicio(treino.id, assocId, updates);
        onReloadTreino(treino.id);
      } catch (err) {
        console.error("Erro ao atualizar exercício:", err);
      }
    },
    [treino.id, onReloadTreino]
  );

  // Abrir exercício na Prancheta para edição
  const handleEditPrancheta = useCallback(
    async (exercicioId: string) => {
      try {
        const exercicioFull = await exercicioService.getExercicioById(exercicioId);
        setExercicioToEdit(exercicioFull);
        setShowPranchetaModal(true);
      } catch (err) {
        console.error("Erro ao buscar detalhes do exercício:", err);
        alert("Erro ao abrir exercício para edição.");
      }
    },
    []
  );

  return {
    isEditing,
    setIsEditing,
    objetivo,
    setObjetivo,
    data,
    setData,
    hora,
    setHora,
    local,
    setLocal,
    numeroJogadores,
    setNumeroJogadores,
    intensidade,
    setIntensidade,
    material,
    setMaterial,
    showCatalogModal,
    setShowCatalogModal,
    showPranchetaModal,
    setShowPranchetaModal,
    showPrintModal,
    setShowPrintModal,
    exercicioToEdit,
    isSaving,
    saveSuccess,
    handleSaveMetadata,
    handleSelectFromLibrary,
    handleCreatedFromPrancheta,
    handleRemoveExercicio,
    handleUpdateExercicioAssoc,
    handleEditPrancheta,
  };
}
