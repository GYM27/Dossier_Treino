"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Film,
  Save,
  Video,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  PlaySquare,
} from "lucide-react";
import { useTacticalPlay } from "./hooks/useTacticalPlay";
import { useTacticalExport } from "./hooks/useTacticalExport";
import { DynamicTacticalCanvas } from "./DynamicTacticalCanvas";
import { DynamicTimeline } from "./DynamicTimeline";
import { DynamicToolbar } from "./DynamicToolbar";
import { DynamicBranchModal } from "./DynamicBranchModal";
import { DynamicExportOverlay } from "./DynamicExportOverlay";
import { TacticalPlayData, TacticalFrame, getFullPath } from "@/models/tacticplay";
import { cn } from "@/lib/utils";

export interface PranchetaDinamicaStudioProps {
  initialPreset?: "bench" | "4-3-3" | "4-4-2";
  initialData?: TacticalPlayData;
  onSave?: (data: TacticalPlayData) => void;
}

export function PranchetaDinamicaStudio({
  initialPreset = "bench",
  initialData,
  onSave,
}: PranchetaDinamicaStudioProps) {
  const [tacticName, setTacticName] = useState(() => initialData?.name || "Nova Jogada Tática");
  const [category, setCategory] = useState(() => initialData?.category || "geral");
  const [decisionNode, setDecisionNode] = useState<TacticalFrame | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hook central de gestão da jogada e árvore
  const play = useTacticalPlay({
    initialPreset,
    initialData,
    onSave,
  });

  // Hook de exportação de vídeo WebM
  const exportTool = useTacticalExport({
    fileNamePrefix: tacticName.toLowerCase().replace(/\s+/g, "_") || "tacticplay",
  });

  // Callback de gravação
  const handleSave = () => {
    const data = play.saveTactic(tacticName, category);
    setSaveFeedback("Jogada gravada com sucesso!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Callback de início de exportação de vídeo
  const handleStartVideoExport = () => {
    if (!canvasRef.current) return;

    // Calcular duração total da jogada (número de transições * velocidade)
    const transitionsCount = Math.max(1, play.tree.activePath.length - 1);
    const totalDurationMs = transitionsCount * play.transitionSpeed + 400;

    // Recuar para o início
    play.selectFrame(0);
    play.setIsPlaying(true);

    exportTool.startRecording(canvasRef.current, totalDurationMs, () => {
      play.setIsPlaying(false);
    });
  };

  // Seleção de ramificação alternativa no ponto de decisão
  const handleSelectBranch = useCallback(
    (childId: string) => {
      const newPath = getFullPath(childId, play.tree.framesMap);
      const childNodeIdx = newPath.indexOf(childId);

      // Atualiza o caminho ativo para a alternativa escolhida
      play.selectFrame(childNodeIdx);
      setDecisionNode(null);
      play.setIsPlaying(true);
    },
    [play]
  );

  return (
    <div className="relative w-full h-full flex flex-col gap-2 p-2 bg-[#070b14] text-slate-100 overflow-hidden select-none">
      {/* 1. Header do Estúdio Dinâmico */}
      <header className="w-full bg-[#0b1120]/95 backdrop-blur-md border border-slate-800/90 rounded-2xl px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Título da Jogada & Categoria */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <PlaySquare className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-0.5 flex-1">
            <input
              type="text"
              value={tacticName}
              onChange={(e) => setTacticName(e.target.value)}
              placeholder="Nome da Jogada Tática..."
              className="bg-transparent text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none border-b border-transparent focus:border-cyan-500 transition-colors truncate max-w-sm"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3 h-3" />
                <span>Modo Dinâmico (Keyframes)</span>
              </span>
              <span>•</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Momento do Jogo"
                className="bg-transparent text-slate-400 text-[11px] hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="geral" className="bg-slate-900 text-slate-200">
                  Geral / Modelo de Jogo
                </option>
                <option value="org_ofensiva" className="bg-slate-900 text-slate-200">
                  Organização Ofensiva
                </option>
                <option value="org_defensiva" className="bg-slate-900 text-slate-200">
                  Organização Defensiva
                </option>
                <option value="trans_ofensiva" className="bg-slate-900 text-slate-200">
                  Transição Ofensiva
                </option>
                <option value="trans_defensiva" className="bg-slate-900 text-slate-200">
                  Transição Defensiva
                </option>
                <option value="bolas_paradas" className="bg-slate-900 text-slate-200">
                  Bolas Paradas
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback & Ações Rápidas */}
        <div className="flex items-center gap-2">
          {saveFeedback && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Botão Gravar Jogada */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Guardar a jogada tática"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gravar</span>
          </button>

          {/* Botão Exportar Vídeo */}
          <button
            type="button"
            onClick={handleStartVideoExport}
            disabled={exportTool.isRecording}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md disabled:opacity-50"
            title="Exportar a animação completa da jogada em vídeo WebM"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Exportar Vídeo</span>
          </button>
        </div>
      </header>

      {/* 2. Área Central: Toolbar Lateral + Canvas Interativo */}
      <main className="w-full flex-1 flex flex-col lg:flex-row gap-2 min-h-0">
        {/* Barra de Ferramentas de Peças e Traços */}
        <DynamicToolbar
          drawingMode={play.drawingMode}
          pitchStyle={play.pitchStyle}
          isEditMode={play.isEditMode}
          canUndo={play.canUndo}
          canRedo={play.canRedo}
          onSetDrawingMode={play.setDrawingMode}
          onSetPitchStyle={play.setPitchStyle}
          onToggleEditMode={() => play.setIsEditMode(!play.isEditMode)}
          onAddPlayer={play.addPlayer}
          onAddBall={play.addBall}
          onAddCone={play.addCone}
          onClearDrawings={play.clearDrawings}
          onLoadPreset={play.loadTacticalPreset}
          onUndo={play.undo}
          onRedo={play.redo}
        />

        {/* Canvas de Renderização 2D */}
        <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
          <DynamicTacticalCanvas
            canvasRef={canvasRef}
            tree={play.tree}
            currentFrame={play.currentFrame}
            pitchStyle={play.pitchStyle}
            isPlaying={play.isPlaying}
            transitionSpeed={play.transitionSpeed}
            drawingMode={play.drawingMode}
            isEditMode={play.isEditMode}
            selectedElementId={play.selectedElementId}
            onSelectElement={play.setSelectedElementId}
            onUpdateElementPosition={play.updateElementPosition}
            onAddDrawing={play.addDrawing}
            onDecisionPoint={(node) => {
              play.setIsPlaying(false);
              setDecisionNode(node);
            }}
            onAdvanceFrame={play.nextFrame}
            onPlaybackEnd={() => play.setIsPlaying(false)}
            onSetProgress={play.setPlaybackFrameProgress}
          />
        </div>
      </main>

      {/* 3. Rodapé: Linha do Tempo Visual e Controlo de Keyframes */}
      <footer className="w-full shrink-0">
        <DynamicTimeline
          tree={play.tree}
          isPlaying={play.isPlaying}
          transitionSpeed={play.transitionSpeed}
          onSelectFrame={play.selectFrame}
          onTogglePlay={play.togglePlayback}
          onPrevFrame={play.prevFrame}
          onNextFrame={play.nextFrame}
          onAddFrame={play.addAnimationFrame}
          onAddAlternative={play.addAlternativeFrame}
          onDeleteFrame={play.deleteCurrentFrame}
          onChangeSpeed={play.setTransitionSpeed}
          onUpdateNotes={play.setFrameNotes}
        />
      </footer>

      {/* 4. Modais Flutuantes: Ponto de Decisão e Gravação de Vídeo */}
      <DynamicBranchModal
        decisionNode={decisionNode}
        tree={play.tree}
        onSelectBranch={handleSelectBranch}
        onClose={() => setDecisionNode(null)}
      />

      <DynamicExportOverlay
        isRecording={exportTool.isRecording}
        progress={exportTool.progress}
        onCancel={exportTool.stopRecording}
      />
    </div>
  );
}
