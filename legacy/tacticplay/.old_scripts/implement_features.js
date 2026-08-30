const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

// --- 1. UPDATE UI ---
// Add Undo/Redo buttons and Edit Mode Toggle to the top toolbar
const topBarHtmlOld = `<div class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10 relative shadow-md">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <i class="fa-solid fa-futbol text-white text-xl"></i>
                </div>
                <div>
                    <h1 class="text-white font-black text-xl tracking-tight leading-none">Prancheta <span class="text-emerald-400">Tática</span></h1>
                    <p class="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5">Criador de Jogadas</p>
                </div>
            </div>`;

const topBarHtmlNew = `<div class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10 relative shadow-md">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <i class="fa-solid fa-futbol text-white text-xl"></i>
                </div>
                <div>
                    <h1 class="text-white font-black text-xl tracking-tight leading-none">Prancheta <span class="text-emerald-400">Tática</span></h1>
                    <p class="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5">Criador de Jogadas</p>
                </div>
                <div class="h-8 w-px bg-slate-800 mx-2"></div>
                <div class="flex gap-1">
                    <button id="btn-undo" onclick="undo()" class="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm" title="Desfazer (Ctrl+Z)"><i class="fa-solid fa-rotate-left"></i></button>
                    <button id="btn-redo" onclick="redo()" class="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm" title="Refazer (Ctrl+Y)"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
                <button id="btn-toggle-edit" onclick="toggleEditMode()" class="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-3.5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2" title="Alternar entre Visualizar e Editar">
                    <i class="fa-solid fa-lock-open text-emerald-400"></i> Modo Edição
                </button>
            </div>`;

if (!content.includes('id="btn-undo"')) {
    content = content.replace(topBarHtmlOld, topBarHtmlNew);
}

// Group drawing buttons so they can be hidden
const drawingToolsOld = `<div class="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col gap-2 shadow-lg w-20 flex-shrink-0">`;
const drawingToolsNew = `<div id="drawing-tools-container" class="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col gap-2 shadow-lg w-20 flex-shrink-0">`;
if (!content.includes('id="drawing-tools-container"')) {
    content = content.replace(drawingToolsOld, drawingToolsNew);
}


// --- 2. UPDATE STATE AND ADD HELPERS ---
const stateMarker = `isDrawing: false,
            currentDrawingPoints: [],
            playbackFrameProgress: 0,
            playbackStartTime: 0,
            loadedTacticIndex: null`;

const stateReplacement = `isDrawing: false,
            currentDrawingPoints: [],
            playbackFrameProgress: 0,
            playbackStartTime: 0,
            loadedTacticIndex: null,
            isEditMode: true,
            history: [],
            historyIndex: -1,
            originalDragPos: null`;

if (!content.includes('isEditMode: true')) {
    content = content.replace(stateMarker, stateReplacement);
}


