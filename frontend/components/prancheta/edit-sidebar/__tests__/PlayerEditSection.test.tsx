import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PlayerEditSection } from "../PlayerEditSection";
import { TacticalElement } from "../../types";

describe("PlayerEditSection - Edição de Jogador (TDD)", () => {
  const mockPlayer: TacticalElement = {
    id: "p-1",
    type: "home",
    x: 100,
    y: 100,
    number: 10,
    label: "10",
    color: "#facc15",
    size: "md",
  };

  it("deve renderizar campos de camisola, tamanho e cores", () => {
    const onUpdateElement = vi.fn();

    render(<PlayerEditSection element={mockPlayer} onUpdateElement={onUpdateElement} />);

    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByText("Pequeno")).toBeInTheDocument();
    expect(screen.getByText("Médio")).toBeInTheDocument();
    expect(screen.getByText("Grande")).toBeInTheDocument();
  });

  it("deve disparar onUpdateElement ao alterar o número da camisola", () => {
    const onUpdateElement = vi.fn();

    render(<PlayerEditSection element={mockPlayer} onUpdateElement={onUpdateElement} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "7" } });

    expect(onUpdateElement).toHaveBeenCalledWith({
      label: "7",
      number: 7,
    });
  });

  it("deve disparar onUpdateElement ao selecionar tamanho pequeno", () => {
    const onUpdateElement = vi.fn();

    render(<PlayerEditSection element={mockPlayer} onUpdateElement={onUpdateElement} />);

    const btnSm = screen.getByText("Pequeno");
    fireEvent.click(btnSm);

    expect(onUpdateElement).toHaveBeenCalledWith({ size: "sm" });
  });
});
