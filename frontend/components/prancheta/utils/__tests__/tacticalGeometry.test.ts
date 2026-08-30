import { describe, it, expect } from "vitest";
import {
  rotatePoint,
  distanceToSegment,
  isPointInsideRect,
  isPointInsideCircle,
  getDrawingBounds,
  getHoveredDrawingHandle,
  findHoveredDrawing,
  findHoveredElement,
} from "../tacticalGeometry";
import { TacticalDrawing, TacticalElement, Point } from "../../types";

describe("tacticalGeometry - Funções Puras de Geometria e Colisões (TDD)", () => {
  describe("rotatePoint", () => {
    it("deve rodar um ponto 90 graus (PI/2 radianos) no sentido dos ponteiros do relógio", () => {
      const p: Point = { x: 10, y: 0 };
      const center: Point = { x: 0, y: 0 };
      const rotated = rotatePoint(p, center, Math.PI / 2);

      expect(Math.round(rotated.x)).toBe(0);
      expect(Math.round(rotated.y)).toBe(10);
    });

    it("deve rodar um ponto 180 graus (PI radianos) em torno de um centro não-nulo", () => {
      const p: Point = { x: 150, y: 100 };
      const center: Point = { x: 100, y: 100 };
      const rotated = rotatePoint(p, center, Math.PI);

      expect(Math.round(rotated.x)).toBe(50);
      expect(Math.round(rotated.y)).toBe(100);
    });
  });

  describe("distanceToSegment", () => {
    it("deve calcular a distância perpendicular exata de um ponto a um segmento de reta", () => {
      const p: Point = { x: 50, y: 30 };
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 100, y: 0 };
      const dist = distanceToSegment(p, a, b);

      expect(dist).toBe(30);
    });

    it("deve calcular a distância ao extremo quando a projeção cai fora do segmento", () => {
      const p: Point = { x: 150, y: 0 };
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 100, y: 0 };
      const dist = distanceToSegment(p, a, b);

      expect(dist).toBe(50);
    });
  });

  describe("isPointInsideRect", () => {
    it("deve retornar true quando o ponto está dentro dos limites do retângulo", () => {
      expect(isPointInsideRect({ x: 50, y: 50 }, 10, 100, 10, 100)).toBe(true);
    });

    it("deve retornar false quando o ponto está fora dos limites", () => {
      expect(isPointInsideRect({ x: 150, y: 50 }, 10, 100, 10, 100)).toBe(false);
    });
  });

  describe("isPointInsideCircle", () => {
    it("deve retornar true para pontos dentro do raio do círculo", () => {
      expect(isPointInsideCircle({ x: 120, y: 100 }, { x: 100, y: 100 }, 30)).toBe(true);
    });

    it("deve retornar false para pontos fora do raio", () => {
      expect(isPointInsideCircle({ x: 150, y: 100 }, { x: 100, y: 100 }, 30)).toBe(false);
    });
  });

  describe("getDrawingBounds", () => {
    it("deve calcular bounding box e handles de rotação para retângulos", () => {
      const rectDrawing: TacticalDrawing = {
        id: "draw-1",
        type: "rect",
        config: {
          color: "#00ffff",
          size: 3,
          lineStyle: "solid",
        },
        points: [{ x: 100, y: 100 }, { x: 200, y: 180 }],
      };

      const bounds = getDrawingBounds(rectDrawing);
      expect(bounds).not.toBeNull();
      expect(bounds?.minX).toBe(100);
      expect(bounds?.maxX).toBe(200);
      expect(bounds?.cx).toBe(150);
      expect(bounds?.cy).toBe(140);
      expect(bounds?.handles.some((h) => h.type === "rotate_shape")).toBe(true);
    });

    it("deve calcular bounding box e handle de raio para círculos", () => {
      const circleDrawing: TacticalDrawing = {
        id: "draw-2",
        type: "circle",
        config: {
          color: "#ffff00",
          size: 3,
          lineStyle: "solid",
        },
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }], // Raio = 50
      };

      const bounds = getDrawingBounds(circleDrawing);
      expect(bounds).not.toBeNull();
      expect(bounds?.cx).toBe(100);
      expect(bounds?.cy).toBe(100);
      expect(bounds?.handles.some((h) => h.type === "radius")).toBe(true);
    });
  });

  describe("findHoveredElement", () => {
    const mockElements: TacticalElement[] = [
      { id: "el-1", type: "home", x: 100, y: 100, label: "7" },
      { id: "el-2", type: "ball", x: 300, y: 300 },
      { id: "el-3", type: "cone", x: 500, y: 500 },
    ];

    it("deve detetar clique em jogador dentro da tolerância de raio (20px)", () => {
      const hovered = findHoveredElement({ x: 105, y: 98 }, mockElements);
      expect(hovered?.id).toBe("el-1");
    });

    it("deve retornar null se o clique for no vazio", () => {
      const hovered = findHoveredElement({ x: 200, y: 200 }, mockElements);
      expect(hovered).toBeNull();
    });
  });
});
