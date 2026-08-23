/**
 * @file tacticalGeometry.ts
 * @description Utilitário de geometria tática para cálculo de limites (bounding boxes), 
 * pontos de manipulação (handles) e deteção de colisões/seleções de desenhos no canvas.
 */

import { TacticalDrawing, Point } from "../types";

/**
 * Tipos de pontos de manipulação (handles) permitidos para redimensionar, 
 * mover ou rodar formas geométricas e linhas táticas.
 */
export type DrawingHandleType = 
  | "tl"          // Top-Left corner
  | "tr"          // Top-Right corner
  | "bl"          // Bottom-Left corner
  | "br"          // Bottom-Right corner
  | "radius"      // Raio do círculo
  | "p0"          // Ponto inicial de uma linha/seta
  | "p1"          // Ponto final de uma linha/seta
  | "rotate_line" // Manipulador de rotação de linha
  | "rotate_shape";// Manipulador de rotação de forma geométrica;

/**
 * Representa os limites espaciais (bounding box) de um desenho no canvas,
 * incluindo coordenadas extremas, centro e pontos de controlo (handles).
 */
export interface DrawingBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  cx?: number;
  cy?: number;
  rotation?: number;
  handles: { type: DrawingHandleType; x: number; y: number }[];
}

/**
 * Calcula os limites espaciais (Bounding Box) e os pontos de manipulação (handles) 
 * para um determinado desenho tático (forma geométrica, linha, passe, corrida ou desenho livre).
 * 
 * @param d - O objeto TacticalDrawing a analisar.
 * @returns Um objeto DrawingBounds com as coordenadas e handles, ou null se os pontos forem inválidos.
 */
export const getDrawingBounds = (d: TacticalDrawing): DrawingBounds | null => {
  if (!d.points || d.points.length < 2) return null;
  const p0 = d.points[0];
  const p1 = d.points[d.points.length - 1];

  // Formas geométricas (Retângulo, Triângulo, Pentágono, Hexágono)
  if (d.type === "rect" || d.type === "triangle" || d.type === "pentagon" || d.type === "hexagon") {
    const minX = Math.min(p0.x, p1.x);
    const maxX = Math.max(p0.x, p1.x);
    const minY = Math.min(p0.y, p1.y);
    const maxY = Math.max(p0.y, p1.y);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      minX,
      maxX,
      minY: minY - 24, // Espaço extra para o handle de rotação
      maxY,
      cx,
      cy,
      rotation: d.rotation || 0,
      handles: [
        { type: "tl", x: minX, y: minY },
        { type: "tr", x: maxX, y: minY },
        { type: "bl", x: minX, y: maxY },
        { type: "br", x: maxX, y: maxY },
        { type: "rotate_shape", x: cx, y: minY - 24 },
      ],
    };
  } 
  // Círculo
  else if (d.type === "circle") {
    const radius = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const minX = p0.x - radius;
    const maxX = p0.x + radius;
    const minY = p0.y - radius;
    const maxY = p0.y + radius;
    return {
      minX,
      maxX,
      minY: minY - 24, // Espaço extra para o handle de rotação
      maxY,
      cx: p0.x,
      cy: p0.y,
      rotation: d.rotation || 0,
      handles: [
        { type: "tl", x: minX, y: minY },
        { type: "tr", x: maxX, y: minY },
        { type: "bl", x: minX, y: maxY },
        { type: "br", x: maxX, y: maxY },
        { type: "radius", x: p0.x + radius, y: p0.y },
        { type: "rotate_shape", x: p0.x, y: minY - 24 },
      ],
    };
  } 
  // Linhas, Passes e Corridas
  else if (d.type === "run" || d.type === "pass" || d.type === "line") {
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    // Deslocar o handle de rotação 24 pixels perpendicularmente à linha
    const rotX = cx + 24 * Math.cos(angle - Math.PI / 2);
    const rotY = cy + 24 * Math.sin(angle - Math.PI / 2);
    
    return {
      minX: Math.min(p0.x, p1.x, rotX - 16),
      maxX: Math.max(p0.x, p1.x, rotX + 16),
      minY: Math.min(p0.y, p1.y, rotY),
      maxY: Math.max(p0.y, p1.y, rotY),
      handles: [
        { type: "p0", x: p0.x, y: p0.y },
        { type: "p1", x: p1.x, y: p1.y },
        { type: "rotate_line", x: rotX, y: rotY },
      ],
    };
  } 
  // Desenho livre (Pen)
  else if (d.type === "pen") {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    d.points.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    return {
      minX,
      maxX,
      minY,
      maxY,
      handles: [
        { type: "tl", x: minX, y: minY },
        { type: "tr", x: maxX, y: minY },
        { type: "bl", x: minX, y: maxY },
        { type: "br", x: maxX, y: maxY },
      ],
    };
  }
  return null;
};
