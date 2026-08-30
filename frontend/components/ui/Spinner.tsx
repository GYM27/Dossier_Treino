import React from "react";
import { cn } from "@/lib/utils";

/**
 * Mapeamento estático de tamanhos.
 * Usamos strings literais para garantir que o analisador do Tailwind CSS
 * detete e preserve todas as classes durante o purge de produção.
 */
const SIZE_MAP = {
  sm: "w-3.5 h-3.5 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-6 h-6 border-2",
  xl: "size-8 border-2",
} as const;

/**
 * Mapeamento estático de cores.
 * NUNCA usar interpolações de strings como `border-${color}-500`,
 * pois o compilador do Tailwind não consegue resolver em tempo de build.
 */
const COLOR_MAP = {
  cyan: "border-cyan-500 border-t-transparent",
  white: "border-white border-t-transparent",
  primary: "border-primary border-t-transparent",
  slate: "border-slate-950 border-t-transparent",
} as const;

export type SpinnerSize = keyof typeof SIZE_MAP;
export type SpinnerColor = keyof typeof COLOR_MAP;

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

/**
 * Spinner — Indicador de carregamento universal, modular e com classes Tailwind estáticas.
 */
export function Spinner({ size = "md", color = "cyan", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="A carregar..."
      className={cn(
        "rounded-full animate-spin shrink-0",
        SIZE_MAP[size],
        COLOR_MAP[color],
        className
      )}
    />
  );
}
