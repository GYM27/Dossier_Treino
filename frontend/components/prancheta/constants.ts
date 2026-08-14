import { TacticalState } from "./types";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 625;
export const FIELD_BG = "#1b4332";
export const HOME_TEAM_COLOR = "#facc15";
export const AWAY_TEAM_COLOR = "#3b82f6";

export const INITIAL_STATE: TacticalState = {
  pitchStyle: "full",
  framesMap: {
    root: {
      id: "root",
      name: "Início",
      elements: [],
      children: [],
      parentId: null,
      notes: ""
    },
  },
  activePath: ["root"],
  currentFrameIdx: 0,
  drawingMode: "select",
  drawings: [],
  isPlaying: false,
  transitionSpeed: 1500,
  selectedElement: null,
  dragOffset: { x: 0, y: 0 },
  isDrawing: false,
  currentDrawingPoints: [],
  playbackFrameProgress: 0,
  playbackStartTime: 0,
  loadedTacticIndex: null,
  isEditMode: true,
  history: [],
  historyIndex: -1,
  originalDragPos: null,
};
