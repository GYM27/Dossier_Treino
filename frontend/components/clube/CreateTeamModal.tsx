"use client";

import React, { useState } from "react";
import { X, Shield, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Team, ESCALOES } from "@/models/team";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (newTeam: Team) => void;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    escalao: "Sub-17",
    modalidade: "Futebol 11",
    designacaoEpoca: "2025/2026",
    duracaoJogo: "45' + 45'",
    numeroJogadores: "Futebol 11",
    emblemaUrl: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError("O nome da equipa é obrigatório.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await apiFetch<Team>("/equipas", {
        method: "POST",
        body: JSON.stringify({
          nome: formData.nome.trim(),
          escalao: formData.escalao,
          modalidade: formData.modalidade,
          designacaoEpoca: formData.designacaoEpoca.trim() || "2025/2026",
          duracaoJogo: formData.duracaoJogo,
          numeroJogadores: formData.numeroJogadores,
          emblemaUrl: formData.emblemaUrl.trim() || undefined,
        }),
      });

      if (created) {
        onTeamCreated(created);
        onClose();
      }
    } catch (err: any) {
      console.error("Erro ao criar equipa:", err);
      setError(err.message || "Erro ao criar a equipa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl p-6 overflow-hidden">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Criar Nova Equipa / Escalão
              </h2>
              <p className="text-xs text-slate-400">
                Configure um novo plantel para gestão de treinos e atletas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Nome da Equipa / Clube */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Nome da Equipa / Clube <span className="text-rose-400">*</span>
            </label>
            <Input
              required
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: União 1919, Académica SF, SC Braga..."
              className="bg-[#162032] border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Escalão e Modalidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Escalão
              </label>
              <select
                value={formData.escalao}
                onChange={(e) =>
                  setFormData({ ...formData, escalao: e.target.value })
                }
                className="w-full h-9 rounded-md bg-[#162032] border border-slate-700 text-xs text-white px-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {ESCALOES.map((esc) => (
                  <option key={esc} value={esc}>
                    {esc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Modalidade / Formato
              </label>
              <select
                value={formData.modalidade}
                onChange={(e) =>
                  setFormData({ ...formData, modalidade: e.target.value })
                }
                className="w-full h-9 rounded-md bg-[#162032] border border-slate-700 text-xs text-white px-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Futebol 11">Futebol 11</option>
                <option value="Futebol 9">Futebol 9</option>
                <option value="Futebol 7">Futebol 7</option>
                <option value="Futsal">Futsal</option>
                <option value="Futebol de Praia">Futebol de Praia</option>
              </select>
            </div>
          </div>

          {/* Época e Duração do Jogo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Época Desportiva
              </label>
              <Input
                value={formData.designacaoEpoca}
                onChange={(e) =>
                  setFormData({ ...formData, designacaoEpoca: e.target.value })
                }
                placeholder="Ex: 2025/2026"
                className="bg-[#162032] border-slate-700 text-white placeholder:text-slate-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Duração de Jogo Padrão
              </label>
              <select
                value={formData.duracaoJogo}
                onChange={(e) =>
                  setFormData({ ...formData, duracaoJogo: e.target.value })
                }
                className="w-full h-9 rounded-md bg-[#162032] border border-slate-700 text-xs text-white px-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="45' + 45'">45&apos; + 45&apos; (90 min)</option>
                <option value="40' + 40'">40&apos; + 40&apos; (80 min)</option>
                <option value="35' + 35'">35&apos; + 35&apos; (70 min)</option>
                <option value="30' + 30'">30&apos; + 30&apos; (60 min)</option>
                <option value="25' + 25'">25&apos; + 25&apos; (50 min)</option>
                <option value="20' + 20'">20&apos; + 20&apos; (Futsal)</option>
              </select>
            </div>
          </div>

          {/* URL do Emblema */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Logótipo / URL do Emblema (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <Input
                value={formData.emblemaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, emblemaUrl: e.target.value })
                }
                placeholder="https://exemplo.com/emblema.png"
                className="bg-[#162032] border-slate-700 text-white placeholder:text-slate-500 text-xs flex-1"
              />
              {formData.emblemaUrl && (
                <div className="size-9 rounded-lg bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={formData.emblemaUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2"
            >
              {loading ? (
                "A Criar..."
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Criar Equipa</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
