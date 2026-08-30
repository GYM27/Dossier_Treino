import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LineEditSection } from "../LineEditSection";
import { TacticalDrawing } from "../../types";

describe("LineEditSection - Edição de Linhas e Traços (TDD)", () => {
  const mockLine: TacticalDrawing = {
    id: "l-1",
    type: "pass",
    points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
    config: {
      color: "#00e5ff",
      size: 2,
      lineStyle: "dashed",
    },
  };

  it("deve renderizar seletores de tipo de linha, estilo de traço e espessura", () => {
    const onUpdateDrawing = vi.fn();

    render(
      <LineEditSection
        drawing={mockLine}
        drawingIndex={0}
        onUpdateDrawing={onUpdateDrawing}
      />
    );

    expect(screen.getByText("Simples")).toBeInTheDocument();
    expect(screen.getByText("Passe")).toBeInTheDocument();
    expect(screen.getByText("Seta")).toBeInTheDocument();
    expect(screen.getByText("Contínua")).toBeInTheDocument();
    expect(screen.getByText("Tracejada")).toBeInTheDocument();
    expect(screen.getAllByText("2px").length).toBeGreaterThanOrEqual(1);
  });

  it("deve disparar onUpdateDrawing ao mudar estilo para contínua", () => {
    const onUpdateDrawing = vi.fn();

    render(
      <LineEditSection
        drawing={mockLine}
        drawingIndex={0}
        onUpdateDrawing={onUpdateDrawing}
      />
    );

    fireEvent.click(screen.getByText("Contínua"));
    expect(onUpdateDrawing).toHaveBeenCalledWith(0, expect.objectContaining({
      config: expect.objectContaining({ lineStyle: "solid" }),
    }));
  });
});
