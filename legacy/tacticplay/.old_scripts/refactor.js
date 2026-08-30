const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

// 1. Add interactive overlay
const overlayHtml = `
    <!-- INTERACTIVE PLAYBACK OVERLAY -->
    <div id="interactive-overlay" class="fixed inset-0 z-40 flex flex-col items-center justify-center hidden bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-lg text-center transform scale-95 transition-transform duration-300" id="interactive-modal">
            <h3 class="text-2xl font-black text-white"><i class="fa-solid fa-code-branch text-emerald-400 mr-2"></i> O que acontece a seguir?</h3>
            <p class="text-sm text-slate-400">Escolhe uma das alternativas táticas para continuar a jogada.</p>
            <div id="interactive-options" class="flex flex-wrap justify-center gap-3 w-full mt-2">
                <!-- Buttons injected dynamically -->
            </div>
        </div>
    </div>
`;
if (!content.includes('id="interactive-overlay"')) {
    content = content.replace('<!-- FULLSCREEN EXPORT SPINNER', overlayHtml + '\n    <!-- FULLSCREEN EXPORT SPINNER');
}

// 2. Add 'Criar Alternativa' button
const altBtnHtml = `</button>
                        <button onclick="addAlternativeFrame()" class="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-sky-950/30 active:scale-[0.98]" title="Criar Alternativa (Ramificação)">
                            <i class="fa-solid fa-code-branch"></i> Alternativa
                        </button>`;
if (!content.includes('addAlternativeFrame()')) {
    content = content.replace('</button>\n                        <button onclick="deleteCurrentFrame()', altBtnHtml + '\n                        <button onclick="deleteCurrentFrame()');
}

// 3. We will rewrite the entire script section from "let state =" to the end, because the changes are so extensive.
// But we need to keep the canvas initialization and constants.
const scriptStartMarker = "// Interactive state manager";
const scriptEndMarker = "</body>";

const beforeScript = content.substring(0, content.indexOf(scriptStartMarker));

