"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Edit2
} from "lucide-react";
import { SessaoTreinoExercicio } from "@/models/sessao-treino";
import { cn } from "@/lib/utils";
import { TacticalBoardThumbnail } from "../prancheta/TacticalBoardThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TreinoExercicioCardProps {
  exercicio: SessaoTreinoExercicio;
  index: number;
  total: number;
  isEditing?: boolean;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdate?: (updates: Partial<SessaoTreinoExercicio>) => void;
  onEditPrancheta?: () => void;
}

export function TreinoExercicioCard({
  exercicio,
  index,
  total,
  isEditing = false,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
  onEditPrancheta,
}: TreinoExercicioCardProps) {

  // Local state for edit mode inputs to avoid bouncing keystrokes
  const [duracao, setDuracao] = useState(exercicio.duracaoMinutos?.toString() || "0");
  const [obs, setObs] = useState(exercicio.observacoesDoTreinador || "");

  const handleBlur = () => {
    if (onUpdate) {
      onUpdate({
        duracaoMinutos: parseInt(duracao) || 0,
        observacoesDoTreinador: obs
      });
    }
  };

  return (
    <div className={cn(
      "group relative flex flex-col md:flex-row items-stretch gap-4 p-4 rounded-xl transition-all shadow-sm",
      isEditing ? "bg-[#111827] border-2 border-cyan-500/50" : "bg-[#111827]/80 border border-slate-800 hover:border-slate-700"
    )}>
      
      {/* 1. Esquerda: Ordem e Miniatura (Thumbnail) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <Badge variant="cyan" className="w-6 h-6 p-0 font-mono text-xs font-bold justify-center rounded-lg">
            {index + 1}
          </Badge>
          {isEditing && (
            <div className="flex flex-col gap-0.5 mt-1">
              {index > 0 && onMoveUp && (
                <button onClick={onMoveUp} className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors" title="Mover para cima">
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
              {index < total - 1 && onMoveDown && (
                <button onClick={onMoveDown} className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors" title="Mover para baixo">
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Thumbnail Prancheta */}
        <div className="relative group/thumb w-24 h-24 sm:w-32 sm:h-32 shrink-0 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
          <TacticalBoardThumbnail 
            tacticData={exercicio.dadosTaticos} 
            className="w-full h-full transition-opacity group-hover/thumb:opacity-50" 
          />
          {isEditing && onEditPrancheta && (
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                <Button 
                  size="sm"
                  variant="cyan"
                  onClick={onEditPrancheta}
                  className="gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </Button>
             </div>
          )}
        </div>
      </div>

      {/* 2. Centro: Nome e Observações */}
      <div className="flex-1 min-w-0 flex flex-col justify-start gap-2">
        <h4 className="text-sm md:text-base font-bold text-white tracking-wide truncate">
          {exercicio.exercicioNome}
        </h4>
        
        {isEditing ? (
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 block">Observações do Treinador</label>
            <Textarea 
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              onBlur={handleBlur}
              placeholder="Adicionar notas para este exercício..."
              className="h-20 text-xs resize-none"
            />
          </div>
        ) : (
          exercicio.observacoesDoTreinador && (
            <p className="text-xs text-slate-400 leading-relaxed bg-[#0b1120] p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
              {exercicio.observacoesDoTreinador}
            </p>
          )
        )}
      </div>

      {/* 3. Direita: Métricas e Acções */}
      <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 shrink-0 border-t border-slate-800 pt-3 md:border-t-0 md:pt-0 md:pl-4 md:border-l">
        <div className="flex flex-col items-end gap-1">
          {isEditing ? (
            <div className="flex flex-col items-end">
              <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Duração (min)</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <Input 
                  type="number" 
                  min={0}
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  onBlur={handleBlur}
                  className="w-20 text-right text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <Badge variant="cyan" className="gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {exercicio.duracaoMinutos} min
            </Badge>
          )}
        </div>

        {isEditing && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="gap-1.5 mt-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remover
          </Button>
        )}
      </div>

    </div>
  );
}
