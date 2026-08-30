import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GoalEditSection } from "../GoalEditSection";
import { TacticalElement } from "../../types";

describe("GoalEditSection - Edição de Balizas (TDD)", () => {
  const mockGoal: TacticalElement = {
    id: "g-1",
    type: "mini_goal",
    x: 50,
    y: 50,
    goalSize: "mini",
    rotation: 0,
  };

  it("deve renderizar opções de tamanho da baliza e botões de rotação", () => {
    const onUpdateElement = vi.fn();
    const onRotateElement = vi.fn();

    render(
      <GoalEditSection
        element={mockGoal}
        onUpdateElement={onUpdateElement}
        onRotateElement={onRotateElement}
      />
    );

    expect(screen.getByText("Mini")).toBeInTheDocument();
    expect(screen.getByText("Fut 7")).toBeInTheDocument();
    expect(screen.getByText("Fut 11")).toBeInTheDocument();
    expect(screen.getByText("+90° (R)")).toBeInTheDocument();
  });

  it("deve disparar onUpdateElement com goalSize fut11", () => {
    const onUpdateElement = vi.fn();
    const onRotateElement = vi.fn();

    render(
      <GoalEditSection
        element={mockGoal}
        onUpdateElement={onUpdateElement}
        onRotateElement={onRotateElement}
      />
    );

    fireEvent.click(screen.getByText("Fut 11"));
    expect(onUpdateElement).toHaveBeenCalledWith({ goalSize: "fut11" });
  });

  it("deve disparar onRotateElement ao clicar no botão +90°", () => {
    const onUpdateElement = vi.fn();
    const onRotateElement = vi.fn();

    render(
      <GoalEditSection
        element={mockGoal}
        onUpdateElement={onUpdateElement}
        onRotateElement={onRotateElement}
      />
    );

    fireEvent.click(screen.getByText("+90° (R)"));
    expect(onRotateElement).toHaveBeenCalled();
  });
});
