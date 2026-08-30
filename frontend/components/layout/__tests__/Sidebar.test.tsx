import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

// Mock do hook usePathname do Next.js
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/plantel"),
}));

describe("Sidebar (TDD)", () => {
  it("deve renderizar todos os itens de navegação principais", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Clube/i })).toHaveAttribute("href", "/clube");
    expect(screen.getByRole("link", { name: /Plantel/i })).toHaveAttribute("href", "/plantel");
    expect(screen.getByRole("link", { name: /Calendário/i })).toHaveAttribute("href", "/calendario");
    expect(screen.getByRole("link", { name: /Planos de Treino/i })).toHaveAttribute("href", "/treinos");
    expect(screen.getByRole("link", { name: /^Prancheta Tática$/i })).toHaveAttribute("href", "/prancheta");
    expect(screen.getByRole("link", { name: /Prancheta Dinâmica/i })).toHaveAttribute("href", "/prancheta-dinamica");
    expect(screen.getByRole("link", { name: /Assiduidade/i })).toHaveAttribute("href", "/assiduidade");
    expect(screen.getByRole("link", { name: /Scouting/i })).toHaveAttribute("href", "/scouting");
    expect(screen.getByRole("link", { name: /Configurações/i })).toHaveAttribute("href", "/config");
  });

  it("deve destacar o item ativo correspondente ao pathname atual", () => {
    render(<Sidebar />);

    const activeLink = screen.getByRole("link", { name: /Plantel/i });
    expect(activeLink.className).toContain("bg-primary/10");
  });
});
