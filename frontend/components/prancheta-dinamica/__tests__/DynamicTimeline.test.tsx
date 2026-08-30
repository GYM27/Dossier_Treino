import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DynamicTimeline } from "../DynamicTimeline";
import { createInitialTree } from "@/models/tacticplay";

describe("DynamicTimeline Component (TDD)", () => {
  it("deve renderizar os controlos de reprodução e o nó do quadro inicial", () => {
    const tree = createInitialTree("bench");
    const onSelectFrame = vi.fn();
    const onTogglePlay = vi.fn();
    const onAddFrame = vi.fn();

    render(
      <DynamicTimeline
        tree={tree}
        isPlaying={false}
        transitionSpeed={1500}
        onSelectFrame={onSelectFrame}
        onTogglePlay={onTogglePlay}
        onPrevFrame={vi.fn()}
        onNextFrame={vi.fn()}
        onAddFrame={onAddFrame}
        onAddAlternative={vi.fn()}
        onDeleteFrame={vi.fn()}
        onChangeSpeed={vi.fn()}
        onUpdateNotes={vi.fn()}
      />
    );

    // Deve exibir o botão de Play
    expect(screen.getByTitle("Reproduzir Animação")).toBeDefined();
    // Deve exibir o nó "Início"
    expect(screen.getByText("Início")).toBeDefined();
  });

  it("deve disparar onTogglePlay ao clicar no botão Play", () => {
    const tree = createInitialTree("bench");
    const onTogglePlay = vi.fn();

    render(
      <DynamicTimeline
        tree={tree}
        isPlaying={false}
        transitionSpeed={1500}
        onSelectFrame={vi.fn()}
        onTogglePlay={onTogglePlay}
        onPrevFrame={vi.fn()}
        onNextFrame={vi.fn()}
        onAddFrame={vi.fn()}
        onAddAlternative={vi.fn()}
        onDeleteFrame={vi.fn()}
        onChangeSpeed={vi.fn()}
        onUpdateNotes={vi.fn()}
      />
    );

    const playBtn = screen.getByTitle("Reproduzir Animação");
    fireEvent.click(playBtn);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
  });
});
