import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTacticalPlay } from "../useTacticalPlay";

describe("useTacticalPlay Hook - Gestão de Estado da Prancheta Dinâmica (TDD)", () => {
  it("deve inicializar com o estado padrão, árvore root e ferramentas de seleção", () => {
    const { result } = renderHook(() => useTacticalPlay({ initialPreset: "bench" }));

    expect(result.current.tree.rootId).toBe("root");
    expect(result.current.currentFrameIdx).toBe(0);
    expect(result.current.currentFrame.id).toBe("root");
    expect(result.current.currentFrame.name).toBe("Início");
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.drawingMode).toBe("select");
    expect(result.current.pitchStyle).toBe("full");
    expect(result.current.currentElements.length).toBeGreaterThan(0);
  });

  it("deve adicionar jogador da Equipa Casa com número incremental", () => {
    const { result } = renderHook(() => useTacticalPlay({ initialPreset: "bench" }));

    const initialHomeCount = result.current.currentElements.filter((e) => e.type === "home").length;

    act(() => {
      result.current.addPlayer("home");
    });

    const newHomeCount = result.current.currentElements.filter((e) => e.type === "home").length;
    expect(newHomeCount).toBe(initialHomeCount + 1);

    const addedPlayer = result.current.currentElements[result.current.currentElements.length - 1];
    expect(addedPlayer.type).toBe("home");
    expect(addedPlayer.number).toBe(12); // banco tinha 1 a 11
  });

  it("deve adicionar uma bola de futebol ao campo se ainda não existir", () => {
    const { result } = renderHook(() => useTacticalPlay());

    // Se já tiver bola, removemos primeiro para testar adição
    const ball = result.current.currentElements.find((e) => e.type === "ball");
    if (ball) {
      act(() => {
        result.current.removeElement(ball.id);
      });
    }

    act(() => {
      result.current.addBall();
    });

    const balls = result.current.currentElements.filter((e) => e.type === "ball");
    expect(balls.length).toBe(1);
    expect(balls[0].type).toBe("ball");
  });

  it("deve adicionar um novo quadro sequencial (Keyframe) na árvore", () => {
    const { result } = renderHook(() => useTacticalPlay({ initialPreset: "bench" }));

    act(() => {
      result.current.addAnimationFrame();
    });

    expect(result.current.tree.activePath.length).toBe(2);
    expect(result.current.currentFrameIdx).toBe(1);
    expect(result.current.currentFrame.name).toBe("Quadro 2");
    expect(result.current.currentFrame.parentId).toBe("root");
  });

  it("deve criar uma ramificação/alternativa tática a partir do nó atual", () => {
    const { result } = renderHook(() => useTacticalPlay({ initialPreset: "bench" }));

    // Cria Quadro 2 normal
    act(() => {
      result.current.addAnimationFrame();
    });

    // Volta ao Quadro 1 (root) e cria uma alternativa "Opção B"
    act(() => {
      result.current.selectFrame(0);
    });

    act(() => {
      result.current.addAlternativeFrame("Opção B - Passe Desmarque");
    });

    expect(result.current.currentFrame.name).toBe("Opção B - Passe Desmarque");
    expect(result.current.tree.framesMap["root"].children.length).toBe(2);
    expect(result.current.currentFrameIdx).toBe(1);
  });

  it("deve mover um jogador e propagar o deslocamento para os quadros filhos", () => {
    const { result } = renderHook(() => useTacticalPlay({ initialPreset: "bench" }));

    // Criar Quadro 2
    act(() => {
      result.current.addAnimationFrame();
    });

    // Voltar à raiz (Quadro 1) e mover o jogador H1
    act(() => {
      result.current.selectFrame(0);
      result.current.updateElementPosition("H1", 200, 300, true);
    });

    // Verificar posição no Quadro 1
    const h1Frame0 = result.current.currentElements.find((e) => e.id === "H1");
    expect(h1Frame0?.x).toBe(200);
    expect(h1Frame0?.y).toBe(300);

    // Navegar para o Quadro 2 e verificar se a propagação ocorreu
    act(() => {
      result.current.selectFrame(1);
    });

    const h1Frame1 = result.current.currentElements.find((e) => e.id === "H1");
    expect(h1Frame1?.x).toBe(200);
    expect(h1Frame1?.y).toBe(300);
  });

  it("deve alternar a reprodução da animação (Play / Pause)", () => {
    const { result } = renderHook(() => useTacticalPlay());

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.togglePlayback();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlayback();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("deve suportar Undo e Redo de ações", () => {
    const { result } = renderHook(() => useTacticalPlay());

    act(() => {
      result.current.addCone();
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    const conesAfterUndo = result.current.currentElements.filter((e) => e.type === "cone");
    expect(conesAfterUndo.length).toBe(0);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    const conesAfterRedo = result.current.currentElements.filter((e) => e.type === "cone");
    expect(conesAfterRedo.length).toBe(1);
  });
});
