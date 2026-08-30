const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

const pauseAtBranchOld = `if (arrivedNode && arrivedNode.children.length > 1) {
                            state.isPlaying = false;
                            document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                            showInteractiveOverlay(arrivedNode);
                        }`;

const pauseAtBranchNew = `if (arrivedNode && arrivedNode.children.length > 1 && !isRecording) {
                            state.isPlaying = false;
                            document.getElementById('btn-play').innerHTML = '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                            showInteractiveOverlay(arrivedNode);
                        }`;

content = content.replace(pauseAtBranchOld, pauseAtBranchNew);

fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Video recording fix applied');
