export interface Point {
  x: number;
  y: number;
}

export interface TacticalElement {
  id: string;
  type: "home" | "away" | "ball" | "cone";
  x: number;
  y: number;
  number?: number;
  color?: string;
}

export interface TacticalDrawing {
  type: "select" | "run" | "pass" | "pen" | "rect";
  points: Point[];
  config?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
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
}

export interface TacticalState {
  pitchStyle: "full" | "half";
  framesMap: Record<string, FrameNode>;
  activePath: string[];
  currentFrameIdx: number;
  drawingMode: "select" | "run" | "pass" | "pen" | "rect";
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
  drawingConfig?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
}
