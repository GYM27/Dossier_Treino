import { describe, it, expect } from "vitest";
import {
  createInitialTree,
  getFullPath,
  interpolateElements,
  calculateScaledCoordinates,
  addFrameToTree,
  addAlternativeToTree,
  deleteFrameFromTree,
  TacticalElement,
  TacticalFrame,
} from "../tacticplay";

describe("TacticPlay Models & Pure Functions (TDD)", () => {
  describe("createInitialTree", () => {
    it("deve criar uma árvore inicial válida com o nó 'root'", () => {
      const tree = createInitialTree();

      expect(tree.rootId).toBe("root");
      expect(tree.activePath).toEqual(["root"]);
      expect(tree.currentFrameIdx).toBe(0);
      expect(tree.framesMap["root"]).toBeDefined();
      expect(tree.framesMap["root"].id).toBe("root");
      expect(tree.framesMap["root"].name).toBe("Início");
      expect(tree.framesMap["root"].parentId).toBeNull();
      expect(tree.framesMap["root"].children).toEqual([]);
      expect(Array.isArray(tree.framesMap["root"].elements)).toBe(true);
    });

    it("deve carregar os 22 jogadores no banco quando o preset for 'bench'", () => {
      const tree = createInitialTree("bench");
      const elements = tree.framesMap["root"].elements;

      const homePlayers = elements.filter((e) => e.type === "home");
      const awayPlayers = elements.filter((e) => e.type === "away");

      expect(homePlayers.length).toBe(11);
      expect(awayPlayers.length).toBe(11);
      expect(homePlayers[0].number).toBe(1);
      expect(awayPlayers[0].number).toBe(1);
    });
  });

  describe("getFullPath", () => {
    it("deve reconstruir o caminho sequencial da raiz até uma folha", () => {
      const framesMap: Record<string, TacticalFrame> = {
        root: { id: "root", name: "Início", elements: [], children: ["frame-1"], parentId: null },
        "frame-1": { id: "frame-1", name: "Quadro 2", elements: [], children: ["frame-2"], parentId: "root" },
        "frame-2": { id: "frame-2", name: "Quadro 3", elements: [], children: [], parentId: "frame-1" },
      };

      const path = getFullPath("frame-2", framesMap);
      expect(path).toEqual(["root", "frame-1", "frame-2"]);
    });

    it("deve devolver apenas a raiz quando solicitado o caminho do próprio root", () => {
      const framesMap: Record<string, TacticalFrame> = {
        root: { id: "root", name: "Início", elements: [], children: [], parentId: null },
      };

      const path = getFullPath("root", framesMap);
      expect(path).toEqual(["root"]);
    });
  });

  describe("interpolateElements", () => {
    it("deve calcular a interpolação linear precisa entre dois quadros", () => {
      const startElements: TacticalElement[] = [
        { id: "H1", type: "home", number: 1, x: 100, y: 100 },
        { id: "B1", type: "ball", x: 200, y: 200 },
      ];

      const endElements: TacticalElement[] = [
        { id: "H1", type: "home", number: 1, x: 200, y: 300 },
        { id: "B1", type: "ball", x: 400, y: 600 },
      ];

      // Teste a meio caminho (progress = 0.5)
      const mid = interpolateElements(startElements, endElements, 0.5);

      expect(mid).toHaveLength(2);
      expect(mid[0].x).toBe(150); // 100 + (200 - 100) * 0.5
      expect(mid[0].y).toBe(200); // 100 + (300 - 100) * 0.5
      expect(mid[1].x).toBe(300); // 200 + (400 - 200) * 0.5
      expect(mid[1].y).toBe(400); // 200 + (600 - 200) * 0.5
    });

    it("deve devolver a posição inicial quando progress for 0.0", () => {
      const startElements: TacticalElement[] = [{ id: "H1", type: "home", number: 1, x: 50, y: 50 }];
      const endElements: TacticalElement[] = [{ id: "H1", type: "home", number: 1, x: 150, y: 250 }];

      const result = interpolateElements(startElements, endElements, 0);
      expect(result[0].x).toBe(50);
      expect(result[0].y).toBe(50);
    });

    it("deve manter elementos que só existem no quadro inicial sem quebrar", () => {
      const startElements: TacticalElement[] = [
        { id: "H1", type: "home", number: 1, x: 50, y: 50 },
        { id: "C1", type: "cone", x: 80, y: 90 },
      ];
      const endElements: TacticalElement[] = [{ id: "H1", type: "home", number: 1, x: 150, y: 150 }];

      const result = interpolateElements(startElements, endElements, 0.5);
      expect(result).toHaveLength(2);
      expect(result.find((e) => e.id === "C1")?.x).toBe(80);
    });
  });

  describe("calculateScaledCoordinates", () => {
    it("deve converter coordenadas do ecrã para as coordenadas afins 1000x625", () => {
      const rect = { left: 100, top: 50, width: 500, height: 312.5 }; // Escala 2x menor
      const pointerX = 350; // Metade do elemento
      const pointerY = 206.25;

      const coords = calculateScaledCoordinates(pointerX, pointerY, rect, 1000, 625);

      expect(coords.x).toBe(500);
      expect(coords.y).toBe(312.5);
    });
  });

  describe("addFrameToTree & addAlternativeToTree", () => {
    it("deve adicionar um quadro sequencial e avançar o activePath", () => {
      const tree = createInitialTree();
      const updated = addFrameToTree(tree, "Quadro 2", [{ id: "H1", type: "home", number: 1, x: 200, y: 200 }]);

      expect(updated.activePath.length).toBe(2);
      expect(updated.currentFrameIdx).toBe(1);
      const newFrameId = updated.activePath[1];
      expect(updated.framesMap[newFrameId].name).toBe("Quadro 2");
      expect(updated.framesMap["root"].children).toContain(newFrameId);
    });

    it("deve criar uma alternativa (ramificação) a partir do nó atual", () => {
      const tree = createInitialTree();
      const treeComQ2 = addFrameToTree(tree, "Quadro 2", []);

      // Voltar ao root e criar uma alternativa para a jogada
      const treeNoRoot = { ...treeComQ2, currentFrameIdx: 0 };
      const treeComAlt = addAlternativeToTree(treeNoRoot, "Opção B - Passe Curto", []);

      expect(treeComAlt.framesMap["root"].children.length).toBe(2);
      expect(treeComAlt.activePath[1]).not.toBe(treeComQ2.activePath[1]);
      const altFrameId = treeComAlt.activePath[1];
      expect(treeComAlt.framesMap[altFrameId].name).toBe("Opção B - Passe Curto");
    });
  });

  describe("deleteFrameFromTree", () => {
    it("deve eliminar o quadro atual e recuar o activePath para o nó pai", () => {
      const tree = createInitialTree();
      const treeComQ2 = addFrameToTree(tree, "Quadro 2", []);
      const frameToDelete = treeComQ2.activePath[1];

      const treeAposDelete = deleteFrameFromTree(treeComQ2, frameToDelete);

      expect(treeAposDelete.activePath).toEqual(["root"]);
      expect(treeAposDelete.currentFrameIdx).toBe(0);
      expect(treeAposDelete.framesMap["root"].children).not.toContain(frameToDelete);
      expect(treeAposDelete.framesMap[frameToDelete]).toBeUndefined();
    });

    it("não deve permitir eliminar o nó 'root'", () => {
      const tree = createInitialTree();
      const resultado = deleteFrameFromTree(tree, "root");

      expect(resultado).toEqual(tree);
    });
  });
});
