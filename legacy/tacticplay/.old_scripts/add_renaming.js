const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

const updateTimelineUIOld = `
                    <div class="flex items-center justify-between cursor-pointer" onclick="selectFrame(\${idx})">
                        <span class="truncate pr-1">\${node.name || 'Quadro ' + (idx+1)}</span>
                        \${idx === state.currentFrameIdx ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400"></span>' : ''}
                    </div>`;

const updateTimelineUINew = `
                    <div class="flex items-center justify-between">
                        <span class="truncate pr-1 cursor-pointer hover:text-emerald-400" onclick="selectFrame(\${idx})" title="Selecionar Quadro">\${node.name || 'Quadro ' + (idx+1)}</span>
                        <div class="flex items-center gap-1">
                            <button onclick="renameFrame('\${frameId}')" class="text-slate-500 hover:text-white" title="Renomear Quadro"><i class="fa-solid fa-pen text-[10px]"></i></button>
                            \${idx === state.currentFrameIdx ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400"></span>' : ''}
                        </div>
                    </div>`;

content = content.replace(updateTimelineUIOld, updateTimelineUINew);

const renameFrameFunction = `
        function renameFrame(frameId) {
            const node = state.framesMap[frameId];
            if (!node) return;
            const newName = prompt("Novo nome para o quadro:", node.name || '');
            if (newName && newName.trim() !== '') {
                node.name = newName.trim();
                updateTimelineUI();
            }
        }
`;

if (!content.includes('function renameFrame')) {
    content = content.replace('function updateTimelineUI', renameFrameFunction + '\n        function updateTimelineUI');
}

fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Renaming functionality added');
