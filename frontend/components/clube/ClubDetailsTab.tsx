"use client";

import { type Team, ESCALOES } from "@/models/team";
import { Shield, Edit2, Check, X, Plus, Layers, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface ClubDetailsTabProps {
  team: Team;
  teams?: Team[];
  onTeamChange?: (team: Team) => void;
  onOpenCreateTeam?: () => void;
  onUpdate?: () => void;
}

export function ClubDetailsTab({
  team,
  teams = [],
  onTeamChange,
  onOpenCreateTeam,
  onUpdate,
}: ClubDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: team.nome || "",
    escalao: team.escalao || "Seniores",
    modalidade: team.modalidade || "Futebol 11",
    epocaNome: team.epocaNome || "2025/2026",
    duracaoJogo: team.duracaoJogo || "45' + 45'",
    numeroJogadores: team.numeroJogadores || "Futebol 11",
    emblemaUrl: team.emblemaUrl || "",
  });

  useEffect(() => {
    setFormData({
      nome: team.nome || "",
      escalao: team.escalao || "Seniores",
      modalidade: team.modalidade || "Futebol 11",
      epocaNome: team.epocaNome || "2025/2026",
      duracaoJogo: team.duracaoJogo || "45' + 45'",
      numeroJogadores: team.numeroJogadores || "Futebol 11",
      emblemaUrl: team.emblemaUrl || "",
    });
  }, [team]);

  async function handleSave() {
    setLoading(true);
    try {
      const updatedTeam = await apiFetch<Team>(`/equipas/${team.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: formData.nome.trim() || team.nome,
          escalao: formData.escalao,
          modalidade: formData.modalidade,
          designacaoEpoca: formData.epocaNome,
          duracaoJogo: formData.duracaoJogo,
          numeroJogadores: formData.numeroJogadores,
          emblemaUrl: formData.emblemaUrl.trim() || undefined,
        }),
      });
      setIsEditing(false);
      if (updatedTeam && onTeamChange) {
        onTeamChange(updatedTeam);
      }
      toast.success("Dados da equipa guardados com sucesso!");
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error("Erro ao guardar equipa", err);
      toast.error("Erro ao guardar dados da equipa: " + (err?.message || "Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Detalhes da Equipa Ativa */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Coluna da Esquerda: Logótipo */}
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="relative flex w-full max-w-[200px] aspect-square items-center justify-center">
            {formData.emblemaUrl || team.emblemaUrl ? (
              <img
                src={formData.emblemaUrl || team.emblemaUrl}
                alt={team.nome}
                className="h-full w-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-border">
                <Shield className="size-20 text-primary/40" />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-4 w-full space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">
                URL do Emblema
              </label>
              <input
                type="text"
                placeholder="https://exemplo.com/emblema.png"
                value={formData.emblemaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, emblemaUrl: e.target.value })
                }
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs outline-none focus:border-primary/50 text-center"
              />
            </div>
          ) : (
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                {team.nome}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {team.escalao || "Plantel Principal"}
              </span>
            </div>
          )}
        </div>

        {/* Coluna da Direita: Ficha Técnica do Clube / Equipa */}
        <div className="glass overflow-hidden rounded-2xl shadow-sm border border-border/50">
          <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-sm tracking-wide">
                Quadros e Ficha da Equipa
              </h3>
              <p className="text-xs text-muted-foreground">
                Dados estruturais e regulamentares da equipa ativa
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-medium bg-foreground/5 hover:bg-foreground/10 px-3 py-1.5 rounded-lg"
              >
                <Edit2 className="size-3.5" />
                Editar Ficha
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                >
                  <X className="size-3.5" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm"
                >
                  <Check className="size-3.5" />
                  {loading ? "A Guardar..." : "Guardar Alterações"}
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-border/50">
            {/* Nome do Clube / Equipa */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Clube / Nome da Equipa
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full max-w-sm rounded-lg border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50"
                  />
                ) : (
                  team.nome
                )}
              </div>
            </div>

            {/* Escalão */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Escalão
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
                {isEditing ? (
                  <select
                    value={formData.escalao}
                    onChange={(e) =>
                      setFormData({ ...formData, escalao: e.target.value })
                    }
                    className="w-full max-w-sm rounded-lg border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50 cursor-pointer"
                  >
                    {ESCALOES.map((esc) => (
                      <option key={esc} value={esc}>
                        {esc}
                      </option>
                    ))}
                  </select>
                ) : (
                  team.escalao || "Seniores"
                )}
              </div>
            </div>

            {/* Modalidade */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Modalidade
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
                {isEditing ? (
                  <select
                    value={formData.modalidade}
                    onChange={(e) =>
                      setFormData({ ...formData, modalidade: e.target.value })
                    }
                    className="w-full max-w-sm rounded-lg border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="Futebol 11">Futebol 11</option>
                    <option value="Futebol 9">Futebol 9</option>
                    <option value="Futebol 7">Futebol 7</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Futebol de Praia">Futebol de Praia</option>
                  </select>
                ) : (
                  team.modalidade || "Futebol 11"
                )}
              </div>
            </div>

            {/* Época */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Época Desportiva
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground font-mono">
                {team.epocaNome || "2025/2026"}
              </div>
            </div>

            {/* Duração do Jogo */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Duração Padrão do Jogo
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
                {isEditing ? (
                  <select
                    value={formData.duracaoJogo}
                    onChange={(e) =>
                      setFormData({ ...formData, duracaoJogo: e.target.value })
                    }
                    className="w-full max-w-sm rounded-lg border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="45' + 45'">45&apos; + 45&apos; (90 min)</option>
                    <option value="40' + 40'">40&apos; + 40&apos; (80 min)</option>
                    <option value="35' + 35'">35&apos; + 35&apos; (70 min)</option>
                    <option value="30' + 30'">30&apos; + 30&apos; (60 min)</option>
                    <option value="25' + 25'">25&apos; + 25&apos; (50 min)</option>
                    <option value="20' + 20'">20&apos; + 20&apos; (Futsal)</option>
                  </select>
                ) : (
                  team.duracaoJogo || "45' + 45'"
                )}
              </div>
            </div>

            {/* Formato de Jogadores */}
            <div className="flex px-6 py-3.5 transition-colors hover:bg-foreground/[0.02] items-center">
              <div className="w-1/3 text-xs font-semibold text-muted-foreground text-right pr-6 border-r border-border/30">
                Formato de Jogadores
              </div>
              <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.numeroJogadores}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroJogadores: e.target.value,
                      })
                    }
                    placeholder="Ex: Futebol 11, Futebol 7..."
                    className="w-full max-w-sm rounded-lg border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50"
                  />
                ) : (
                  team.numeroJogadores || "Futebol 11"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lista de Equipas / Escalões do Clube */}
      <div className="glass rounded-2xl p-6 shadow-sm border border-border/50 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Plantéis & Escalões Registados ({teams.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecione um escalão para alternar a equipa ativa ou adicione um novo plantel
              </p>
            </div>
          </div>

          {onOpenCreateTeam && (
            <Button
              onClick={onOpenCreateTeam}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Nova Equipa</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((t) => {
            const isActive = t.id === team.id;
            return (
              <div
                key={t.id}
                onClick={() => onTeamChange && onTeamChange(t)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "bg-foreground/[0.02] border-border/50 hover:bg-foreground/[0.05] hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-background border border-border/50 p-1 flex items-center justify-center shrink-0">
                    {t.emblemaUrl ? (
                      <img
                        src={t.emblemaUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Shield className="size-5 text-primary/60" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {t.nome}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.escalao || "Sem escalão"} • {t.modalidade || "Futebol"}
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-md shrink-0">
                    Ativa
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground hover:text-foreground shrink-0">
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
