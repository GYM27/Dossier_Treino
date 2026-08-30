/**
 * Propaga o movimento de um elemento tático para os frames seguintes na árvore de jogadas.
 * @param {string} nodeId - O ID do nó (frame) atual.
 * @param {string} elementId - O ID do elemento a mover.
 * @param {number} dx - A diferença de movimento no eixo X.
 * @param {number} dy - A diferença de movimento no eixo Y.
 */
window.propagateMovement = function(nodeId, elementId, dx, dy) {
        const node = window.state.framesMap[nodeId];
        if (!node) return;
        node.children.forEach((childId) => {
          const childNode = window.state.framesMap[childId];
          const el = childNode.elements.find((e) => e.id === elementId);
          if (el) {
            el.x += dx;
            el.y += dy;
          }
          propagateMovement(childId, elementId, dx, dy);
        });
      }

/**
 * Adiciona um novo jogador ao campo.
 * @param {string} team - A equipa do jogador ("home" ou "away").
 */
window.addPlayer = function(team) {
        const id =
          team === "home"
            ? "H" + (Date.now() % 1000)
            : "A" + (Date.now() % 1000);
        const currentElements = getActiveElements();
        const existingNumbers = currentElements
          .filter((el) => el.type === team)
          .map((el) => el.number);
        let num = 1;
        while (existingNumbers.includes(num)) num++;

        const color = team === "home" ? window.HOME_TEAM_COLOR : window.AWAY_TEAM_COLOR;
        currentElements.push({
          id: id,
          type: team,
          number: num,
          x: window.CANVAS_WIDTH / 2,
          y: window.CANVAS_HEIGHT / 2,
          color: color,
        });
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          `Adicionado jogador número ${num} ao centro do campo.`;
      }

/**
 * Adiciona uma bola ao campo.
 */
window.addBall = function() {
        const currentElements = getActiveElements();
        if (currentElements.some((el) => el.type === "ball")) {
          document.getElementById("status-message").textContent =
            "Já tens uma bola em jogo!";
          return;
        }
        currentElements.push({
          id: "B" + Date.now(),
          type: "ball",
          x: window.CANVAS_WIDTH / 2,
          y: window.CANVAS_HEIGHT / 2,
        });
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Bola de futebol adicionada ao centro.";
      }

/**
 * Adiciona um cone de treino ao campo.
 */
window.addCone = function() {
        getActiveElements().push({
          id: "C" + Date.now(),
          type: "cone",
          x: window.CANVAS_WIDTH / 2,
          y: window.CANVAS_HEIGHT / 2,
        });
        saveStateToHistory();
        document.getElementById("status-message").textContent =
          "Obstáculo de treino adicionado.";
      }

/**
 * Carrega uma predefinição tática (ex: 4-3-3, 4-4-2) no campo atual.
 * @param {string} preset - O identificador da tática.
 */
window.loadTacticalPreset = function(preset) {
        const newElements = [];
        
        if (preset === 'bench') {
            const spacing = window.CANVAS_HEIGHT / 12;
            for (let i = 1; i <= 11; i++) {
                newElements.push({ id: 'H' + i, type: 'home', number: i, x: 30, y: spacing * i, color: i === 1 ? '#f59e0b' : window.HOME_TEAM_COLOR });
                newElements.push({ id: 'A' + i, type: 'away', number: i, x: window.CANVAS_WIDTH - 30, y: spacing * i, color: i === 1 ? '#ec4899' : window.AWAY_TEAM_COLOR });
            }
        }

        newElements.push({
          id: 'B1',
          type: 'ball',
          x: window.CANVAS_WIDTH / 2,
          y: window.CANVAS_HEIGHT / 2,
        });

        window.state.framesMap = {
          root: {
            id: 'root',
            name: 'Início',
            elements: newElements,
            children: [],
            parentId: null,
          },
        };
        window.state.activePath = ['root'];
        window.state.currentFrameIdx = 0;
        window.state.drawings = [];

        document.getElementById('status-message').textContent = preset === 'bench' ? 'Quadro Tático iniciado vazio. Arrasta os jogadores para o campo.' : 'Quadro Tático reposto para o modelo padrão 1-4-2-3-1.';
        if (typeof window.updateTimelineUI === 'function') window.updateTimelineUI();
      }

/**
 * Obtém o ID do frame (nó) ativo na linha do tempo tática.
 * @returns {string} O ID do frame atual.
 */
window.getActiveFrameId = function() {
        return window.state.activePath[window.state.currentFrameIdx];
      }

/**
 * Obtém a lista de elementos táticos (jogadores, bolas, cones) do frame ativo.
 * @returns {Array} Array de elementos.
 */
window.getActiveElements = function() {
        const id = getActiveFrameId();
        return window.state.framesMap[id]?.elements || [];
      }

/**
 * Retorna o objeto do nó (frame) atualmente ativo com base no estado.
 * @returns {Object} O nó da árvore de táticas.
 */
window.getActiveNode = function() {
        const id = getActiveFrameId();
        return window.state.framesMap[id];
      }

/**
 * Constrói o caminho completo da raiz até a um nó específico.
 * @param {string} startNodeId - O ID do nó final do caminho.
 * @returns {Array<string>} Um array de IDs representando o caminho.
 */
window.getFullPath = function(startNodeId) {
        let path = buildActivePath(startNodeId);
        let curr = window.state.framesMap[startNodeId];
        while (curr && curr.children.length > 0) {
          let nextId = curr.children[0];
          path.push(nextId);
          curr = window.state.framesMap[nextId];
        }
        return path;
      }

/**
 * Reconstrói o caminho ativo da linha do tempo com base no nó final.
 * @param {string} endNodeId - O nó onde o caminho atual termina.
 */
window.buildActivePath = function(endNodeId) {
        let path = [];
        let curr = endNodeId;
        while (curr) {
          path.unshift(curr);
          curr = window.state.framesMap[curr]?.parentId;
        }
        return path;
      }

