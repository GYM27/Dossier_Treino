const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

// 1. Add getFullPath helper
const getFullPathCode = `
        function getFullPath(startNodeId) {
            let path = buildActivePath(startNodeId);
            let curr = state.framesMap[startNodeId];
            while (curr && curr.children.length > 0) {
                let nextId = curr.children[0];
                path.push(nextId);
                curr = state.framesMap[nextId];
            }
            return path;
        }
`;
if (!content.includes('getFullPath(startNodeId)')) {
    content = content.replace('function buildActivePath', getFullPathCode + '\n        function buildActivePath');
}

// 2. Fix showInteractiveOverlay to use getFullPath
const showOverlayOld = `btn.onclick = () => {
                    // Update active path to include this child
                    state.activePath.push(childId);
                    hideInteractiveOverlay();
                    // Resume playback automatically!
                    state.isPlaying = true;
                    state.playbackStartTime = performance.now();
                    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                    updateTimelineUI();
                };`;
const showOverlayNew = `btn.onclick = () => {
                    state.activePath = getFullPath(childId);
                    hideInteractiveOverlay();
                    state.isPlaying = true;
                    state.playbackStartTime = performance.now();
                    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                    updateTimelineUI();
                };`;
content = content.replace(showOverlayOld, showOverlayNew);

// 3. Fix drawLoop to pause when arriving at a branched node
const drawLoopProgressOld = `if (progress >= 1.0) {
                        state.currentFrameIdx++;
                        state.playbackStartTime = performance.now();
                        updateTimelineUI();
                    }`;
const drawLoopProgressNew = `if (progress >= 1.0) {
                        state.currentFrameIdx++;
                        state.playbackStartTime = performance.now();
                        updateTimelineUI();
                        
                        const arrivedNode = state.framesMap[state.activePath[state.currentFrameIdx]];
                        if (arrivedNode && arrivedNode.children.length > 1) {
                            state.isPlaying = false;
                            document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                            showInteractiveOverlay(arrivedNode);
                        }
                    }`;
content = content.replace(drawLoopProgressOld, drawLoopProgressNew);

// 4. Fix drawLoop end of path logic
const drawLoopEndOld = `// If it's the last frame in the active path
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
                }`;
const drawLoopEndNew = `// If it's the last frame in the active path
                if (state.currentFrameIdx >= state.activePath.length - 1) {
                    // End of playback
                    state.isPlaying = false;
                    document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                    if (isRecording) stopVideoRecording();
                    else document.getElementById('status-message').textContent = "Visualização Terminada";
                    elementsToRender = node.elements || [];
                }`;
content = content.replace(drawLoopEndOld, drawLoopEndNew);

// 5. Fix togglePlayback to check for branch at start
const togglePlaybackOld = `if (state.currentFrameIdx >= state.activePath.length - 1 && getActiveNode().children.length === 0) {
                    // If at the very end of a branch, restart from root
                    state.activePath = buildActivePath(getActiveNode().id);
                    state.currentFrameIdx = 0;
                }
                state.playbackStartTime = performance.now();
                state.isPlaying = true;
                document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                document.getElementById('status-message').textContent = "A reproduzir tática...";`;
const togglePlaybackNew = `if (state.currentFrameIdx >= state.activePath.length - 1 && getActiveNode().children.length === 0) {
                    // If at the very end of a branch, restart from root
                    state.activePath = getFullPath('root');
                    state.currentFrameIdx = 0;
                }
                
                const currentNode = getActiveNode();
                if (currentNode.children.length > 1) {
                    showInteractiveOverlay(currentNode);
                    return;
                }

                state.playbackStartTime = performance.now();
                state.isPlaying = true;
                document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
                document.getElementById('status-message').textContent = "A reproduzir tática...";`;
content = content.replace(togglePlaybackOld, togglePlaybackNew);

// 6. Fix switchBranch prompt logic
const switchBranchOld = `function switchBranch(frameId, idx) {
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
        }`;
const switchBranchNew = `function switchBranch(frameId, idx) {
            const node = state.framesMap[frameId];
            const children = node.children.map(id => state.framesMap[id]);
            const choice = prompt(\`Escolha a ramificação:\\n\${children.map((c, i) => (i+1) + ' - ' + (c.name || 'Alternativa')).join('\\n')}\\nDigite o número:\`);
            const opt = parseInt(choice) - 1;
            if (opt >= 0 && opt < children.length) {
                state.activePath = getFullPath(children[opt].id);
                state.currentFrameIdx = idx + 1;
                updateTimelineUI();
            }
        }`;
content = content.replace(switchBranchOld, switchBranchNew);


fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Fixed branching logic');
