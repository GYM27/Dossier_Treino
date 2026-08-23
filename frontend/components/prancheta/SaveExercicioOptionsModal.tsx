import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Copy, Sparkles, AlertCircle, CheckCircle2, X } from "lucide-react";

interface SaveExercicioOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNome: string;
  isFromTreino: boolean;
  isSaving: boolean;
  onConfirmOverwrite: () => void;
  onConfirmSaveAsNew: (novoNome: string) => void;
}

export function SaveExercicioOptionsModal({
  isOpen,
  onClose,
  currentNome,
  isFromTreino,
  isSaving,
  onConfirmOverwrite,
  onConfirmSaveAsNew,
}: SaveExercicioOptionsModalProps) {
  const [selectedMode, setSelectedMode] = useState<"OVERWRITE" | "NEW">("NEW");
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Sugerir automaticamente um nome para a variante
      const baseName = currentNome.trim() || "Exercício";
      setNovoNome(`${baseName} (Variante)`);
      // Se veio de um treino, sugerimos "NEW" por padrão para evitar quebrar outros exercícios do treino
      setSelectedMode(isFromTreino ? "NEW" : "OVERWRITE");
    }
  }, [isOpen, currentNome, isFromTreino]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedMode === "OVERWRITE") {
      onConfirmOverwrite();
    } else {
      const finalName = novoNome.trim() || `${currentNome} (Variante)`;
      onConfirmSaveAsNew(finalName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-[#0b1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Opções de Gravação do Exercício
              </h3>
              <p className="text-xs text-slate-400">
                Escolha se deseja atualizar o exercício original ou criar uma variante independente.
              </p>
            </div>
          </div>

          <button
            onClick={() => !isSaving && onClose()}
            disabled={isSaving}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4 text-slate-200 bg-[#0d131f]">
          {isFromTreino && (
            <div className="bg-cyan-950/40 border border-cyan-500/30 p-3.5 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-cyan-200">Edição a partir do Plano de Treino</p>
                <p className="text-slate-300 mt-0.5">
                  Para manter os outros exercícios deste treino inalterados, recomendamos gravar como uma <strong>Nova Variante</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Opção 1: Atualizar Original */}
            <div
              onClick={() => !isSaving && setSelectedMode("OVERWRITE")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === "OVERWRITE"
                  ? "bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                  : "bg-[#162032]/60 border-slate-800 hover:bg-[#1e293b]/60 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <RefreshCw className="w-4 h-4" />
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMode === "OVERWRITE" ? "border-cyan-400 bg-cyan-500/20" : "border-slate-600"
                  }`}>
                    {selectedMode === "OVERWRITE" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Atualizar Original</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Substitui o exercício original no catálogo. Aplica as mudanças a todos os planos que o utilizam.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1 text-[10px] text-amber-300">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Modifica a matriz do catálogo</span>
              </div>
            </div>

            {/* Opção 2: Gravar como Nova Variante */}
            <div
              onClick={() => !isSaving && setSelectedMode("NEW")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === "NEW"
                  ? "bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                  : "bg-[#162032]/60 border-slate-800 hover:bg-[#1e293b]/60 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Copy className="w-4 h-4" />
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMode === "NEW" ? "border-cyan-400 bg-cyan-500/20" : "border-slate-600"
                  }`}>
                    {selectedMode === "NEW" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Gravar Nova Variante</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cria um novo exercício independente. Preserva o original e isola este exercício no treino.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1 text-[10px] text-cyan-300">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>Cria registo independente</span>
              </div>
            </div>
          </div>

          {/* Campo de Nome para Nova Variante */}
          {selectedMode === "NEW" && (
            <div className="bg-[#111827] p-3.5 rounded-xl border border-slate-800 space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Nome da Nova Variante
              </label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Meínhos 4x1 (Pressão Alta)"
                className="bg-[#162032] border-cyan-500/30 text-cyan-100 text-xs"
                autoFocus
              />
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              variant="dark"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="cyan"
              onClick={handleConfirm}
              disabled={isSaving || (selectedMode === "NEW" && !novoNome.trim())}
              className="text-xs font-bold"
            >
              {isSaving
                ? "A Gravar..."
                : selectedMode === "OVERWRITE"
                ? "Atualizar Original"
                : "Gravar Nova Variante"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
