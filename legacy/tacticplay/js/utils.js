/**
 * Converte as coordenadas do rato ou toque na janela para as coordenadas internas escaladas do window.canvas.
 * @param {Event} e - O evento disparado.
 * @returns {Object} Um objeto com {x, y} no espaço 2D do window.canvas.
 */
window.getCanvasCoords = function(event) {
        const rect = window.canvas.getBoundingClientRect();
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else {
          clientX = event.clientX;
          clientY = event.clientY;
        }
        const x = (clientX - rect.left) * (window.CANVAS_WIDTH / rect.width);
        const y = (clientY - rect.top) * (window.CANVAS_HEIGHT / rect.height);
        return { x, y };
      }

