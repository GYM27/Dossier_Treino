/**
 * Atualiza o estado visual (ativo/inativo) dos botões de Undo e Redo.
 */
window.updateUndoRedoUI = function() {
        const btnUndo = document.getElementById("btn-undo");
        const btnRedo = document.getElementById("btn-redo");
        if (btnUndo) {
          btnUndo.disabled = window.state.historyIndex <= 0;
          btnUndo.style.opacity = window.state.historyIndex <= 0 ? 0.3 : 1;
        }
        if (btnRedo) {
          btnRedo.disabled = window.state.historyIndex >= window.state.history.length - 1;
          btnRedo.style.opacity =
            window.state.historyIndex >= window.state.history.length - 1 ? 0.3 : 1;
        }
      }

/**
 * Alterna entre o modo de Edição (criar tática) e o modo de Animação/Visualização.
 */
window.toggleEditMode = function() {
        window.state.isEditMode = !window.state.isEditMode;
        document.getElementById("btn-toggle-edit").innerHTML = window.state.isEditMode
          ? '<i class="fa-solid fa-lock-open text-emerald-400"></i> Modo Edição'
          : '<i class="fa-solid fa-lock text-rose-400"></i> Modo Ver';
        document.getElementById("btn-toggle-edit").className = window.state.isEditMode
          ? "bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-3.5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2"
          : "bg-rose-950/30 border border-rose-800/50 hover:bg-rose-900/50 text-rose-300 px-3.5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2";
        document.getElementById("status-message").textContent = window.state.isEditMode
          ? "Modo Edição Ativado"
          : "Modo Visualização (Bloqueado)";
        document.getElementById("drawing-tools-container").style.display =
          window.state.isEditMode ? "flex" : "none";
      }

/**
 * Define a ferramenta atual do cursor (selecionar, desenhar linha plana, tracejada, etc.).
 * @param {string} mode - O modo da ferramenta (ex: "select", "line").
 */
window.setDrawingMode = function(mode) {
        window.state.drawingMode = mode;
        document.getElementById("btn-draw-select").className =
          "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";
        document.getElementById("btn-draw-run").className =
          "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";
        document.getElementById("btn-draw-pass").className =
          "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";

        if (mode === "select") {
          document.getElementById("btn-draw-select").className =
            "bg-emerald-600 border border-emerald-500 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-white font-semibold active:scale-95 shadow-md";
          document.getElementById("status-message").textContent =
            "Modo Edição • Clica e arrasta as peças";
        } else if (mode === "run") {
          document.getElementById("btn-draw-run").className =
            "bg-yellow-500/20 border border-yellow-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-yellow-400 font-semibold active:scale-95 shadow-md";
          document.getElementById("status-message").textContent =
            "Modo Corrida • Clica e arrasta no relvado para traçar corridas";
        } else if (mode === "pass") {
          document.getElementById("btn-draw-pass").className =
            "bg-sky-500/20 border border-sky-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-sky-400 font-semibold active:scale-95 shadow-md";
          document.getElementById("status-message").textContent =
            "Modo Passe • Clica e arrasta no relvado para desenhar trajetórias";
        }
      }

/**
 * Limpa todos os desenhos livres e marcações desenhadas no window.canvas.
 */
window.clearDrawings = function() {
        window.state.drawings = [];
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Linhas táticas eliminadas.";
      }

/**
 * Altera a visualização gráfica do campo (completo, meio campo ofensivo, etc.).
 */
window.changePitchStyle = function() {
        window.state.pitchStyle = document.getElementById("pitch-style").value;
      }

/**
 * Exibe a janela sobreposta quando a animação atinge um ponto de decisão (ramificação tática).
 */
