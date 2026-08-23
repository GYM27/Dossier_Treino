import React from "react";
import { Input } from "@/components/ui/input";
import { Users, Flame, Boxes, Target, CalendarDays, Layers, Zap } from "lucide-react";

interface TreinoStudioMetadataFormProps {
  isEditing: boolean;
  objetivo: string;
  setObjetivo: (val: string) => void;
  numeroJogadores: number;
  setNumeroJogadores: (val: number) => void;
  intensidade: number;
  setIntensidade: (val: number) => void;
  material: string;
  setMaterial: (val: string) => void;
  mesociclo: number;
  setMesociclo: (val: number) => void;
  microciclo: number;
  setMicrociclo: (val: number) => void;
  unidadeTreino: number;
  setUnidadeTreino: (val: number) => void;
}

export function TreinoStudioMetadataForm({
  isEditing,
  objetivo,
  setObjetivo,
  numeroJogadores,
  setNumeroJogadores,
  intensidade,
  setIntensidade,
  material,
  setMaterial,
  mesociclo,
  setMesociclo,
  microciclo,
  setMicrociclo,
  unidadeTreino,
  setUnidadeTreino,
}: TreinoStudioMetadataFormProps) {
  return (
    <section className="bg-[#111827] border border-slate-800/80 rounded-xl p-4 shadow-md space-y-4">
      {/* Linha 1: Hierarquia de Periodização e Intensidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d131f] p-3 rounded-lg border border-slate-800/60">
        {/* Mesociclo */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Mesociclo (Bloco)</span>
          </label>
          {isEditing ? (
            <Input
              type="number"
              min={1}
              value={mesociclo}
              onChange={(e) => setMesociclo(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 text-xs font-mono font-bold bg-[#162032] border-blue-500/30 text-blue-200"
            />
          ) : (
            <div className="h-8 bg-[#162032] px-3 rounded-lg border border-blue-500/20 flex items-center">
              <span className="text-xs font-mono font-bold text-blue-300">Mesociclo #{mesociclo || 1}</span>
            </div>
          )}
        </div>

        {/* Microciclo */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-cyan-400" />
            <span>Microciclo (Semana)</span>
          </label>
          {isEditing ? (
            <Input
              type="number"
              min={1}
              value={microciclo}
              onChange={(e) => setMicrociclo(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 text-xs font-mono font-bold bg-[#162032] border-cyan-500/30 text-cyan-200"
            />
          ) : (
            <div className="h-8 bg-[#162032] px-3 rounded-lg border border-cyan-500/20 flex items-center">
              <span className="text-xs font-mono font-bold text-cyan-300">Microciclo #{microciclo || 1}</span>
            </div>
          )}
        </div>

        {/* Unidade de Treino (UT) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Unidade de Treino (UT)</span>
          </label>
          {isEditing ? (
            <Input
              type="number"
              min={1}
              value={unidadeTreino}
              onChange={(e) => setUnidadeTreino(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 text-xs font-mono font-bold bg-[#162032] border-amber-500/30 text-amber-200"
            />
          ) : (
            <div className="h-8 bg-[#162032] px-3 rounded-lg border border-amber-500/20 flex items-center">
              <span className="text-xs font-mono font-bold text-amber-300">Treino - UT #{unidadeTreino || 1}</span>
            </div>
          )}
        </div>

        {/* Intensidade */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Intensidade (1-5)</span>
          </label>
          {isEditing ? (
            <div className="flex items-center gap-1 h-8">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensidade(lvl)}
                  className={`flex-1 h-full rounded text-xs font-bold font-mono transition-all ${
                    intensidade === lvl
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-[#162032] text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          ) : (
            <div className="h-8 bg-[#162032] px-3 rounded-lg border border-slate-700/60 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < intensidade ? "bg-amber-400" : "bg-slate-700"
                  }`}
                />
              ))}
              <span className="text-xs text-slate-300 font-mono font-bold ml-1.5">
                Nível {intensidade}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Linha 2: Objetivo do Treino e Atletas Previstos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Objetivo Principal */}
        <div className="md:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Objetivo do Treino</span>
          </label>
          {isEditing ? (
            <Input
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex: Organização ofensiva e pressão alta..."
              className="bg-[#162032]"
            />
          ) : (
            <p className="text-xs text-slate-200 font-medium bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[36px] flex items-center">
              {objetivo || "Sem objetivo definido."}
            </p>
          )}
        </div>

        {/* Número de Jogadores */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jogadores Previstos</span>
          </label>
          {isEditing ? (
            <Input
              type="number"
              value={numeroJogadores}
              onChange={(e) => setNumeroJogadores(Number(e.target.value))}
              min={1}
              max={40}
              className="bg-[#162032] font-mono"
            />
          ) : (
            <p className="text-xs text-slate-200 font-mono font-medium bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[36px] flex items-center">
              {numeroJogadores} Atletas
            </p>
          )}
        </div>

        {/* Material Necessário */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>Material Necessário</span>
          </label>
          {isEditing ? (
            <Input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Ex: 20 Bolas, 10 Cones, Coletes Azuis/Vermelhos..."
              className="bg-[#162032]"
            />
          ) : (
            <p className="text-xs text-slate-300 bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[36px] flex items-center">
              {material || "Nenhum material especificado."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
