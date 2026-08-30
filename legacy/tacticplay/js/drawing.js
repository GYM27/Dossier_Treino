/**
 * Desenha o campo de futebol e as suas marcações principais (linhas, áreas, meio campo).
 * Adapta-se ao estilo de campo selecionado (completo, meio campo, etc.).
 */
window.drawField = function() {
        window.ctx.fillStyle = window.FIELD_BG;
        window.ctx.fillRect(0, 0, window.CANVAS_WIDTH, window.CANVAS_HEIGHT);

        window.ctx.strokeStyle = "#ffffff60";
        window.ctx.lineWidth = 3.5;
        const padding = 65;
        const w = window.CANVAS_WIDTH - padding * 2;
        const h = window.CANVAS_HEIGHT - padding * 2;
        window.ctx.strokeRect(padding, padding, w, h);

        if (window.state.pitchStyle === "full") {
          window.ctx.beginPath();
          window.ctx.moveTo(window.CANVAS_WIDTH / 2, padding);
          window.ctx.lineTo(window.CANVAS_WIDTH / 2, window.CANVAS_HEIGHT - padding);
          window.ctx.stroke();
          window.ctx.beginPath();
          window.ctx.arc(window.CANVAS_WIDTH / 2, window.CANVAS_HEIGHT / 2, 75, 0, Math.PI * 2);
          window.ctx.stroke();
          window.ctx.beginPath();
          window.ctx.arc(window.CANVAS_WIDTH / 2, window.CANVAS_HEIGHT / 2, 3.5, 0, Math.PI * 2);
          window.ctx.fillStyle = "#ffffffa0";
          window.ctx.fill();

          window.ctx.strokeRect(padding, window.CANVAS_HEIGHT / 2 - 130, 110, 260);
          window.ctx.strokeRect(padding, window.CANVAS_HEIGHT / 2 - 50, 40, 100);
          window.ctx.strokeRect(padding - 15, window.CANVAS_HEIGHT / 2 - 30, 15, 60);
          window.ctx.beginPath();
          window.ctx.arc(padding + 80, window.CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
          window.ctx.fill();
          window.ctx.beginPath();
          window.ctx.arc(
            padding + 80,
            window.CANVAS_HEIGHT / 2,
            50,
            -0.295 * Math.PI,
            0.295 * Math.PI,
          );
          window.ctx.stroke();

          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding - 110,
            window.CANVAS_HEIGHT / 2 - 130,
            110,
            260,
          );
          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding - 40,
            window.CANVAS_HEIGHT / 2 - 50,
            40,
            100,
          );
          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding,
            window.CANVAS_HEIGHT / 2 - 30,
            15,
            60,
          );
          window.ctx.beginPath();
          window.ctx.arc(
            window.CANVAS_WIDTH - padding - 80,
            window.CANVAS_HEIGHT / 2,
            3,
            0,
            Math.PI * 2,
          );
          window.ctx.fill();
          window.ctx.beginPath();
          window.ctx.arc(
            window.CANVAS_WIDTH - padding - 80,
            window.CANVAS_HEIGHT / 2,
            50,
            0.705 * Math.PI,
            1.295 * Math.PI,
          );
          window.ctx.stroke();
        } else {
          window.ctx.beginPath();
          window.ctx.moveTo(padding, padding);
          window.ctx.lineTo(padding, window.CANVAS_HEIGHT - padding);
          window.ctx.stroke();
          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding - 220,
            window.CANVAS_HEIGHT / 2 - 200,
            220,
            400,
          );
          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding - 80,
            window.CANVAS_HEIGHT / 2 - 90,
            80,
            180,
          );
          window.ctx.strokeRect(
            window.CANVAS_WIDTH - padding,
            window.CANVAS_HEIGHT / 2 - 55,
            18,
            110,
          );
          window.ctx.beginPath();
          window.ctx.arc(
            window.CANVAS_WIDTH - padding - 160,
            window.CANVAS_HEIGHT / 2,
            4,
            0,
            Math.PI * 2,
          );
          window.ctx.fill();
          window.ctx.beginPath();
          window.ctx.arc(
            window.CANVAS_WIDTH - padding - 160,
            window.CANVAS_HEIGHT / 2,
            80,
            0.77 * Math.PI,
            1.23 * Math.PI,
          );
          window.ctx.stroke();
        }

        window.ctx.beginPath();
        window.ctx.arc(padding, padding, 15, 0, 0.5 * Math.PI);
        window.ctx.stroke();
        window.ctx.beginPath();
        window.ctx.arc(
          padding,
          window.CANVAS_HEIGHT - padding,
          15,
          1.5 * Math.PI,
          2 * Math.PI,
        );
        window.ctx.stroke();
        window.ctx.beginPath();
        window.ctx.arc(window.CANVAS_WIDTH - padding, padding, 15, 0.5 * Math.PI, Math.PI);
        window.ctx.stroke();
        window.ctx.beginPath();
        window.ctx.arc(
          window.CANVAS_WIDTH - padding,
          window.CANVAS_HEIGHT - padding,
          15,
          Math.PI,
          1.5 * Math.PI,
        );
        window.ctx.stroke();
      }

