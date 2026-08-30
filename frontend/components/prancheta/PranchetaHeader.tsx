"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Exercicio } from "@/models/exercicio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  Menu,
  X,
  Plus,
  ArrowLeft,
  SlidersHorizontal,
  Copy,
  Trash2,
  Save,
  CheckCircle2,
} from "lucide-react";

interface PranchetaHeaderProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  totalExercicios: number;
  onNovoExercicio: () => void;
  treinoId?: string | null;
  nome: string;
  selectedExercicio: Exercicio | null;
  showMetadataPanel: boolean;
  onToggleMetadataPanel: () => void;
  onDuplicarExercicio: () => void;
  onEliminarExercicio: () => void;
  onGuardarExercicio: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export function PranchetaHeader({
  isDrawerOpen,
  onToggleDrawer,
  totalExercicios,
  onNovoExercicio,
  treinoId,
  nome,
  selectedExercicio,
  showMetadataPanel,
  onToggleMetadataPanel,
  onDuplicarExercicio,
  onEliminarExercicio,
  onGuardarExercicio,
  isSaving,
  saveSuccess,
}: PranchetaHeaderProps) {
  return (
    <header className="px-4 py-2.5 border-b border-slate-800 bg-[#0d131f] flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3">
        {/* Botão Menu Hambúrguer com Toggle 1-Clique */}
        <button
          type="button"
          onClick={onToggleDrawer}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95",
            isDrawerOpen
              ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-white"
          )}
          title={isDrawerOpen ? "Fechar Biblioteca (1-Clique)" : "Abrir Biblioteca (1-Clique)"}
        >
          {isDrawerOpen ? <X className="w-4 h-4 text-slate-950" /> : <Menu className="w-4 h-4 text-cyan-400" />}
          <span>Exercícios ({totalExercicios})</span>
        </button>

        <button
          onClick={onNovoExercicio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all active:scale-95"
          title="Criar Novo Exercício"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </button>

        {treinoId && (
          <Link
            href="/treinos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Voltar ao Plano de Treino"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar ao Treino</span>
          </Link>
        )}

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <h1 className="text-sm md:text-base font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-[340px]">
            {nome || "Novo Exercício"}
          </h1>
          {selectedExercicio ? (
            <Badge variant="cyan" className="text-[10px] py-0.5 hidden sm:inline-flex">
              Guardado
            </Badge>
          ) : (
            <Badge variant="amber" className="text-[10px] py-0.5 hidden sm:inline-flex">
              Não Gravado
            </Badge>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        <Button
          variant={showMetadataPanel ? "cyan" : "dark"}
          size="sm"
          onClick={onToggleMetadataPanel}
          title="Mostrar/Esconder dados da Ficha Técnica na horizontal"
          className="h-8 text-xs font-semibold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
          <span>{showMetadataPanel ? "Ocultar Ficha" : "Ficha Técnica"}</span>
        </Button>

        {selectedExercicio && (
          <>
            <Button
              variant="dark"
              size="sm"
              onClick={onDuplicarExercicio}
              disabled={isSaving}
              title="Criar uma cópia deste exercício"
              className="h-8 text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span className="hidden md:inline">Duplicar</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onEliminarExercicio}
              disabled={isSaving}
              title="Eliminar exercício do catálogo"
              className="h-8 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">Eliminar</span>
            </Button>
          </>
        )}

        <Button
          variant="cyan"
          size="sm"
          onClick={onGuardarExercicio}
          disabled={isSaving}
          title="Guardar alterações no catálogo"
          className="h-8 text-xs font-bold"
        >
          {isSaving ? (
            <Spinner size="sm" color="slate" className="mr-1" />
          ) : saveSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          <span>{saveSuccess ? "Gravado!" : "Guardar"}</span>
        </Button>
      </div>
    </header>
  );
}
