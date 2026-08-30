/**
 * Guarda a tática atual no LocalStorage do navegador.
 */
window.saveTacticToStorage = function() {
        const name =
          document.getElementById("tactic-name").value.trim() ||
          "Jogada sem nome";
        const categoryEl = document.getElementById("tactic-category");
        const category = categoryEl ? categoryEl.value : "geral";
        const dataToSave = {
          name: name,
          category: category,
          pitchStyle: window.state.pitchStyle,
          framesMap: window.state.framesMap,
          activePath: window.state.activePath,
          drawings: window.state.drawings,
        };
        // Migrate old tactics if they exist and we haven't migrated
        const legacyTactics = localStorage.getItem("tacticplay_tactics");
        if (legacyTactics) {
          localStorage.setItem("tacticplay_tactics_model", legacyTactics);
          localStorage.removeItem("tacticplay_tactics");
        }

        const existing = JSON.parse(
          localStorage.getItem("tacticplay_tactics_" + window.state.currentModule) || "[]",
        );
        if (
          window.state.loadedTacticIndex !== null &&
          window.state.loadedTacticIndex < existing.length
        ) {
          existing[window.state.loadedTacticIndex] = dataToSave;
        } else {
          existing.push(dataToSave);
          window.state.loadedTacticIndex = existing.length - 1;
          document
            .getElementById("editing-indicator")
            .classList.remove("hidden");
          document
            .getElementById("btn-clear-loaded-tactic")
            .classList.remove("hidden");
        }
        localStorage.setItem("tacticplay_tactics_" + window.state.currentModule, JSON.stringify(existing));
        document.getElementById("status-message").textContent =
          `Tática gravada!`;
        loadSavedTacticsList();
      }

/**
 * Carrega e atualiza a interface com a lista de táticas guardadas no LocalStorage.
 */
window.loadSavedTacticsList = function() {
        const listContainer = document.getElementById("saved-tactics-list");
        const legacyTactics = localStorage.getItem("tacticplay_tactics");
        if (legacyTactics) {
          localStorage.setItem("tacticplay_tactics_model", legacyTactics);
          localStorage.removeItem("tacticplay_tactics");
        }

        const saved = JSON.parse(
          localStorage.getItem("tacticplay_tactics_" + window.state.currentModule) || "[]",
        );
        if (saved.length === 0) {
          listContainer.innerHTML =
            '<p class="text-xs text-slate-500 text-center py-2">Nenhuma jogada gravada ainda.</p>';
          return;
        }
        listContainer.innerHTML = "";
        
        const categoryLabels = {
          "org_ofensiva": "Organização Ofensiva",
          "org_defensiva": "Organização Defensiva",
          "trans_ofensiva": "Transição Ofensiva",
          "trans_defensiva": "Transição Defensiva",
          "bolas_paradas": "Bolas Paradas",
          "geral": "Geral / Outro"
        };
        
        // Agrupar as táticas por categoria
        const grouped = {};
        saved.forEach((tactic, idx) => {
          const cat = tactic.category || "geral";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({ tactic, idx });
        });
        
        // Renderizar cada grupo que tenha jogadas
        Object.keys(categoryLabels).forEach(catKey => {
          if (grouped[catKey] && grouped[catKey].length > 0) {
            const header = document.createElement("div");
            header.className = "text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1 pl-1";
            header.textContent = categoryLabels[catKey];
            listContainer.appendChild(header);
            
            grouped[catKey].forEach(item => {
              const el = document.createElement("div");
              el.className =
                "flex items-center justify-between gap-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-2 transition-all text-xs";
              el.innerHTML = `<button onclick="loadSavedTactic(${item.idx})" class="flex-1 font-semibold text-left text-slate-300 hover:text-white truncate">${item.tactic.name}</button><button onclick="deleteSavedTactic(${item.idx})" class="text-rose-400 hover:text-rose-350 px-1.5 py-0.5"><i class="fa-solid fa-trash"></i></button>`;
              listContainer.appendChild(el);
            });
          }
        });
      }

