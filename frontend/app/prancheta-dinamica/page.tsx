"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";
import { Dumbbell, LayoutDashboard, Sparkles } from "lucide-react";

// Importação dinâmica do Estúdio da Prancheta Dinâmica para evitar erros de SSR com Canvas HTML5 e MediaRecorder
const PranchetaDinamicaStudio = dynamic(
  () =>
    import("@/components/prancheta-dinamica/PranchetaDinamicaStudio").then(
      (m) => m.PranchetaDinamicaStudio
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b14] text-slate-400 text-xs gap-3">
        <Spinner size="lg" color="cyan" />
        <span className="font-semibold tracking-wide">
          A inicializar o motor dinâmico e aceleração gráfica...
        </span>
      </div>
    ),
  }
);

export default function PranchetaDinamicaPage() {
  return (
    <div className="h-screen max-h-screen w-screen max-w-full bg-[#070b14] flex flex-col p-1.5 md:p-2 overflow-hidden select-none">
      {/* Barra Superior de Acesso Rápido */}
      <div className="w-full mb-1 flex items-center justify-between px-1 shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <Link
            href="/treinos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Voltar aos Treinos</span>
          </Link>

          <Link
            href="/prancheta"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prancheta Estática</span>
          </Link>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Conteúdo Principal Fullscreen: Estúdio Dinâmico */}
      <div className="w-full flex-1 flex flex-col min-h-0 relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#070b14] text-slate-500 text-xs gap-2">
              <Spinner size="md" color="cyan" />
              <span>A carregar estúdio tático dinâmico...</span>
            </div>
          }
        >
          <PranchetaDinamicaStudio />
        </Suspense>
      </div>
    </div>
  );
}
