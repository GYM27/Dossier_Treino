import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TacticalBoard from "../TacticalBoard";

// Mock para HTMLCanvasElementgetContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  clip: vi.fn(),
  closePath: vi.fn(),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
  setLineDash: vi.fn(),
  fillText: vi.fn(),
});

describe("TacticalBoard - Componente Modular (TDD / Integração)", () => {
  it("deve renderizar a área de canvas e as barras de ferramentas quando não for thumbnail", () => {
    render(
      <TacticalBoard
        initialTacticData={{
          meta: { name: "Exercício de Pressão Alta", duration: 15, playersCount: 16 },
        }}
      />
    );

    expect(screen.getByText("Exercício de Pressão Alta")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("16 atletas")).toBeInTheDocument();
  });

  it("deve renderizar em modo miniatura (thumbnail) sem as barras laterais", () => {
    const { container } = render(<TacticalBoard thumbnail={true} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
    expect(screen.queryByText("Exercício de Pressão Alta")).not.toBeInTheDocument();
  });
});
