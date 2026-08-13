"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface StaffFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function StaffForm({ onSuccess, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    password: "",
    cargo: "TREINADOR_ADJUNTO",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        papel: "TREINADOR",
      };

      await apiFetch("/auth/registar", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Membro da Equipa Técnica convidado com sucesso!");
      
      // Quando tem sucesso, limpa os dados e avisa o "Pai"
      setFormData({
        nomeCompleto: "",
        email: "",
        password: "",
        cargo: "TREINADOR_ADJUNTO",
      });
      onSuccess(); 
      
    } catch (err: any) {
      alert("Erro ao registar: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Dados do Novo Membro</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Nome Completo
        </label>
        <input
          type="text"
          required
          className="w-full h-10 rounded-lg border border-border bg-foreground/[0.03] px-3 text-sm"
          value={formData.nomeCompleto}
          onChange={(e) =>
            setFormData({ ...formData, nomeCompleto: e.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          required
          className="w-full h-10 rounded-lg border border-border bg-foreground/[0.03] px-3 text-sm"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Password Provisória
        </label>
        <input
          type="password"
          required
          className="w-full h-10 rounded-lg border border-border bg-foreground/[0.03] px-3 text-sm"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Cargo</label>
        <select
          className="w-full h-10 rounded-lg border border-border bg-foreground/[0.03] px-3 text-sm"
          value={formData.cargo}
          onChange={(e) =>
            setFormData({ ...formData, cargo: e.target.value })
          }
        >
          <option value="TREINADOR_PRINCIPAL">Treinador Principal</option>
          <option value="TREINADOR_ADJUNTO">Treinador Adjunto</option>
          <option value="PREPARADOR_FISICO">Preparador Físico</option>
          <option value="FISIOTERAPEUTA">Fisioterapeuta</option>
          <option value="MEDICO">Médico</option>
        </select>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground mt-4"
      >
        <UserPlus className="size-4 mr-2" />
        Convidar e Registar
      </Button>
    </form>
  );
}
