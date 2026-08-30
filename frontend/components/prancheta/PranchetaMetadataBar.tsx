"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Exercicio } from "@/models/exercicio";
import { PastaItem, buildHierarchicalOptions } from "@/models/pasta";
import { Input } from "@/components/ui/input";

interface PranchetaMetadataBarProps {
  show: boolean;
  nome: string;
  setNome: (nome: string) => void;
  pasta: string;
  setPasta: (pasta: string) => void;
  pastas: PastaItem[];
  categoria: Exercicio["categoria"];
  setCategoria: (cat: Exercicio["categoria"]) => void;
  espaco: string;
  setEspaco: (espaco: string) => void;
  tempo: string;
  setTempo: (tempo: string) => void;
  jogadoresEnvolvidos: number;
  setJogadoresEnvolvidos: (num: number) => void;
  nivelDificuldade: number;
  setNivelDificuldade: (lvl: number) => void;
}

export function PranchetaMetadataBar({
  show,
  nome,
  setNome,
  pasta,
  setPasta,
  pastas,
  categoria,
  setCategoria,
  espaco,
  setEspaco,
  tempo,
  setTempo,
  jogadoresEnvolvidos,
  setJogadoresEnvolvidos,
  nivelDificuldade,
  setNivelDificuldade,
}: PranchetaMetadataBarProps) {
  if (!show) return null;

  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 p-2.5 px-4 shrink-0 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
        {/* Nome do Exercício */}
        <div className="md:col-span-3 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Nome do Exercício *
          </label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Saída de Pressão 3v2"
            className="text-xs h-8 bg-[#162032]"
          />
        </div>

        {/* Pasta */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            📁 Pasta
          </label>
          <select
            value={pasta}
            onChange={(e) => setPasta(e.target.value)}
            className="w-full bg-[#162032] border border-amber-500/30 rounded-lg px-2.5 h-8 text-xs text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
          >
            {buildHierarchicalOptions(pastas).map((opt) => (
              <option key={opt.id} value={opt.nome}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as any)}
            className="w-full bg-[#162032] border border-slate-700/80 rounded-lg px-2.5 h-8 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="AQUECIMENTO">Aquecimento</option>
            <option value="TECNICO">Técnico</option>
            <option value="TATICO">Tático</option>
            <option value="FISICO">Físico</option>
            <option value="GUARDA_REDES">Guarda-Redes</option>
            <option value="LUDICO">Lúdico</option>
          </select>
        </div>

        {/* Espaço */}
        <div className="md:col-span-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Espaço
          </label>
          <Input
            value={espaco}
            onChange={(e) => setEspaco(e.target.value)}
            placeholder="Ex: 50x40m"
            className="text-xs h-8 bg-[#162032]"
          />
        </div>

        {/* Tempo */}
        <div className="md:col-span-1 space-y-1">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
            Tempo
          </label>
          <Input
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            placeholder="Ex: 15 min"
            className="text-xs h-8 bg-[#162032] text-cyan-200 border-cyan-500/30 font-semibold"
          />
        </div>

        {/* Nº Jogadores */}
        <div className="md:col-span-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Atletas
          </label>
          <Input
            type="number"
            min={1}
            max={40}
            value={jogadoresEnvolvidos}
            onChange={(e) => setJogadoresEnvolvidos(parseInt(e.target.value) || 14)}
            className="text-xs font-mono h-8 bg-[#162032]"
          />
        </div>

        {/* Dificuldade */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Dificuldade (1-5)
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setNivelDificuldade(lvl)}
                className={cn(
                  "flex-1 h-8 rounded-lg text-xs font-bold transition-all",
                  nivelDificuldade >= lvl
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