/**
 * Carrega uma tática guardada para o canvas principal.
 * @param {number} idx - O índice da tática no LocalStorage.
 */
window.loadSavedTactic = function(idx) {
        const saved = JSON.parse(
          localStorage.getItem("tacticplay_tactics_" + window.state.currentModule) || "[]",
        );
        const tactic = saved[idx];
        if (tactic) {
          window.state.pitchStyle = tactic.pitchStyle || "full";
          window.state.drawings = tactic.drawings || [];

          // Legacy support for flat arrays
          if (Array.isArray(tactic.frames)) {
            window.state.framesMap = {};
            window.state.activePath = [];
            tactic.frames.forEach((f, i) => {
              const id = "frame_" + i;
              window.state.framesMap[id] = {
                id: id,
                name: "Quadro " + (i + 1),
                elements: f,
                children:
                  i < tactic.frames.length - 1 ? ["frame_" + (i + 1)] : [],
                parentId: i > 0 ? "frame_" + (i - 1) : null,
              };
              window.state.activePath.push(id);
            });
          } else {
            window.state.framesMap = tactic.framesMap;
            window.state.activePath = tactic.activePath;
          }

          window.state.currentFrameIdx = 0;
          window.state.loadedTacticIndex = idx;
          document.getElementById("pitch-style").value = window.state.pitchStyle;
          document.getElementById("tactic-name").value = tactic.name;
          
          const categoryEl = document.getElementById("tactic-category");
          if (categoryEl) categoryEl.value = tactic.category || "geral";
          
          document
            .getElementById("editing-indicator")
            .classList.remove("hidden");
          document
            .getElementById("btn-clear-loaded-tactic")
            .classList.remove("hidden");
          updateTimelineUI();
          document.getElementById("status-message").textContent =
            `Carregado: ${tactic.name}`;
        }
      }

/**
 * Apaga permanentemente uma tática guardada do LocalStorage.
 * @param {number} idx - O índice da tática.
 */
window.deleteSavedTactic = function(idx) {
        const saved = JSON.parse(
          localStorage.getItem("tacticplay_tactics_" + window.state.currentModule) || "[]",
        );
        saved.splice(idx, 1);
        localStorage.setItem("tacticplay_tactics_" + window.state.currentModule, JSON.stringify(saved));
        if (window.state.loadedTacticIndex === idx) clearActiveLoadedTactic();
        else if (window.state.loadedTacticIndex > idx) window.state.loadedTacticIndex--;
        loadSavedTacticsList();
      }

/**
 * Gera um URL de partilha contendo os dados comprimidos da tática atual.
 */
window.shareTactic = function() {
        // Simplified sharing serialization for tree
        const compactState = {
          p: window.state.pitchStyle,
          d: window.state.drawings,
          fM: window.state.framesMap,
          aP: window.state.activePath,
          m: window.state.currentModule,
        };
        try {
          const b64 = btoa(encodeURIComponent(JSON.stringify(compactState)));
          document.getElementById("share-url").value =
            window.location.origin + window.location.pathname + "#t=" + b64;
          document.getElementById("share-modal").classList.remove("hidden");
          setTimeout(
            () =>
              document
                .getElementById("share-modal")
                .firstElementChild.classList.add("scale-100"),
            50,
          );
        } catch (e) {
          document.getElementById("status-message").textContent =
            "Erro ao partilhar.";
        }
      }

/**
 * Fecha a janela (modal) de partilha da tática.
 */
window.closeShareModal = function() {
        document
          .getElementById("share-modal")
          .firstElementChild.classList.add("scale-100");
        setTimeout(() => {
          document.getElementById("share-modal").classList.add("hidden");
          document.getElementById("copy-feedback").classList.add("hidden");
        }, 150);
      }

/**
 * Copia o URL de partilha gerado para a área de transferência do utilizador.
 */
