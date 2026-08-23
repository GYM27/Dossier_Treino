import React from "react";
import { Input } from "@/components/ui/input";
import { Users, Flame, Boxes, Target } from "lucide-react";

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
}: TreinoStudioMetadataFormProps) {
  return (
    <section className="bg-[#111827] border border-slate-800/80 rounded-xl p-4 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Objetivo Principal */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Objetivo do Treino</span>
          </label>
          {isEditing ? (
            <Input
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex: Organização ofensiva e pressão alta..."
            />
          ) : (
            <p className="text-xs text-slate-200 font-medium bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[34px] flex items-center">
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
            />
          ) : (
            <p className="text-xs text-slate-200 font-mono font-medium bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[34px] flex items-center">
              {numeroJogadores} Atletas
            </p>
          )}
        </div>

        {/* Intensidade */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Intensidade (1-5)</span>
          </label>
          {isEditing ? (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensidade(lvl)}
                  className={`flex-1 py-1 rounded text-xs font-bold font-mono transition-all ${
                    intensidade === lvl
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-[#1e293b] text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[34px] flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < intensidade ? "bg-amber-400" : "bg-slate-700"
                  }`}
                />
              ))}
              <span className="text-xs text-slate-300 font-mono font-bold ml-2">
                Nível {intensidade}/5
              </span>
            </div>
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
            />
          ) : (
            <p className="text-xs text-slate-300 bg-[#1e293b]/60 px-3 py-2 rounded-xl border border-slate-700/60 min-h-[34px] flex items-center">
              {material || "Nenhum material especificado."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
