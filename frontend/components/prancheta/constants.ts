import { TacticalState, TacticalElement } from "./types";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 625;
export const FIELD_BG = "#1b4332";
export const HOME_TEAM_COLOR = "#facc15";
export const AWAY_TEAM_COLOR = "#3b82f6";

export const getInitialElements = (): TacticalElement[] => {
  const elements: TacticalElement[] = [];

  // Equipa A (Amarelos - 1 a 11 alinhados na lateral/trás da baliza esquerda)
  for (let i = 1; i <= 11; i++) {
    elements.push({
      id: `H_init_${i}`,
      type: "home",
      number: i,
      x: 30,
      y: 40 + (i - 1) * 54.5,
      color: HOME_TEAM_COLOR,
    });
  }

  // Equipa B (Azuis - 1 a 11 alinhados na lateral/trás da baliza direita)
  for (let i = 1; i <= 11; i++) {
    elements.push({
      id: `A_init_${i}`,
      type: "away",
      number: i,
      x: CANVAS_WIDTH - 30,
      y: 40 + (i - 1) * 54.5,
      color: AWAY_TEAM_COLOR,
    });
  }

  // Bola no centro
  elements.push({
    id: "B_init",
    type: "ball",
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
  });

  return elements;
};

export const INITIAL_STATE: TacticalState = {
  pitchStyle: "full",
  framesMap: {
    root: {
      id: "root",
      name: "Início",
      elements: getInitialElements(),
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
  drawingConfig: {
    color: "#00e5ff",
    fillColor: "#ef4444",
    size: 2,
    opacity: 100
  },
  tempo: "",
  numeroJogadores: "",
  espaco: "",
  objetivoEspecifico: "",
  descricaoMetodologica: ""
};