window.copyShareUrl = function() {
        const input = document.getElementById("share-url");
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value).then(() => {
          document.getElementById("copy-feedback").classList.remove("hidden");
        });
      }

/**
 * Verifica se existe uma tática partilhada no URL atual e, se sim, carrega-a.
 */
window.checkSharedUrl = function() {
        const hash = window.location.hash;
        if (hash.startsWith("#t=")) {
          try {
            const json = decodeURIComponent(atob(hash.replace("#t=", "")));
            const compactState = JSON.parse(json);
            
            if (compactState.m && compactState.m !== window.state.currentModule) {
              if (typeof window.switchModule === 'function') {
                window.switchModule(compactState.m);
              } else {
                window.state.currentModule = compactState.m;
              }
            }

            window.state.pitchStyle = compactState.p;
            document.getElementById("pitch-style").value = compactState.p;
            window.state.drawings = compactState.d || [];
            window.state.framesMap = compactState.fM;
            window.state.activePath = compactState.aP;
            window.state.currentFrameIdx = 0;
            return true;
          } catch (e) {
            // Try legacy format
            if (hash.startsWith("#tactic=")) {
              // Omitted for brevity, but let's assume it handles new #t format now
            }
          }
        }
        return false;
      }

/**
 * Limpa o estado da tática atualmente carregada, permitindo iniciar uma nova de rascunho.
 */
window.clearActiveLoadedTactic = function() {
        window.state.loadedTacticIndex = null;
        document.getElementById("tactic-name").value = "";
        document.getElementById("editing-indicator").classList.add("hidden");
        document
          .getElementById("btn-clear-loaded-tactic")
          .classList.add("hidden");
      }

/**
 * Guarda o estado atual temporariamente no autosave.
 */
window.autoSaveWorkspace = function() {
        const categoryEl = document.getElementById("tactic-category");
        const dataToSave = {
          name: document.getElementById("tactic-name").value,
          category: categoryEl ? categoryEl.value : "geral",
          pitchStyle: window.state.pitchStyle,
          framesMap: window.state.framesMap,
          activePath: window.state.activePath,
          drawings: window.state.drawings,
          loadedTacticIndex: window.state.loadedTacticIndex
        };
        localStorage.setItem("tacticplay_autosave_" + window.state.currentModule, JSON.stringify(dataToSave));
      }

/**
 * Restaura o estado atual a partir do autosave (quando a página recarrega).
 */
window.restoreAutoSave = function() {
        try {
          // Migrate old autosave if exists
          const legacyAutoSave = localStorage.getItem("tacticplay_autosave");
          if (legacyAutoSave) {
            localStorage.setItem("tacticplay_autosave_model", legacyAutoSave);
            localStorage.removeItem("tacticplay_autosave");
          }

          const saved = localStorage.getItem("tacticplay_autosave_" + window.state.currentModule);
          if (saved) {
            const data = JSON.parse(saved);
            window.state.pitchStyle = data.pitchStyle || "default";
            const pitchStyleEl = document.getElementById("pitch-style");
            if (pitchStyleEl) pitchStyleEl.value = window.state.pitchStyle;
            window.state.framesMap = data.framesMap;
            window.state.activePath = data.activePath;
            window.state.drawings = data.drawings || [];
            window.state.loadedTacticIndex = data.loadedTacticIndex !== undefined ? data.loadedTacticIndex : null;
            
            const tacticNameEl = document.getElementById("tactic-name");
            if (tacticNameEl) tacticNameEl.value = data.name || "";
            const categoryEl = document.getElementById("tactic-category");
            if (categoryEl) categoryEl.value = data.category || "geral";
            
            if (window.state.loadedTacticIndex !== null) {
              const editingIndicator = document.getElementById("editing-indicator");
              const btnClearLoaded = document.getElementById("btn-clear-loaded-tactic");
              if (editingIndicator) editingIndicator.classList.remove("hidden");
              if (btnClearLoaded) btnClearLoaded.classList.remove("hidden");
            }
            return true;
          }
        } catch(e) {}
        return false;
      }
