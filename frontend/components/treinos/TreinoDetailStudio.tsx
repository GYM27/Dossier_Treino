"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Library, 
  Sparkles, 
  Dumbbell, 
  Boxes,
  CheckCircle2,
  Edit2,
  Eye,
  Printer
} from "lucide-react";
import { SessaoTreino, SessaoTreinoExercicio } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Exercicio } from "@/models/exercicio";
import { TreinoExercicioCard } from "./TreinoExercicioCard";
import { CatalogoExerciciosModal } from "./CatalogoExerciciosModal";
import { NovoExercicioPranchetaModal } from "./NovoExercicioPranchetaModal";
import { TreinoPrintPreviewModal } from "./TreinoPrintPreviewModal";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TreinoDetailStudioProps {
  treino: SessaoTreino;
  activeTeam: Team;
  onTreinoUpdated: (treino: SessaoTreino) => void;
  onReloadTreino: (treinoId: string) => void;
}

export function TreinoDetailStudio({
  treino,
  activeTeam,
  onTreinoUpdated,
  onReloadTreino,
}: TreinoDetailStudioProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Estados locais do treino
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
  const handleSaveMetadata = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        eventoId: (treino as any).eventoId || "00000000-0000-0000-0000-000000000000",
        equipaId: activeTeam.id,
        objetivo: objetivo,
        material: material,
        numeroJogadores: numeroJogadores,
        intensidadeGeral: intensidade,
      };

      const atualizado = await apiFetch(`/treinos/${treino.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      onTreinoUpdated(atualizado);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false); // Voltar para visualização após guardar
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
      alert("Erro ao gravar metadados do treino.");
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar exercício selecionado da Biblioteca
  const handleSelectFromLibrary = async (exercicio: Exercicio) => {
    setShowCatalogModal(false);
    try {
      const payload = {
        exercicioId: exercicio.id,
        ordem: (treino.exercicios?.length || 0) + 1,
        duracaoMinutos: 15,
        observacoesDoTreinador: exercicio.objetivosEspecificos || exercicio.descricao || exercicio.nome,
      };

      const sessaoAtualizada = await apiFetch(`/treinos/${treino.id}/exercicios`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onTreinoUpdated(sessaoAtualizada);
    } catch (err) {
      console.error("Erro ao adicionar exercício do catálogo:", err);
      alert("Erro ao adicionar exercício.");
    }
  };

  // Adicionar novo exercício criado na Prancheta
  const handleCreatedFromPrancheta = async (exercicio: Exercicio, duracao: number, obs?: string) => {
    setShowPranchetaModal(false);
    try {
      const payload = {
        exercicioId: exercicio.id,
        ordem: (treino.exercicios?.length || 0) + 1,
        duracaoMinutos: duracao,
        observacoesDoTreinador: obs || exercicio.objetivosEspecificos || exercicio.nome,
      };

      const sessaoAtualizada = await apiFetch(`/treinos/${treino.id}/exercicios`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onTreinoUpdated(sessaoAtualizada);
    } catch (err) {
      console.error("Erro ao anexar exercício criado:", err);
      alert("Erro ao associar exercício à sessão.");
    }
  };

  // Remover exercício da sessão
  const handleRemoveExercicio = async (assocId?: string) => {
    if (!assocId) return;
    if (!confirm("Tem a certeza que deseja remover este exercício da sessão?")) return;

    try {
      await apiFetch(`/treinos/${treino.id}/exercicios/${assocId}`, {
        method: "DELETE",
      });
      onReloadTreino(treino.id);
    } catch (err) {
      console.error("Erro ao remover exercício:", err);
      alert("Erro ao remover exercício.");
    }
  };

  // Atualizar dados de um exercício associado
  const handleUpdateExercicioAssoc = async (assocId: string, updates: Partial<SessaoTreinoExercicio>) => {
    try {
      await apiFetch(`/treinos/${treino.id}/exercicios/${assocId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      onReloadTreino(treino.id);
    } catch (err) {
      console.error("Erro ao atualizar exercício:", err);
    }
  };

  // Estado para edição do exercício na Prancheta
  const [exercicioToEdit, setExercicioToEdit] = useState<Exercicio | null>(null);
  
  // Estado para o Modal de Pré-visualização de Impressão (PDF)
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleEditPrancheta = async (exercicioId: string) => {
    try {
      const exercicioFull = await apiFetch(`/exercicios/${exercicioId}`);
      setExercicioToEdit(exercicioFull);
      setShowPranchetaModal(true);
    } catch (err) {
      console.error("Erro ao buscar detalhes do exercício:", err);
      alert("Erro ao abrir exercício para edição.");
    }
  };

  const exercicios = treino.exercicios || [];
  const totalMinutos = exercicios.reduce((acc, curr) => acc + (curr.duracaoMinutos || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto print:overflow-visible p-4 md:p-8 print:p-0 flex flex-col gap-6 bg-[#0a0f1d] print:bg-white select-none print:select-auto">
      
      {/* Container do UI normal (Oculto na impressão) */}
      <div className="print:hidden flex flex-col gap-6">
        {/* 1. Header do Treino com Ações */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#111827]/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              #{treino.microciclo || "1"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="cyan">
                  Microciclo {treino.microciclo || 1}
                </Badge>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  {exercicios.length} {exercicios.length === 1 ? "exercício" : "exercícios"}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-wide mt-0.5">
                {objetivo || `Treino #${treino.microciclo || 1}`}
              </h1>
            </div>
          </div>

          {/* Botões do Topo */}
          <div className="flex items-center gap-3">
            <Button
              variant="dark"
              size="sm"
              onClick={() => setShowPrintModal(true)}
              title="Pré-visualizar e Exportar para PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>

            <Button
              variant={isEditing ? "amber" : "dark"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Modo Leitura</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Modo Edição</span>
                </>
              )}
            </Button>

            {isEditing && (
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Guardado!
                  </span>
                )}
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "A guardar..." : "Guardar Alterações"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Grelha de Metadados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Objetivo Geral */}
          <div className="md:col-span-2 p-4 rounded-xl bg-[#111827]/60 border border-slate-800 flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Objetivo Geral da Sessão
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ex: Transições Ofensivas e Finalização"
                className="text-xs"
              />
            ) : (
              <div className="px-3 py-2 text-sm text-white font-medium bg-slate-900/50 rounded-lg border border-transparent">
                {objetivo || <span className="text-slate-600 italic">Sem objetivo definido</span>}
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Data e Hora
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="font-mono text-xs"
                />
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-white font-mono bg-slate-900/50 rounded-lg border border-transparent flex gap-3">
                <span>{data || "--/--/----"}</span>
                <span className="text-cyan-400">{hora || "--:--"}</span>
              </div>
            )}
          </div>

          {/* Jogadores */}
          <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Jogadores
            </label>
            {isEditing ? (
              <Input
                type="number"
                min={1}
                max={40}
                value={numeroJogadores}
                onChange={(e) => setNumeroJogadores(parseInt(e.target.value) || 20)}
                className="font-mono text-xs"
              />
            ) : (
              <div className="px-3 py-2 text-sm text-white font-mono bg-slate-900/50 rounded-lg border border-transparent">
                {numeroJogadores} convocados
              </div>
            )}
          </div>

          {/* Material */}
          <div className="md:col-span-4 p-4 rounded-xl bg-[#111827]/60 border border-slate-800 flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              Material Necessário
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Ex: 20 Bolas, 16 Cones Chineses, 3 Cores de Coletes, 2 Mini Balizas"
                className="text-xs"
              />
            ) : (
              <div className="px-3 py-2 text-sm text-white bg-slate-900/50 rounded-lg border border-transparent">
                {material || <span className="text-slate-600 italic">Sem material definido</span>}
              </div>
            )}
          </div>
        </div>

        {/* 3. Secção dos Exercícios do Treino (Timeline) */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Plano de Sessão
              </h3>
              <Badge variant="secondary" className="font-mono text-[11px]">
                Total: {totalMinutos} min
              </Badge>
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => setShowCatalogModal(true)}
                >
                  <Library className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Biblioteca</span>
                </Button>

                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => {
                    setExercicioToEdit(null);
                    setShowPranchetaModal(true);
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Novo Exercício</span>
                </Button>
              </div>
            )}
          </div>

          {/* Lista Sequencial de Exercícios */}
          {exercicios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-[#111827]/30 text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Ainda não adicionou exercícios a esta sessão
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isEditing 
                    ? "Escolha exercícios já catalogados na Biblioteca ou desenhe um novo exercício na Prancheta Tática interativa."
                    : "Ative o Modo Edição para adicionar exercícios ao plano de sessão."
                  }
                </p>
              </div>
              {isEditing && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="dark"
                    onClick={() => setShowCatalogModal(true)}
                  >
                    <Library className="w-4 h-4 text-cyan-400" />
                    <span>Escolher da Biblioteca</span>
                  </Button>
                  <Button
                    variant="cyan"
                    onClick={() => {
                      setExercicioToEdit(null);
                      setShowPranchetaModal(true);
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Criar na Prancheta</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {exercicios.map((ex, idx) => (
                <TreinoExercicioCard
                  key={ex.id || idx}
                  exercicio={ex}
                  index={idx}
                  total={exercicios.length}
                  isEditing={isEditing}
                  onRemove={() => handleRemoveExercicio(ex.id)}
                  onUpdate={(updates) => handleUpdateExercicioAssoc(ex.id!, updates)}
                  onEditPrancheta={ex.exercicioId ? () => handleEditPrancheta(ex.exercicioId!) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {showCatalogModal && (
        <CatalogoExerciciosModal
          onClose={() => setShowCatalogModal(false)}
          onSelect={handleSelectFromLibrary}
        />
      )}

      {showPranchetaModal && (
        <NovoExercicioPranchetaModal
          isOpen={showPranchetaModal}
          exercicioToEdit={exercicioToEdit || undefined}
          onClose={() => setShowPranchetaModal(false)}
          onExercicioCreated={(exercicio, duracao, obs) => {
            if (exercicioToEdit) {
                setShowPranchetaModal(false);
                onReloadTreino(treino.id);
            } else {
                handleCreatedFromPrancheta(exercicio, duracao, obs);
            }
          }}
        />
      )}

      {showPrintModal && (
        <TreinoPrintPreviewModal
          treino={treino}
          activeTeam={activeTeam}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
