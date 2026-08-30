import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CatalogoExerciseCard } from "../CatalogoExerciseCard";
import { Exercicio } from "@/models/exercicio";

describe("CatalogoExerciseCard - Card de Exercício no Catálogo de Treinos (TDD)", () => {
  const mockExercicio: Exercicio = {
    id: "ex-123",
    nome: "Rondo de Posse 4v2",
    categoria: "TATICO",
    tempo: 15,
    jogadoresEnvolvidos: 6,
    espaco: "20x20m",
    descricao: "Manutenção de posse sob pressão com 2 toques",
    nivelDificuldade: 3,
  };

  it("deve renderizar o nome do exercício, tempo, jogadores e espaço", () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <CatalogoExerciseCard
        exercicio={mockExercicio}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("Rondo de Posse 4v2")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("6 jogadores")).toBeInTheDocument();
    expect(screen.getByText("20x20m")).toBeInTheDocument();
    expect(screen.getByText("Tático")).toBeInTheDocument();
  });

  it("deve disparar onSelect ao clicar no card", () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <CatalogoExerciseCard
        exercicio={mockExercicio}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByText("Rondo de Posse 4v2"));
    expect(onSelect).toHaveBeenCalledWith(mockExercicio);
  });

  it("deve disparar onDelete ao clicar no botão de eliminar", () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <CatalogoExerciseCard
        exercicio={mockExercicio}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

    const btnDelete = screen.getByTitle("Eliminar exercício");
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalled();
  });
});
