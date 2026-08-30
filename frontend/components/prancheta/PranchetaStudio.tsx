"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { buildHierarchicalOptions } from "@/models/pasta";
import { SaveExercicioOptionsModal } from "@/components/prancheta/SaveExercicioOptionsModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { usePranchetaPastas } from "@/components/prancheta/hooks/usePranchetaPastas";
import { usePranchetaGestao } from "@/components/prancheta/hooks/usePranchetaGestao";
import { PranchetaHeader } from "@/components/prancheta/PranchetaHeader";
import { PranchetaSidebarPastas } from "@/components/prancheta/PranchetaSidebarPastas";
import { PranchetaMetadataBar } from "@/components/prancheta/PranchetaMetadataBar";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Importação dinâmica da Prancheta Tática para evitar erros de SSR com o Canvas HTML5
const TacticalBoard = dynamic(
  () => import("@/components/prancheta/TacticalBoard"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#070b14] text-slate-500 text-xs">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" color="cyan" />
          <span>A carregar Prancheta Tática...</span>
        </div>
      </div>
    ),
  }
);

interface PranchetaStudioProps {
  initialExercicioId?: string;
}

export function PranchetaStudio({ initialExercicioId }: PranchetaStudioProps = {}) {
  const searchParams = useSearchParams();
  const targetExercicioId = initialExercicioId || searchParams?.get("id") || undefined;
  const treinoId = searchParams?.get("treinoId") || null;
  const assocId = searchParams?.get("assocId") || null;

  // Estados de Interface
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(true);
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

  // 1. Hook de Pastas Hierárquicas
  const pastasState = usePranchetaPastas();

  // Callback estável para seleção de pastas
  const handlePastaSelect = useCallback(
    (p: string) => {
      pastasState.setPasta(p);
      pastasState.setExpandedPastas((prev) => ({ ...prev, [p]: true }));
    },
    [pastasState.setPasta, pastasState.setExpandedPastas]
  );

  // 2. Hook de Gestão de Exercícios
  const gestao = usePranchetaGestao({
    initialExercicioId: targetExercicioId,
    treinoId,
    assocId,
    onPastaSelect: handlePastaSelect,
  });

  // Confirmação para eliminar pasta
  const handlePedirEliminarPasta = (e: React.MouseEvent, pastaId: string, nomePasta: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Pasta",
      description: `Tem a certeza que deseja eliminar a pasta "${nomePasta}"? As subpastas e exercícios associados permanecerão intactos na biblioteca geral.`,
      onConfirm: () => {
        pastasState.handleEliminarPasta(pastaId, nomePasta);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Confirmação para eliminar exercício
  const handlePedirEliminarExercicio = () => {
    if (!gestao.selectedExercicio?.id) return;
    const exercicioParaEliminar = gestao.selectedExercicio;

    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Exercício",
      description: `Tem a certeza que deseja eliminar o exercício "${exercicioParaEliminar.nome}"?`,
      onConfirm: async () => {
        await gestao.handleEliminarExercicioConfirmado(exercicioParaEliminar.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-[#070b14] border border-slate-800/80 rounded-2xl shadow-2xl select-none">
      {/* 📁 GAVETA LATERAL: Catálogo de Exercícios e Pastas */}
      <PranchetaSidebarPastas
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        exercicios={gestao.exercicios}
        exerciciosFiltrados={gestao.exerciciosFiltrados}
        selectedExercicio={gestao.selectedExercicio}
        isLoading={gestao.isLoading}
        searchTerm={gestao.searchTerm}
        setSearchTerm={gestao.setSearchTerm}
        categoriaFilter={gestao.categoriaFilter}
        setCategoriaFilter={gestao.setCategoriaFilter}
        pastas={pastasState.pastas}
        expandedPastas={pastasState.expandedPastas}
        drawerMode={pastasState.drawerMode}
        setDrawerMode={pastasState.setDrawerMode}
        isCreatingPasta={pastasState.isCreatingPasta}
        setIsCreatingPasta={pastasState.setIsCreatingPasta}
        creatingParentId={pastasState.creatingParentId}
        setCreatingParentId={pastasState.setCreatingParentId}
        novaPastaNome={pastasState.novaPastaNome}
        setNovaPastaNome={pastasState.setNovaPastaNome}
        onNovoExercicio={() => {
          gestao.handleNovoExercicio();
          setIsDrawerOpen(false);
        }}
        onSelectExercicio={gestao.carregarDetalhesExercicio}
        onCreatePasta={pastasState.handleCriarNovaPasta}
        onStartCreateSubpasta={pastasState.handleIniciarCriacaoSubpasta}
        onDeletePasta={handlePedirEliminarPasta}
        onTogglePasta={pastasState.togglePastaExpanded}
      />

      {/* 🎨 PAINEL PRINCIPAL: Estúdio */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
        {/* Barra Superior */}
        <PranchetaHeader
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          totalExercicios={gestao.exercicios.length}
          onNovoExercicio={gestao.handleNovoExercicio}
          treinoId={treinoId}
          nome={gestao.nome}
          selectedExercicio={gestao.selectedExercicio}
          showMetadataPanel={showMetadataPanel}
          onToggleMetadataPanel={() => setShowMetadataPanel(!showMetadataPanel)}
          onDuplicarExercicio={gestao.handleDuplicarExercicio}
          onEliminarExercicio={handlePedirEliminarExercicio}
          onGuardarExercicio={() => gestao.handleGuardarExercicio()}
          isSaving={gestao.isSaving}
          saveSuccess={gestao.saveSuccess}
        />

        {/* Barra de Metadados / Ficha Técnica */}
        <PranchetaMetadataBar
          show={showMetadataPanel}
          nome={gestao.nome}
          setNome={gestao.setNome}
          pasta={pastasState.pasta}
          setPasta={pastasState.setPasta}
          pastas={pastasState.pastas}
          categoria={gestao.categoria}
          setCategoria={gestao.setCategoria}
          espaco={gestao.espaco}
          setEspaco={gestao.setEspaco}
          tempo={gestao.tempo}
          setTempo={gestao.setTempo}
          jogadoresEnvolvidos={gestao.jogadoresEnvolvidos}
          setJogadoresEnvolvidos={gestao.setJogadoresEnvolvidos}
          nivelDificuldade={gestao.nivelDificuldade}
          setNivelDificuldade={gestao.setNivelDificuldade}
        />

        {/* Mensagem de Erro */}
        {gestao.errorMsg && (
          <div className="mx-4 mt-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{gestao.errorMsg}</span>
          </div>
        )}

        {/* Banner de Sincronização com Treino */}
        {gestao.reassociatedInTreino && treinoId && (
          <div className="mx-4 mt-2 p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Nova variante criada e associada a este exercício do treino com sucesso!</span>
            </div>
            <Link
              href="/treinos"
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              Voltar ao Treino
            </Link>
          </div>
        )}

        {/* 🕹️ Quadro Tático */}
        <div className="flex-1 w-full h-full min-h-0 bg-[#070b14] p-2 md:p-3 overflow-hidden flex flex-col items-center justify-center relative">
          <div className="w-full h-full flex items-center justify-center">
            <TacticalBoard
              key={gestao.selectedExercicio?.id || "novo-exercicio"}
              initialTacticData={gestao.tacticData}
              onChange={gestao.handleSaveTacticBoard}
              onSave={(data) => gestao.handleGuardarExercicio(data)}
            />
          </div>
        </div>
      </main>

      {/* Modal de Opções de Gravação */}
      <SaveExercicioOptionsModal
        isOpen={gestao.showSaveOptionsModal}
        onClose={() => gestao.setShowSaveOptionsModal(false)}
        currentNome={gestao.nome}
        currentPasta={pastasState.pasta}
        pastaOptions={buildHierarchicalOptions(pastasState.pastas)}
        isFromTreino={Boolean(treinoId)}
        isSaving={gestao.isSaving}
        onConfirmOverwrite={(novaPasta) => {
          if (novaPasta) pastasState.setPasta(novaPasta);
          gestao.handleExecutarGravacao({
            isNew: false,
            nomeFinal: gestao.nome,
            pastaFinal: novaPasta || pastasState.pasta,
          });
        }}
        onConfirmSaveAsNew={(novoNome, novaPasta) => {
          if (novaPasta) pastasState.setPasta(novaPasta);
          gestao.handleExecutarGravacao({
            isNew: true,
            nomeFinal: novoNome,
            pastaFinal: novaPasta || pastasState.pasta,
          });
        }}
      />

      {/* Confirmação Acessível */}
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

export default PranchetaStudio;