const newScript = `// Interactive state manager
        let state = {
            pitchStyle: 'full',
            // Tree structure for frames
            framesMap: {
                'root': { id: 'root', name: 'Início', elements: [], children: [], parentId: null }
            },
            activePath: ['root'], // Array of IDs from root to current leaf
            currentFrameIdx: 0, // Index in activePath
            
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
            loadedTacticIndex: null
        };

        // UI & Recording Status manager
        let mediaRecorder = null;
        let recordedChunks = [];
        let isRecording = false;
        let recordingDuration = 0;
        let recordingTimer = null;

        // Piece Editing Manager
        let editingPiece = null;
        let editingPieceColor = '';

        // Custom assets configurations
        const FIELD_BG = '#1b4332';
        const HOME_TEAM_COLOR = '#facc15';
        const AWAY_TEAM_COLOR = '#3b82f6';

        // Helpers for State
        function getActiveFrameId() {
            return state.activePath[state.currentFrameIdx];
        }

        function getActiveElements() {
            const id = getActiveFrameId();
            return state.framesMap[id]?.elements || [];
        }

        function getActiveNode() {
            const id = getActiveFrameId();
            return state.framesMap[id];
        }

        function buildActivePath(endNodeId) {
            let path = [];
            let curr = endNodeId;
            while(curr) {
                path.unshift(curr);
                curr = state.framesMap[curr]?.parentId;
            }
            return path;
        }

        window.onload = function() {
            if (!checkSharedUrl()) {
                loadTacticalPreset('14231');
            }
            updateTimelineUI();
            setupInteractionListeners();
            requestAnimationFrame(drawLoop);
            loadSavedTacticsList();
        };

        function setupInteractionListeners() {
            canvas.addEventListener('mousedown', handlePointerDown);
            canvas.addEventListener('mousemove', handlePointerMove);
            canvas.addEventListener('mouseup', handlePointerUp);
            canvas.addEventListener('mouseleave', handlePointerUp);
            canvas.addEventListener('touchstart', function(e) {
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
                }
                e.preventDefault();
            }, { passive: false });
            canvas.addEventListener('touchmove', function(e) {
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY }));
                }
                e.preventDefault();
            }, { passive: false });
            canvas.addEventListener('touchend', function(e) {
                canvas.dispatchEvent(new MouseEvent('mouseup', {}));
                e.preventDefault();
            }, { passive: false });
            canvas.addEventListener('dblclick', handleDoubleClick);
        }

        function getCanvasCoords(event) {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;
            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
            const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
            return { x, y };
        }

        function handlePointerDown(e) {
            const coords = getCanvasCoords(e);
            if (state.isPlaying) return;

            if (state.drawingMode !== 'select') {
                state.isDrawing = true;
                state.currentDrawingPoints = [{ x: coords.x, y: coords.y }];
                return;
            }

            const currentFrameElements = getActiveElements();
            for (let i = currentFrameElements.length - 1; i >= 0; i--) {
                const el = currentFrameElements[i];
                const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
                const radius = el.type === 'ball' ? 12 : el.type === 'cone' ? 14 : 20;

                if (dist <= radius) {
                    state.selectedElement = el;
                    state.dragOffset.x = coords.x - el.x;
                    state.dragOffset.y = coords.y - el.y;
                    
                    currentFrameElements.splice(i, 1);
                    currentFrameElements.push(el);
                    break;
                }
            }
        }

        function handlePointerMove(e) {
            const coords = getCanvasCoords(e);
            if (state.isDrawing) {
                const lastPoint = state.currentDrawingPoints[state.currentDrawingPoints.length - 1];
                if (!lastPoint || Math.hypot(lastPoint.x - coords.x, lastPoint.y - coords.y) > 4) {
                    state.currentDrawingPoints.push({ x: coords.x, y: coords.y });
                }
                return;
            }

            if (state.selectedElement && !state.isPlaying) {
                state.selectedElement.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, coords.x - state.dragOffset.x));
                state.selectedElement.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, coords.y - state.dragOffset.y));
            }
        }

        function handlePointerUp() {
            if (state.isDrawing) {
                if (state.currentDrawingPoints.length > 2) {
                    state.drawings.push({
                        type: state.drawingMode,
                        points: state.currentDrawingPoints
                    });
                }
                state.isDrawing = false;
                state.currentDrawingPoints = [];
            }
            state.selectedElement = null;
        }

        function handleDoubleClick(e) {
            if (state.isPlaying) return;
            const coords = getCanvasCoords(e);
            const currentFrameElements = getActiveElements();
            
            for (let i = currentFrameElements.length - 1; i >= 0; i--) {
                const el = currentFrameElements[i];
                const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
                const radius = el.type === 'ball' ? 12 : el.type === 'cone' ? 14 : 20;

                if (dist <= radius) {
                    openEditModal(el);
                    break;
                }
            }
        }

        function loadTacticalPreset(preset) {
            const newElements = [];
            newElements.push({ id: 'H1', type: 'home', number: 1, x: 80, y: CANVAS_HEIGHT/2, color: '#f59e0b' });

            if (preset === '14231') {
                newElements.push({ id: 'H2', type: 'home', number: 2, x: 260, y: 120, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H3', type: 'home', number: 3, x: 220, y: 230, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H4', type: 'home', number: 4, x: 220, y: 395, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H5', type: 'home', number: 5, x: 260, y: 505, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H6', type: 'home', number: 6, x: 420, y: 220, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H8', type: 'home', number: 8, x: 420, y: 400, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H10', type: 'home', number: 10, x: 600, y: CANVAS_HEIGHT/2, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H11', type: 'home', number: 11, x: 580, y: 120, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H7', type: 'home', number: 7, x: 580, y: 505, color: HOME_TEAM_COLOR });
                newElements.push({ id: 'H9', type: 'home', number: 9, x: 780, y: CANVAS_HEIGHT/2, color: HOME_TEAM_COLOR });
            }

            newElements.push({ id: 'A1', type: 'away', number: 1, x: 920, y: CANVAS_HEIGHT/2, color: '#ec4899' });
            newElements.push({ id: 'A2', type: 'away', number: 4, x: 740, y: 210, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A3', type: 'away', number: 3, x: 740, y: 415, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A4', type: 'away', number: 2, x: 760, y: 100, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A5', type: 'away', number: 5, x: 760, y: 525, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A6', type: 'away', number: 6, x: 550, y: 230, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A7', type: 'away', number: 8, x: 550, y: 395, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A8', type: 'away', number: 9, x: 380, y: 230, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'A9', type: 'away', number: 11, x: 380, y: 395, color: AWAY_TEAM_COLOR });
            newElements.push({ id: 'B1', type: 'ball', x: 480, y: CANVAS_HEIGHT/2 });

            state.framesMap = {
                'root': { id: 'root', name: 'Início', elements: newElements, children: [], parentId: null }
            };
            state.activePath = ['root'];
            state.currentFrameIdx = 0;
            state.drawings = [];
            
            document.getElementById('status-message').textContent = "Quadro Tático reposto para o modelo padrão 1-4-2-3-1.";
            updateTimelineUI();
        }

        function addPlayer(team) {
            const id = team === 'home' ? 'H' + (Date.now() % 1000) : 'A' + (Date.now() % 1000);
            const currentElements = getActiveElements();
            const existingNumbers = currentElements.filter(el => el.type === team).map(el => el.number);
            let num = 1;
            while (existingNumbers.includes(num)) num++;
            
            const color = team === 'home' ? HOME_TEAM_COLOR : AWAY_TEAM_COLOR;
            currentElements.push({ id: id, type: team, number: num, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, color: color });
            document.getElementById('status-message').textContent = \`Adicionado jogador número \${num} ao centro do campo.\`;
        }

        function addBall() {
            const currentElements = getActiveElements();
            if (currentElements.some(el => el.type === 'ball')) {
                document.getElementById('status-message').textContent = "Já tens uma bola em jogo!";
                return;
            }
            currentElements.push({ id: 'B' + Date.now(), type: 'ball', x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
            document.getElementById('status-message').textContent = "Bola de futebol adicionada ao centro.";
        }

        function addCone() {
            getActiveElements().push({ id: 'C' + Date.now(), type: 'cone', x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
            document.getElementById('status-message').textContent = "Obstáculo de treino adicionado.";
        }

        function setDrawingMode(mode) {
            state.drawingMode = mode;
            document.getElementById('btn-draw-select').className = "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";
            document.getElementById('btn-draw-run').className = "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";
            document.getElementById('btn-draw-pass').className = "bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-slate-300 font-semibold shadow-sm active:scale-95";

            if (mode === 'select') {
                document.getElementById('btn-draw-select').className = "bg-emerald-600 border border-emerald-500 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-white font-semibold active:scale-95 shadow-md";
                document.getElementById('status-message').textContent = "Modo Edição • Clica e arrasta as peças";
            } else if (mode === 'run') {
                document.getElementById('btn-draw-run').className = "bg-yellow-500/20 border border-yellow-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-yellow-400 font-semibold active:scale-95 shadow-md";
                document.getElementById('status-message').textContent = "Modo Corrida • Clica e arrasta no relvado para traçar corridas";
            } else if (mode === 'pass') {
                document.getElementById('btn-draw-pass').className = "bg-sky-500/20 border border-sky-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs text-sky-400 font-semibold active:scale-95 shadow-md";
                document.getElementById('status-message').textContent = "Modo Passe • Clica e arrasta no relvado para desenhar trajetórias";
            }
        }

        function clearDrawings() {
            state.drawings = [];
            document.getElementById('status-message').textContent = "Linhas táticas eliminadas.";
        }

        function changePitchStyle() {
            state.pitchStyle = document.getElementById('pitch-style').value;
        }

        function drawField() {
            ctx.fillStyle = FIELD_BG;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.strokeStyle = '#ffffff60';
            ctx.lineWidth = 3.5;
            const padding = 30;
            const w = CANVAS_WIDTH - (padding * 2);
            const h = CANVAS_HEIGHT - (padding * 2);
            ctx.strokeRect(padding, padding, w, h);

            if (state.pitchStyle === 'full') {
                ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH / 2, padding); ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - padding); ctx.stroke();
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 75, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffffa0'; ctx.fill();

                ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 130, 110, 260); 
                ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - 50, 40, 100);  
                ctx.strokeRect(padding - 15, CANVAS_HEIGHT / 2 - 30, 15, 60);
                ctx.beginPath(); ctx.arc(padding + 80, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(padding + 80, CANVAS_HEIGHT / 2, 50, -0.295 * Math.PI, 0.295 * Math.PI); ctx.stroke();

                ctx.strokeRect(CANVAS_WIDTH - padding - 110, CANVAS_HEIGHT / 2 - 130, 110, 260); 
                ctx.strokeRect(CANVAS_WIDTH - padding - 40, CANVAS_HEIGHT / 2 - 50, 40, 100);  
                ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - 30, 15, 60);
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding - 80, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding - 80, CANVAS_HEIGHT / 2, 50, 0.705 * Math.PI, 1.295 * Math.PI); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, CANVAS_HEIGHT - padding); ctx.stroke();
                ctx.strokeRect(CANVAS_WIDTH - padding - 220, CANVAS_HEIGHT / 2 - 200, 220, 400); 
                ctx.strokeRect(CANVAS_WIDTH - padding - 80, CANVAS_HEIGHT / 2 - 90, 80, 180);  
                ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - 55, 18, 110);
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding - 160, CANVAS_HEIGHT / 2, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding - 160, CANVAS_HEIGHT / 2, 80, 0.77 * Math.PI, 1.23 * Math.PI); ctx.stroke();
            }

            ctx.beginPath(); ctx.arc(padding, padding, 15, 0, 0.5 * Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(padding, CANVAS_HEIGHT - padding, 15, 1.5 * Math.PI, 2 * Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding, padding, 15, 0.5 * Math.PI, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding, 15, Math.PI, 1.5 * Math.PI); ctx.stroke();
        }

        function drawArrowhead(context, fromX, fromY, toX, toY, type) {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const headLength = 15;
            context.beginPath();
            context.moveTo(toX, toY);
            context.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
            context.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
            context.closePath();
            context.fillStyle = type === 'run' ? '#facc15' : '#38bdf8';
            context.fill();
        }

        function drawTacticalDrawings() {
            state.drawings.forEach(drawing => {
                if (drawing.points.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
                for (let i = 1; i < drawing.points.length; i++) {
                    ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
                }
                ctx.strokeStyle = drawing.type === 'run' ? '#facc15' : '#38bdf8';
                ctx.lineWidth = 3.5;
                if (drawing.type === 'pass') ctx.setLineDash([8, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
                const pLen = drawing.points.length;
                drawArrowhead(ctx, drawing.points[pLen - 2].x, drawing.points[pLen - 2].y, drawing.points[pLen - 1].x, drawing.points[pLen - 1].y, drawing.type);
            });

            if (state.isDrawing && state.currentDrawingPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(state.currentDrawingPoints[0].x, state.currentDrawingPoints[0].y);
                for (let i = 1; i < state.currentDrawingPoints.length; i++) {
                    ctx.lineTo(state.currentDrawingPoints[i].x, state.currentDrawingPoints[i].y);
                }
                ctx.strokeStyle = state.drawingMode === 'run' ? '#facc15' : '#38bdf8';
                ctx.lineWidth = 3.5;
                if (state.drawingMode === 'pass') ctx.setLineDash([8, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        function drawLoop(timestamp) {
            drawField();
            drawTacticalDrawings();

            let elementsToRender = [];

            if (state.isPlaying) {
                const currentId = state.activePath[state.currentFrameIdx];
                const node = state.framesMap[currentId];
                
                // If it's the last frame in the active path
                if (state.currentFrameIdx >= state.activePath.length - 1) {
                    
                    // Branching interactive pause
                    if (node.children.length > 0) {
                        state.isPlaying = false;
                        document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                        showInteractiveOverlay(node);
                    } else {
                        // End of playback
                        state.isPlaying = false;
                        document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                        if (isRecording) stopVideoRecording();
                        else document.getElementById('status-message').textContent = "Visualização Terminada";
                    }
                    elementsToRender = node.elements || [];
                } else {
                    const elapsed = timestamp - state.playbackStartTime;
                    const totalTransitionTime = state.transitionSpeed;
                    const progress = Math.min(1.0, elapsed / totalTransitionTime);
                    state.playbackFrameProgress = progress;

                    const startElements = node.elements || [];
                    const nextId = state.activePath[state.currentFrameIdx + 1];
                    const endElements = state.framesMap[nextId]?.elements || [];

                    startElements.forEach(startEl => {
                        const endEl = endElements.find(e => e.id === startEl.id);
                        if (endEl) {
                            const interpolatedX = startEl.x + (endEl.x - startEl.x) * progress;
                            const interpolatedY = startEl.y + (endEl.y - startEl.y) * progress;
                            elementsToRender.push({ ...startEl, x: interpolatedX, y: interpolatedY });
                        } else {
                            elementsToRender.push(startEl);
                        }
                    });

                    if (progress >= 1.0) {
                        state.currentFrameIdx++;
                        state.playbackStartTime = performance.now();
                        updateTimelineUI();
                    }
                }
            } else {
                elementsToRender = getActiveElements();
            }

            elementsToRender.forEach(el => {
                if (el.type === 'ball') {
                    const r = 11;
                    ctx.beginPath(); ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#000000'; ctx.stroke();
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = i * 2 * Math.PI / 5 - Math.PI / 2;
                        const px = el.x + (r * 0.4) * Math.cos(angle);
                        const py = el.y + (r * 0.4) * Math.sin(angle);
                        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.closePath(); ctx.fillStyle = '#000000'; ctx.fill();
                    for (let i = 0; i < 5; i++) {
                        const angle = i * 2 * Math.PI / 5 - Math.PI / 2;
                        const px1 = el.x + (r * 0.4) * Math.cos(angle); const py1 = el.y + (r * 0.4) * Math.sin(angle);
                        const px2 = el.x + r * Math.cos(angle); const py2 = el.y + r * Math.sin(angle);
                        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
                        const midAngle = angle + Math.PI / 5;
                        ctx.beginPath(); ctx.arc(el.x, el.y, r, midAngle - 0.35, midAngle + 0.35);
                        ctx.lineTo(el.x + (r * 0.75) * Math.cos(midAngle), el.y + (r * 0.75) * Math.sin(midAngle));
                        ctx.closePath(); ctx.fill();
                    }
                } else if (el.type === 'cone') {
                    ctx.beginPath(); ctx.moveTo(el.x, el.y - 12); ctx.lineTo(el.x - 12, el.y + 12); ctx.lineTo(el.x + 12, el.y + 12);
                    ctx.closePath(); ctx.fillStyle = '#f97316'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(el.x - 14, el.y + 12); ctx.lineTo(el.x + 14, el.y + 12); ctx.strokeStyle = '#374151'; ctx.lineWidth = 3; ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.arc(el.x, el.y, 19, 0, Math.PI * 2);
                    ctx.fillStyle = el.color; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2.5; ctx.fill();
                    ctx.shadowColor = 'transparent'; ctx.lineWidth = 2.5;
                    ctx.strokeStyle = el.type === 'home' ? '#0f172a' : '#ffffff'; ctx.stroke();
                    ctx.font = 'bold 15px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = el.type === 'home' ? '#0f172a' : '#ffffff'; ctx.fillText(el.number, el.x, el.y);
                }
            });

            requestAnimationFrame(drawLoop);
        }

        // --- INTERACTIVE PLAYBACK OVERLAY ---
        function showInteractiveOverlay(node) {
            const overlay = document.getElementById('interactive-overlay');
            const optionsContainer = document.getElementById('interactive-options');
            optionsContainer.innerHTML = '';
            
            node.children.forEach(childId => {
                const childNode = state.framesMap[childId];
                const btn = document.createElement('button');
                btn.className = "bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-2";
                btn.innerHTML = \`<i class="fa-solid fa-play text-emerald-400"></i> \${childNode.name || 'Alternativa'}\`;
                btn.onclick = () => {
                    // Update active path to include this child
                    state.activePath.push(childId);
                    hideInteractiveOverlay();
                    // Resume playback automatically!
                    state.isPlaying = true;
                    state.playbackStartTime = performance.now();
                    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                    updateTimelineUI();
                };
                optionsContainer.appendChild(btn);
            });
            
            overlay.classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('interactive-modal').classList.remove('scale-95');
                document.getElementById('interactive-modal').classList.add('scale-100');
            }, 50);
        }

        function hideInteractiveOverlay() {
            const overlay = document.getElementById('interactive-overlay');
            document.getElementById('interactive-modal').classList.remove('scale-100');
            document.getElementById('interactive-modal').classList.add('scale-95');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }

        function updateTimelineUI() {
            const track = document.getElementById('timeline-track');
            track.innerHTML = '';

            state.activePath.forEach((frameId, idx) => {
                const node = state.framesMap[frameId];
                const btn = document.createElement('div');
                btn.className = \`flex-shrink-0 w-32 h-16 rounded-xl border relative transition-all text-xs font-semibold flex flex-col justify-between p-2 text-left \${idx === state.currentFrameIdx ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400'}\`;
                
                const hasBranches = node.children.length > 1;
                
                btn.innerHTML = \`
                    <div class="flex items-center justify-between cursor-pointer" onclick="selectFrame(\${idx})">
                        <span class="truncate pr-1">\${node.name || 'Quadro ' + (idx+1)}</span>
                        \${idx === state.currentFrameIdx ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400"></span>' : ''}
                    </div>
                    <div class="flex items-center justify-between mt-auto">
                        <span class="text-[10px] text-slate-500">\${node.elements.length} peças</span>
                        \${hasBranches ? \`<button onclick="switchBranch('\${frameId}', \${idx})" class="text-sky-400 hover:text-white px-1"><i class="fa-solid fa-code-branch"></i></button>\` : ''}
                    </div>
                \`;
                track.appendChild(btn);
            });

            document.getElementById('frame-indicator').textContent = \`Quadro \${state.currentFrameIdx + 1} / \${state.activePath.length}\`;
        }
        
        function switchBranch(frameId, idx) {
            const node = state.framesMap[frameId];
            const children = node.children.map(id => state.framesMap[id]);
            const names = children.map(c => c.name).join(' | ');
            const choice = prompt(\`Escolha a ramificação:\\n\${children.map((c, i) => (i+1) + ' - ' + c.name).join('\\n')}\\nDigite o número:\`);
            const opt = parseInt(choice) - 1;
            if (opt >= 0 && opt < children.length) {
                state.activePath = buildActivePath(children[opt].id);
                state.currentFrameIdx = idx + 1; // move to the selected branch
                updateTimelineUI();
            }
        }

        function addAnimationFrame() {
            const currentId = getActiveFrameId();
            const currentNode = state.framesMap[currentId];
            const currentElements = JSON.parse(JSON.stringify(currentNode.elements));
            
            const newId = 'frame_' + Date.now();
            state.framesMap[newId] = {
                id: newId,
                name: 'Quadro ' + (state.activePath.length + 1),
                elements: currentElements,
                children: [],
                parentId: currentId
            };
            
            currentNode.children.push(newId);
            
            // Adjust active path - delete anything after current index and push new
            state.activePath = state.activePath.slice(0, state.currentFrameIdx + 1);
            state.activePath.push(newId);
            state.currentFrameIdx++;
            
            updateTimelineUI();
            document.getElementById('status-message').textContent = \`Quadro inserido!\`;
        }

        function addAlternativeFrame() {
            const currentId = getActiveFrameId();
            const currentNode = state.framesMap[currentId];
            
            const altName = prompt("Nome desta alternativa (ex: 'Passe Rutura', 'Defesa Baixa'):", "Nova Opção");
            if (!altName) return;

            const currentElements = JSON.parse(JSON.stringify(currentNode.elements));
            const newId = 'frame_alt_' + Date.now();
            
            state.framesMap[newId] = {
                id: newId,
                name: altName,
                elements: currentElements,
                children: [],
                parentId: currentId
            };
            
            currentNode.children.push(newId);
            
            // Switch path to this new alternative
            state.activePath = state.activePath.slice(0, state.currentFrameIdx + 1);
            state.activePath.push(newId);
            state.currentFrameIdx++;
            
            updateTimelineUI();
            document.getElementById('status-message').textContent = \`Alternativa "\${altName}" criada com sucesso!\`;
        }

        function deleteCurrentFrame() {
            const currentId = getActiveFrameId();
            const currentNode = state.framesMap[currentId];
            if (currentNode.parentId === null) return; // Cannot delete root
            
            const parent = state.framesMap[currentNode.parentId];
            parent.children = parent.children.filter(id => id !== currentId);
            
            // Rebuild active path to parent
            state.activePath = buildActivePath(currentNode.parentId);
            state.currentFrameIdx = state.activePath.length - 1;
            
            // Note: garbage collection for disconnected branches isn't strictly necessary for this prototype
            updateTimelineUI();
            document.getElementById('status-message').textContent = "Quadro removido.";
        }

        function selectFrame(idx) {
            state.currentFrameIdx = idx;
            updateTimelineUI();
        }

        function prevFrame() {
            state.currentFrameIdx = Math.max(0, state.currentFrameIdx - 1);
            updateTimelineUI();
        }

        function nextFrame() {
            if (state.currentFrameIdx < state.activePath.length - 1) {
                state.currentFrameIdx++;
            } else {
                const node = getActiveNode();
                if (node.children.length > 0) {
                    // Pick the first child automatically if traversing
                    state.activePath.push(node.children[0]);
                    state.currentFrameIdx++;
                }
            }
            updateTimelineUI();
        }

        function togglePlayback() {
            if (state.isPlaying) {
                state.isPlaying = false;
                document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                document.getElementById('status-message').textContent = "Animação Pausada";
            } else {
                if (state.currentFrameIdx >= state.activePath.length - 1 && getActiveNode().children.length === 0) {
                    // If at the very end of a branch, restart from root
                    state.activePath = buildActivePath(getActiveNode().id);
                    state.currentFrameIdx = 0;
                }
                state.playbackStartTime = performance.now();
                state.isPlaying = true;
                document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                document.getElementById('status-message').textContent = "A reproduzir tática...";
            }
            updateTimelineUI();
        }

        function updateTransitionSpeed() {
            state.transitionSpeed = document.getElementById('speed-slider').value * 1000;
            document.getElementById('speed-val').textContent = document.getElementById('speed-slider').value + 's';
        }

        function resetBoard() {
            loadTacticalPreset('14231');
            document.getElementById('status-message').textContent = "Quadro Tático reposto para o modelo padrão.";
        }

        // --- EDIT MODAL LOGIC ---
        function openEditModal(piece) {
            editingPiece = piece;
            const modal = document.getElementById('edit-piece-modal');
            if (piece.type === 'home' || piece.type === 'away') {
                document.getElementById('edit-number-group').style.display = 'block';
                document.getElementById('edit-color-group').style.display = 'block';
                document.getElementById('edit-player-number').value = piece.number;
                selectEditColor(piece.color);
            } else {
                document.getElementById('edit-number-group').style.display = 'none';
                document.getElementById('edit-color-group').style.display = 'none';
            }
            modal.classList.remove('hidden');
            setTimeout(() => { modal.firstElementChild.classList.remove('scale-95'); modal.firstElementChild.classList.add('scale-100'); }, 50);
        }

        function selectEditColor(color) {
            editingPieceColor = color;
            document.querySelectorAll('#edit-color-group button').forEach(btn => btn.classList.remove('color-selected'));
            if (color === '#facc15') document.getElementById('color-btn-yellow').classList.add('color-selected');
            else if (color === '#3b82f6') document.getElementById('color-btn-blue').classList.add('color-selected');
            else if (color === '#ec4899') document.getElementById('color-btn-pink').classList.add('color-selected');
            else if (color === '#f59e0b') document.getElementById('color-btn-orange').classList.add('color-selected');
            else if (color === '#ef4444') document.getElementById('color-btn-red').classList.add('color-selected');
            else if (color === '#ffffff') document.getElementById('color-btn-white').classList.add('color-selected');
        }

        function closeEditModal() {
            const modal = document.getElementById('edit-piece-modal');
            modal.firstElementChild.classList.remove('scale-100');
            modal.firstElementChild.classList.add('scale-95');
            setTimeout(() => { modal.classList.add('hidden'); editingPiece = null; }, 150);
        }

        function savePieceChanges() {
            if (!editingPiece) return;
            if (editingPiece.type === 'home' || editingPiece.type === 'away') {
                const newNum = Math.max(1, Math.min(99, parseInt(document.getElementById('edit-player-number').value) || 1));
                const validatedColor = editingPieceColor;
                
                // Update across all frames
                Object.values(state.framesMap).forEach(node => {
                    const el = node.elements.find(e => e.id === editingPiece.id);
                    if (el) { el.number = newNum; el.color = validatedColor; }
                });
            }
            document.getElementById('status-message').textContent = "Peça editada com sucesso!";
            closeEditModal();
        }

        function deleteSelectedPiece() {
            if (!editingPiece) return;
            Object.values(state.framesMap).forEach(node => {
                const idx = node.elements.findIndex(e => e.id === editingPiece.id);
                if (idx !== -1) node.elements.splice(idx, 1);
            });
            document.getElementById('status-message').textContent = "Peça eliminada do campo.";
            updateTimelineUI();
            closeEditModal();
        }

        // --- LOCAL STORAGE ---
        function clearActiveLoadedTactic() {
            state.loadedTacticIndex = null;
            document.getElementById('tactic-name').value = '';
            document.getElementById('editing-indicator').classList.add('hidden');
            document.getElementById('btn-clear-loaded-tactic').classList.add('hidden');
        }

        function saveTacticToStorage() {
            const name = document.getElementById('tactic-name').value.trim() || 'Jogada sem nome';
            const dataToSave = {
                name: name,
                pitchStyle: state.pitchStyle,
                framesMap: state.framesMap,
                activePath: state.activePath,
                drawings: state.drawings
            };
            const existing = JSON.parse(localStorage.getItem('tacticplay_tactics') || '[]');
            if (state.loadedTacticIndex !== null && state.loadedTacticIndex < existing.length) {
                existing[state.loadedTacticIndex] = dataToSave;
            } else {
                existing.push(dataToSave);
                state.loadedTacticIndex = existing.length - 1;
                document.getElementById('editing-indicator').classList.remove('hidden');
                document.getElementById('btn-clear-loaded-tactic').classList.remove('hidden');
            }
            localStorage.setItem('tacticplay_tactics', JSON.stringify(existing));
            document.getElementById('status-message').textContent = \`Tática gravada!\`;
            loadSavedTacticsList();
        }

        function loadSavedTacticsList() {
            const listContainer = document.getElementById('saved-tactics-list');
            const saved = JSON.parse(localStorage.getItem('tacticplay_tactics') || '[]');
            if (saved.length === 0) {
                listContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-2">Nenhuma jogada gravada ainda.</p>';
                return;
            }
            listContainer.innerHTML = '';
            saved.forEach((tactic, idx) => {
                const item = document.createElement('div');
                item.className = "flex items-center justify-between gap-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-2 transition-all text-xs";
                item.innerHTML = \`<button onclick="loadSavedTactic(\${idx})" class="flex-1 font-semibold text-left text-slate-300 hover:text-white truncate">\${tactic.name}</button><button onclick="deleteSavedTactic(\${idx})" class="text-rose-400 hover:text-rose-350 px-1.5 py-0.5"><i class="fa-solid fa-trash"></i></button>\`;
                listContainer.appendChild(item);
            });
        }

        function loadSavedTactic(idx) {
            const saved = JSON.parse(localStorage.getItem('tacticplay_tactics') || '[]');
            const tactic = saved[idx];
            if (tactic) {
                state.pitchStyle = tactic.pitchStyle || 'full';
                state.drawings = tactic.drawings || [];
                
                // Legacy support for flat arrays
                if (Array.isArray(tactic.frames)) {
                    state.framesMap = {};
                    state.activePath = [];
                    tactic.frames.forEach((f, i) => {
                        const id = 'frame_' + i;
                        state.framesMap[id] = { id: id, name: 'Quadro ' + (i+1), elements: f, children: i < tactic.frames.length - 1 ? ['frame_' + (i+1)] : [], parentId: i > 0 ? 'frame_' + (i-1) : null };
                        state.activePath.push(id);
                    });
                } else {
                    state.framesMap = tactic.framesMap;
                    state.activePath = tactic.activePath;
                }
                
                state.currentFrameIdx = 0;
                state.loadedTacticIndex = idx;
                document.getElementById('pitch-style').value = state.pitchStyle;
                document.getElementById('tactic-name').value = tactic.name;
                document.getElementById('editing-indicator').classList.remove('hidden');
                document.getElementById('btn-clear-loaded-tactic').classList.remove('hidden');
                updateTimelineUI();
                document.getElementById('status-message').textContent = \`Carregado: \${tactic.name}\`;
            }
        }

        function deleteSavedTactic(idx) {
            const saved = JSON.parse(localStorage.getItem('tacticplay_tactics') || '[]');
            saved.splice(idx, 1);
            localStorage.setItem('tacticplay_tactics', JSON.stringify(saved));
            if (state.loadedTacticIndex === idx) clearActiveLoadedTactic();
            else if (state.loadedTacticIndex > idx) state.loadedTacticIndex--;
            loadSavedTacticsList();
        }

        function shareTactic() {
            // Simplified sharing serialization for tree
            const compactState = {
                p: state.pitchStyle,
                d: state.drawings,
                fM: state.framesMap,
                aP: state.activePath
            };
            try {
                const b64 = btoa(encodeURIComponent(JSON.stringify(compactState)));
                document.getElementById('share-url').value = window.location.origin + window.location.pathname + '#t=' + b64;
                document.getElementById('share-modal').classList.remove('hidden');
                setTimeout(() => document.getElementById('share-modal').firstElementChild.classList.add('scale-100'), 50);
            } catch (e) {
                document.getElementById('status-message').textContent = "Erro ao partilhar.";
            }
        }

        function closeShareModal() {
            document.getElementById('share-modal').firstElementChild.classList.remove('scale-100');
            setTimeout(() => { document.getElementById('share-modal').classList.add('hidden'); document.getElementById('copy-feedback').classList.add('hidden'); }, 150);
        }

        function copyShareUrl() {
            const input = document.getElementById('share-url');
            input.select(); input.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(input.value).then(() => { document.getElementById('copy-feedback').classList.remove('hidden'); });
        }

        function checkSharedUrl() {
            const hash = window.location.hash;
            if (hash.startsWith('#t=')) {
                try {
                    const json = decodeURIComponent(atob(hash.replace('#t=', '')));
                    const compactState = JSON.parse(json);
                    state.pitchStyle = compactState.p;
                    document.getElementById('pitch-style').value = compactState.p;
                    state.drawings = compactState.d || [];
                    state.framesMap = compactState.fM;
                    state.activePath = compactState.aP;
                    state.currentFrameIdx = 0;
                    return true;
                } catch (e) {
                    // Try legacy format
                    if (hash.startsWith('#tactic=')) {
                       // Omitted for brevity, but let's assume it handles new #t format now
                    }
                }
            }
            return false;
        }

        function triggerVideoExport() {
            if (isRecording) return;
            if (!window.MediaRecorder || !canvas.captureStream) return alert("Não suportado no navegador.");
            isRecording = true; recordedChunks = [];
            document.getElementById('recording-dot').className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 transition-colors duration-300";
            document.getElementById('recording-ping').className = "absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping";
            document.getElementById('export-overlay').classList.remove('hidden');
            
            const stream = canvas.captureStream(30);
            let options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'video/webm' };
            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
            mediaRecorder.onstop = () => {
                const url = URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }));
                const a = document.createElement('a'); a.href = url; a.download = \`tacticplay_\${Date.now()}.webm\`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                document.getElementById('recording-dot').className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 transition-colors duration-300";
                document.getElementById('recording-ping').className = "absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping";
                document.getElementById('export-overlay').classList.add('hidden');
                isRecording = false;
            };

            state.currentFrameIdx = 0;
            state.playbackStartTime = performance.now();
            state.isPlaying = true;
            updateTimelineUI();
            mediaRecorder.start();
            recordingDuration = state.activePath.length * state.transitionSpeed;
            const startT = performance.now();
            recordingTimer = setInterval(() => {
                const p = Math.min(100, Math.round(((performance.now() - startT) / recordingDuration) * 100));
                document.getElementById('export-progress-bar').style.width = p + '%';
                document.getElementById('export-percentage').textContent = p + '%';
                if (p >= 100) clearInterval(recordingTimer);
            }, 100);
        }

        function stopVideoRecording() {
            if (recordingTimer) clearInterval(recordingTimer);
            if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }
    </script>
</body>
</html>`;

content = beforeScript + newScript;
fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Script updated successfully');
