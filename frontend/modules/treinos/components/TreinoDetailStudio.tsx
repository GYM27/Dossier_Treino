"use client";

import React, { useState } from "react";
import { SessaoTreino } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { useTreinoDetailStudio } from "../hooks/useTreinoDetailStudio";
import { TreinoStudioHeader } from "./TreinoStudioHeader";
import { TreinoStudioMetadataForm } from "./TreinoStudioMetadataForm";
import { TreinoExercicioCard } from "./TreinoExercicioCard";
import { CatalogoExerciciosModal } from "../modals/CatalogoExerciciosModal";
import { TreinoPrintPreviewModal } from "../modals/TreinoPrintPreviewModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dumbbell, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const {
    isEditing,
    setIsEditing,
    objetivo,
    setObjetivo,
    data,
    hora,
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
    confirmDialog,
    setConfirmDialog,
  } = useTreinoDetailStudio({
    treino,
    activeTeam,
    onTreinoUpdated,
    onReloadTreino,
  });

  const exercicios = treino.exercicios || [];

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", idx.toString());
    } catch {
      // Fallback para ambientes restritos
    }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleMoveExercicio(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] h-full overflow-hidden select-none">
      {/* Barra de Topo do Estúdio */}
      <TreinoStudioHeader
        treino={treino}
        data={data}
        hora={hora}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onSaveMetadata={handleSaveMetadata}
        onOpenPrintModal={() => setShowPrintModal(true)}
        onOpenCatalogModal={() => setShowCatalogModal(true)}
      />

      {/* Corpo Principal com Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metadados do Treino */}
        <TreinoStudioMetadataForm
          isEditing={isEditing}
          objetivo={objetivo}
          setObjetivo={setObjetivo}
          numeroJogadores={numeroJogadores}
          setNumeroJogadores={setNumeroJogadores}
          intensidade={intensidade}
          setIntensidade={setIntensidade}
          material={material}
          setMaterial={setMaterial}
          mesociclo={mesociclo}
          setMesociclo={setMesociclo}
          microciclo={microciclo}
          setMicrociclo={setMicrociclo}
          unidadeTreino={unidadeTreino}
          setUnidadeTreino={setUnidadeTreino}
          periodo={periodo}
          setPeriodo={setPeriodo}
        />

        {/* Timeline de Exercícios da Sessão */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Estrutura da Sessão ({exercicios.length} {exercicios.length === 1 ? "exercício" : "exercícios"})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setShowCatalogModal(true)}
              >
                <Library className="w-3.5 h-3.5 mr-1" />
                Biblioteca
              </Button>
            </div>
          </div>

          {/* Lista de Cartões de Exercícios */}
          {exercicios.length === 0 ? (
            <div className="bg-[#0f172a] border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Nenhum exercício associado
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Adicione exercícios a partir da biblioteca para estruturar o plano de treino.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => setShowCatalogModal(true)}
                >
                  <Library className="w-3.5 h-3.5 mr-1" />
                  Abrir Biblioteca
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {exercicios.map((assoc, idx) => (
                <TreinoExercicioCard
                  key={assoc.id || idx}
                  exercicio={assoc}
                  treinoId={treino.id}
                  index={idx}
                  total={exercicios.length}
                  isEditing={isEditing}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedIndex === idx}
                  isOver={dragOverIndex === idx && draggedIndex !== idx}
                  onRemove={() => assoc.id && handleRemoveExercicio(assoc.id)}
                  onMoveUp={() => handleMoveExercicio(idx, idx - 1)}
                  onMoveDown={() => handleMoveExercicio(idx, idx + 1)}
                  onReplace={() => handleStartReplace(assoc)}
                  onUpdate={(updates) => assoc.id && handleUpdateExercicioAssoc(assoc.id, updates)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais do Estúdio */}
      {showCatalogModal && (
        <CatalogoExerciciosModal
          replacingExerciseName={replacingAssoc?.exercicioNome}
          onClose={() => {
            setShowCatalogModal(false);
            setReplacingAssoc(null);
          }}
          onSelect={(ex) => {
            if (replacingAssoc) {
              handleReplaceExercicio(ex);
            } else {
              handleSelectFromLibrary(ex);
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

      {/* Modal de Confirmação Acessível */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
