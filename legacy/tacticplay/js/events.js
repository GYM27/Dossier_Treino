/**
 * Configura os event listeners para interação com o rato/toque no window.canvas.
 */
window.setupInteractionListeners = function() {
        window.canvas.addEventListener("mousedown", handlePointerDown);
        window.canvas.addEventListener("mousemove", handlePointerMove);
        window.canvas.addEventListener("mouseup", handlePointerUp);
        window.canvas.addEventListener("mouseleave", handlePointerUp);
        window.canvas.addEventListener(
          "touchstart",
          function (e) {
            if (e.touches.length > 0) {
              const touch = e.touches[0];
              window.canvas.dispatchEvent(
                new MouseEvent("mousedown", {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                }),
              );
            }
            e.preventDefault();
          },
          { passive: false },
        );
        window.canvas.addEventListener(
          "touchmove",
          function (e) {
            if (e.touches.length > 0) {
              const touch = e.touches[0];
              window.canvas.dispatchEvent(
                new MouseEvent("mousemove", {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                }),
              );
            }
            e.preventDefault();
          },
          { passive: false },
        );
        window.canvas.addEventListener(
          "touchend",
          function (e) {
            window.canvas.dispatchEvent(new MouseEvent("mouseup", {}));
            e.preventDefault();
          },
          { passive: false },
        );
        window.canvas.addEventListener("dblclick", handleDoubleClick);
        document.addEventListener("keydown", function (e) {
          if (e.ctrlKey && e.key === "z") {
            e.preventDefault();
            undo();
          }
          if (e.ctrlKey && e.key === "y") {
            e.preventDefault();
            redo();
          }
        });
        
        const notesArea = document.getElementById("frame-notes");
        if (notesArea) {
          notesArea.addEventListener("input", function (e) {
            if (window.state && window.state.activePath && window.state.framesMap) {
              const currentFrameId = window.state.activePath[window.state.currentFrameIdx];
              const currentNode = window.state.framesMap[currentFrameId];
              if (currentNode) {
                currentNode.notes = e.target.value;
              }
            }
          });
          notesArea.addEventListener("change", function (e) {
            if (typeof window.saveStateToHistory === 'function') window.saveStateToHistory();
          });
        }
      }

/**
 * Lida com o evento de início de toque/clique no window.canvas.
 * Inicia o arraste de elementos ou o desenho livre.
 * @param {Event} e - O evento de pointer.
 */
window.handlePointerDown = function(e) {
        const coords = getCanvasCoords(e);
        if (window.state.isPlaying || !window.state.isEditMode) return;

        if (window.state.drawingMode !== "select") {
          window.state.isDrawing = true;
          window.state.currentDrawingPoints = [{ x: coords.x, y: coords.y }];
          return;
        }

        const handleIdx = window.findHandleAtPosition(coords.x, coords.y);
        if (handleIdx !== null) {
          window.state.resizingHandle = { drawingIndex: window.state.activeDrawingIndex, handleIndex: handleIdx };
          window.state.dragLastPos = { x: coords.x, y: coords.y };
          window.state.drawingDragged = false;
          return;
        }

        const currentFrameElements = getActiveElements();
        for (let i = currentFrameElements.length - 1; i >= 0; i--) {
          const el = currentFrameElements[i];
          const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
          const radius = el.type === "ball" ? 12 : el.type === "cone" ? 14 : 20;

          if (dist <= radius) {
            window.state.selectedElement = el;
            window.state.dragOffset.x = coords.x - el.x;
            window.state.dragOffset.y = coords.y - el.y;
            window.state.originalDragPos = { x: el.x, y: el.y };

            currentFrameElements.splice(i, 1);
            currentFrameElements.push(el);
            window.state.activeDrawingIndex = -1;
            return;
          }
        }
        
        const drawingIdx = window.findDrawingAtPosition(coords.x, coords.y);
        if (drawingIdx !== -1) {
          window.state.selectedDrawingIndex = drawingIdx;
          window.state.activeDrawingIndex = drawingIdx;
          window.state.dragLastPos = { x: coords.x, y: coords.y };
          window.state.drawingDragged = false;
        } else {
          window.state.activeDrawingIndex = -1;
        }
      }

