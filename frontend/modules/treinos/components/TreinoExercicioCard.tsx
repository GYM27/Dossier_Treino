"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Clock, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Users,
  MapPin,
  Target,
  FileText,
  Zap,
  RefreshCw
} from "lucide-react";
import { SessaoTreinoExercicio } from "@/models/sessao-treino";
import { cn } from "@/lib/utils";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TreinoExercicioCardProps {
  exercicio: SessaoTreinoExercicio;
  treinoId?: string;
  index: number;
  total: number;
  isEditing?: boolean;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReplace?: () => void;
  onUpdate?: (updates: Partial<SessaoTreinoExercicio>) => void;
}

export function TreinoExercicioCard({
  exercicio,
  treinoId,
  index,
  total,
  isEditing = false,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReplace,
  onUpdate,
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

  const pranchetaHref = exercicio.exercicioId 
    ? `/prancheta?id=${exercicio.exercicioId}${treinoId ? `&treinoId=${treinoId}` : ""}${exercicio.id ? `&assocId=${exercicio.id}` : ""}` 
    : "/prancheta";

  return (
    <div className={cn(
      "group relative flex flex-col rounded-xl overflow-hidden transition-all shadow-md",
      isEditing 
        ? "bg-[#0d131f] border-2 border-cyan-500/60" 
        : "bg-[#0d131f]/90 border border-slate-800 hover:border-slate-700"
    )}>
      
      {/* 🏷️ Cabeçalho do Cartão: Ordem e Nome do Exercício */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111827] border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold flex items-center justify-center font-mono shrink-0">
            {index + 1}
          </span>
          <Link
            href={pranchetaHref}
            className="text-sm md:text-base font-bold text-white hover:text-cyan-400 transition-colors tracking-wide truncate"
            title="Abrir exercício na Prancheta Tática"
          >
            {exercicio.exercicioNome}
          </Link>
          {exercicio.categoria && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-2 text-slate-400 border-slate-700">
              {exercicio.categoria}
            </Badge>
          )}
        </div>

        {/* Controlos de Ordem e Ações */}
        <div className="flex items-center gap-1 shrink-0">
          {index > 0 && onMoveUp && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }} 
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition-all active:scale-95 shadow-sm" 
              title="Mover exercício para cima (Ordem anterior)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {index < total - 1 && onMoveDown && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }} 
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition-all active:scale-95 shadow-sm" 
              title="Mover exercício para baixo (Próxima ordem)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          {onReplace && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReplace();
              }}
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition-all active:scale-95 shadow-sm ml-0.5"
              title="Substituir este exercício por outro da biblioteca (mantém o mesmo lugar no treino)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all active:scale-95 ml-1"
              title="Remover exercício da sessão"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 🧩 Corpo em Grelha de 3 Secções (Relvado | Metodologia | Badges) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-3.5 items-stretch">
        
        {/* 1. Secção Esquerda (md:col-span-5): Relvado Tático com Botão Ecrã Inteiro */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <Link
            href={pranchetaHref}
            title="Clique para abrir em Ecrã Inteiro na Prancheta Tática"
            className="relative group/field w-full aspect-[16/10] bg-[#1b4332] rounded-lg overflow-hidden border border-slate-700/80 shadow-md flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-all"
          >
            <TacticalBoardThumbnail 
              tacticData={exercicio.dadosTaticos} 
              className="w-full h-full" 
            />

            {/* Badge Flutuante "ECRÃ INTEIRO" no Canto Inferior Esquerdo */}
            <div className="absolute bottom-1.5 left-1.5 z-10 px-2 py-0.5 rounded bg-black/75 border border-white/20 text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 group-hover/field:bg-cyan-600 group-hover/field:border-cyan-400 transition-all shadow-sm">
              <Maximize2 className="w-2.5 h-2.5 text-cyan-300" />
              <span>Ecrã Inteiro</span>
            </div>
          </Link>
        </div>

        {/* 2. Secção Central (md:col-span-5): Metodologia (Objetivos e Descrição) */}
        <div className="md:col-span-5 flex flex-col justify-start gap-2.5 bg-[#090d16] p-3 rounded-lg border border-slate-800/80">
          {/* Objetivo(s) Específico(s) */}
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>Objetivo(s) Específico(s)</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-wrap">
              {exercicio.objetivosEspecificos || exercicio.dadosTaticos?.objetivoEspecifico || "Sem objetivos definidos."}
            </p>
          </div>

          {/* Divisória */}
          <div className="border-t border-slate-800/80 my-0.5" />

          {/* Descrição e Organização Metodológica */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Descrição e Organização Metodológica</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">
              {exercicio.descricao || exercicio.dadosTaticos?.descricaoMetodologica || "Sem descrição metodológica preenchida."}
            </p>
          </div>

          {/* Observações do Treinador (se houver ou em modo de edição) */}
          {isEditing ? (
            <div className="pt-2 border-t border-slate-800/60 mt-auto">
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Notas do Treino
              </label>
              <Textarea 
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                onBlur={handleBlur}
                placeholder="Notas para esta sessão..."
                className="h-14 text-xs resize-none bg-[#111827] border-slate-800"
              />
            </div>
          ) : (
            exercicio.observacoesDoTreinador && (
              <div className="pt-2 border-t border-slate-800/60 mt-auto">
                <span className="text-[9px] text-amber-400/80 font-bold uppercase tracking-wider block mb-0.5">
                  Notas:
                </span>
                <p className="text-[11px] text-slate-400 italic whitespace-pre-wrap">
                  {exercicio.observacoesDoTreinador}
                </p>
              </div>
            )
          )}
        </div>

        {/* 3. Secção Direita (md:col-span-2): Coluna Vertical de Badges (Tempo, Número, Espaço, Carga) */}
        <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-between gap-2 bg-[#090d16] p-2.5 rounded-lg border border-slate-800/80 text-center">
          {/* Tempo */}
          <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-1 w-full">
            {isEditing ? (
              <div className="flex flex-col items-center">
                <Input 
                  type="number" 
                  min={0}
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  onBlur={handleBlur}
                  className="w-16 text-center text-xs font-mono font-bold h-7 bg-[#111827]"
                />
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">tempo</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {exercicio.duracaoMinutos || 10} min
                </span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> tempo
                </span>
              </>
            )}
          </div>

          <div className="hidden md:block w-full border-t border-slate-800/80" />

          {/* Número de Atletas */}
          <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-1 w-full">
            <span className="text-xs font-bold text-slate-200">
              {exercicio.jogadoresEnvolvidos ? `${exercicio.jogadoresEnvolvidos}` : "Todos"}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-2.5 h-2.5" /> número
            </span>
          </div>

          <div className="hidden md:block w-full border-t border-slate-800/80" />

          {/* Espaço */}
          <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-1 w-full">
            <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]" title={exercicio.espaco || "Meio-Campo"}>
              {exercicio.espaco || "Meio-Campo"}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> espaço
            </span>
          </div>

          {/* Carga / Séries / Pausas */}
          {(exercicio.carga || exercicio.dadosTaticos?.carga) && (
            <>
              <div className="hidden md:block w-full border-t border-slate-800/80" />
              <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-1 w-full">
                <span className="text-[10.5px] font-bold text-amber-300 leading-tight text-center whitespace-pre-wrap">
                  {exercicio.carga || exercicio.dadosTaticos?.carga}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-400" /> carga
                </span>
              </div>
            </>
          )}

          {/* Botão Remover (se em modo de edição) */}
          {isEditing && (
            <div className="w-full pt-1 md:mt-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="w-full h-7 text-[10px] gap-1 px-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remover</span>
              </Button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
