"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Save,
  Video,
  Sparkles,
  CheckCircle2,
  PlaySquare,
  Undo2,
  Redo2,
  MousePointer2,
  ArrowRight,
  TrendingUp,
  Minus,
  Square,
  Circle,
  Triangle,
  CircleDot,
  Cone,
  Eraser,
  Grid,
} from "lucide-react";
import { useTacticalPlay, DrawingMode, PitchStyle } from "./hooks/useTacticalPlay";
import { useTacticalExport } from "./hooks/useTacticalExport";
import { DynamicTacticalCanvas } from "./DynamicTacticalCanvas";
import { DynamicTimeline } from "./DynamicTimeline";
import { DynamicBranchModal } from "./DynamicBranchModal";
import { DynamicExportOverlay } from "./DynamicExportOverlay";
import { TacticalEditSidebar } from "@/components/prancheta/TacticalEditSidebar";
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
    setSaveFeedback("Jogada gravada!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Callback de início de exportação de vídeo
  const handleStartVideoExport = () => {
    if (!canvasRef.current) return;

    const transitionsCount = Math.max(1, play.tree.activePath.length - 1);
    const totalDurationMs = transitionsCount * play.transitionSpeed + 400;

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

      play.selectFrame(childNodeIdx);
      setDecisionNode(null);
      play.setIsPlaying(true);
    },
    [play]
  );

  const isSidebarOpen =
    play.selectedElement !== null ||
    (play.selectedDrawingIdx !== null && play.drawings[play.selectedDrawingIdx] !== undefined);

  return (
    <div className="w-full h-full min-h-0 bg-[#0a0f1c] text-slate-300 font-sans flex flex-col gap-2 p-1.5 md:p-2.5 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden select-none">
      {/* Área Central: Canvas Fullscreen com Overlays Flutuantes */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 w-full rounded-xl overflow-hidden border border-slate-800/80 bg-[#0d1527]">
        {/* 1. Header Flutuante Superior Esquerdo (Nome e Momento do Jogo) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 max-w-[85vw]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-xl">
            <PlaySquare className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={tacticName}
              onChange={(e) => setTacticName(e.target.value)}
              placeholder="Nome da Jogada Tática..."
              className="bg-transparent text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-b focus:border-cyan-400 transition-colors truncate max-w-[200px] sm:max-w-[300px]"
            />
          </div>

          <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-xl text-xs text-slate-300">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Momento do Jogo"
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="geral" className="bg-slate-900 text-slate-200">
                Geral / Modelo
              </option>
              <option value="org_ofensiva" className="bg-slate-900 text-slate-200">
                Org. Ofensiva
              </option>
              <option value="org_defensiva" className="bg-slate-900 text-slate-200">
                Org. Defensiva
              </option>
              <option value="trans_ofensiva" className="bg-slate-900 text-slate-200">
                Trans. Ofensiva
              </option>
              <option value="trans_defensiva" className="bg-slate-900 text-slate-200">
                Trans. Defensiva
              </option>
              <option value="bolas_paradas" className="bg-slate-900 text-slate-200">
                Bolas Paradas
              </option>
            </select>
          </div>

          {/* Feedback de Gravação */}
          {saveFeedback && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-xl animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saveFeedback}</span>
            </div>
          )}
        </div>

        {/* 2. Botões Flutuantes Topo Direito (Undo, Redo, Vídeo, Gravar) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={play.undo}
            disabled={!play.canUndo}
            className={cn(
              "p-2 rounded-xl border backdrop-blur-md transition-all shadow-xl",
              play.canUndo
                ? "bg-slate-900/90 border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed"
            )}
            title="Desfazer Ação (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={play.redo}
            disabled={!play.canRedo}
            className={cn(
              "p-2 rounded-xl border backdrop-blur-md transition-all shadow-xl",
              play.canRedo
                ? "bg-slate-900/90 border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed"
            )}
            title="Refazer Ação (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-700/50 mx-0.5 hidden sm:block" />

          <button
            type="button"
            onClick={handleStartVideoExport}
            disabled={exportTool.isRecording}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-semibold backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95"
            title="Exportar Animação em Vídeo HD (WebM)"
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Vídeo</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-xl shadow-cyan-950/40 transition-all hover:scale-105 active:scale-95"
            title="Gravar Jogada Tática"
          >
            <Save className="w-4 h-4" />
            <span>Gravar</span>
          </button>
        </div>

        {/* 3. Barra Lateral de Edição Contextual (Reutilizada e Flutuante) */}
        {isSidebarOpen && (
          <div className="absolute top-0 left-0 bottom-0 z-30 flex">
            <TacticalEditSidebar
              selectedDrawing={
                play.selectedDrawingIdx !== null && play.drawings[play.selectedDrawingIdx]
                  ? (play.drawings[play.selectedDrawingIdx] as any)
                  : null
              }
              selectedDrawingIdx={play.selectedDrawingIdx}
              selectedElement={play.selectedElement as any}
              onUpdateDrawing={(idx, updated) => play.updateDrawing(idx, updated as any)}
              onDeleteDrawing={play.deleteDrawing}
              onDuplicateDrawing={(d) => play.duplicateDrawing(d as any)}
              onUpdateElement={play.updateElement}
              onDeleteElement={play.deleteElement}
              onDuplicateElement={play.duplicateElement}
              onRotateElement={play.rotateElement}
              onClose={() => {
                play.setSelectedElementId(null);
                play.setSelectedDrawingIdx(null);
              }}
            />
          </div>
        )}

        {/* Canvas de Desenho e Interpolação a 60 FPS */}
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
          selectedDrawingIdx={play.selectedDrawingIdx}
          onSelectElement={play.setSelectedElementId}
          onSelectDrawing={play.setSelectedDrawingIdx}
          onUpdateElementPosition={play.updateElementPosition}
          onCommitHistory={play.commitHistory}
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

      {/* Linha do Tempo e Keyframes */}
      <div className="shrink-0 w-full">
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
      </div>

      {/* Barra Flutuante de Ferramentas, Formas e Peças Táticas */}
      <div className="shrink-0 w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#0b1120]/95 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl text-xs overflow-x-auto">
        {/* Ferramentas de Seleção, Linhas e Formas */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => play.setDrawingMode("select")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all border",
              play.drawingMode === "select"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Modo Seleção e Mover"
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mover</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* Linhas */}
          <button
            type="button"
            onClick={() => play.setDrawingMode("line")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "line"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Linha Simples"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => play.setDrawingMode("run")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "run"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Corrida (Seta Contínua)"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => play.setDrawingMode("pass")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "pass"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Passe (Seta Tracejada)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-600">|</span>

          {/* Formas Geométricas */}
          <button
            type="button"
            onClick={() => play.setDrawingMode("rect")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "rect"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Quadrado / Retângulo"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => play.setDrawingMode("circle")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "circle"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Círculo"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => play.setDrawingMode("triangle")}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              play.drawingMode === "triangle"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            )}
            title="Desenhar Triângulo"
          >
            <Triangle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Campo e Presets */}
        <div className="flex items-center gap-2">
          <select
            value={play.pitchStyle}
            onChange={(e) => play.setPitchStyle(e.target.value as PitchStyle)}
            aria-label="Estilo do Campo"
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="full">Campo Completo</option>
            <option value="half">Meio Campo</option>
          </select>

          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                play.loadTacticalPreset(e.target.value as "bench" | "4-3-3" | "4-4-2");
                e.target.value = "";
              }
            }}
            aria-label="Carregar Tática Predefinida"
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer hidden md:block"
          >
            <option value="" disabled>
              Tática Preset...
            </option>
            <option value="bench">Banco Lateral (22)</option>
            <option value="4-3-3">Disposição 4-3-3</option>
          </select>
        </div>

        {/* Peças no Campo */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => play.addPlayer("home")}
            className="flex items-center justify-center size-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:scale-110 active:scale-95 transition-all"
            title="Adicionar Jogador Equipa Principal (Amarelo)"
          >
            A
          </button>

          <button
            type="button"
            onClick={() => play.addPlayer("away")}
            className="flex items-center justify-center size-6 rounded-full bg-blue-500 text-white font-bold text-xs shadow-md hover:scale-110 active:scale-95 transition-all"
            title="Adicionar Jogador Equipa Adversária (Azul)"
          >
            B
          </button>

          <button
            type="button"
            onClick={play.addCone}
            className="flex items-center justify-center p-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-orange-400 hover:scale-110 active:scale-95 transition-all"
            title="Adicionar Cone"
          >
            <Cone className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={play.addBall}
            className="flex items-center justify-center p-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-white hover:scale-110 active:scale-95 transition-all"
            title="Adicionar Bola de Futebol"
          >
            <CircleDot className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={play.clearDrawings}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 text-[11px] font-semibold transition-all"
            title="Limpar Linhas e Formas Táticas"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Modais Flutuantes: Ponto de Decisão e Gravação de Vídeo */}
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
