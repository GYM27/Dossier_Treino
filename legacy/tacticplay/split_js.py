import os
import re

os.makedirs('js', exist_ok=True)

with open('js/legacy.js', 'r', encoding='utf-8') as f:
    content = f.read()

# mapping of function names to filenames
mapping = {
    'history.js': ['saveStateToHistory', 'undo', 'redo', 'restoreSnapshot'],
    'elements.js': ['propagateMovement', 'addPlayer', 'addBall', 'addCone', 'loadTacticalPreset', 'getActiveFrameId', 'getActiveElements', 'getActiveNode', 'getFullPath', 'buildActivePath'],
    'events.js': ['setupInteractionListeners', 'handlePointerDown', 'handlePointerMove', 'handlePointerUp', 'handleDoubleClick'],
    'drawing.js': ['drawField', 'drawArrowhead', 'drawTacticalDrawings', 'drawLoop'],
    'ui.js': ['updateUndoRedoUI', 'toggleEditMode', 'setDrawingMode', 'clearDrawings', 'changePitchStyle', 'showInteractiveOverlay', 'hideInteractiveOverlay', 'renameFrame', 'updateTimelineUI', 'switchBranch', 'addAnimationFrame', 'addAlternativeFrame', 'deleteCurrentFrame', 'selectFrame', 'prevFrame', 'nextFrame', 'togglePlayback', 'updateTransitionSpeed', 'resetBoard', 'openEditModal', 'selectEditColor', 'closeEditModal', 'savePieceChanges', 'deleteSelectedPiece'],
    'storage.js': ['saveTacticToStorage', 'loadSavedTacticsList', 'loadSavedTactic', 'deleteSavedTactic', 'shareTactic', 'closeShareModal', 'copyShareUrl', 'checkSharedUrl', 'clearActiveLoadedTactic'],
    'export.js': ['triggerVideoExport', 'stopVideoRecording'],
    'utils.js': ['getCanvasCoords']
}

def extract_functions(code):
    funcs = {}
    lines = code.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith('function ') or ' = function' in line:
            name = None
            if line.strip().startswith('function '):
                name = line.strip().split('(')[0].replace('function ', '').strip()
            
            start = i
            brace_count = 0
            started = False
            while i < len(lines):
                brace_count += lines[i].count('{')
                brace_count -= lines[i].count('}')
                if '{' in lines[i]:
                    started = True
                i += 1
                if started and brace_count == 0:
                    break
            
            if name:
                funcs[name] = '\n'.join(lines[start:i])
            continue
        i += 1
    return funcs

funcs = extract_functions(content)

# create state.js manually
state_code = """
const canvas = document.getElementById("tacticCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 625;
if (canvas) {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

let state = {
  pitchStyle: "full",
  framesMap: {
    root: {
      id: "root",
      name: "Início",
      elements: [],
      children: [],
      parentId: null,
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

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recordingDuration = 0;
let recordingTimer = null;
let editingPieceId = null;
"""
with open('js/state.js', 'w', encoding='utf-8') as f:
    f.write(state_code.strip())

# create other files
for file_name, func_names in mapping.items():
    with open(f'js/{file_name}', 'w', encoding='utf-8') as f:
        for fn in func_names:
            if fn in funcs:
                f.write(funcs[fn] + '\n\n')

# Create main.js with window.onload
main_code = """
window.onload = function () {
  drawField();
  setupInteractionListeners();
  loadSavedTacticsList();
  
  // Check for shared tactic in URL
  checkSharedUrl();
};
"""
with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(main_code.strip())

print("Split completed successfully without ES modules!")