/**
 * Desenha a ponta de uma seta no fim de uma linha de percurso.
 * @param {CanvasRenderingContext2D} context - O contexto 2D do window.canvas.
 * @param {number} x - Posição X da ponta da seta.
 * @param {number} y - Posição Y da ponta da seta.
 * @param {number} angle - O ângulo de rotação da seta em radianos.
 */
window.drawArrowhead = function(context, fromX, fromY, toX, toY, type, customColor) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const headLength = 15;
        context.beginPath();
        context.moveTo(toX, toY);
        context.lineTo(
          toX - headLength * Math.cos(angle - Math.PI / 6),
          toY - headLength * Math.sin(angle - Math.PI / 6),
        );
        context.lineTo(
          toX - headLength * Math.cos(angle + Math.PI / 6),
          toY - headLength * Math.sin(angle + Math.PI / 6),
        );
        context.closePath();
        context.fillStyle = customColor || (type === "run" ? "#facc15" : "#38bdf8");
        context.fill();
      }

/**
 * Renderiza todos os desenhos livres feitos pelo utilizador por cima do campo tático.
 */
window.drawTacticalDrawings = function() {
        window.state.drawings.forEach((drawing) => {
          if (drawing.points.length < 2) return;
          
          const color = drawing.config?.color || (drawing.type === "pen" ? "#ffffff" : drawing.type === "run" ? "#facc15" : drawing.type === "rect" ? "#fb923c" : "#38bdf8");
          const size = drawing.config?.size || 3.5;
          const opacity = drawing.config?.opacity !== undefined ? drawing.config.opacity : 1.0;
          
          if (drawing.type === "rect") {
            const start = drawing.points[0];
            const end = drawing.points[drawing.points.length - 1];
            window.ctx.beginPath();
            window.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
            window.ctx.globalAlpha = 1.0;
            window.ctx.strokeStyle = color;
            window.ctx.lineWidth = size;
            window.ctx.stroke();
            window.ctx.globalAlpha = opacity;
            window.ctx.fillStyle = color;
            window.ctx.fill();
            window.ctx.globalAlpha = 1.0;
            return;
          }

          window.ctx.globalAlpha = 1.0;

          window.ctx.beginPath();
          window.ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
          for (let i = 1; i < drawing.points.length; i++) {
            window.ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
          }
          
          window.ctx.strokeStyle = color;
          window.ctx.lineWidth = size;
          if (drawing.type === "pass") window.ctx.setLineDash([8, 6]);
          window.ctx.stroke();
          window.ctx.setLineDash([]);
          
          if (drawing.type !== "pen") {
            const pLen = drawing.points.length;
            drawArrowhead(
              window.ctx,
              drawing.points[pLen - 2].x,
              drawing.points[pLen - 2].y,
              drawing.points[pLen - 1].x,
              drawing.points[pLen - 1].y,
              drawing.type,
              color
            );
          }
          
          window.ctx.globalAlpha = 1.0;
        });

        if (window.state.isDrawing && window.state.currentDrawingPoints.length > 1) {
          const pts = window.state.currentDrawingPoints;
          const type = window.state.drawingMode;
          const config = window.state.drawingConfig;
          
          const color = config?.color || (type === "pen" ? "#ffffff" : type === "run" ? "#facc15" : type === "rect" ? "#fb923c" : "#38bdf8");
          const size = config?.size || 3.5;
          const opacity = config?.opacity !== undefined ? config.opacity : 1.0;
          
          if (type === "rect") {
            const start = pts[0];
            const end = pts[pts.length - 1];
            window.ctx.beginPath();
            window.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
            window.ctx.globalAlpha = 1.0;
            window.ctx.strokeStyle = color;
            window.ctx.lineWidth = size;
            window.ctx.stroke();
            window.ctx.globalAlpha = opacity;
            window.ctx.fillStyle = color;
            window.ctx.fill();
            window.ctx.globalAlpha = 1.0;
            return;
          }

          window.ctx.globalAlpha = 1.0;

          window.ctx.beginPath();
          window.ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            window.ctx.lineTo(pts[i].x, pts[i].y);
          }
          
          window.ctx.strokeStyle = color;
          window.ctx.lineWidth = size;
          if (type === "pass") window.ctx.setLineDash([8, 6]);
          window.ctx.stroke();
          window.ctx.setLineDash([]);
          
          window.ctx.globalAlpha = 1.0;
          window.ctx.globalAlpha = 1.0;
        }

        // Desenhar handles de redimensionamento
        if (
          window.state.drawingMode === "select" &&
          window.state.activeDrawingIndex !== undefined &&
          window.state.activeDrawingIndex !== -1 &&
          window.state.drawings[window.state.activeDrawingIndex]
        ) {
          const activeDrawing = window.state.drawings[window.state.activeDrawingIndex];
          if (activeDrawing.points && activeDrawing.points.length >= 2) {
            window.ctx.fillStyle = "#ffffff";
            window.ctx.strokeStyle = "#1e293b"; // dark slate
            window.ctx.lineWidth = 2;
            
            const handleRadius = 6;
            const drawHandle = (pt) => {
              window.ctx.beginPath();
              window.ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
              window.ctx.fill();
              window.ctx.stroke();
            };

            const pts = activeDrawing.points;
            if (activeDrawing.type === "rect") {
              const start = pts[0];
              const end = pts[pts.length - 1];
              drawHandle({ x: start.x, y: start.y });
              drawHandle({ x: end.x, y: start.y });
              drawHandle({ x: start.x, y: end.y });
              drawHandle({ x: end.x, y: end.y });
            } else {
              drawHandle(pts[0]);
              drawHandle(pts[pts.length - 1]);
            }
          }
        }
      }