const helpersMarker = `function buildActivePath(endNodeId)`;
const helpersReplacement = `
        function saveStateToHistory() {
            if (state.historyIndex < state.history.length - 1) {
                state.history = state.history.slice(0, state.historyIndex + 1);
            }
            const snapshot = {
                framesMap: JSON.parse(JSON.stringify(state.framesMap)),
                activePath: JSON.parse(JSON.stringify(state.activePath))
            };
            state.history.push(snapshot);
            state.historyIndex++;
            updateUndoRedoUI();
        }

        function undo() {
            if (state.historyIndex > 0) {
                state.historyIndex--;
                restoreSnapshot(state.history[state.historyIndex]);
            }
        }

        function redo() {
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                restoreSnapshot(state.history[state.historyIndex]);
            }
        }

        function restoreSnapshot(snapshot) {
            state.framesMap = JSON.parse(JSON.stringify(snapshot.framesMap));
            state.activePath = JSON.parse(JSON.stringify(snapshot.activePath));
            state.currentFrameIdx = Math.min(state.currentFrameIdx, state.activePath.length - 1);
            updateTimelineUI();
            updateUndoRedoUI();
        }

        function updateUndoRedoUI() {
            const btnUndo = document.getElementById('btn-undo');
            const btnRedo = document.getElementById('btn-redo');
            if(btnUndo) { btnUndo.disabled = state.historyIndex <= 0; btnUndo.style.opacity = state.historyIndex <= 0 ? 0.3 : 1; }
            if(btnRedo) { btnRedo.disabled = state.historyIndex >= state.history.length - 1; btnRedo.style.opacity = state.historyIndex >= state.history.length - 1 ? 0.3 : 1; }
        }

        function toggleEditMode() {
            state.isEditMode = !state.isEditMode;
            document.getElementById('btn-toggle-edit').innerHTML = state.isEditMode ? 
                '<i class="fa-solid fa-lock-open text-emerald-400"></i> Modo Edição' : 
                '<i class="fa-solid fa-lock text-rose-400"></i> Modo Ver';
            document.getElementById('btn-toggle-edit').className = state.isEditMode ?
                "bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-3.5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2" :
                "bg-rose-950/30 border border-rose-800/50 hover:bg-rose-900/50 text-rose-300 px-3.5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2";
            document.getElementById('status-message').textContent = state.isEditMode ? "Modo Edição Ativado" : "Modo Visualização (Bloqueado)";
            document.getElementById('drawing-tools-container').style.display = state.isEditMode ? 'flex' : 'none';
        }

        function propagateMovement(nodeId, elementId, dx, dy) {
            const node = state.framesMap[nodeId];
            if (!node) return;
            node.children.forEach(childId => {
                const childNode = state.framesMap[childId];
                const el = childNode.elements.find(e => e.id === elementId);
                if (el) {
                    el.x += dx;
                    el.y += dy;
                }
                propagateMovement(childId, elementId, dx, dy);
            });
        }
        
        function buildActivePath(endNodeId)`;

if (!content.includes('function saveStateToHistory()')) {
    content = content.replace(helpersMarker, helpersReplacement);
}


// --- 3. KEYBOARD SHORTCUTS ---
const listenersMarker = `canvas.addEventListener('dblclick', handleDoubleClick);`;
const listenersReplacement = `canvas.addEventListener('dblclick', handleDoubleClick);
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
                if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            });`;
if (!content.includes("e.key === 'z'")) {
    content = content.replace(listenersMarker, listenersReplacement);
}


// --- 4. INITIALIZE HISTORY ON LOAD ---
const onLoadMarker = `loadSavedTacticsList();`;
const onLoadReplacement = `loadSavedTacticsList();
            saveStateToHistory();`;
if (!content.includes('saveStateToHistory();')) {
    content = content.replace(onLoadMarker, onLoadReplacement);
}


// --- 5. EDIT MODE LOCKS & PROPAGATION ---
const pointerDownOld = `function handlePointerDown(e) {
            const coords = getCanvasCoords(e);
            if (state.isPlaying) return;

            if (state.drawingMode !== 'select') {`;

const pointerDownNew = `function handlePointerDown(e) {
            const coords = getCanvasCoords(e);
            if (state.isPlaying || !state.isEditMode) return;

            if (state.drawingMode !== 'select') {`;

content = content.replace(pointerDownOld, pointerDownNew);


const dragRecordOld = `state.dragOffset.y = coords.y - el.y;
                    
                    currentFrameElements.splice(i, 1);`;
const dragRecordNew = `state.dragOffset.y = coords.y - el.y;
                    state.originalDragPos = { x: el.x, y: el.y };
                    
                    currentFrameElements.splice(i, 1);`;
content = content.replace(dragRecordOld, dragRecordNew);


const pointerUpOld = `function handlePointerUp() {
            if (state.isDrawing) {
                if (state.currentDrawingPoints.length > 2) {
                    state.drawings.push({
                        type: state.drawingMode,
                        points: state.currentDrawingPoints
                    });
                }`;

const pointerUpNew = `function handlePointerUp() {
            if (state.isDrawing) {
                if (state.currentDrawingPoints.length > 2) {
                    state.drawings.push({
                        type: state.drawingMode,
                        points: state.currentDrawingPoints
                    });
                    saveStateToHistory();
                }`;
content = content.replace(pointerUpOld, pointerUpNew);


const selectedElementEndOld = `state.currentDrawingPoints = [];
            }
            state.selectedElement = null;
        }`;

