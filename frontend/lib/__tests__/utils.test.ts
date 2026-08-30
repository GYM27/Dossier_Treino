import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("Função utilitária cn (ClassNames Merger)", () => {
  it("deve juntar classes estáticas simples", () => {
    const resultado = cn("px-4", "py-2", "text-white");
    expect(resultado).toBe("px-4 py-2 text-white");
  });

  it("deve resolver conflitos de classes Tailwind usando twMerge (última prevalece)", () => {
    const resultado = cn("px-2", "px-4");
    expect(resultado).toBe("px-4");
  });

  it("deve lidar com valores condicionais falsy (null, undefined, false)", () => {
    const isHidden = false;
    const isSpecial = true;
    const resultado = cn(
      "base-class",
      isHidden && "hidden",
      isSpecial && "bg-primary",
      undefined,
      null
    );
    expect(resultado).toBe("base-class bg-primary");
  });
});