window.showInteractiveOverlay = function(node) {
        const overlay = document.getElementById("interactive-overlay");
        const optionsContainer = document.getElementById("interactive-options");
        optionsContainer.innerHTML = "";

        node.children.forEach((childId) => {
          const childNode = window.state.framesMap[childId];
          const btn = document.createElement("button");
          btn.className =
            "bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-2";
          btn.innerHTML = `<i class="fa-solid fa-play text-emerald-400"></i> ${childNode.name || "Alternativa"}`;
          btn.onclick = () => {
            window.state.activePath = getFullPath(childId);
            hideInteractiveOverlay();
            window.state.isPlaying = true;
            window.state.playbackStartTime = performance.now();
            document.getElementById("btn-play").innerHTML =
              '<i class="fa-solid fa-pause text-lg"></i>';
            updateTimelineUI();
          };
          optionsContainer.appendChild(btn);
        });

        overlay.classList.remove("hidden");
        setTimeout(() => {
          document
            .getElementById("interactive-modal")
            .classList.remove("scale-95");
          document
            .getElementById("interactive-modal")
            .classList.add("scale-100");
        }, 50);
      }

/**
 * Oculta a janela de decisão interativa.
 */
window.hideInteractiveOverlay = function() {
        const overlay = document.getElementById("interactive-overlay");
        document
          .getElementById("interactive-modal")
          .classList.remove("scale-100");
        document.getElementById("interactive-modal").classList.add("scale-95");
        setTimeout(() => overlay.classList.add("hidden"), 300);
      }

/**
 * Permite alterar o nome do frame (jogada) atual através de um input na interface.
 */
window.renameFrame = function(frameId) {
        const node = window.state.framesMap[frameId];
        if (!node) return;
        const newName = prompt("Novo nome para o quadro:", node.name || "");
        if (newName && newName.trim() !== "") {
          node.name = newName.trim();
          updateTimelineUI();
          saveStateToHistory();
        }
      }

/**
 * Reconstrói a interface da linha do tempo (timeline) na zona inferior da app,
 * refletindo a árvore de jogadas e nós ativos.
 */
