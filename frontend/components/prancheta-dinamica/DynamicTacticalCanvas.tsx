"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  TacticalTree,
  TacticalFrame,
  TacticalElement,
  TacticalDrawing,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_FIELD_BG,
  calculateScaledCoordinates,
  interpolateElements,
} from "@/models/tacticplay";
import { DrawingMode, PitchStyle } from "./hooks/useTacticalPlay";
import { findHoveredElement } from "@/components/prancheta/utils/tacticalGeometry";
import { cn } from "@/lib/utils";

export interface DynamicTacticalCanvasProps {
  tree: TacticalTree;
  currentFrame: TacticalFrame;
  pitchStyle: PitchStyle;
  isPlaying: boolean;
  transitionSpeed: number;
  drawingMode: DrawingMode;
  isEditMode: boolean;
  selectedElementId: string | null;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onSelectElement?: (id: string | null) => void;
  onUpdateElementPosition?: (id: string, x: number, y: number, propagate?: boolean) => void;
  onCommitHistory?: () => void;
  onAddDrawing?: (drawing: TacticalDrawing) => void;
  onDecisionPoint?: (node: TacticalFrame) => void;
  onAdvanceFrame?: () => void;
  onPlaybackEnd?: () => void;
  onSetProgress?: (progress: number) => void;
}

