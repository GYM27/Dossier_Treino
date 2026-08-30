"use client";

import React from "react";
import { Clock, Users, MapPin, Trash2, Dumbbell } from "lucide-react";
import { Exercicio } from "@/models/exercicio";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";
import { CATEGORIAS_EXERCICIO } from "@/models/categoria-exercicio";

interface CatalogoExerciseCardProps {
  exercicio: Exercicio;
  onSelect: (exercicio: Exercicio) => void;
  onDelete: (e: React.MouseEvent, id: string, nome: string) => void;
}

export function CatalogoExerciseCard({
  exercicio,
  onSelect,
  onDelete,
}: CatalogoExerciseCardProps) {
  const catObj = CATEGORIAS_EXERCICIO.find(
    (c) => c.value.toLowerCase() === (exercicio.categoria || "").toLowerCase()
  );

  return (
    <div
      onClick={() => onSelect(exercicio)}
      className="group relative bg-[#0e1626] border border-slate-800/80 hover:border-cyan-500/60 rounded-2xl p-3.5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
    >
      <div>
        {/* Preview do Quadro Tático */}
        <div className="w-full aspect-[16/10] bg-[#070b14] rounded-xl overflow-hidden mb-3 relative border border-slate-800 group-hover:border-cyan-500/30 transition-colors flex items-center justify-center">
          {exercicio.tacticData ? (
            <TacticalBoardThumbnail
              tacticData={exercicio.tacticData}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600">
              <Dumbbell className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[10px] font-medium tracking-wide">Sem Prancheta</span>
            </div>
          )}

          {/* Badge de Categoria */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${
                catObj?.color || "bg-slate-800/80 text-slate-300 border-slate-700"
              }`}
            >
              {catObj?.label || exercicio.categoria || "Geral"}
            </span>
          </div>

          {/* Botão de Eliminar Rápido */}
          <button
            onClick={(e) => onDelete(e, exercicio.id, exercicio.nome)}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:scale-105"
            title="Eliminar exercício"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Título */}
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1">
          {exercicio.nome}
        </h4>

        {/* Descrição breve */}
        {exercicio.descricao && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {exercicio.descricao}
          </p>
        )}
      </div>

      {/* Metadados: Duração, Atletas, Espaço */}
      <div className="pt-2.5 border-t border-slate-800/60 flex items-center gap-3 text-[11px] font-medium text-slate-400">
        {exercicio.tempo ? (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            {exercicio.tempo} min
          </span>
        ) : null}

        {exercicio.jogadoresEnvolvidos ? (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-400" />
            {exercicio.jogadoresEnvolvidos} jogadores
          </span>
        ) : null}

        {exercicio.espaco ? (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{exercicio.espaco}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
