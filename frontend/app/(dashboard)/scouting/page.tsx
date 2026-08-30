"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { adversarioService, type Adversario } from "@/services/adversarioService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { Search, ShieldAlert, Eye, Trash2, Edit3, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScoutingPage() {
  const [adversarios, setAdversarios] = useState<Adversario[]>([]);
  const [nome, setNome] = useState("");
  const [sistemaTatico, setSistemaTatico] = useState("");
  const [pontosFortes, setPontosFortes] = useState("");
  const [pontosFracos, setPontosFracos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [editando, setEditando] = useState(false);
  const [adversarioId, setAdversarioId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const carregarAdversarios = async () => {
    try {
      const data = await adversarioService.listarTodos();
      setAdversarios(data || []);
    } catch (err) {
      console.error("Erro ao carregar adversários:", err);
    }
  };

  useEffect(() => {
    carregarAdversarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning("Por favor, introduza o nome do adversário.");
      return;
    }

    try {
      if (editando && adversarioId) {
        await adversarioService.atualizar(adversarioId, {
          nome,
          sistemaTaticoPref: sistemaTatico,
          pontosFortes,
          pontosFracos,
          observacoesGerais: observacoes,
        });
        toast.success("Adversário atualizado com sucesso!");
      } else {
        await adversarioService.criar({
          nome,
          sistemaTaticoPref: sistemaTatico,
          pontosFortes,
          pontosFracos,
          observacoesGerais: observacoes,
        });
        toast.success("Novo relatório de scouting registado!");
      }
      limparFormulario();
      carregarAdversarios();
    } catch (err: any) {
      toast.error("Erro ao guardar adversário: " + (err.message || "Erro desconhecido"));
    }
  };

  const editar = (id: string, adv: Adversario) => {
    setEditando(true);
    setAdversarioId(id);
    setNome(adv.nome);
    setSistemaTatico(adv.sistemaTaticoPref || "");
    setPontosFortes(adv.pontosFortes || "");
    setPontosFracos(adv.pontosFracos || "");
    setObservacoes(adv.observacoesGerais || "");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const excluir = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remover Adversário",
      description: "Tem a certeza que deseja remover este adversário? Esta ação é irreversível.",
      onConfirm: async () => {
        try {
          await adversarioService.eliminar(id);
          toast.success("Adversário removido com sucesso!");
          carregarAdversarios();
        } catch (err: any) {
          toast.error("Erro ao remover adversário: " + (err.message || "Erro desconhecido"));
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const limparFormulario = () => {
    setNome("");
    setSistemaTatico("");
    setPontosFortes("");
    setPontosFracos("");
    setObservacoes("");
    setAdversarioId(null);
    setEditando(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 select-none">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Search className="size-6 text-primary" />
            <span>Scouting & Análise de Adversários</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Registe e consulte o perfil tático, pontos fortes e vulnerabilidades das equipas adversárias.
          </p>
        </div>
      </div>

      {/* Lista de Adversários Registados */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Adversários Registados ({adversarios.length})
        </h2>

        {adversarios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-foreground/[0.01]">
            <p className="text-sm text-muted-foreground">
              Ainda não existem relatórios de adversários registados. Utilize o formulário abaixo para criar a primeira análise.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adversarios.map((adv) => (
              <div
                key={adv.id}
                className="glass-card rounded-xl p-5 flex flex-col justify-between border border-border hover:border-primary/40 transition-all shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {adv.nome}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
                      {adv.sistemaTaticoPref || "Sem Sistema"}
                    </span>
                  </div>

                  {adv.pontosFortes && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-400">Pontos Fortes:</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {adv.pontosFortes}
                      </p>
                    </div>
                  )}

                  {adv.pontosFracos && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-rose-400">Pontos Fracos:</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {adv.pontosFracos}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adv.id && editar(adv.id, adv)}
                    className="h-8 text-xs font-medium"
                  >
                    <Edit3 className="size-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => adv.id && excluir(adv.id)}
                    className="h-8 text-xs font-medium"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Formulário de Criação / Edição */}
      <section className="glass-card rounded-2xl p-6 border border-border shadow-md">
        <h2 className="text-lg font-bold text-foreground mb-4">
          {editando ? `Editar Análise: ${nome}` : "Novo Relatório de Scouting"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Nome da Equipa Adversária *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex.: SC Pombal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Sistema Tático Habitual
              </label>
              <input
                type="text"
                value={sistemaTatico}
                onChange={(e) => setSistemaTatico(e.target.value)}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex.: 1-4-3-3 ou 1-3-5-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                Pontos Fortes (Padrões Ofensivos / Destaques)
              </label>
              <textarea
                value={pontosFortes}
                onChange={(e) => setPontosFortes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex.: Transição rápida pelos corredores laterais..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1.5">
                Pontos Fracos (Vulnerabilidades / Espaços)
              </label>
              <textarea
                value={pontosFracos}
                onChange={(e) => setPontosFracos(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex.: Dificuldade nas coberturas defensivas aos médios..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Observações Gerais & Bolas Paradas
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-foreground/[0.02] p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Notas sobre pontapés de canto, livres diretos ou jogadores-chave..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {editando && (
              <Button
                type="button"
                variant="outline"
                onClick={limparFormulario}
                className="text-xs font-medium"
              >
                Cancelar Edição
              </Button>
            )}
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold px-6"
            >
              {editando ? "Atualizar Relatório" : "Guardar Análise"}
            </Button>
          </div>
        </form>
      </section>

      {/* Modal de Confirmação Acessível */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
