"use client";

import { PranchetaStudio } from "@/components/prancheta/PranchetaStudio";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PranchetaPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col p-4 md:p-8">
      <div className="max-w-[1600px] w-full mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      <div className="max-w-[1600px] w-full mx-auto flex-1">
        <PranchetaStudio />
      </div>
    </div>
  );
}
