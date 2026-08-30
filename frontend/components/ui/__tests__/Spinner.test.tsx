import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Componente Spinner (Loading Indicator)", () => {
  it("deve renderizar com as classes padrão (tamanho md, cor cyan)", () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstChild as HTMLElement;

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
    expect(spinner).toHaveClass("w-5");
    expect(spinner).toHaveClass("h-5");
    expect(spinner).toHaveClass("border-cyan-500");
  });

  it("deve aplicar tamanho sm, md e lg corretamente via mapeamento estático", () => {
    const { container: smContainer } = render(<Spinner size="sm" />);
    expect(smContainer.firstChild).toHaveClass("w-3.5", "h-3.5");

    const { container: lgContainer } = render(<Spinner size="lg" />);
    expect(lgContainer.firstChild).toHaveClass("w-6", "h-6");
  });

  it("deve aplicar cores estáticas corretas (white, primary, slate)", () => {
    const { container: whiteContainer } = render(<Spinner color="white" />);
    expect(whiteContainer.firstChild).toHaveClass("border-white");

    const { container: primaryContainer } = render(<Spinner color="primary" />);
    expect(primaryContainer.firstChild).toHaveClass("border-primary");

    const { container: slateContainer } = render(<Spinner color="slate" />);
    expect(slateContainer.firstChild).toHaveClass("border-slate-950");
  });

  it("deve permitir injetar classes adicionais via prop className", () => {
    const { container } = render(<Spinner className="mr-2 opacity-80" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass("mr-2", "opacity-80");
  });
});
