export type DrawingHandleType = "tl" | "tr" | "bl" | "br" | "radius" | "p0" | "p1" | "rotate_line" | "rotate_shape";

export interface Point {
  x: number;
  y: number;
}

export interface TacticalElement {
  id: string;
  type: "home" | "away" | "ball" | "cone" | "mini_goal";
  x: number;
  y: number;
  number?: number;
  label?: string;
  color?: string;
  rotation?: number;
  goalSize?: "mini" | "fut7" | "fut11";
  size?: "sm" | "md" | "lg";
}

export interface DrawingConfig {
  color?: string;
  fillColor?: string;
  size?: number;
  opacity?: number;
  lineStyle?: "solid" | "dashed";
}

export interface TacticalDrawing {
  type: "select" | "run" | "pass" | "pen" | "rect" | "circle" | "triangle" | "pentagon" | "hexagon" | "line";
  points: Point[];
  config?: DrawingConfig;
  rotation?: number;
}

export interface FrameNode {
  id: string;
  name: string;
  elements: TacticalElement[];
  children: string[];
  parentId: string | null;
  notes?: string;
}

export interface HistorySnapshot {
  framesMap: Record<string, FrameNode>;
  activePath: string[];
  drawings?: TacticalDrawing[];
}

export interface TacticalState {
  pitchStyle: "full" | "half" | "free";
  framesMap: Record<string, FrameNode>;
  activePath: string[];
  currentFrameIdx: number;
  drawingMode: "select" | "run" | "pass" | "pen" | "rect" | "circle" | "triangle" | "line";
  drawings: TacticalDrawing[];
  isPlaying: boolean;
  transitionSpeed: number;
  selectedElement: TacticalElement | null;
  dragOffset: Point;
  isDrawing: boolean;
  currentDrawingPoints: Point[];
  playbackFrameProgress: number;
  playbackStartTime: number;
  loadedTacticIndex: number | null;
  isEditMode: boolean;
  history: HistorySnapshot[];
  historyIndex: number;
  originalDragPos: Point | null;
  activeDrawingIndex?: number;
  drawingConfig?: DrawingConfig;
  
  // Metadados do exercício
  tempo?: string;
  numeroJogadores?: string;
  espaco?: string;
  objetivoEspecifico?: string;
  descricaoMetodologica?: string;
}
