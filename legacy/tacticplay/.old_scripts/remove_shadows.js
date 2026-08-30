const fs = require('fs');

let content = fs.readFileSync('c:/Projetos/PranchetaTactica/index.html', 'utf-8');

const drawLoopGhostCode = `
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
            }`;

content = content.replace(drawLoopGhostCode, '');

fs.writeFileSync('c:/Projetos/PranchetaTactica/index.html', content, 'utf-8');
console.log('Onion Skinning removed');
