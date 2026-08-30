"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  TacticalTree,
  TacticalFrame,
  TacticalElement,
  TacticalDrawing,
  TacticalPlayData,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_HOME_COLOR,
  DEFAULT_AWAY_COLOR,
  createInitialTree,
  addFrameToTree,
  addAlternativeToTree,
  deleteFrameFromTree,
  getPresetElements,
} from "@/models/tacticplay";

export interface UseTacticalPlayOptions {
  initialPreset?: "bench" | "4-3-3" | "4-4-2";
  initialData?: TacticalPlayData;
  onSave?: (data: TacticalPlayData) => void;
}

export type DrawingMode = "select" | "pass" | "run" | "line";
export type PitchStyle = "full" | "half";

export function useTacticalPlay(options: UseTacticalPlayOptions = {}) {
  const { initialPreset = "bench", initialData, onSave } = options;

  // Estado inicial da árvore
  const [tree, setTree] = useState<TacticalTree>(() => {
    if (initialData?.tree) {
      return initialData.tree;
    }
    return createInitialTree(initialPreset);
  });

  // Histórico de Undo / Redo
  const [history, setHistory] = useState<TacticalTree[]>([tree]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Estados de reprodução e visualização
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackFrameProgress, setPlaybackFrameProgress] = useState(0);
  const [transitionSpeed, setTransitionSpeed] = useState(() => initialData?.transitionSpeed || 1500);
  const [pitchStyle, setPitchStyle] = useState<PitchStyle>(() => initialData?.pitchStyle || "full");
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("select");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Pronto.");
  const [isEditMode, setIsEditMode] = useState(true);

  // Callback de onSave em ref estável
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Frame atual ativo
  const currentFrameId = tree.activePath[tree.currentFrameIdx] || tree.rootId;
  const currentFrame: TacticalFrame = tree.framesMap[currentFrameId] || {
    id: "root",
    name: "Início",
    elements: [],
    drawings: [],
    children: [],
    parentId: null,
  };

  const currentElements = currentFrame.elements || [];
  const drawings = currentFrame.drawings || [];

  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return currentElements.find((e) => e.id === selectedElementId) || null;
  }, [selectedElementId, currentElements]);

  // Função auxiliar para registar novo estado no histórico
  const recordHistory = useCallback((newTree: TacticalTree) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newTree];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Desfazer (Undo)
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setTree(history[prevIndex]);
      setStatusMessage("Ação desfeita.");
    }
  }, [historyIndex, history]);

  // Refazer (Redo)
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setTree(history[nextIndex]);
      setStatusMessage("Ação refeita.");
    }
  }, [historyIndex, history]);

  // Ações da Timeline
  const addAnimationFrame = useCallback(() => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];
      const drws = node?.drawings || [];

      const nextNumber = prevTree.activePath.length + 1;
      const updatedTree = addFrameToTree(prevTree, `Quadro ${nextNumber}`, elements, drws);
      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Quadro inserido na jogada.");
  }, [recordHistory]);

  const addAlternativeFrame = useCallback((altName: string) => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];
      const drws = node?.drawings || [];

      const updatedTree = addAlternativeToTree(
        prevTree,
        altName || "Nova Alternativa",
        elements,
        drws
      );
      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage(`Alternativa "${altName}" criada.`);
  }, [recordHistory]);

  const deleteCurrentFrame = useCallback(() => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      if (activeId === "root") {
        setStatusMessage("Não é possível eliminar o quadro inicial (Início).");
        return prevTree;
      }
      const updatedTree = deleteFrameFromTree(prevTree, activeId);
      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Quadro removido.");
  }, [recordHistory]);

  const selectFrame = useCallback((idx: number) => {
    setTree((prev) => {
      if (idx >= 0 && idx < prev.activePath.length) {
        return {
          ...prev,
          currentFrameIdx: idx,
        };
      }
      return prev;
    });
  }, []);

  const prevFrame = useCallback(() => {
    setTree((prev) => ({
      ...prev,
      currentFrameIdx: Math.max(0, prev.currentFrameIdx - 1),
    }));
  }, []);

  const nextFrame = useCallback(() => {
    setTree((prev) => {
      if (prev.currentFrameIdx < prev.activePath.length - 1) {
        return {
          ...prev,
          currentFrameIdx: prev.currentFrameIdx + 1,
        };
      }
      return prev;
    });
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      setStatusMessage(nextPlaying ? "Animação em reprodução." : "Animação pausada.");
      return nextPlaying;
    });
  }, []);

  // Manipulação de Peças no Campo
  const addPlayer = useCallback((team: "home" | "away") => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];

      const existingNumbers = elements
        .filter((el) => el.type === team && typeof el.number === "number")
        .map((el) => el.number as number);

      let num = 1;
      while (existingNumbers.includes(num)) num++;

      const color = team === "home" ? DEFAULT_HOME_COLOR : DEFAULT_AWAY_COLOR;
      const newPlayer: TacticalElement = {
        id: `${team === "home" ? "H" : "A"}${Date.now() % 10000}`,
        type: team,
        number: num,
        x: Math.round(CANVAS_WIDTH / 2),
        y: Math.round(CANVAS_HEIGHT / 2),
        color,
      };

      const updatedFrame: TacticalFrame = {
        ...node,
        elements: [...elements, newPlayer],
      };

      const updatedTree: TacticalTree = {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };

      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Jogador adicionado ao centro do campo.");
  }, [recordHistory]);

  const addBall = useCallback(() => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];

      if (elements.some((e) => e.type === "ball")) {
        setStatusMessage("Já existe uma bola em campo!");
        return prevTree;
      }

      const newBall: TacticalElement = {
        id: `ball_${Date.now() % 10000}`,
        type: "ball",
        x: Math.round(CANVAS_WIDTH / 2),
        y: Math.round(CANVAS_HEIGHT / 2),
      };

      const updatedFrame: TacticalFrame = {
        ...node,
        elements: [...elements, newBall],
      };

      const updatedTree: TacticalTree = {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };

      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Bola de futebol adicionada ao centro.");
  }, [recordHistory]);

  const addCone = useCallback(() => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];

      const newCone: TacticalElement = {
        id: `cone_${Date.now() % 10000}`,
        type: "cone",
        x: Math.round(CANVAS_WIDTH / 2),
        y: Math.round(CANVAS_HEIGHT / 2),
      };

      const updatedFrame: TacticalFrame = {
        ...node,
        elements: [...elements, newCone],
      };

      const updatedTree: TacticalTree = {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };

      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Obstáculo / cone de treino adicionado.");
  }, [recordHistory]);

  const removeElement = useCallback((elementId: string) => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];
      const elements = node?.elements || [];

      const updatedElements = elements.filter((el) => el.id !== elementId);
      const updatedFrame: TacticalFrame = {
        ...node,
        elements: updatedElements,
      };

      const updatedTree: TacticalTree = {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };

      recordHistory(updatedTree);
      return updatedTree;
    });

    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
    setStatusMessage("Peça removida do campo.");
  }, [selectedElementId, recordHistory]);

  // Propagação recursiva de movimento para descendentes na árvore
  const propagateMovement = useCallback(
    (nodeId: string, elementId: string, dx: number, dy: number, framesMap: Record<string, TacticalFrame>) => {
      const node = framesMap[nodeId];
      if (!node) return;

      node.children.forEach((childId) => {
        const childNode = framesMap[childId];
        if (childNode) {
          const el = childNode.elements.find((e) => e.id === elementId);
          if (el) {
            el.x = Math.round(el.x + dx);
            el.y = Math.round(el.y + dy);
          }
          propagateMovement(childId, elementId, dx, dy, framesMap);
        }
      });
    },
    []
  );

  const updateElementPosition = useCallback(
    (elementId: string, newX: number, newY: number, propagate = false) => {
      setTree((prevTree) => {
        const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
        const node = prevTree.framesMap[activeId];
        const elements = node?.elements || [];

        const existingEl = elements.find((e) => e.id === elementId);
        if (!existingEl) return prevTree;

        const dx = newX - existingEl.x;
        const dy = newY - existingEl.y;

        const updatedElements = elements.map((el) =>
          el.id === elementId ? { ...el, x: Math.round(newX), y: Math.round(newY) } : el
        );

        const newFramesMap: Record<string, TacticalFrame> = JSON.parse(JSON.stringify(prevTree.framesMap));
        newFramesMap[activeId].elements = updatedElements;

        if (propagate && (dx !== 0 || dy !== 0)) {
          propagateMovement(activeId, elementId, dx, dy, newFramesMap);
        }

        const updatedTree: TacticalTree = {
          ...prevTree,
          framesMap: newFramesMap,
        };

        recordHistory(updatedTree);
        return updatedTree;
      });
    },
    [propagateMovement, recordHistory]
  );

  const updateElementDetails = useCallback(
    (elementId: string, updates: Partial<TacticalElement>) => {
      setTree((prevTree) => {
        const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
        const node = prevTree.framesMap[activeId];
        const elements = node?.elements || [];

        const updatedElements = elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        );

        const updatedFrame: TacticalFrame = {
          ...node,
          elements: updatedElements,
        };

        const updatedTree: TacticalTree = {
          ...prevTree,
          framesMap: {
            ...prevTree.framesMap,
            [activeId]: updatedFrame,
          },
        };

        recordHistory(updatedTree);
        return updatedTree;
      });
    },
    [recordHistory]
  );

  const loadTacticalPreset = useCallback(
    (preset: "bench" | "4-3-3" | "4-4-2") => {
      setTree((prevTree) => {
        const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
        const node = prevTree.framesMap[activeId];
        const presetElements = getPresetElements(preset);

        const updatedFrame: TacticalFrame = {
          ...node,
          elements: presetElements,
        };

        const updatedTree: TacticalTree = {
          ...prevTree,
          framesMap: {
            ...prevTree.framesMap,
            [activeId]: updatedFrame,
          },
        };

        recordHistory(updatedTree);
        return updatedTree;
      });
      setStatusMessage(`Predefinição tática "${preset}" carregada.`);
    },
    [recordHistory]
  );

  // Desenhos e Anotações
  const addDrawing = useCallback(
    (drawing: TacticalDrawing) => {
      setTree((prevTree) => {
        const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
        const node = prevTree.framesMap[activeId];
        const drws = node?.drawings || [];

        const updatedFrame: TacticalFrame = {
          ...node,
          drawings: [...drws, drawing],
        };

        const updatedTree: TacticalTree = {
          ...prevTree,
          framesMap: {
            ...prevTree.framesMap,
            [activeId]: updatedFrame,
          },
        };

        recordHistory(updatedTree);
        return updatedTree;
      });
    },
    [recordHistory]
  );

  const clearDrawings = useCallback(() => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];

      const updatedFrame: TacticalFrame = {
        ...node,
        drawings: [],
      };

      const updatedTree: TacticalTree = {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };

      recordHistory(updatedTree);
      return updatedTree;
    });
    setStatusMessage("Linhas táticas eliminadas.");
  }, [recordHistory]);

  const setFrameNotes = useCallback((notes: string) => {
    setTree((prevTree) => {
      const activeId = prevTree.activePath[prevTree.currentFrameIdx] || prevTree.rootId;
      const node = prevTree.framesMap[activeId];

      const updatedFrame: TacticalFrame = {
        ...node,
        notes,
      };

      return {
        ...prevTree,
        framesMap: {
          ...prevTree.framesMap,
          [activeId]: updatedFrame,
        },
      };
    });
  }, []);

  // Gravação / Persistência
  const saveTactic = useCallback(
    (name: string, category = "geral") => {
      const playData: TacticalPlayData = {
        id: initialData?.id,
        name: name.trim() || "Jogada Dinâmica",
        category,
        pitchStyle,
        tree,
        transitionSpeed,
      };

      if (onSaveRef.current) {
        onSaveRef.current(playData);
      }

      setStatusMessage(`Jogada "${playData.name}" gravada com sucesso!`);
      return playData;
    },
    [initialData?.id, pitchStyle, tree, transitionSpeed]
  );

  return {
    tree,
    currentFrame,
    currentFrameId,
    currentElements,
    drawings,
    selectedElement,
    selectedElementId,
    currentFrameIdx: tree.currentFrameIdx,
    activePath: tree.activePath,
    isPlaying,
    playbackFrameProgress,
    transitionSpeed,
    pitchStyle,
    drawingMode,
    statusMessage,
    isEditMode,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    // Ações
    setSelectedElementId,
    setDrawingMode,
    setPitchStyle,
    setTransitionSpeed,
    setIsPlaying,
    setPlaybackFrameProgress,
    setStatusMessage,
    setIsEditMode,
    undo,
    redo,
    addAnimationFrame,
    addAlternativeFrame,
    deleteCurrentFrame,
    selectFrame,
    prevFrame,
    nextFrame,
    togglePlayback,
    addPlayer,
    addBall,
    addCone,
    removeElement,
    updateElementPosition,
    updateElementDetails,
    loadTacticalPreset,
    addDrawing,
    clearDrawings,
    setFrameNotes,
    saveTactic,
  };
}