window.updateTimelineUI = function() {
        const track = document.getElementById("timeline-track");
        track.innerHTML = "";

        window.state.activePath.forEach((frameId, idx) => {
          const node = window.state.framesMap[frameId];
          const btn = document.createElement("div");
          btn.className = `flex-shrink-0 w-32 h-16 rounded-xl border relative transition-all text-xs font-semibold flex flex-col justify-between p-2 text-left ${idx === window.state.currentFrameIdx ? "bg-emerald-600/20 border-emerald-500 text-white shadow-md" : "bg-slate-950 border-slate-800 text-slate-400"}`;

          const hasBranches = node.children.length > 1;

          btn.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="truncate pr-1 cursor-pointer hover:text-emerald-400" onclick="selectFrame(${idx})" title="Selecionar Quadro">${node.name || "Quadro " + (idx + 1)}</span>
                        <div class="flex items-center gap-1">
                            <button onclick="renameFrame('${frameId}')" class="text-slate-500 hover:text-white" title="Renomear Quadro"><i class="fa-solid fa-pen text-[10px]"></i></button>
                            ${idx === window.state.currentFrameIdx ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400"></span>' : ""}
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-auto">
                        <span class="text-[10px] text-slate-500">${node.elements.length} peças</span>
                        ${hasBranches ? `<button onclick="switchBranch('${frameId}', ${idx})" class="text-sky-400 hover:text-white px-1"><i class="fa-solid fa-code-branch"></i></button>` : ""}
                    </div>
                `;
          track.appendChild(btn);
        });

        document.getElementById("frame-indicator").textContent =
          `Quadro ${window.state.currentFrameIdx + 1} / ${window.state.activePath.length}`;
          
        const notesArea = document.getElementById("frame-notes");
        if (notesArea && window.state.activePath.length > 0) {
          const currentFrameId = window.state.activePath[window.state.currentFrameIdx];
          const currentNode = window.state.framesMap[currentFrameId];
          notesArea.value = currentNode?.notes || "";
        }
      }

/**
 * Muda o caminho ativo da jogada para seguir por uma ramificação alternativa da árvore.
 * @param {string} nodeId - O nó para o qual mudar.
 */
window.switchBranch = function(frameId, idx) {
        const node = window.state.framesMap[frameId];
        const children = node.children.map((id) => window.state.framesMap[id]);
        const choice = prompt(
          `Escolha a ramificação:\n${children.map((c, i) => i + 1 + " - " + (c.name || "Alternativa")).join("\n")}\nDigite o número:`,
        );
        const opt = parseInt(choice) - 1;
        if (opt >= 0 && opt < children.length) {
          window.state.activePath = getFullPath(children[opt].id);
          window.state.currentFrameIdx = idx + 1;
          updateTimelineUI();
        }
      }

/**
 * Adiciona um novo frame sequencial na mesma linha tática (avança a jogada).
 */
window.addAnimationFrame = function() {
        const currentId = getActiveFrameId();
        const currentNode = window.state.framesMap[currentId];
        const currentElements = JSON.parse(
          JSON.stringify(currentNode.elements),
        );

        const newId = "frame_" + Date.now();
        window.state.framesMap[newId] = {
          id: newId,
          name: "Quadro " + (window.state.activePath.length + 1),
          elements: currentElements,
          children: [],
          parentId: currentId,
        };

        currentNode.children.push(newId);

        // Adjust active path - delete anything after current index and push new
        window.state.activePath = window.state.activePath.slice(0, window.state.currentFrameIdx + 1);
        window.state.activePath.push(newId);
        window.state.currentFrameIdx++;

        updateTimelineUI();
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          `Quadro inserido!`;
      }

/**
 * Adiciona uma alternativa (ramificação) a partir do frame atual.
 */
window.addAlternativeFrame = function() {
        const currentId = getActiveFrameId();
        const currentNode = window.state.framesMap[currentId];

        const altName = prompt(
          "Nome desta alternativa (ex: 'Passe Rutura', 'Defesa Baixa'):",
          "Nova Opção",
        );
        if (!altName) return;

        const currentElements = JSON.parse(
          JSON.stringify(currentNode.elements),
        );
        const newId = "frame_alt_" + Date.now();

        window.state.framesMap[newId] = {
          id: newId,
          name: altName,
          elements: currentElements,
          children: [],
          parentId: currentId,
        };

        currentNode.children.push(newId);

        // Switch path to this new alternative
        window.state.activePath = window.state.activePath.slice(0, window.state.currentFrameIdx + 1);
        window.state.activePath.push(newId);
        window.state.currentFrameIdx++;

        updateTimelineUI();
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          `Alternativa "${altName}" criada com sucesso!`;
      }

/**
 * Apaga o frame atual e todos os seus descendentes, recuando para o frame pai.
 */
window.deleteCurrentFrame = function() {
        const currentId = getActiveFrameId();
        const currentNode = window.state.framesMap[currentId];
        if (currentNode.parentId === null) return; // Cannot delete root

        const parent = window.state.framesMap[currentNode.parentId];
        parent.children = parent.children.filter((id) => id !== currentId);

        // Rebuild active path to parent
        window.state.activePath = buildActivePath(currentNode.parentId);
        window.state.currentFrameIdx = window.state.activePath.length - 1;

        // Note: garbage collection for disconnected branches isn't strictly necessary for this prototype
        updateTimelineUI();
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Quadro removido.";
      }

/**
 * Seleciona e carrega diretamente um frame através do seu índice na linha do tempo atual.
 * @param {number} idx - O índice do frame a carregar.
 */
window.selectFrame = function(idx) {
        window.state.currentFrameIdx = idx;
        updateTimelineUI();
      }

/**
 * Recua para a jogada/frame anterior.
 */
window.prevFrame = function() {
        window.state.currentFrameIdx = Math.max(0, window.state.currentFrameIdx - 1);
        updateTimelineUI();
      }

/**
 * Avança para a próxima jogada/frame, ou exibe as opções caso existam alternativas.
 */
window.nextFrame = function() {
        if (window.state.currentFrameIdx < window.state.activePath.length - 1) {
          window.state.currentFrameIdx++;
        } else {
          const node = getActiveNode();
          if (node.children.length > 0) {
            // Pick the first child automatically if traversing
            window.state.activePath.push(node.children[0]);
            window.state.currentFrameIdx++;
          }
        }
        updateTimelineUI();
      }

/**
 * Alterna o estado de reprodução automática da animação tática (Play/Pause).
 */
window.togglePlayback = function() {
        if (window.state.isPlaying) {
          window.state.isPlaying = false;
          document.getElementById("btn-play").innerHTML =
            '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
          document.getElementById("status-message").textContent =
            "Animação Pausada";
        } else {
          if (
            window.state.currentFrameIdx >= window.state.activePath.length - 1 &&
            getActiveNode().children.length === 0
          ) {
            // Just rewind to start of current path
            window.state.currentFrameIdx = 0;
          }

          const currentNode = getActiveNode();
          if (currentNode.children.length > 1) {
            showInteractiveOverlay(currentNode);
            return;
          }

          window.state.playbackStartTime = performance.now();
          window.state.isPlaying = true;
          document.getElementById("btn-play").innerHTML =
            '<i class="fa-solid fa-pause text-lg"></i>';
          document.getElementById("status-message").textContent =
            "A reproduzir tática...";
        }
        updateTimelineUI();
      }

/**
 * Atualiza a velocidade de transição das animações com base no controlo da interface.
 * @param {number} value - O novo valor da velocidade em ms.
 */
window.updateTransitionSpeed = function() {
        window.state.transitionSpeed =
          document.getElementById("speed-slider").value * 1000;
        document.getElementById("speed-val").textContent =
          document.getElementById("speed-slider").value + "s";
      }

/**
 * Limpa completamente a prancheta tática e apaga o histórico não guardado.
 */
window.resetBoard = function() {
        window.state.framesMap = {
          root: {
            id: 'root',
            name: 'Início',
            elements: [],
            children: [],
            parentId: null,
          },
        };
        window.state.activePath = ['root'];
        window.state.currentFrameIdx = 0;
        window.state.drawings = [];
        
        if (typeof window.updateTimelineUI === 'function') window.updateTimelineUI();
        document.getElementById("status-message").textContent = "Campo totalmente limpo.";
      }

/**
 * Abre a janela (modal) de edição das propriedades de uma peça do campo.
 * @param {Object} element - O elemento tático a editar.
 */
window.openEditModal = function(piece) {
        window.editingPiece = piece;
        const modal = document.getElementById("edit-piece-modal");
        if (piece.type === "home" || piece.type === "away") {
          document.getElementById("edit-number-group").style.display = "block";
          document.getElementById("edit-color-group").style.display = "block";
          document.getElementById("edit-player-number").value = piece.number;
          selectEditColor(piece.color);
        } else {
          document.getElementById("edit-number-group").style.display = "none";
          document.getElementById("edit-color-group").style.display = "none";
        }
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.firstElementChild.classList.remove("scale-95");
          modal.firstElementChild.classList.add("scale-100");
        }, 50);
      }

/**
 * Seleciona uma cor no modal de edição de peça.
 * @param {HTMLElement} btn - O botão de cor clicado.
 * @param {string} color - A cor hexadecimal.
 */
window.selectEditColor = function(color) {
        window.editingPieceColor = color;
        document
          .querySelectorAll("#edit-color-group button")
          .forEach((btn) => btn.classList.remove("color-selected"));
        if (color === "#facc15")
          document
            .getElementById("color-btn-yellow")
            .classList.add("color-selected");
        else if (color === "#3b82f6")
          document
            .getElementById("color-btn-blue")
            .classList.add("color-selected");
        else if (color === "#ec4899")
          document
            .getElementById("color-btn-pink")
            .classList.add("color-selected");
        else if (color === "#f59e0b")
          document
            .getElementById("color-btn-orange")
            .classList.add("color-selected");
        else if (color === "#ef4444")
          document
            .getElementById("color-btn-red")
            .classList.add("color-selected");
        else if (color === "#ffffff")
          document
            .getElementById("color-btn-white")
            .classList.add("color-selected");
      }

/**
 * Fecha a janela (modal) de edição de peça e descarta alterações não salvas.
 */
window.closeEditModal = function() {
        const modal = document.getElementById("edit-piece-modal");
        modal.firstElementChild.classList.remove("scale-100");
        modal.firstElementChild.classList.add("scale-95");
        setTimeout(() => {
          modal.classList.add("hidden");
          window.editingPiece = null;
        }, 150);
      }

/**
 * Guarda as alterações (número, cor, label) aplicadas à peça no modal de edição.
 */
window.savePieceChanges = function() {
        if (!window.editingPiece) return;
        if (window.editingPiece.type === "home" || window.editingPiece.type === "away") {
          const newNum = Math.max(
            1,
            Math.min(
              99,
              parseInt(document.getElementById("edit-player-number").value) ||
                1,
            ),
          );
          const validatedColor = window.editingPieceColor;

          // Update across all frames
          Object.values(window.state.framesMap).forEach((node) => {
            const el = node.elements.find((e) => e.id === window.editingPiece.id);
            if (el) {
              el.number = newNum;
              el.color = validatedColor;
            }
          });
        }
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Peça editada com sucesso!";
        closeEditModal();
      }

/**
 * Apaga definitivamente a peça selecionada no modal do campo tático.
 */
window.deleteSelectedPiece = function() {
        if (!window.editingPiece) return;
        Object.values(window.state.framesMap).forEach((node) => {
          const idx = node.elements.findIndex((e) => e.id === window.editingPiece.id);
          if (idx !== -1) node.elements.splice(idx, 1);
        });
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Peça eliminada do campo.";
        updateTimelineUI();
        closeEditModal();
      }

window.switchModule = function(moduleName) {
    if (window.isRecording) return; // Proteção de exportação
    if (window.state.currentModule === moduleName) return;

    // 1. Gravar auto-save do módulo atual ANTES de mudar
    if (typeof window.autoSaveWorkspace === 'function') {
      window.autoSaveWorkspace(); 
    }

    // 2. Mudar a variável de estado
    window.state.currentModule = moduleName;

    // 3. Limpar estados transitórios de UI
    window.state.selectedElement = null;
    window.state.activeDrawingIndex = -1;
    window.state.selectedDrawingIndex = -1;
    window.state.loadedTacticIndex = null;
    window.state.history = [];
    window.state.historyIndex = -1;
    if (typeof window.setDrawingMode === 'function') {
      window.setDrawingMode('select');
    }

    // 4. Carregar auto-save do novo módulo ou prancheta limpa
    if (typeof window.restoreAutoSave === 'function') {
      if (!window.restoreAutoSave()) {
          if (typeof window.resetBoard === 'function') window.resetBoard(); 
      }
    } else if (typeof window.resetBoard === 'function') {
      window.resetBoard();
    }

    // 5. Atualizar a Interface
    if (typeof window.updateTimelineUI === 'function') window.updateTimelineUI();
    if (typeof window.updateUndoRedoUI === 'function') window.updateUndoRedoUI();
    if (typeof window.loadSavedTacticsList === 'function') window.loadSavedTacticsList();
    
    // Atualizar UI dos Tabs no index.html
    window.updateTabsUI(moduleName); 
};

window.updateTabsUI = function(moduleName) {
  const modelTab = document.getElementById("tab-model");
  const exercisesTab = document.getElementById("tab-exercises");

  if (!modelTab || !exercisesTab) return;

  const activeClasses = ["bg-emerald-600/20", "text-emerald-400", "shadow-sm", "font-bold"];
  const inactiveClasses = ["text-slate-400", "hover:text-slate-200", "hover:bg-slate-700/50", "font-semibold"];

  if (moduleName === "model") {
    modelTab.classList.remove(...inactiveClasses);
    modelTab.classList.add(...activeClasses);
    
    exercisesTab.classList.remove(...activeClasses);
    exercisesTab.classList.add(...inactiveClasses);
  } else {
    exercisesTab.classList.remove(...inactiveClasses);
    exercisesTab.classList.add(...activeClasses);
    
    modelTab.classList.remove(...activeClasses);
    modelTab.classList.add(...inactiveClasses);
  }
};
