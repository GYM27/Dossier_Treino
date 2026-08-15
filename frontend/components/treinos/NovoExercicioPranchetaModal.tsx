"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Save, Clock, Layers, Users, MapPin, Target, Sparkles, Copy, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Exercicio } from "@/models/exercicio";

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
  const currentExercicio = exercicioToEdit !== undefined ? exercicioToEdit : initialExercicio;
  const isEditMode = !!currentExercicio?.id;
  const originalNome = currentExercicio?.nome || "";

  const [nome, setNome] = useState(currentExercicio?.nome || "");
  const [categoria, setCategoria] = useState<"AQUECIMENTO" | "TECNICO" | "TATICO" | "FISICO" | "GUARDA_REDES" | "LUDICO">(
    currentExercicio?.categoria || "TATICO"
  );
  const [duracaoMinutos, setDuracaoMinutos] = useState(15);
  const [espaco, setEspaco] = useState(currentExercicio?.espaco || "40x30m");
  const [jogadoresEnvolvidos, setJogadoresEnvolvidos] = useState(currentExercicio?.jogadoresEnvolvidos || 16);
  const [nivelDificuldade, setNivelDificuldade] = useState(currentExercicio?.nivelDificuldade || 3);
  const [descricao, setDescricao] = useState(currentExercicio?.descricao || "");
  const [objetivosEspecificos, setObjetivosEspecificos] = useState(currentExercicio?.objetivosEspecificos || "");
  const [tacticData, setTacticData] = useState<any>((currentExercicio as any)?.dadosTaticos || null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentExercicio) {
      setNome(currentExercicio.nome || "");
      setCategoria(currentExercicio.categoria || "TATICO");
      setEspaco(currentExercicio.espaco || "40x30m");
      setJogadoresEnvolvidos(currentExercicio.jogadoresEnvolvidos || 16);
      setNivelDificuldade(currentExercicio.nivelDificuldade || 3);
      setDescricao(currentExercicio.descricao || "");
      setObjetivosEspecificos(currentExercicio.objetivosEspecificos || "");
      setTacticData((currentExercicio as any)?.dadosTaticos || null);
    } else {
      setNome("");
      setCategoria("TATICO");
      setEspaco("40x30m");
      setJogadoresEnvolvidos(16);
      setNivelDificuldade(3);
      setDescricao("");
      setObjetivosEspecificos("");
      setTacticData(null);
    }
  }, [currentExercicio, isOpen]);

  if (!isOpen) return null;

  const handleSaveTacticBoard = (data: any) => {
    setTacticData(data);
  };

  // Gravar como NOVO exercício (Duplicação / Criação)
  const handleSaveAsNew = async () => {
    if (!nome.trim()) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao || objetivosEspecificos || nome,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        objetivosEspecificos: objetivosEspecificos,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        dadosTaticos: tacticData,
      };

      const exercicioSalvo = await apiFetch(`/exercicios`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onExercicioCreated(exercicioSalvo, duracaoMinutos, objetivosEspecificos || descricao);
      onClose();
    } catch (err: any) {
      console.error("Erro ao gravar novo exercício:", err);
      setErrorMsg(err.message || "Erro ao gravar exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar o exercício EXISTENTE (PUT)
  const handleUpdateExisting = async () => {
    if (!initialExercicio?.id) return;
    if (!nome.trim()) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: initialExercicio.id,
        nome: nome.trim(),
        descricao: descricao || objetivosEspecificos || nome,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        objetivosEspecificos: objetivosEspecificos,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        dadosTaticos: tacticData,
      };

      const exercicioAtualizado = await apiFetch(`/exercicios/${initialExercicio.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (onExercicioUpdated) {
        onExercicioUpdated(exercicioAtualizado);
      }
      onExercicioCreated(exercicioAtualizado, duracaoMinutos, objetivosEspecificos || descricao);
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar exercício:", err);
      setErrorMsg(err.message || "Erro ao atualizar exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submissão inteligente padrão: se mudou o nome em modo de edição, assume como novo!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && nome.trim() === originalNome.trim()) {
      await handleUpdateExisting();
    } else {
      await handleSaveAsNew();
    }
  };

  const hasNameChanged = isEditMode && nome.trim().toLowerCase() !== originalNome.trim().toLowerCase();

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
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            {isEditMode && !hasNameChanged && (
              <button
                type="button"
                onClick={handleUpdateExisting}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
                title="Atualizar o exercício original no catálogo"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Atualizar Original</span>
              </button>
            )}

            <button
              onClick={handleSaveAsNew}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              title={isEditMode ? "Gravar como novo exercício (mantém o original intacto)" : "Gravar e anexar ao treino"}
            >
              {isEditMode ? <Copy className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "A gravar..." : isEditMode ? "Gravar como Novo" : "Gravar e Anexar"}</span>
            </button>
          </div>
        </div>

        {/* Modal Content: Form (Esquerda/Topo) + TacticalBoard (Direita/Principal) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Painel de Metadados do Exercício */}
          <div className="w-full lg:w-84 bg-[#0f172a] border-r border-slate-800 p-5 overflow-y-auto flex flex-col gap-4 shrink-0">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Nome do Exercício */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nome do Exercício *
                </label>
                {hasNameChanged && (
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    Cópia / Novo
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Rondo 4v4 + 3 Neutros"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
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
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duração nesta Sessão (min)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(parseInt(e.target.value) || 15)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Espaço e Jogadores */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Espaço
                </label>
                <input
                  type="text"
                  value={espaco}
                  onChange={(e) => setEspaco(e.target.value)}
                  placeholder="40x30m"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nº Jogadores
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={jogadoresEnvolvidos}
                  onChange={(e) => setJogadoresEnvolvidos(parseInt(e.target.value) || 16)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Dificuldade */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
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
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Objetivos / Instruções
              </label>
              <textarea
                rows={4}
                value={objetivosEspecificos}
                onChange={(e) => setObjetivosEspecificos(e.target.value)}
                placeholder="Ex: Foco no passe curto, criação de linhas de passe e transição defensiva pós-perda..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
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
