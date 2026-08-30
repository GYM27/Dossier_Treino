import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
  const [mesociclo, setMesociclo] = useState(treino.mesociclo || 1);
  const [microciclo, setMicrociclo] = useState(treino.microciclo || 1);
  const [unidadeTreino, setUnidadeTreino] = useState(treino.unidadeTreino || 1);
  const [periodo, setPeriodo] = useState<string>(treino.periodo || "COMPETITIVO");

  // Modais
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    setMesociclo(treino.mesociclo || 1);
    setMicrociclo(treino.microciclo || 1);
    setUnidadeTreino(treino.unidadeTreino || 1);
    setPeriodo(treino.periodo || "COMPETITIVO");
  }, [treino.id, treino.periodo, treino.objetivo, treino.material, treino.numeroJogadores, treino.intensidadeGeral, treino.mesociclo, treino.microciclo, treino.unidadeTreino]);

  // Gravar alterações no cabeçalho do treino
  const handleSaveMetadata = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // 1. Atualização Otimista Imediata
    const optimisticTreino: SessaoTreino = {
      ...treino,
      objetivo,
      material,
      numeroJogadores,
      intensidadeGeral: intensidade,
      mesociclo,
      microciclo,
      unidadeTreino,
      periodo,
    };
    onTreinoUpdated(optimisticTreino);

    try {
      const atualizado = await treinoService.atualizarTreino(treino.id, {
        eventoId: (treino as any).eventoId || "00000000-0000-0000-0000-000000000000",
        equipaId: activeTeam.id,
        objetivo: objetivo,
        material: material,
        numeroJogadores: numeroJogadores,
        intensidadeGeral: intensidade,
        mesociclo: mesociclo,
        microciclo: microciclo,
        unidadeTreino: unidadeTreino,
        periodo: periodo,
      });

      if (atualizado) {
        onTreinoUpdated(atualizado);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
      // Mantém o estado otimista para não frustrar o utilizador
    } finally {
      setIsSaving(false);
    }
  }, [treino, activeTeam.id, objetivo, material, numeroJogadores, intensidade, mesociclo, microciclo, unidadeTreino, periodo, onTreinoUpdated]);

  // Adicionar exercício selecionado da Biblioteca
  const handleSelectFromLibrary = useCallback(
    async (exercicio: Exercicio) => {
      setShowCatalogModal(false);
      try {
        const sessaoAtualizada = await treinoService.adicionarExercicio(treino.id, {
          exercicioId: exercicio.id,
          ordem: (treino.exercicios?.length || 0) + 1,
          duracaoMinutos: 15,
          observacoesDoTreinador: "",
        });

        onTreinoUpdated(sessaoAtualizada);
      } catch (err) {
        console.error("Erro ao adicionar exercício do catálogo:", err);
        toast.error("Erro ao adicionar exercício.");
      }
    },
    [treino.id, treino.exercicios?.length, onTreinoUpdated]
  );

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

  // Remover exercício da sessão
  const handleRemoveExercicio = useCallback(
    (assocId?: string) => {
      if (!assocId) return;
      setConfirmDialog({
        isOpen: true,
        title: "Remover Exercício",
        description: "Tem a certeza que deseja remover este exercício da sessão de treino?",
        onConfirm: async () => {
          try {
            await treinoService.removerExercicio(treino.id, assocId);
            onReloadTreino(treino.id);
            toast.success("Exercício removido com sucesso!");
          } catch (err) {
            console.error("Erro ao remover exercício:", err);
            toast.error("Erro ao remover exercício.");
          } finally {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    },
    [treino.id, onReloadTreino]
  );

  // Atualizar dados de um exercício associado (Duração, Observações, etc.)
  const handleUpdateExercicioAssoc = useCallback(
    async (assocId: string, updates: Partial<SessaoTreinoExercicio>) => {
      // 1. Atualização Otimista imediata da duração e do total da sessão
      const exerciciosAtualizados = (treino.exercicios || []).map((ex) =>
        ex.id === assocId ? { ...ex, ...updates } : ex
      );
      const novoTotal = exerciciosAtualizados.reduce(
        (sum, curr) => sum + (curr.duracaoMinutos || 0),
        0
      );
      onTreinoUpdated({
        ...treino,
        exercicios: exerciciosAtualizados,
        duracaoTotalMinutos: novoTotal,
      });

      // 2. Persistir no backend
      try {
        const treinoAtualizado = await treinoService.atualizarExercicio(treino.id, assocId, updates);
        if (treinoAtualizado) {
          onTreinoUpdated(treinoAtualizado);
        }
      } catch (err) {
        console.error("Erro ao atualizar exercício:", err);
        onReloadTreino(treino.id);
      }
    },
    [treino, onTreinoUpdated, onReloadTreino]
  );

  // Substituir um exercício existente na sessão por outro da biblioteca (mantém o mesmo lugar/ordem)
  const [replacingAssoc, setReplacingAssoc] = useState<SessaoTreinoExercicio | null>(null);

  const handleStartReplace = useCallback((assoc: SessaoTreinoExercicio) => {
    setReplacingAssoc(assoc);
    setShowCatalogModal(true);
  }, []);

  const handleReplaceExercicio = useCallback(
    async (novoExercicio: Exercicio) => {
      if (!replacingAssoc?.id) return;
      setShowCatalogModal(false);
      try {
        await treinoService.atualizarExercicio(treino.id, replacingAssoc.id, {
          exercicioId: novoExercicio.id,
        });
        setReplacingAssoc(null);
        onReloadTreino(treino.id);
      } catch (err) {
        console.error("Erro ao substituir exercício:", err);
        toast.error("Erro ao substituir exercício.");
      }
    },
    [treino.id, replacingAssoc, onReloadTreino]
  );

  // Reordenação atómica de exercícios (usada tanto pelo Drag & Drop como pelos botões de subir/descer)
  const handleReorderExercicios = useCallback(
    async (novaLista: SessaoTreinoExercicio[]) => {
      // 1. Atualização otimista imediata na interface
      const listaComOrdem = novaLista.map((item, idx) => ({
        ...item,
        ordem: idx + 1,
      }));

      onTreinoUpdated({
        ...treino,
        exercicios: listaComOrdem,
      });

      // 2. Extração dos IDs para persistência atómica no backend
      const idsOrdenados = listaComOrdem
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id));

      if (idsOrdenados.length === 0) return;

      try {
        const treinoAtualizado = await treinoService.reordenarExercicios(
          treino.id,
          idsOrdenados
        );
        if (treinoAtualizado) {
          onTreinoUpdated(treinoAtualizado);
        }
      } catch (err) {
        console.error("Erro ao reordenar exercícios:", err);
        onReloadTreino(treino.id);
      }
    },
    [treino, onTreinoUpdated, onReloadTreino]
  );

  // Mover exercício uma posição para cima ou para baixo (botões direcionais)
  const handleMoveExercicio = useCallback(
    (currentIndex: number, targetIndex: number) => {
      const exercicios = treino.exercicios || [];
      if (
        currentIndex < 0 ||
        currentIndex >= exercicios.length ||
        targetIndex < 0 ||
        targetIndex >= exercicios.length
      ) {
        return;
      }

      const novaLista = [...exercicios];
      const [itemMovido] = novaLista.splice(currentIndex, 1);
      novaLista.splice(targetIndex, 0, itemMovido);

      handleReorderExercicios(novaLista);
    },
    [treino.exercicios, handleReorderExercicios]
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
    mesociclo,
    setMesociclo,
    microciclo,
    setMicrociclo,
    unidadeTreino,
    setUnidadeTreino,
    periodo,
    setPeriodo,
    showCatalogModal,
    setShowCatalogModal,
    showPrintModal,
    setShowPrintModal,
    isSaving,
    saveSuccess,
    replacingAssoc,
    setReplacingAssoc,
    handleSaveMetadata,
    handleSelectFromLibrary,
    handleRemoveExercicio,
    handleUpdateExercicioAssoc,
    handleStartReplace,
    handleReplaceExercicio,
    handleMoveExercicio,
    handleReorderExercicios,
    confirmDialog,
    setConfirmDialog,
  };
}
