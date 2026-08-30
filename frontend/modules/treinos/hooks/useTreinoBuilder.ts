import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { SessaoTreino, SessaoTreinoExercicio } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Exercicio } from "@/models/exercicio";
import { EventoCalendario } from "@/models/planeamento";
import { treinoService, calendarioService, exercicioService } from "@/services";

interface UseTreinoBuilderParams {
  treino?: SessaoTreino | null;
  activeTeam: Team;
  onGoBack: () => void;
}

export function useTreinoBuilder({
  treino,
  activeTeam,
  onGoBack,
}: UseTreinoBuilderParams) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestMicrociclo, setLatestMicrociclo] = useState(1);
  const [showPrancheta, setShowPrancheta] = useState(false);

  // Controlled States
  const [titulo, setTitulo] = useState(treino?.objetivo || "Nova Sessão");
  const [data, setData] = useState(treino?.data || new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState(treino?.hora || "19:00");
  const [duracao, setDuracao] = useState<number>(treino?.duracaoTotalMinutos || 90);
  const [local, setLocal] = useState("Arregaça");
  const [microciclo, setMicrociclo] = useState<number>(treino?.microciclo || 1);
  const [morfociclo, setMorfociclo] = useState<number>(treino?.morfociclo || 1);
  const [material, setMaterial] = useState(treino?.material || "Bolas, cones, coletes.");
  const [exerciciosLocais, setExerciciosLocais] = useState<SessaoTreinoExercicio[]>(
    treino?.exercicios || []
  );
  const [sessaoId, setSessaoId] = useState<string | null>(treino?.id || null);
  const [jogadores, setJogadores] = useState<number>(treino?.numeroJogadores || 20);

  useEffect(() => {
    if (!treino && activeTeam) {
      calendarioService
        .getUltimoNumeroTreino(activeTeam.id)
        .then((num) => {
          if (typeof num === "number" && num > 0) {
            setLatestMicrociclo(num + 1);
            setMicrociclo(num + 1);
          }
        })
        .catch(() => {});
    }
  }, [treino, activeTeam]);

  const handleCreateEvento = useCallback(
    async (evento: Omit<EventoCalendario, "id">) => {
      try {
        const eventoCriado = await calendarioService.criarEvento(activeTeam.id, evento);

        const treinoGerado = await treinoService.criarTreino({
          eventoId: eventoCriado.id,
          equipaId: activeTeam.id,
          numeroJogadores: 20,
          objetivo: evento.descricao || "Nova Sessão",
        });

        setTitulo(treinoGerado.objetivo || `Treino #${treinoGerado.microciclo}`);
        setData(treinoGerado.data || "");
        setHora(treinoGerado.hora || "19:00");
        setDuracao(treinoGerado.duracaoTotalMinutos || 90);
        setMicrociclo(treinoGerado.microciclo || 1);
        setSessaoId(treinoGerado.id);
        setIsModalOpen(false);
      } catch (e) {
        console.error("Erro ao criar evento e treino", e);
        toast.error("Erro ao criar sessão.");
      }
    },
    [activeTeam.id]
  );

  const handleSaveTreino = useCallback(async () => {
    if (!sessaoId) return;
    setIsSaving(true);
    try {
      await treinoService.atualizarTreino(sessaoId, {
        equipaId: activeTeam.id,
        objetivo: titulo,
        material: material,
        numeroJogadores: jogadores,
      });
      toast.success("Treino guardado com sucesso!");
    } catch (e) {
      console.error("Erro ao gravar treino:", e);
      toast.error("Erro ao gravar treino.");
    } finally {
      setIsSaving(false);
    }
  }, [sessaoId, activeTeam.id, titulo, material, jogadores]);

  return {
    showLibrary,
    setShowLibrary,
    isSaving,
    isModalOpen,
    setIsModalOpen,
    latestMicrociclo,
    showPrancheta,
    setShowPrancheta,
    titulo,
    setTitulo,
    data,
    setData,
    hora,
    setHora,
    duracao,
    setDuracao,
    local,
    setLocal,
    microciclo,
    morfociclo,
    setMorfociclo,
    material,
    setMaterial,
    exerciciosLocais,
    setExerciciosLocais,
    sessaoId,
    jogadores,
    setJogadores,
    handleCreateEvento,
    handleSaveTreino,
  };
}
