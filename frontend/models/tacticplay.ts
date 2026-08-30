/**
 * Modelos, Tipos e Algoritmos Puros da Prancheta Tática Dinâmica (TacticPlay)
 * 
 * Responsável por gerir a estrutura em árvore de jogadas (frames, alternativas, ramificações),
 * cálculos matemáticos de interpolação linear para animações a 60 FPS e transformações afins de coordenadas.
 */

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 625;
export const DEFAULT_FIELD_BG = "#1b4332";
export const DEFAULT_HOME_COLOR = "#facc15";
export const DEFAULT_AWAY_COLOR = "#3b82f6";

export type TacticalElementType = "home" | "away" | "ball" | "cone";

export interface TacticalElement {
  id: string;
  type: TacticalElementType;
  number?: number;
  x: number;
  y: number;
  color?: string;
}

export interface TacticalDrawing {
  id: string;
  type: "line" | "pass" | "run" | "arrow";
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface TacticalFrame {
  id: string;
  name: string;
  elements: TacticalElement[];
  drawings?: TacticalDrawing[];
  children: string[];
  parentId: string | null;
  notes?: string;
}

export interface TacticalTree {
  rootId: string;
  framesMap: Record<string, TacticalFrame>;
  activePath: string[];
  currentFrameIdx: number;
}

export interface TacticalPlayData {
  id?: string;
  name: string;
  category?: string;
  pitchStyle: "full" | "half";
  tree: TacticalTree;
  transitionSpeed: number; // Em milissegundos (ex: 1500ms)
}

/**
 * Gera os elementos padrão de acordo com a predefinição selecionada (ex: banco lateral, 4-3-3).
 */
export function getPresetElements(preset: "bench" | "4-3-3" | "4-4-2" = "bench"): TacticalElement[] {
  const elements: TacticalElement[] = [];

  if (preset === "bench") {
    const spacing = CANVAS_HEIGHT / 12;
    for (let i = 1; i <= 11; i++) {
      elements.push({
        id: `H${i}`,
        type: "home",
        number: i,
        x: 35,
        y: Math.round(spacing * i),
        color: i === 1 ? "#f59e0b" : DEFAULT_HOME_COLOR,
      });
      elements.push({
        id: `A${i}`,
        type: "away",
        number: i,
        x: CANVAS_WIDTH - 35,
        y: Math.round(spacing * i),
        color: i === 1 ? "#ec4899" : DEFAULT_AWAY_COLOR,
      });
    }
    // Bola no centro
    elements.push({
      id: "ball-1",
      type: "ball",
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });
  } else if (preset === "4-3-3") {
    // Guarda-redes
    elements.push({ id: "H1", type: "home", number: 1, x: 120, y: 312, color: "#f59e0b" });
    // Defesas
    elements.push({ id: "H2", type: "home", number: 2, x: 240, y: 120, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H3", type: "home", number: 3, x: 200, y: 240, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H4", type: "home", number: 4, x: 200, y: 385, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H5", type: "home", number: 5, x: 240, y: 505, color: DEFAULT_HOME_COLOR });
    // Médios
    elements.push({ id: "H6", type: "home", number: 6, x: 320, y: 312, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H8", type: "home", number: 8, x: 390, y: 200, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H10", type: "home", number: 10, x: 390, y: 425, color: DEFAULT_HOME_COLOR });
    // Avançados
    elements.push({ id: "H7", type: "home", number: 7, x: 470, y: 140, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H9", type: "home", number: 9, x: 480, y: 312, color: DEFAULT_HOME_COLOR });
    elements.push({ id: "H11", type: "home", number: 11, x: 470, y: 485, color: DEFAULT_HOME_COLOR });

    // Bola
    elements.push({ id: "ball-1", type: "ball", x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  }

  return elements;
}

/**
 * Cria uma nova árvore de jogadas inicial com o quadro raiz ('root').
 */
export function createInitialTree(preset: "bench" | "4-3-3" | "4-4-2" = "bench"): TacticalTree {
  const rootElements = getPresetElements(preset);

  const rootFrame: TacticalFrame = {
    id: "root",
    name: "Início",
    elements: rootElements,
    drawings: [],
    children: [],
    parentId: null,
    notes: "",
  };

  return {
    rootId: "root",
    framesMap: {
      root: rootFrame,
    },
    activePath: ["root"],
    currentFrameIdx: 0,
  };
}

/**
 * Reconstrói o percurso sequencial da árvore partindo da raiz até ao nó especificado.
 */
export function getFullPath(targetNodeId: string, framesMap: Record<string, TacticalFrame>): string[] {
  const path: string[] = [];
  let curr: string | null = targetNodeId;

  while (curr !== null && framesMap[curr]) {
    path.unshift(curr);
    curr = framesMap[curr].parentId;
  }

  return path.length > 0 ? path : ["root"];
}

/**
 * Calcula a interpolação linear precisa de posições entre dois quadros táticos.
 * Fórmula: P(progress) = Start + (End - Start) * progress
 * 
 * @param startElements Elementos do quadro de origem
 * @param endElements   Elementos do quadro de destino
 * @param progress      Valor de 0.0 (início) até 1.0 (fim)
 */
export function interpolateElements(
  startElements: TacticalElement[],
  endElements: TacticalElement[],
  progress: number
): TacticalElement[] {
  const endMap = new Map<string, TacticalElement>();
  endElements.forEach((el) => endMap.set(el.id, el));

  return startElements.map((startEl) => {
    const endEl = endMap.get(startEl.id);
    if (!endEl) {
      return { ...startEl };
    }

    const interpolatedX = Math.round((startEl.x + (endEl.x - startEl.x) * progress) * 100) / 100;
    const interpolatedY = Math.round((startEl.y + (endEl.y - startEl.y) * progress) * 100) / 100;

    return {
      ...startEl,
      x: interpolatedX,
      y: interpolatedY,
    };
  });
}

/**
 * Converte coordenadas do ecrã do rato/toque para a matriz interna do Canvas (1000x625),
 * compensando letterbox e barras pretas do object-contain em qualquer formato de ecrã.
 */
export function calculateScaledCoordinates(
  pointerX: number,
  pointerY: number,
  rect: { left: number; top: number; width: number; height: number },
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT
): { x: number; y: number } {
  if (!rect.width || !rect.height) return { x: 0, y: 0 };

  const containerAspect = rect.width / rect.height;
  const canvasAspect = canvasWidth / canvasHeight;
  let renderedWidth = rect.width;
  let renderedHeight = rect.height;
  let offsetX = 0;
  let offsetY = 0;

  if (containerAspect > canvasAspect) {
    renderedHeight = rect.height;
    renderedWidth = rect.height * canvasAspect;
    offsetX = (rect.width - renderedWidth) / 2;
  } else {
    renderedWidth = rect.width;
    renderedHeight = rect.width / canvasAspect;
    offsetY = (rect.height - renderedHeight) / 2;
  }

  const relativeX = pointerX - (rect.left + offsetX);
  const relativeY = pointerY - (rect.top + offsetY);

  const x = relativeX * (canvasWidth / renderedWidth);
  const y = relativeY * (canvasHeight / renderedHeight);

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

/**
 * Adiciona um novo quadro sequencial à árvore tática na ramificação ativa.
 */
export function addFrameToTree(
  tree: TacticalTree,
  name: string,
  elements: TacticalElement[],
  drawings: TacticalDrawing[] = []
): TacticalTree {
  const currentFrameId = tree.activePath[tree.currentFrameIdx] || tree.rootId;
  const currentNode = tree.framesMap[currentFrameId];

  const newFrameId = `frame_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const clonedElements: TacticalElement[] = JSON.parse(JSON.stringify(elements));

  const newFrame: TacticalFrame = {
    id: newFrameId,
    name: name || `Quadro ${tree.activePath.length + 1}`,
    elements: clonedElements,
    drawings: [...drawings],
    children: [],
    parentId: currentFrameId,
  };

  const updatedCurrentNode: TacticalFrame = {
    ...currentNode,
    children: [...currentNode.children, newFrameId],
  };

  const newActivePath = [...tree.activePath.slice(0, tree.currentFrameIdx + 1), newFrameId];

  return {
    ...tree,
    framesMap: {
      ...tree.framesMap,
      [currentFrameId]: updatedCurrentNode,
      [newFrameId]: newFrame,
    },
    activePath: newActivePath,
    currentFrameIdx: newActivePath.length - 1,
  };
}

/**
 * Cria uma ramificação/alternativa tática a partir do quadro atual.
 */
export function addAlternativeToTree(
  tree: TacticalTree,
  altName: string,
  elements: TacticalElement[],
  drawings: TacticalDrawing[] = []
): TacticalTree {
  const currentFrameId = tree.activePath[tree.currentFrameIdx] || tree.rootId;
  const currentNode = tree.framesMap[currentFrameId];

  const altFrameId = `frame_alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const clonedElements: TacticalElement[] = JSON.parse(JSON.stringify(elements));

  const altFrame: TacticalFrame = {
    id: altFrameId,
    name: altName || `Opção ${currentNode.children.length + 1}`,
    elements: clonedElements,
    drawings: [...drawings],
    children: [],
    parentId: currentFrameId,
  };

  const updatedCurrentNode: TacticalFrame = {
    ...currentNode,
    children: [...currentNode.children, altFrameId],
  };

  const newActivePath = [...tree.activePath.slice(0, tree.currentFrameIdx + 1), altFrameId];

  return {
    ...tree,
    framesMap: {
      ...tree.framesMap,
      [currentFrameId]: updatedCurrentNode,
      [altFrameId]: altFrame,
    },
    activePath: newActivePath,
    currentFrameIdx: newActivePath.length - 1,
  };
}

/**
 * Elimina um quadro e recua a ramificação ativa para o nó pai correspondente.
 */
export function deleteFrameFromTree(tree: TacticalTree, frameId: string): TacticalTree {
  if (frameId === "root" || !tree.framesMap[frameId]) {
    return tree;
  }

  const targetNode = tree.framesMap[frameId];
  const parentId = targetNode.parentId;
  if (!parentId || !tree.framesMap[parentId]) {
    return tree;
  }

  const parentNode = tree.framesMap[parentId];
  const updatedParentNode: TacticalFrame = {
    ...parentNode,
    children: parentNode.children.filter((id) => id !== frameId),
  };

  const newFramesMap = { ...tree.framesMap };
  delete newFramesMap[frameId];
  newFramesMap[parentId] = updatedParentNode;

  const newActivePath = getFullPath(parentId, newFramesMap);

  return {
    ...tree,
    framesMap: newFramesMap,
    activePath: newActivePath,
    currentFrameIdx: newActivePath.length - 1,
  };
}
