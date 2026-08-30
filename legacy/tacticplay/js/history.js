/**
 * Guarda o estado atual da tática no histórico para permitir ações de Undo.
 */
window.saveStateToHistory = function() {
        if (window.state.historyIndex < window.state.history.length - 1) {
          window.state.history = window.state.history.slice(0, window.state.historyIndex + 1);
        }
        const snapshot = {
          framesMap: JSON.parse(JSON.stringify(window.state.framesMap)),
          activePath: JSON.parse(JSON.stringify(window.state.activePath)),
          drawings: JSON.parse(JSON.stringify(window.state.drawings || [])),
        };
        window.state.history.push(snapshot);
        window.state.historyIndex++;
        updateUndoRedoUI();
        if (typeof window.autoSaveWorkspace === 'function') {
          window.autoSaveWorkspace();
        }
      }

/**
 * Reverte a prancheta para o estado anterior guardado no histórico.
 */
window.undo = function() {
        if (window.state.historyIndex > 0) {
          window.state.historyIndex--;
          restoreSnapshot(window.state.history[window.state.historyIndex]);
        }
      }

/**
 * Refaz a última alteração revertida pelo Undo.
 */
window.redo = function() {
        if (window.state.historyIndex < window.state.history.length - 1) {
          window.state.historyIndex++;
          restoreSnapshot(window.state.history[window.state.historyIndex]);
        }
      }

/**
 * Restaura a aplicação inteira com base num estado (snapshot) específico do histórico.
 * @param {Object} snapshot - O estado a ser restaurado.
 */
window.restoreSnapshot = function(snapshot) {
        window.state.framesMap = JSON.parse(JSON.stringify(snapshot.framesMap));
        window.state.activePath = JSON.parse(JSON.stringify(snapshot.activePath));
        window.state.drawings = snapshot.drawings ? JSON.parse(JSON.stringify(snapshot.drawings)) : [];
        window.state.currentFrameIdx = Math.min(
          window.state.currentFrameIdx,
          window.state.activePath.length - 1,
        );
        updateTimelineUI();
        updateUndoRedoUI();
      }

