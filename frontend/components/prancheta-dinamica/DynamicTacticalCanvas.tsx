"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  TacticalTree,
  TacticalFrame,
  TacticalElement,
  TacticalDrawing,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  calculateScaledCoordinates,
  interpolateElements,
} from "@/models/tacticplay";
import { DrawingMode, PitchStyle } from "./hooks/useTacticalPlay";
import {
  findHoveredElement,
  findHoveredDrawing,
  getDrawingBounds,
} from "@/components/prancheta/utils/tacticalGeometry";
import {
  drawPitch,
  drawSingleDrawing,
  drawDrawingSelection,
  drawElement,
} from "@/components/prancheta/utils/canvasDrawers";
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
  selectedDrawingIdx?: number | null;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onSelectElement?: (id: string | null) => void;
  onSelectDrawing?: (index: number | null) => void;
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
  selectedDrawingIdx = null,
  canvasRef: externalCanvasRef,
  onSelectElement,
  onSelectDrawing,
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

  const selectedDrawingIdxRef = useRef(selectedDrawingIdx);
  selectedDrawingIdxRef.current = selectedDrawingIdx;

  const drawingModeRef = useRef(drawingMode);
  drawingModeRef.current = drawingMode;

  const isDraggingRef = useRef(false);
  const draggedElementIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const currentDrawingPointsRef = useRef<{ x: number; y: number }[]>([]);

  const onAdvanceFrameRef = useRef(onAdvanceFrame);
  onAdvanceFrameRef.current = onAdvanceFrame;

  const onPlaybackEndRef = useRef(onPlaybackEnd);
  onPlaybackEndRef.current = onPlaybackEnd;

  const onSetProgressRef = useRef(onSetProgress);
  onSetProgressRef.current = onSetProgress;

  const onDecisionPointRef = useRef(onDecisionPoint);
  onDecisionPointRef.current = onDecisionPoint;

  const onSelectElementRef = useRef(onSelectElement);
  onSelectElementRef.current = onSelectElement;

  const onSelectDrawingRef = useRef(onSelectDrawing);
  onSelectDrawingRef.current = onSelectDrawing;

  const onUpdateElementPositionRef = useRef(onUpdateElementPosition);
  onUpdateElementPositionRef.current = onUpdateElementPosition;

  const onCommitHistoryRef = useRef(onCommitHistory);
  onCommitHistoryRef.current = onCommitHistory;

  const onAddDrawingRef = useRef(onAddDrawing);
  onAddDrawingRef.current = onAddDrawing;

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
      drawPitch(ctx, pitchStyleRef.current);

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

      const nodeDrawings = (currentNode?.drawings || []) as any[];
      nodeDrawings.forEach((drawing) => {
        drawSingleDrawing(ctx, drawing);
      });

      const selIdx = selectedDrawingIdxRef.current;
      if (selIdx !== null && selIdx !== undefined && nodeDrawings[selIdx]) {
        const selDrawing = nodeDrawings[selIdx];
        const bounds = getDrawingBounds(selDrawing);
        if (bounds) {
          drawDrawingSelection(ctx, selDrawing, bounds);
        }
      }

      if (isDrawingRef.current && currentDrawingPointsRef.current.length > 0) {
        const dMode = drawingModeRef.current;
        const isShape =
          dMode === "rect" ||
          dMode === "circle" ||
          dMode === "triangle" ||
          dMode === "pentagon" ||
          dMode === "hexagon";

        const tempDrawing: any = {
          type: dMode,
          points: currentDrawingPointsRef.current,
          config: {
            color: isShape ? "#38bdf8" : dMode === "pass" ? "#38bdf8" : dMode === "run" ? "#facc15" : "#ffffff",
            fillColor: "#38bdf8",
            size: isShape ? 2 : 3,
            opacity: isShape ? 35 : 100,
            lineStyle: dMode === "pass" ? "dashed" : "solid",
          },
        };
        drawSingleDrawing(ctx, tempDrawing);
      }

      elementsToRender.forEach((el) => {
        drawElement(ctx, el as any, selectedElementIdRef.current === el.id);
      });

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlayingRef.current) {
      if (onPlaybackEndRef.current) {
        onPlaybackEndRef.current();
      }
    }
    if (!isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = canvas.getBoundingClientRect();
    const coords = calculateScaledCoordinates(e.clientX, e.clientY, rect);

    const currentTree = treeRef.current;
    const activeFrameId = currentTree.activePath[currentTree.currentFrameIdx] || currentTree.rootId;
    const activeFrame = currentTree.framesMap[activeFrameId];
    const elements = (activeFrame?.elements || []) as any[];
    const drawings = (activeFrame?.drawings || []) as any[];

    const hoveredEl = findHoveredElement(coords, elements);

    if (hoveredEl) {
      isDraggingRef.current = true;
      draggedElementIdRef.current = hoveredEl.id;
      dragOffsetRef.current = { x: coords.x - hoveredEl.x, y: coords.y - hoveredEl.y };
      if (onSelectElementRef.current) {
        onSelectElementRef.current(hoveredEl.id);
      }
      if (onSelectDrawingRef.current) {
        onSelectDrawingRef.current(null);
      }
      return;
    }

    if (drawingMode === "select") {
      const hoveredDrawingIdx = findHoveredDrawing(coords, drawings);
      if (hoveredDrawingIdx !== null) {
        if (onSelectDrawingRef.current) {
          onSelectDrawingRef.current(hoveredDrawingIdx);
        }
        if (onSelectElementRef.current) {
          onSelectElementRef.current(null);
        }
        return;
      }

      if (onSelectElementRef.current) {
        onSelectElementRef.current(null);
      }
      if (onSelectDrawingRef.current) {
        onSelectDrawingRef.current(null);
      }
    } else {
      isDrawingRef.current = true;
      currentDrawingPointsRef.current = [{ x: coords.x, y: coords.y }];
      if (onSelectElementRef.current) {
        onSelectElementRef.current(null);
      }
      if (onSelectDrawingRef.current) {
        onSelectDrawingRef.current(null);
      }
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
      const dMode = drawingModeRef.current;
      if (dMode === "pen") {
        currentDrawingPointsRef.current.push({ x: coords.x, y: coords.y });
      } else {
        const p0 = currentDrawingPointsRef.current[0];
        if (p0) {
          currentDrawingPointsRef.current = [p0, { x: coords.x, y: coords.y }];
        }
      }
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
      const dMode = drawingModeRef.current;

      const isShape =
        dMode === "rect" ||
        dMode === "circle" ||
        dMode === "triangle" ||
        dMode === "pentagon" ||
        dMode === "hexagon";

      if (pts.length >= 2) {
        const p0 = pts[0];
        const pLast = pts[pts.length - 1];
        const dist = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);

        if (dist > 8 || pts.length > 2) {
          const newDrawing: TacticalDrawing = {
            id: `draw_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: dMode as any,
            points: [...pts],
            color: isShape ? "#38bdf8" : dMode === "pass" ? "#38bdf8" : dMode === "run" ? "#facc15" : "#ffffff",
            width: isShape ? 2 : 3,
            config: {
              color: isShape ? "#38bdf8" : dMode === "pass" ? "#38bdf8" : dMode === "run" ? "#facc15" : "#ffffff",
              fillColor: isShape ? "#38bdf8" : undefined,
              size: isShape ? 2 : 3,
              opacity: isShape ? 35 : 100,
              lineStyle: dMode === "pass" ? "dashed" : "solid",
            },
          };

          if (onAddDrawingRef.current) {
            onAddDrawingRef.current(newDrawing);
          }
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
