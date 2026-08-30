"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface ProfileFormProps {
  initialData: any;
  onSuccess: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    novaPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        nomeCompleto: initialData.nomeCompleto || "",
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/utilizadores/me", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      toast.success("Perfil atualizado com sucesso!");
      setFormData(prev => ({...prev, novaPassword: ""}));
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao atualizar perfil: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Os Meus Dados Pessoais</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Nome Completo
          </label>
          <input
            required
            type="text"
            className="mt-1.5 w-full rounded-xl bg-background/50 border border-border/50 px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            value={formData.nomeCompleto}
            onChange={(e) =>
              setFormData({ ...formData, nomeCompleto: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Nova Password (opcional)
          </label>
          <input
            type="password"
            placeholder="Deixa em branco se não quiseres alterar"
            className="mt-1.5 w-full rounded-xl bg-background/50 border border-border/50 px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            value={formData.novaPassword}
            onChange={(e) =>
              setFormData({ ...formData, novaPassword: e.target.value })
            }
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl px-8"
          disabled={loading}
        >
          {loading ? "A Guardar..." : "Guardar Alterações"}
        </Button>
      </div>
    </form>
  );
}
