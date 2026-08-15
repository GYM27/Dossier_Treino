"use client";

import React from "react";
import dynamic from "next/dynamic";
import { X, Save, Clock, Sparkles, Copy, RefreshCw } from "lucide-react";
import { Exercicio } from "@/models/exercicio";
import { useNovoExercicioPrancheta } from "./useNovoExercicioPrancheta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import dinâmico do TacticalBoard para evitar problemas com SSR / Canvas
const TacticalBoard = dynamic(() => import("@/components/prancheta/TacticalBoard"), { ssr: false });

interface NovoExercicioPranchetaModalProps {
  isOpen: boolean;
  initialExercicio?: Exercicio | null;
  exercicioToEdit?: Exercicio | null;
  onClose: () => void;
  onExercicioCreated: (exercicio: Exercicio, duracaoMinutos: number, observacoes?: string) => void;
  onExercicioUpdated?: (exercicio: Exercicio) => void;
}

export function NovoExercicioPranchetaModal({
  isOpen,
  initialExercicio,
  exercicioToEdit,
  onClose,
  onExercicioCreated,
  onExercicioUpdated,
}: NovoExercicioPranchetaModalProps) {
  const {
    nome,
    setNome,
    categoria,
    setCategoria,
    duracaoMinutos,
    setDuracaoMinutos,
    espaco,
    setEspaco,
    jogadoresEnvolvidos,
    setJogadoresEnvolvidos,
    nivelDificuldade,
    setNivelDificuldade,
    objetivosEspecificos,
    setObjetivosEspecificos,
    tacticData,
    isEditMode,
    originalNome,
    hasNameChanged,
    isSaving,
    errorMsg,
    handleSaveTacticBoard,
    handleSaveAsNew,
    handleSubmit,
  } = useNovoExercicioPrancheta({
    isOpen,
    initialExercicio,
    exercicioToEdit,
    onClose,
    onExercicioCreated,
    onExercicioUpdated,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-7xl h-[92vh] bg-[#0b1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b14] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {isEditMode ? `Editar / Duplicar: ${originalNome}` : "Criar Novo Exercício (Prancheta Tática)"}
              </h3>
              <p className="text-xs text-slate-400">
                {hasNameChanged
                  ? "Nome alterado: será gravado como uma nova cópia no catálogo sem apagar o original."
                  : isEditMode
                  ? "Pode atualizar o exercício original ou gravar com um novo nome para duplicar."
                  : "Desenhe o exercício tático e adicione-o imediatamente à sessão de treino."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>

            {isEditMode && !hasNameChanged && (
              <Button
                variant="dark"
                size="sm"
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                title="Atualizar o exercício original no catálogo"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                <span>Atualizar Original</span>
              </Button>
            )}

            <Button
              variant="cyan"
              size="sm"
              onClick={handleSaveAsNew}
              disabled={isSaving}
              title={isEditMode ? "Gravar como novo exercício (mantém o original intacto)" : "Gravar e anexar ao treino"}
            >
              {isEditMode ? <Copy className="w-3.5 h-3.5 mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              <span>{isSaving ? "A gravar..." : isEditMode ? "Gravar como Novo" : "Gravar e Anexar"}</span>
            </Button>
          </div>
        </div>

        {/* Modal Content: Form (Esquerda) + TacticalBoard (Direita) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Painel de Metadados do Exercício */}
          <div className="w-full lg:w-84 bg-[#0f172a] border-r border-slate-800 p-5 overflow-y-auto flex flex-col gap-4 shrink-0">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Nome do Exercício */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nome do Exercício *
                </label>
                {hasNameChanged && (
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    Cópia / Novo
                  </span>
                )}
              </div>
              <Input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Rondo 4v4 + 3 Neutros"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                aria-label="Categoria do Exercício"
                className="w-full bg-[#162032] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="AQUECIMENTO">Aquecimento</option>
                <option value="TECNICO">Técnico</option>
                <option value="TATICO">Tático</option>
                <option value="FISICO">Físico</option>
                <option value="GUARDA_REDES">Guarda-Redes</option>
                <option value="LUDICO">Lúdico</option>
              </select>
            </div>

            {/* Duração na Sessão */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duração nesta Sessão (min)
              </label>
              <Input
                type="number"
                min={1}
                max={120}
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(parseInt(e.target.value) || 15)}
              />
            </div>

            {/* Espaço e Jogadores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Espaço
                </label>
                <Input
                  value={espaco}
                  onChange={(e) => setEspaco(e.target.value)}
                  placeholder="40x30m"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Nº Jogadores
                </label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={jogadoresEnvolvidos}
                  onChange={(e) => setJogadoresEnvolvidos(parseInt(e.target.value) || 16)}
                />
              </div>
            </div>

            {/* Dificuldade */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Nível de Dificuldade (1 a 5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNivelDificuldade(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      nivelDificuldade >= lvl
                        ? "bg-cyan-500 text-slate-950 shadow-sm"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Objetivos Específicos / Descrição */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Objetivos / Instruções
              </label>
              <Textarea
                rows={4}
                value={objetivosEspecificos}
                onChange={(e) => setObjetivosEspecificos(e.target.value)}
                placeholder="Ex: Foco no passe curto, criação de linhas de passe..."
              />
            </div>
          </div>

          {/* Prancheta Tática Embebida */}
          <div className="flex-1 bg-[#070b14] p-3 overflow-hidden flex flex-col items-center justify-center">
            <div className="w-full h-full max-h-[820px] flex items-center justify-center">
              <TacticalBoard 
                initialTacticData={tacticData}
                onSave={handleSaveTacticBoard} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
