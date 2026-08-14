"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Utilizador } from "@/models/utilizador";

import { StaffList } from "./StaffList";
import { StaffForm } from "./StaffForm";

export function Settings() {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipaTecnica, setEquipaTecnica] = useState<Utilizador[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarDados() {
    try {
      setLoading(true);
      const dadosEquipa = await apiFetch("/utilizadores");
      setEquipaTecnica(dadosEquipa);
    } catch (err) {
      console.error("Erro ao carregar configurações", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gere os acessos e membros da equipa técnica.
          </p>
        </div>

        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-primary-foreground"
          >
            <UserPlus className="size-4 mr-2" />
            Novo Membro
          </Button>
        )}
      </div>

      {isFormOpen && (
        <StaffForm 
          onSuccess={() => {
            setIsFormOpen(false);
            carregarDados();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {!isFormOpen && (
        <StaffList 
          equipaTecnica={equipaTecnica} 
          loading={loading} 
        />
      )}
    </div>
  );
}