export function DynamicTacticalCanvas({
  tree,
  currentFrame,
  pitchStyle,
  isPlaying,
  transitionSpeed,
  drawingMode,
  isEditMode,
  selectedElementId,
  canvasRef: externalCanvasRef,
  onSelectElement,
  onUpdateElementPosition,
  onCommitHistory,
  onAddDrawing,
  onDecisionPoint,
  onAdvanceFrame,
  onPlaybackEnd,
  onSetProgress,
}: DynamicTacticalCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  // Refs de estado para o loop de animação a 60 FPS
  const requestRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const treeRef = useRef(tree);
  treeRef.current = tree;

  const currentFrameRef = useRef(currentFrame);
  currentFrameRef.current = currentFrame;

  const transitionSpeedRef = useRef(transitionSpeed);
  transitionSpeedRef.current = transitionSpeed;

  const pitchStyleRef = useRef(pitchStyle);
  pitchStyleRef.current = pitchStyle;

  const selectedElementIdRef = useRef(selectedElementId);
  selectedElementIdRef.current = selectedElementId;

  // Interação de Drag-and-Drop e Desenho
  const isDraggingRef = useRef(false);
  const draggedElementIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const currentDrawingPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Callbacks em refs estáveis
  const onAdvanceFrameRef = useRef(onAdvanceFrame);
  onAdvanceFrameRef.current = onAdvanceFrame;

  const onDecisionPointRef = useRef(onDecisionPoint);
  onDecisionPointRef.current = onDecisionPoint;

  const onPlaybackEndRef = useRef(onPlaybackEnd);
  onPlaybackEndRef.current = onPlaybackEnd;

  const onSetProgressRef = useRef(onSetProgress);
  onSetProgressRef.current = onSetProgress;

  const onUpdateElementPositionRef = useRef(onUpdateElementPosition);
  onUpdateElementPositionRef.current = onUpdateElementPosition;

  const onCommitHistoryRef = useRef(onCommitHistory);
  onCommitHistoryRef.current = onCommitHistory;

  const onAddDrawingRef = useRef(onAddDrawing);
  onAddDrawingRef.current = onAddDrawing;

  const onSelectElementRef = useRef(onSelectElement);
  onSelectElementRef.current = onSelectElement;

  // Renderização do Campo e Marcações Oficiais
  const drawField = useCallback((ctx: CanvasRenderingContext2D, style: PitchStyle) => {
    ctx.fillStyle = DEFAULT_FIELD_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "#ffffff50";
    ctx.lineWidth = 3;
    const padding = 55;
    const w = CANVAS_WIDTH - padding * 2;
    const h = CANVAS_HEIGHT - padding * 2;

    // Linha limite exterior
    ctx.strokeRect(padding, padding, w, h);

    if (style === "full") {
      // Linha de Meio-Campo
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, padding);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - padding);
      ctx.stroke();

      // Círculo Central
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Ponto Central
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffffa0";
      ctx.fill();

      // Grande Área Esquerda
      ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 120, 105, 240);
      // Pequena Área Esquerda
      ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 45, 38, 90);
      // Baliza Esquerda
      ctx.strokeRect(padding - 15, CANVAS_HEIGHT / 2 - 30, 15, 60);
      // Marca de Penálti Esquerda
      ctx.beginPath();
      ctx.arc(padding + 75, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Meia-lua Esquerda
      ctx.beginPath();
      ctx.arc(padding + 75, CANVAS_HEIGHT / 2, 45, -0.3 * Math.PI, 0.3 * Math.PI);
      ctx.stroke();

      // Grande Área Direita
      ctx.strokeRect(CANVAS_WIDTH - padding - 105, CANVAS_HEIGHT / 2 - 120, 105, 240);
      // Pequena Área Direita
      ctx.strokeRect(CANVAS_WIDTH - padding - 38, CANVAS_HEIGHT / 2 - 45, 38, 90);
      // Baliza Direita
      ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - 30, 15, 60);
      // Marca de Penálti Direita
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - padding - 75, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Meia-lua Direita
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - padding - 75, CANVAS_HEIGHT / 2, 45, 0.7 * Math.PI, 1.3 * Math.PI);
      ctx.stroke();
    } else {
      // Meio Campo Ofensivo
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, CANVAS_HEIGHT - padding);
      ctx.stroke();

      // Grande Área
      ctx.strokeRect(CANVAS_WIDTH - padding - 210, CANVAS_HEIGHT / 2 - 180, 210, 360);
      // Pequena Área
      ctx.strokeRect(CANVAS_WIDTH - padding - 75, CANVAS_HEIGHT / 2 - 80, 75, 160);
      // Baliza
      ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - 45, 20, 90);
    }
  }, []);

  // Desenho de Linhas Táticas e Trajetórias com Setas
  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    width: number
  ) => {
    const headlen = 12;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawTacticalDrawings = useCallback(
    (ctx: CanvasRenderingContext2D, drawings: TacticalDrawing[]) => {
      drawings.forEach((d) => {
        if (!d.points || d.points.length < 2) return;

        ctx.save();
        ctx.strokeStyle = d.color || "#facc15";
        ctx.lineWidth = d.width || 3;

        if (d.type === "pass") {
          ctx.setLineDash([8, 6]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        for (let i = 1; i < d.points.length; i++) {
          ctx.lineTo(d.points[i].x, d.points[i].y);
        }
        ctx.stroke();

        // Desenhar seta na terminação
        const pLast = d.points[d.points.length - 1];
        const pPrev = d.points[d.points.length - 2];
        drawArrowhead(ctx, pPrev.x, pPrev.y, pLast.x, pLast.y, d.color || "#facc15", d.width || 3);
        ctx.restore();
      });

      // Desenhar o traço temporário em criação
      if (isDrawingRef.current && currentDrawingPointsRef.current.length > 1) {
        const pts = currentDrawingPointsRef.current;
        ctx.save();
        ctx.strokeStyle = drawingMode === "pass" ? "#38bdf8" : "#facc15";
        ctx.lineWidth = 3.5;
        if (drawingMode === "pass") ctx.setLineDash([8, 6]);

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    },
    [drawingMode]
  );

  // Renderização de Elementos (Jogadores, Bola e Cones)
  const drawElements = useCallback(
    (ctx: CanvasRenderingContext2D, elements: TacticalElement[]) => {
      elements.forEach((el) => {
        if (el.type === "ball") {
          const r = 11;
          ctx.beginPath();
          ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#0f172a";
          ctx.stroke();

          // Pentágono central
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const px = el.x + r * 0.42 * Math.cos(angle);
            const py = el.y + r * 0.42 * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = "#0f172a";
          ctx.fill();
        } else if (el.type === "cone") {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y - 12);
          ctx.lineTo(el.x - 12, el.y + 12);
          ctx.lineTo(el.x + 12, el.y + 12);
          ctx.closePath();
          ctx.fillStyle = "#f97316";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Base do cone
          ctx.beginPath();
          ctx.moveTo(el.x - 14, el.y + 12);
          ctx.lineTo(el.x + 14, el.y + 12);
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 3.5;
          ctx.stroke();
        } else {
          // Jogador
          const isSelected = selectedElementIdRef.current === el.id;

          // Anel de seleção em destaque
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(el.x, el.y, 25, 0, Math.PI * 2);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.beginPath();
          ctx.arc(el.x, el.y, 18, 0, Math.PI * 2);
          ctx.fillStyle = el.color || (el.type === "home" ? "#facc15" : "#3b82f6");
          ctx.shadowColor = "rgba(0,0,0,0.45)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2.5;
          ctx.fill();
          ctx.shadowColor = "transparent";

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = el.type === "home" ? "#0f172a" : "#ffffff";
          ctx.stroke();

          if (typeof el.number === "number") {
            ctx.font = "bold 14px Inter, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = el.type === "home" ? "#0f172a" : "#ffffff";
            ctx.fillText(String(el.number), el.x, el.y);
          }
        }
      });
    },
    []
  );

  // Loop de Animação com Interpolação a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isPlaying) {
      playbackStartTimeRef.current = performance.now();
    }

    const renderLoop = (time: number) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawField(ctx, pitchStyleRef.current);

      let elementsToRender: TacticalElement[] = [];
      const currentTree = treeRef.current;
      const currentActivePath = currentTree.activePath;
      const currentIdx = currentTree.currentFrameIdx;
      const currentNodeId = currentActivePath[currentIdx];
      const currentNode = currentTree.framesMap[currentNodeId];

      if (isPlayingRef.current && currentIdx < currentActivePath.length - 1) {
        const nextNodeId = currentActivePath[currentIdx + 1];
        const nextNode = currentTree.framesMap[nextNodeId];

        const elapsed = time - playbackStartTimeRef.current;
        const progress = Math.min(1.0, elapsed / transitionSpeedRef.current);

        if (onSetProgressRef.current) {
          onSetProgressRef.current(progress);
        }

        if (currentNode && nextNode) {
          elementsToRender = interpolateElements(
            currentNode.elements || [],
            nextNode.elements || [],
            progress
          );
        } else {
          elementsToRender = currentNode?.elements || [];
        }

        if (progress >= 1.0) {
          playbackStartTimeRef.current = time;
          if (onAdvanceFrameRef.current) {
            onAdvanceFrameRef.current();
          }

          // Se chegámos a uma bifurcação tática (nó com mais de 1 alternativa)
          if (nextNode && nextNode.children.length > 1) {
            if (onDecisionPointRef.current) {
              onDecisionPointRef.current(nextNode);
            }
          }
        }
      } else {
        if (isPlayingRef.current && currentIdx >= currentActivePath.length - 1) {
          if (onPlaybackEndRef.current) {
            onPlaybackEndRef.current();
          }
        }
        elementsToRender = currentNode?.elements || [];
      }

      drawTacticalDrawings(ctx, currentNode?.drawings || []);
      drawElements(ctx, elementsToRender);

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, drawField, drawTacticalDrawings, drawElements]);

  // Gestão de Eventos de Pointer (Drag & Drop + Linhas)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlaying || !isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = canvas.getBoundingClientRect();
    const coords = calculateScaledCoordinates(e.clientX, e.clientY, rect);

    const elements = currentFrameRef.current?.elements || [];
    const hoveredEl = findHoveredElement(coords, elements);

    // Se clicou num elemento (prioritário) ou se estiver no modo de seleção
    if (hoveredEl) {
      isDraggingRef.current = true;
      draggedElementIdRef.current = hoveredEl.id;
      dragOffsetRef.current = { x: coords.x - hoveredEl.x, y: coords.y - hoveredEl.y };
      if (onSelectElementRef.current) {
        onSelectElementRef.current(hoveredEl.id);
      }
      return;
    }

    if (drawingMode === "select") {
      if (onSelectElementRef.current) {
        onSelectElementRef.current(null);
      }
    } else {
      // Iniciar traçado de linha tática
      isDrawingRef.current = true;
      currentDrawingPointsRef.current = [{ x: coords.x, y: coords.y }];
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlaying || !isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const coords = calculateScaledCoordinates(e.clientX, e.clientY, rect);

    if (isDraggingRef.current && draggedElementIdRef.current) {
      const newX = Math.max(15, Math.min(CANVAS_WIDTH - 15, coords.x - dragOffsetRef.current.x));
      const newY = Math.max(15, Math.min(CANVAS_HEIGHT - 15, coords.y - dragOffsetRef.current.y));
      if (onUpdateElementPositionRef.current) {
        onUpdateElementPositionRef.current(draggedElementIdRef.current, newX, newY, false);
      }
    } else if (isDrawingRef.current) {
      currentDrawingPointsRef.current.push({ x: coords.x, y: coords.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      draggedElementIdRef.current = null;
      if (onCommitHistoryRef.current) {
        onCommitHistoryRef.current();
      }
    }

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      const pts = currentDrawingPointsRef.current;
      if (pts.length > 2) {
        const newDrawing: TacticalDrawing = {
          id: `draw_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: drawingMode as "pass" | "run" | "line",
          points: [...pts],
          color: drawingMode === "pass" ? "#38bdf8" : drawingMode === "run" ? "#facc15" : "#ffffff",
          width: 3.5,
        };

        if (onAddDrawingRef.current) {
          onAddDrawingRef.current(newDrawing);
        }
      }
      currentDrawingPointsRef.current = [];
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "w-full h-full max-h-full object-contain touch-none select-none",
          isPlaying ? "cursor-default" : drawingMode === "select" ? "cursor-default" : "cursor-crosshair"
        )}
      />
    </div>
  );
}
