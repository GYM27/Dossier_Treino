"use client";

import React, { Suspense } from "react";
import { PranchetaStudio } from "@/components/prancheta/PranchetaStudio";
import Link from "next/link";
import { ArrowLeft, Dumbbell, LayoutDashboard } from "lucide-react";

export default function PranchetaPage() {
  return (
    <div className="h-screen max-h-screen w-screen max-w-full bg-[#070b14] flex flex-col p-1.5 md:p-2 overflow-hidden">
      <div className="w-full mb-1.5 flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/treinos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Voltar aos Treinos</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col min-h-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#070b14] text-slate-500 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar estúdio tático...</span>
            </div>
          }
        >
          <PranchetaStudio />
        </Suspense>
      </div>
    </div>
  );
}
