import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TacticalEditSidebar } from "../../TacticalEditSidebar";
import { TacticalDrawing, TacticalElement } from "../../types";

describe("TacticalEditSidebar - Orquestração e Delegação (TDD)", () => {
  it("deve renderizar a edição de jogador quando um jogador está selecionado", () => {
    const player: TacticalElement = {
      id: "p-1",
      type: "home",
      x: 100,
      y: 100,
      label: "10",
      number: 10,
    };

    render(
      <TacticalEditSidebar
        selectedDrawing={null}
        selectedDrawingIdx={null}
        selectedElement={player}
        onUpdateDrawing={vi.fn()}
        onDeleteDrawing={vi.fn()}
        onDuplicateDrawing={vi.fn()}
        onUpdateElement={vi.fn()}
        onDeleteElement={vi.fn()}
        onDuplicateElement={vi.fn()}
        onRotateElement={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Editar Jogador")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByText("Duplicar")).toBeInTheDocument();
    expect(screen.getByText("Apagar")).toBeInTheDocument();
  });

  it("deve renderizar a edição de linha quando uma linha está selecionada", () => {
    const line: TacticalDrawing = {
      id: "l-1",
      type: "pass",
      points: [{ x: 0, y: 0 }, { x: 50, y: 50 }],
    };

    render(
      <TacticalEditSidebar
        selectedDrawing={line}
        selectedDrawingIdx={0}
        selectedElement={null}
        onUpdateDrawing={vi.fn()}
        onDeleteDrawing={vi.fn()}
        onDuplicateDrawing={vi.fn()}
        onUpdateElement={vi.fn()}
        onDeleteElement={vi.fn()}
        onDuplicateElement={vi.fn()}
        onRotateElement={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Editar Linha")).toBeInTheDocument();
    expect(screen.getByText("Simples")).toBeInTheDocument();
  });
});
