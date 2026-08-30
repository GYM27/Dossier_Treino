const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

const oldLogic = `if (state.currentFrameIdx >= state.activePath.length - 1 && getActiveNode().children.length === 0) {
                    // If at the very end of a branch, restart from root
                    state.activePath = getFullPath('root');
                    state.currentFrameIdx = 0;
                }`;

const newLogic = `if (state.currentFrameIdx >= state.activePath.length - 1 && getActiveNode().children.length === 0) {
                    // Just rewind to start of current path
                    state.currentFrameIdx = 0;
                }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Fixed togglePlayback rewind logic');
