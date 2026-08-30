import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "../ConfirmDialog";

describe("Componente ConfirmDialog (Modal de Confirmação)", () => {
  it("não deve renderizar quando isOpen for false", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Eliminar Exercício"
        description="Tem a certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText("Eliminar Exercício")).not.toBeInTheDocument();
  });

  it("deve renderizar o título, descrição e botões quando isOpen for true", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Eliminar Exercício"
        description="Esta ação não pode ser revertida."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Eliminar Exercício")).toBeInTheDocument();
    expect(screen.getByText("Esta ação não pode ser revertida.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("deve chamar onConfirm ao clicar no botão de confirmação", () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Remover Pasta"
        description="Deseja continuar?"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onCancel ao clicar no botão de cancelar", () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Remover Pasta"
        description="Deseja continuar?"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar botões quando isLoading for true", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="A eliminar..."
        description="Aguarde"
        isLoading={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
