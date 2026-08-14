import { type Team } from "@/models/team";
import { Shield, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface ClubDetailsTabProps {
  team: Team;
  onUpdate?: () => void;
}

export function ClubDetailsTab({ team, onUpdate }: ClubDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    duracaoJogo: team.duracaoJogo || "45' + 45'",
    numeroJogadores: team.numeroJogadores || "Futebol 11",
    emblemaUrl: team.emblemaUrl || "",
  });

  async function handleSave() {
    setLoading(true);
    try {
      await apiFetch(`/equipas/${team.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: team.nome,
          escalao: team.escalao,
          designacaoEpoca: team.epocaNome, // Ignorado pelo backend atual
          modalidade: team.modalidade,
          duracaoJogo: formData.duracaoJogo,
          numeroJogadores: formData.numeroJogadores,
          emblemaUrl: formData.emblemaUrl,
        }),
      });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Erro ao guardar equipa", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      {/* Coluna da Esquerda: Logótipo */}
      <div className="glass flex flex-col items-center justify-center rounded-xl p-8 shadow-sm">
        <div className="relative flex w-full max-w-[240px] aspect-square items-center justify-center">
          {team.emblemaUrl ? (
            <img
              src={team.emblemaUrl}
              alt={team.nome}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner ring-1 ring-border">
              <Shield className="size-24 text-primary/40" />
            </div>
          )}
        </div>

        {isEditing && (
          <div className="mt-4 w-full">
            <input
              type="text"
              placeholder="URL da Imagem..."
              value={formData.emblemaUrl}
              onChange={(e) =>
                setFormData({ ...formData, emblemaUrl: e.target.value })
              }
              className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-xs outline-none focus:border-primary/50 text-center"
            />
          </div>
        )}
      </div>

      {/* Coluna da Direita: Quadros do Clube */}
      <div className="glass overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Quadros do Clube</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Edit2 className="size-3.5" />
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <X className="size-3.5" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Check className="size-3.5" />
                {loading ? "A Guardar..." : "Guardar"}
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-border/50">
          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30">
              Clube
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
              {team.nome}
            </div>
          </div>

          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30">
              Escalão
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
              {team.escalao || "Sénior"}
            </div>
          </div>

          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30">
              Modalidade
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
              {team.modalidade || "Futebol"}
            </div>
          </div>

          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30">
              Época
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground">
              {team.epocaNome || "2025/2026"}
            </div>
          </div>

          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30 flex items-center justify-end">
              Duração do Jogo
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground flex items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.duracaoJogo}
                  onChange={(e) =>
                    setFormData({ ...formData, duracaoJogo: e.target.value })
                  }
                  className="w-full max-w-[200px] rounded-md border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50"
                />
              ) : (
                team.duracaoJogo || "45' + 45'"
              )}
            </div>
          </div>

          <div className="flex px-6 py-4 transition-colors hover:bg-foreground/[0.02]">
            <div className="w-1/3 text-sm font-medium text-muted-foreground text-right pr-6 border-r border-border/30 flex items-center justify-end">
              Número de Jogadores
            </div>
            <div className="w-2/3 pl-6 text-sm font-semibold text-foreground flex items-center">
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
                  className="w-full max-w-[200px] rounded-md border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:border-primary/50"
                />
              ) : (
                team.numeroJogadores || "Futebol 11"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
