"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Utilizador } from "@/models/utilizador";

// Importamos os dois novos "módulos" que criaste
import { StaffList } from "./staff-list";
import { StaffList } from "./staff-list";
import { StaffForm } from "./staff-form";
import { ProfileForm } from "./profile-form";

export function Settings() {
  const [activeTab, setActiveTab] = useState<"perfil" | "equipa">("perfil");

  // Apenas o Estado (Memória) que interessa ao Coordenador
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipaTecnica, setEquipaTecnica] = useState<Utilizador[]>([]);
  const [me, setMe] = useState<Utilizador | null>(null);
  const [loading, setLoading] = useState(true);

  // A Lógica de ir buscar dados ao servidor
  async function carregarDados() {
    try {
      setLoading(true);
      const [dadosEquipa, dadosMe] = await Promise.all([
        apiFetch("/utilizadores"),
        apiFetch("/auth/me")
      ]);
      setEquipaTecnica(dadosEquipa);
      setMe(dadosMe);
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
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gere o teu perfil pessoal e os acessos da equipa técnica.
          </p>
        </div>

        {activeTab === "equipa" && !isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-primary-foreground"
          >
            <UserPlus className="size-4 mr-2" />
            Novo Membro
          </Button>
        )}
      </div>

      {/* NAVEGAÇÃO EM ABAS */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === "perfil" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          O Meu Perfil
        </button>
        <button
          onClick={() => setActiveTab("equipa")}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === "equipa" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Equipa Técnica
        </button>
      </div>

      {activeTab === "perfil" && (
        <ProfileForm initialData={me} onSuccess={carregarDados} />
      )}

      {activeTab === "equipa" && (
        <>
          {/* FORMULÁRIO */}
          {isFormOpen && (
            <StaffForm 
              onSuccess={() => {
                setIsFormOpen(false);
                carregarDados();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          )}

          {/* LISTA (Componente Externo) */}
          {!isFormOpen && (
            <StaffList 
              membros={equipaTecnica} 
              isLoading={loading} 
            />
          )}
        </>
      )}
    </div>
  );
}
