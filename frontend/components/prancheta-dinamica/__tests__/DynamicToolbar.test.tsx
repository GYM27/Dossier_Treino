import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DynamicToolbar } from "../DynamicToolbar";

describe("DynamicToolbar Component (TDD)", () => {
  it("deve renderizar os botões de ferramentas de desenho e peças", () => {
    const onSetDrawingMode = vi.fn();
    const onAddPlayer = vi.fn();

    render(
      <DynamicToolbar
        drawingMode="select"
        pitchStyle="full"
        isEditMode={true}
        canUndo={false}
        canRedo={false}
        onSetDrawingMode={onSetDrawingMode}
        onSetPitchStyle={vi.fn()}
        onToggleEditMode={vi.fn()}
        onAddPlayer={onAddPlayer}
        onAddBall={vi.fn()}
        onAddCone={vi.fn()}
        onClearDrawings={vi.fn()}
        onLoadPreset={vi.fn()}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    expect(screen.getByTitle("Modo Seleção")).toBeDefined();
    expect(screen.getByTitle("Traçar Linha de Passe")).toBeDefined();
    expect(screen.getByTitle("Traçar Linha de Corrida")).toBeDefined();
    expect(screen.getByTitle("Adicionar Jogador Equipa Principal (Amarelo)")).toBeDefined();
  });

  it("deve disparar onSetDrawingMode ao clicar numa ferramenta de traço", () => {
    const onSetDrawingMode = vi.fn();

    render(
      <DynamicToolbar
        drawingMode="select"
        pitchStyle="full"
        isEditMode={true}
        canUndo={false}
        canRedo={false}
        onSetDrawingMode={onSetDrawingMode}
        onSetPitchStyle={vi.fn()}
        onToggleEditMode={vi.fn()}
        onAddPlayer={vi.fn()}
        onAddBall={vi.fn()}
        onAddCone={vi.fn()}
        onClearDrawings={vi.fn()}
        onLoadPreset={vi.fn()}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const passBtn = screen.getByTitle("Traçar Linha de Passe");
    fireEvent.click(passBtn);
    expect(onSetDrawingMode).toHaveBeenCalledWith("pass");
  });
});
