window.onload = function () {
  if (typeof window.checkSharedUrl === 'function' && !window.checkSharedUrl()) {
    let restored = false;
    if (typeof window.restoreAutoSave === 'function') {
      restored = window.restoreAutoSave();
    }
    if (!restored && typeof window.loadTacticalPreset === 'function') {
      window.loadTacticalPreset("bench");
    }
  }
  if (typeof window.updateTimelineUI === 'function') window.updateTimelineUI();
  if (typeof window.setupInteractionListeners === 'function') window.setupInteractionListeners();
  if (typeof window.drawLoop === 'function') requestAnimationFrame(window.drawLoop);
  if (typeof window.loadSavedTacticsList === 'function') window.loadSavedTacticsList();
  if (typeof window.saveStateToHistory === 'function') window.saveStateToHistory();
};