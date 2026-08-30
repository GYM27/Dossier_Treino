import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { PranchetaDinamicaStudio } from "../PranchetaDinamicaStudio";

describe("PranchetaDinamicaStudio Orchestrator (TDD)", () => {
  it("deve renderizar o cabeçalho com o nome da jogada, barra de ferramentas, canvas e timeline", () => {
    render(<PranchetaDinamicaStudio initialPreset="bench" />);

    // Deve exibir o campo de nome da jogada
    expect(screen.getByPlaceholderText("Nome da Jogada Tática...")).toBeDefined();
    // Deve exibir botão de exportação de vídeo
    expect(screen.getByText("Exportar Vídeo")).toBeDefined();
    // Deve exibir a timeline com o nó "Início"
    expect(screen.getByText("Início")).toBeDefined();
  });
});
