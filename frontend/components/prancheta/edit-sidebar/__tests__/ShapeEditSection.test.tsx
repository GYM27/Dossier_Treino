import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ShapeEditSection } from "../ShapeEditSection";
import { TacticalDrawing } from "../../types";

describe("ShapeEditSection - Edição de Formas Geométricas (TDD)", () => {
  const mockShape: TacticalDrawing = {
    id: "s-1",
    type: "rect",
    points: [{ x: 10, y: 10 }, { x: 80, y: 80 }],
    config: {
      color: "#00e5ff",
      fillColor: "#ef4444",
      size: 2,
      opacity: 100,
    },
  };

  it("deve renderizar botões de geometria, espessura e opacidade", () => {
    const onUpdateDrawing = vi.fn();

    render(
      <ShapeEditSection
        drawing={mockShape}
        drawingIndex={0}
        onUpdateDrawing={onUpdateDrawing}
      />
    );

    expect(screen.getByTitle("Retângulo")).toBeInTheDocument();
    expect(screen.getByTitle("Círculo")).toBeInTheDocument();
    expect(screen.getByTitle("Triângulo")).toBeInTheDocument();
    expect(screen.getByTitle("Hexágono")).toBeInTheDocument();
    expect(screen.getAllByText("100%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("deve disparar onUpdateDrawing ao alterar a opacidade", () => {
    const onUpdateDrawing = vi.fn();

    render(
      <ShapeEditSection
        drawing={mockShape}
        drawingIndex={0}
        onUpdateDrawing={onUpdateDrawing}
      />
    );

    fireEvent.click(screen.getByText("50%"));
    expect(onUpdateDrawing).toHaveBeenCalledWith(0, expect.objectContaining({
      config: expect.objectContaining({ opacity: 50 }),
    }));
  });
});
