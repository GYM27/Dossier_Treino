"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface TeamFormProps {
  onSuccess: () => void;
}

export function TeamForm({ onSuccess }: TeamFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    escalao: "",
    designacaoEpoca: "2026/2027",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/equipas", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      alert("Equipa criada com sucesso!");
      onSuccess();
      
    } catch (err: any) {
      alert("Erro ao criar equipa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <Shield className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Cria a tua primeira Equipa</h2>
        <p className="text-muted-foreground mt-2">
          Para começares a trabalhar no Dossier, precisas de definir o plantel que vais treinar.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Nome da Equipa
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Seniores, Equipa A..."
              className="mt-1.5 w-full rounded-xl bg-background/50 border border-border/50 px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Escalão
            </label>
            <select
              required
              className="mt-1.5 w-full rounded-xl bg-background/50 border border-border/50 px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
              value={formData.escalao}
              onChange={(e) => setFormData({ ...formData, escalao: e.target.value })}
            >
              <option value="" disabled>Selecionar Escalão</option>
              <option value="Seniores">Seniores</option>
              <option value="Sub-19">Sub-19 (Juniores)</option>
              <option value="Sub-17">Sub-17 (Juvenis)</option>
              <option value="Sub-15">Sub-15 (Iniciados)</option>
              <option value="Sub-13">Sub-13 (Infantis)</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Época Desportiva
            </label>
            <input
              required
              type="text"
              placeholder="Ex: 2024/2025"
              className="mt-1.5 w-full rounded-xl bg-background/50 border border-border/50 px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              value={formData.designacaoEpoca}
              onChange={(e) => setFormData({ ...formData, designacaoEpoca: e.target.value })}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-11"
          disabled={loading}
        >
          {loading ? "A Criar..." : "Criar Equipa"}
        </Button>
      </form>
    </div>
  );
}
