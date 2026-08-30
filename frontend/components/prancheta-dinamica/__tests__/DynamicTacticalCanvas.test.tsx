import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { DynamicTacticalCanvas } from "../DynamicTacticalCanvas";
import { createInitialTree } from "@/models/tacticplay";

describe("DynamicTacticalCanvas Component (TDD)", () => {
  it("deve renderizar o elemento canvas com a resolução nativa 1000x625", () => {
    const tree = createInitialTree("bench");
    const currentFrame = tree.framesMap["root"];

    const { container } = render(
      <DynamicTacticalCanvas
        tree={tree}
        currentFrame={currentFrame}
        pitchStyle="full"
        isPlaying={false}
        transitionSpeed={1500}
        drawingMode="select"
        isEditMode={true}
        selectedElementId={null}
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("width")).toBe("1000");
    expect(canvas?.getAttribute("height")).toBe("625");
  });
});
