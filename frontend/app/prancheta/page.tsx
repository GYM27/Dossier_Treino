"use client";

import { PranchetaStudio } from "@/components/prancheta/PranchetaStudio";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PranchetaPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col p-2 md:p-3 overflow-hidden">
      <div className="w-full mb-2 flex items-center justify-between px-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      <div className="w-full flex-1 flex flex-col min-h-0">
        <PranchetaStudio />
      </div>
    </div>
  );
}
