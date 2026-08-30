
try {
    window.canvas = document.getElementById('tacticCanvas');
    window.ctx = window.canvas ? window.canvas.getContext('2d') : null;

    window.CANVAS_WIDTH = 1000;
    window.CANVAS_HEIGHT = 625;
    if (window.canvas) {
      window.canvas.width = window.CANVAS_WIDTH;
      window.canvas.height = window.CANVAS_HEIGHT;
    }

    window.state = {
      currentModule: 'model',
      modules: {
        model: "Modelo de Jogo",
        exercises: "Exercícios"
      },
      pitchStyle: 'full',
      framesMap: {
        root: {
          id: 'root',
          name: 'Início',
          elements: [],
          children: [],
          parentId: null,
        },
      },
      activePath: ['root'],
      currentFrameIdx: 0,
      drawingMode: 'select',
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

    window.mediaRecorder = null;
    window.recordedChunks = [];
    window.isRecording = false;
    window.recordingDuration = 0;
    window.recordingTimer = null;

    window.editingPiece = null;
    window.editingPieceColor = '';

    window.FIELD_BG = '#1b4332';
    window.HOME_TEAM_COLOR = '#facc15';
    window.AWAY_TEAM_COLOR = '#3b82f6';
    
    // No 'var' declarations to avoid syntax errors if regex touches it later.
    // They are already properties of window, so window.varName will work everywhere.
    
    console.log('STATE.JS LOADED SUCCESSFULLY!');
} catch (e) {
    console.error('ERROR LOADING STATE.JS:', e);
}
