/**
 * @file tacticalGeometry.ts
 * @description Utilitário de geometria tática para cálculo de limites (bounding boxes), 
 * pontos de manipulação (handles), rotações e deteção de colisões/seleções no canvas.
 */

import { TacticalDrawing, TacticalElement, Point } from "../types";

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
 * Roda um ponto 2D em torno de um centro arbitrário com um dado ângulo em radianos.
 */
export function rotatePoint(p: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

/**
 * Calcula a menor distância perpendicular de um ponto `p` a um segmento de reta `[a, b]`.
 */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const l2 = Math.hypot(b.x - a.x, b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2));
  const projX = a.x + t * (b.x - a.x);
  const projY = a.y + t * (b.y - a.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Verifica se um ponto está dentro de um retângulo delimitador (AABB).
 */
export function isPointInsideRect(p: Point, minX: number, maxX: number, minY: number, maxY: number): boolean {
  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
}

/**
 * Verifica se um ponto está dentro de um círculo com determinado raio.
 */
export function isPointInsideCircle(p: Point, center: Point, radius: number): boolean {
  return Math.hypot(p.x - center.x, p.y - center.y) <= radius;
}

/**
 * Calcula os limites espaciais (Bounding Box) e os pontos de manipulação (handles) 
 * para um determinado desenho tático (forma geométrica, linha, passe, corrida ou desenho livre).
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

/**
 * Deteta se o cursor está sobre um handle de redimensionamento/rotação de um desenho.
 */
export function getHoveredDrawingHandle(
  coords: Point,
  bounds: DrawingBounds | null,
  tolerance = 24
): DrawingHandleType | null {
  if (!bounds || !bounds.handles) return null;

  let localCoords = coords;
  if (bounds.rotation && bounds.cx !== undefined && bounds.cy !== undefined) {
    localCoords = rotatePoint(coords, { x: bounds.cx, y: bounds.cy }, -bounds.rotation);
  }

  for (const h of bounds.handles) {
    if (Math.hypot(localCoords.x - h.x, localCoords.y - h.y) <= tolerance) {
      return h.type;
    }
  }

  return null;
}

/**
 * Deteta se o cursor está sobre o handle de rotação de um elemento (ex: baliza).
 */
export function getHoveredElementHandle(
  coords: Point,
  el: TacticalElement | null,
  tolerance = 24
): string | null {
  if (!el || el.type !== "mini_goal") return null;

  let localCoords = coords;
  if (el.rotation) {
    localCoords = rotatePoint(coords, { x: el.x, y: el.y }, -el.rotation);
  }

  const handleLocal = { x: el.x, y: el.y - 36 };
  if (Math.hypot(localCoords.x - handleLocal.x, localCoords.y - handleLocal.y) <= tolerance) {
    return "rotate_element";
  }

  return null;
}

/**
 * Deteta o elemento tático sob o cursor (jogadores, bolas, cones, balizas).
 */
export function findHoveredElement(
  coords: Point,
  elements: TacticalElement[]
): TacticalElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const radius =
      el.type === "home" || el.type === "away" ? 20 : el.type === "mini_goal" ? 30 : 15;
    if (Math.hypot(el.x - coords.x, el.y - coords.y) <= radius) {
      return el;
    }
  }
  return null;
}

/**
 * Deteta o desenho tático sob o cursor (linhas, formas, círculos).
 */
export function findHoveredDrawing(
  coords: Point,
  drawings: TacticalDrawing[]
): number | null {
  for (let i = drawings.length - 1; i >= 0; i--) {
    const d = drawings[i];
    if (!d.points || d.points.length < 2) continue;

    const p0 = d.points[0];
    const pLast = d.points[d.points.length - 1];

    if (d.type === "rect" || d.type === "triangle" || d.type === "pentagon" || d.type === "hexagon") {
      let shapeCoords = coords;
      if (d.rotation) {
        const cx = (p0.x + pLast.x) / 2;
        const cy = (p0.y + pLast.y) / 2;
        shapeCoords = rotatePoint(coords, { x: cx, y: cy }, -d.rotation);
      }
      const minX = Math.min(p0.x, pLast.x);
      const maxX = Math.max(p0.x, pLast.x);
      const minY = Math.min(p0.y, pLast.y);
      const maxY = Math.max(p0.y, pLast.y);
      if (isPointInsideRect(shapeCoords, minX - 8, maxX + 8, minY - 8, maxY + 8)) {
        return i;
      }
    } else if (d.type === "circle") {
      const radius = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);
      const dist = Math.hypot(coords.x - p0.x, coords.y - p0.y);
      if (Math.abs(dist - radius) <= 12 || dist <= radius) {
        return i;
      }
    } else if (d.type === "line" || d.type === "pass" || d.type === "run") {
      if (distanceToSegment(coords, p0, pLast) <= 12) {
        return i;
      }
    } else if (d.type === "pen") {
      for (let j = 0; j < d.points.length - 1; j++) {
        if (distanceToSegment(coords, d.points[j], d.points[j + 1]) <= 10) {
          return i;
        }
      }
    }
  }
  return null;
}