/**
 * Lida com o movimento do ponteiro sobre o window.canvas.
 * Atualiza a posição da peça arrastada ou desenha a linha livre.
 * @param {Event} e - O evento de pointer.
 */
window.handlePointerMove = function(e) {
        const coords = getCanvasCoords(e);
        if (window.state.isDrawing) {
          const lastPoint =
            window.state.currentDrawingPoints[window.state.currentDrawingPoints.length - 1];
          if (
            !lastPoint ||
            Math.hypot(lastPoint.x - coords.x, lastPoint.y - coords.y) > 4
          ) {
            window.state.currentDrawingPoints.push({ x: coords.x, y: coords.y });
          }
          return;
        }

        if (window.state.selectedElement && !window.state.isPlaying) {
          window.state.selectedElement.x = Math.max(
            20,
            Math.min(window.CANVAS_WIDTH - 20, coords.x - window.state.dragOffset.x),
          );
          window.state.selectedElement.y = Math.max(
            20,
            Math.min(window.CANVAS_HEIGHT - 20, coords.y - window.state.dragOffset.y),
          );
          return;
        }

        if (window.state.resizingHandle !== null && !window.state.isPlaying) {
          const { drawingIndex, handleIndex } = window.state.resizingHandle;
          const drawing = window.state.drawings[drawingIndex];
          if (!drawing) return;
          const pts = drawing.points;
          
          if (drawing.type === "rect") {
            if (handleIndex === 0) { pts[0].x = coords.x; pts[0].y = coords.y; }
            else if (handleIndex === 1) { pts[pts.length - 1].x = coords.x; pts[0].y = coords.y; }
            else if (handleIndex === 2) { pts[0].x = coords.x; pts[pts.length - 1].y = coords.y; }
            else if (handleIndex === 3) { pts[pts.length - 1].x = coords.x; pts[pts.length - 1].y = coords.y; }
          } else {
            const A = pts[0];
            const B = pts[pts.length - 1];
            
            let newA = { x: A.x, y: A.y };
            let newB = { x: B.x, y: B.y };
            
            if (handleIndex === 0) newA = coords;
            if (handleIndex === 1) newB = coords;
            
            const dx = B.x - A.x;
            const dy = B.y - A.y;
            const lenSq = dx * dx + dy * dy;
            
            const newDx = newB.x - newA.x;
            const newDy = newB.y - newA.y;
            
            if (lenSq > 0.1) {
              const transformed = pts.map(p => {
                const px = p.x - A.x;
                const py = p.y - A.y;
                const u = (px * dx + py * dy) / lenSq;
                const v = (px * -dy + py * dx) / lenSq;
                return {
                  x: newA.x + u * newDx - v * newDy,
                  y: newA.y + u * newDy + v * newDx
                };
              });
              for (let i = 0; i < pts.length; i++) {
                pts[i].x = transformed[i].x;
                pts[i].y = transformed[i].y;
              }
            } else {
              if (handleIndex === 0) { pts[0].x = coords.x; pts[0].y = coords.y; }
              if (handleIndex === 1) { pts[pts.length - 1].x = coords.x; pts[pts.length - 1].y = coords.y; }
            }
          }
          window.state.drawingDragged = true;
          return;
        }

        if (window.state.selectedDrawingIndex !== -1 && !window.state.isPlaying) {
          const dx = coords.x - window.state.dragLastPos.x;
          const dy = coords.y - window.state.dragLastPos.y;
          
          if (dx !== 0 || dy !== 0) {
            window.state.drawingDragged = true;
            const drawing = window.state.drawings[window.state.selectedDrawingIndex];
            drawing.points.forEach(p => {
              p.x += dx;
              p.y += dy;
            });
            window.state.dragLastPos = { x: coords.x, y: coords.y };
          }
        }
      }

/**
 * Lida com o fim do evento de toque/clique no window.canvas.
 * Finaliza o arraste de elementos ou o desenho.
 * @param {Event} e - O evento de pointer.
 */