const selectedElementEndNew = `state.currentDrawingPoints = [];
            }
            if (state.selectedElement && state.originalDragPos) {
                const dx = state.selectedElement.x - state.originalDragPos.x;
                const dy = state.selectedElement.y - state.originalDragPos.y;
                if (dx !== 0 || dy !== 0) {
                    propagateMovement(getActiveFrameId(), state.selectedElement.id, dx, dy);
                    saveStateToHistory();
                }
            }
            state.selectedElement = null;
        }`;
content = content.replace(selectedElementEndOld, selectedElementEndNew);

const doubleClickOld = `function handleDoubleClick(e) {
            if (state.isPlaying) return;`;
const doubleClickNew = `function handleDoubleClick(e) {
            if (state.isPlaying || !state.isEditMode) return;`;
content = content.replace(doubleClickOld, doubleClickNew);


// --- 6. ADD HISTORY TO ACTIONS ---
const ops = [
    { old: `document.getElementById('status-message').textContent = \`Adicionado jogador número \${num} ao centro do campo.\`;`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = \`Adicionado jogador número \${num} ao centro do campo.\`;` },
    { old: `document.getElementById('status-message').textContent = "Bola de futebol adicionada ao centro.";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Bola de futebol adicionada ao centro.";` },
    { old: `document.getElementById('status-message').textContent = "Obstáculo de treino adicionado.";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Obstáculo de treino adicionado.";` },
    { old: `document.getElementById('status-message').textContent = "Linhas táticas eliminadas.";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Linhas táticas eliminadas.";` },
    { old: `document.getElementById('status-message').textContent = \`Quadro inserido!\`;`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = \`Quadro inserido!\`;` },
    { old: `document.getElementById('status-message').textContent = \`Alternativa "\${altName}" criada com sucesso!\`;`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = \`Alternativa "\${altName}" criada com sucesso!\`;` },
    { old: `document.getElementById('status-message').textContent = "Quadro removido.";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Quadro removido.";` },
    { old: `document.getElementById('status-message').textContent = "Peça editada com sucesso!";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Peça editada com sucesso!";` },
    { old: `document.getElementById('status-message').textContent = "Peça eliminada do campo.";`, new: `saveStateToHistory();\n            document.getElementById('status-message').textContent = "Peça eliminada do campo.";` },
    { old: `node.name = newName.trim();
                updateTimelineUI();`, new: `node.name = newName.trim();
                updateTimelineUI();
                saveStateToHistory();`}
];
ops.forEach(op => {
    if (!content.includes(op.new)) {
        content = content.replace(op.old, op.new);
    }
});


// --- 7. ONION SKINNING ---
// In drawLoop, right before drawing elementsToRender, draw ghost elements
const drawLoopGhostOld = `elementsToRender.forEach(el => {`;
const drawLoopGhostNew = `
            // ONION SKINNING: Draw previous frame ghost elements
            if (state.isEditMode && !state.isPlaying) {
                const node = getActiveNode();
                if (node && node.parentId) {
                    const prevElements = state.framesMap[node.parentId].elements || [];
                    ctx.globalAlpha = 0.3; // Make ghosts transparent
                    prevElements.forEach(el => {
                        if (el.type === 'ball') {
                            const r = 11;
                            ctx.beginPath(); ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
                            ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#000000'; ctx.stroke();
                        } else if (el.type === 'cone') {
                            ctx.beginPath(); ctx.moveTo(el.x, el.y - 12); ctx.lineTo(el.x - 12, el.y + 12); ctx.lineTo(el.x + 12, el.y + 12);
                            ctx.closePath(); ctx.fillStyle = '#f97316'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
                        } else {
                            ctx.beginPath(); ctx.arc(el.x, el.y, 19, 0, Math.PI * 2);
                            ctx.fillStyle = el.color; ctx.fill();
                            ctx.lineWidth = 2.5; ctx.strokeStyle = el.type === 'home' ? '#0f172a' : '#ffffff'; ctx.stroke();
                        }
                    });
                    ctx.globalAlpha = 1.0; // Reset opacity
                }
            }

            elementsToRender.forEach(el => {`;
if (!content.includes('ONION SKINNING')) {
    content = content.replace(drawLoopGhostOld, drawLoopGhostNew);
}


fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Editing features implemented');
