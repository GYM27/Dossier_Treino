"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Spinner } from "@/components/ui/Spinner";
import { TeamForm } from "@/components/settings/TeamForm";
import { Placeholder } from "@/components/ui/Placeholder";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teams, me, loading, refreshData } = useActiveTeam();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Spinner size="lg" color="cyan" />
        <p className="text-sm font-medium tracking-wide">A carregar o Dossier do Treinador...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Barra lateral fixa no desktop */}
      <Sidebar />

      {/* Gaveta de navegação móvel */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho superior global */}
        <TopHeader onOpenMobileNav={() => setMobileOpen(true)} />

        {/* Conteúdo principal */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">
          {teams.length === 0 ? (
            me?.cargo === "TREINADOR_PRINCIPAL" ? (
              <div className="max-w-2xl mx-auto py-8">
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-foreground">Bem-vindo ao Dossier do Treinador!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Para começar a gerir o seu plantel, assiduidade e planeamento, crie a sua primeira equipa.
                  </p>
                </div>
                <TeamForm onSuccess={refreshData} />
              </div>
            ) : (
              <div className="py-12">
                <Placeholder title="A aguardar que o Treinador Principal crie e configure a primeira equipa..." />
              </div>
            )
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