window.handlePointerUp = function() {
        if (window.state.isDrawing) {
          if (window.state.currentDrawingPoints.length > 2) {
            window.state.drawings.push({
              type: window.state.drawingMode,
              points: window.state.currentDrawingPoints,
              config: window.state.drawingConfig ? { ...window.state.drawingConfig } : null,
            });
            saveStateToHistory();
          }
          window.state.isDrawing = false;
          window.state.currentDrawingPoints = [];
        }
        if (window.state.selectedElement && window.state.originalDragPos) {
          const dx = window.state.selectedElement.x - window.state.originalDragPos.x;
          const dy = window.state.selectedElement.y - window.state.originalDragPos.y;
          if (dx !== 0 || dy !== 0) {
            propagateMovement(
              getActiveFrameId(),
              window.state.selectedElement.id,
              dx,
              dy,
            );
            saveStateToHistory();
          }
        }
        
        if (window.state.selectedDrawingIndex !== -1) {
          if (window.state.drawingDragged) {
            saveStateToHistory();
          }
          window.state.selectedDrawingIndex = -1;
        }
        
        if (window.state.resizingHandle !== null) {
          if (window.state.drawingDragged) {
            saveStateToHistory();
          }
          window.state.resizingHandle = null;
        }

        window.state.selectedElement = null;
      }

window.findHandleAtPosition = function(x, y) {
  if (window.state.activeDrawingIndex === -1) return null;
  const drawing = window.state.drawings[window.state.activeDrawingIndex];
  if (!drawing || !drawing.points || drawing.points.length < 2) return null;

  const pts = drawing.points;
  const tolerance = 12;
  const checkPt = (ptX, ptY) => Math.hypot(x - ptX, y - ptY) <= tolerance;

  if (drawing.type === "rect") {
    const start = pts[0];
    const end = pts[pts.length - 1];
    if (checkPt(start.x, start.y)) return 0;
    if (checkPt(end.x, start.y)) return 1;
    if (checkPt(start.x, end.y)) return 2;
    if (checkPt(end.x, end.y)) return 3;
  } else {
    if (checkPt(pts[0].x, pts[0].y)) return 0;
    if (checkPt(pts[pts.length - 1].x, pts[pts.length - 1].y)) return 1;
  }
  return null;
}

window.pointToSegmentDistance = function(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = px - xx;
  let dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

window.findDrawingAtPosition = function(x, y) {
  for (let i = window.state.drawings.length - 1; i >= 0; i--) {
    const drawing = window.state.drawings[i];
    if (drawing.points.length < 2) continue;

    if (drawing.type === "rect") {
      const start = drawing.points[0];
      const end = drawing.points[drawing.points.length - 1];
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);

      // Check if point is inside the rect
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        return i;
      }
      
      const tolerance = 10;
      if (
        (x >= minX - tolerance && x <= maxX + tolerance && Math.abs(y - minY) <= tolerance) ||
        (x >= minX - tolerance && x <= maxX + tolerance && Math.abs(y - maxY) <= tolerance) ||
        (y >= minY - tolerance && y <= maxY + tolerance && Math.abs(x - minX) <= tolerance) ||
        (y >= minY - tolerance && y <= maxY + tolerance && Math.abs(x - maxX) <= tolerance)
      ) {
        return i;
      }
    } else {
      const tolerance = (drawing.config?.size || 3.5) + 5;
      for (let j = 0; j < drawing.points.length - 1; j++) {
        const p1 = drawing.points[j];
        const p2 = drawing.points[j+1];
        const dist = pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist <= tolerance) {
          return i;
        }
      }
    }
  }
  return -1;
};

/**
 * Lida com o clique duplo sobre um elemento no canvas, abrindo o modal de edição.
 * @param {Event} e - O evento de pointer.
 */
window.handleDoubleClick = function(e) {
        if (window.state.isPlaying || !window.state.isEditMode) return;
        const coords = getCanvasCoords(e);
        const currentFrameElements = getActiveElements();

        for (let i = currentFrameElements.length - 1; i >= 0; i--) {
          const el = currentFrameElements[i];
          const dist = Math.hypot(el.x - coords.x, el.y - coords.y);
          const radius = el.type === "ball" ? 12 : el.type === "cone" ? 14 : 20;

          if (dist <= radius) {
            openEditModal(el);
            return;
          }
        }
        
        const drawingIdx = findDrawingAtPosition(coords.x, coords.y);
        if (drawingIdx !== -1) {
           openDrawingEditModal(window.state.drawings[drawingIdx], drawingIdx);
        }
      }
