"use client";

import React from "react";
import { Dumbbell } from "lucide-react";
import { Exercicio } from "@/models/exercicio";
import { Spinner } from "@/components/ui/Spinner";
import { CatalogoExerciseCard } from "./CatalogoExerciseCard";

interface CatalogoExerciseGridProps {
  exercicios: Exercicio[];
  isLoading: boolean;
  onSelect: (exercicio: Exercicio) => void;
  onDelete: (e: React.MouseEvent, id: string, nome: string) => void;
}

export function CatalogoExerciseGrid({
  exercicios,
  isLoading,
  onSelect,
  onDelete,
}: CatalogoExerciseGridProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <Spinner size="lg" color="cyan" />
        <span className="text-sm font-medium">A carregar exercícios do catálogo...</span>
      </div>
    );
  }

  if (exercicios.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <Dumbbell className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-bold text-slate-300 mb-1">Nenhum exercício encontrado</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Não existem exercícios que correspondam aos filtros selecionados. Crie novos exercícios na Prancheta Tática.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {exercicios.map((ex) => (
        <CatalogoExerciseCard
          key={ex.id}
          exercicio={ex}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