/**
 * O ciclo principal de renderização da aplicação.
 * Limpa o canvas e redesenha o campo, elementos táticos (jogadores, bolas), trajetórias e desenhos.
 */
window.drawLoop = function(timestamp) {
        drawField();
        drawTacticalDrawings();

        let elementsToRender = [];

        if (window.state.isPlaying) {
          const currentId = window.state.activePath[window.state.currentFrameIdx];
          const node = window.state.framesMap[currentId];

          // If it's the last frame in the active path
          if (window.state.currentFrameIdx >= window.state.activePath.length - 1) {
            // End of playback
            window.state.isPlaying = false;
            document.getElementById("btn-play").innerHTML =
              '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
            if (window.isRecording) stopVideoRecording();
            else
              document.getElementById("status-message").textContent =
                "Visualização Terminada";
            elementsToRender = node.elements || [];
          } else {
            const elapsed = timestamp - window.state.playbackStartTime;
            const totalTransitionTime = window.state.transitionSpeed;
            const progress = Math.min(1.0, elapsed / totalTransitionTime);
            window.state.playbackFrameProgress = progress;

            const startElements = node.elements || [];
            const nextId = window.state.activePath[window.state.currentFrameIdx + 1];
            const endElements = window.state.framesMap[nextId]?.elements || [];

            startElements.forEach((startEl) => {
              const endEl = endElements.find((e) => e.id === startEl.id);
              if (endEl) {
                const interpolatedX =
                  startEl.x + (endEl.x - startEl.x) * progress;
                const interpolatedY =
                  startEl.y + (endEl.y - startEl.y) * progress;
                elementsToRender.push({
                  ...startEl,
                  x: interpolatedX,
                  y: interpolatedY,
                });
              } else {
                elementsToRender.push(startEl);
              }
            });

            if (progress >= 1.0) {
              window.state.currentFrameIdx++;
              window.state.playbackStartTime = performance.now();
              updateTimelineUI();

              const arrivedNode =
                window.state.framesMap[window.state.activePath[window.state.currentFrameIdx]];
              if (
                arrivedNode &&
                arrivedNode.children.length > 1 &&
                !window.isRecording
              ) {
                window.state.isPlaying = false;
                document.getElementById("btn-play").innerHTML =
                  '<i class="fa-solid fa-play text-lg ml-0.5"></i>';
                showInteractiveOverlay(arrivedNode);
              }
            }
          }
        } else {
          elementsToRender = getActiveElements();
        }

        elementsToRender.forEach((el) => {
          if (el.type === "ball") {
            const r = 11;
            window.ctx.beginPath();
            window.ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
            window.ctx.fillStyle = "#ffffff";
            window.ctx.fill();
            window.ctx.lineWidth = 1.2;
            window.ctx.strokeStyle = "#000000";
            window.ctx.stroke();
            window.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const px = el.x + r * 0.4 * Math.cos(angle);
              const py = el.y + r * 0.4 * Math.sin(angle);
              if (i === 0) window.ctx.moveTo(px, py);
              else window.ctx.lineTo(px, py);
            }
            window.ctx.closePath();
            window.ctx.fillStyle = "#000000";
            window.ctx.fill();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const px1 = el.x + r * 0.4 * Math.cos(angle);
              const py1 = el.y + r * 0.4 * Math.sin(angle);
              const px2 = el.x + r * Math.cos(angle);
              const py2 = el.y + r * Math.sin(angle);
              window.ctx.beginPath();
              window.ctx.moveTo(px1, py1);
              window.ctx.lineTo(px2, py2);
              window.ctx.stroke();
              const midAngle = angle + Math.PI / 5;
              window.ctx.beginPath();
              window.ctx.arc(el.x, el.y, r, midAngle - 0.35, midAngle + 0.35);
              window.ctx.lineTo(
                el.x + r * 0.75 * Math.cos(midAngle),
                el.y + r * 0.75 * Math.sin(midAngle),
              );
              window.ctx.closePath();
              window.ctx.fill();
            }
          } else if (el.type === "cone") {
            window.ctx.beginPath();
            window.ctx.moveTo(el.x, el.y - 12);
            window.ctx.lineTo(el.x - 12, el.y + 12);
            window.ctx.lineTo(el.x + 12, el.y + 12);
            window.ctx.closePath();
            window.ctx.fillStyle = "#f97316";
            window.ctx.fill();
            window.ctx.strokeStyle = "#ffffff";
            window.ctx.lineWidth = 1.5;
            window.ctx.stroke();
            window.ctx.beginPath();
            window.ctx.moveTo(el.x - 14, el.y + 12);
            window.ctx.lineTo(el.x + 14, el.y + 12);
            window.ctx.strokeStyle = "#374151";
            window.ctx.lineWidth = 3;
            window.ctx.stroke();
          } else {
            window.ctx.beginPath();
            window.ctx.arc(el.x, el.y, 19, 0, Math.PI * 2);
            window.ctx.fillStyle = el.color;
            window.ctx.shadowColor = "rgba(0,0,0,0.35)";
            window.ctx.shadowBlur = 4;
            window.ctx.shadowOffsetY = 2.5;
            window.ctx.fill();
            window.ctx.shadowColor = "transparent";
            window.ctx.lineWidth = 2.5;
            window.ctx.strokeStyle = el.type === "home" ? "#0f172a" : "#ffffff";
            window.ctx.stroke();
            window.ctx.font = "bold 15px Inter, system-ui, sans-serif";
            window.ctx.textAlign = "center";
            window.ctx.textBaseline = "middle";
            window.ctx.fillStyle = el.type === "home" ? "#0f172a" : "#ffffff";
            window.ctx.fillText(el.number, el.x, el.y);
          }
        });

        requestAnimationFrame(drawLoop);
      }

