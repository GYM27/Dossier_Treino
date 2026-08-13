"use client";

import { Attendance } from "@/components/attendance";
import { Dashboard } from "@/components/dashboard";
import { Placeholder } from "@/components/placeholder";
import { Squad } from "@/components/squad";
import { Sidebar, type NavKey } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  SettingsIcon,
  Users,
  X,
} from "lucide-react";
import { Team } from "@/models/team";
import { Utilizador } from "@/models/utilizador";
import { useState, useEffect, useCallback } from "react";
import { Settings } from "@/components/settings";
import { TeamForm } from "@/components/team-form";

const mobileNav: { key: NavKey; label: string; icon: typeof Users }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "plantel", label: "Plantel", icon: Users },
  { key: "calendario", label: "Calendário", icon: Calendar },
  { key: "assiduidade", label: "Assiduidade", icon: CheckSquare },
  { key: "config", label: "Configurações", icon: Settings },
];

export default function Page() {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [me, setMe] = useState<Utilizador | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Recuperar o último separador aberto quando a página carrega
  useEffect(() => {
    const saved = localStorage.getItem("activeTab") as NavKey;
    if (saved) setActive(saved);
  }, []);

  // Gravar o separador atual sempre que mudamos de página
  useEffect(() => {
    localStorage.setItem("activeTab", active);
  }, [active]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Carregar Quem sou eu
      const meData = await apiFetch("/auth/me");
      setMe(meData);
      
      // 2. Carregar Equipas
      const equipasData = await apiFetch("/equipas");
      setTeams(equipasData);
      
      if (equipasData && equipasData.length > 0) {
        setActiveTeam(equipasData[0]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados iniciais", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function navigate(key: NavKey) {
    setActive(key);
    setMobileOpen(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        A carregar Dossier...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={navigate} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="glass-strong animate-fade-up absolute left-0 top-0 h-full w-72 border-r p-4">
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-sm font-semibold">Dossier do Treinador</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {mobileNav.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {activeTeam ? (
          <TopHeader
            teams={teams}
            activeTeam={activeTeam}
            onTeamChange={setActiveTeam}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
        ) : (
          <header className="glass sticky top-0 z-30 flex items-center justify-between border-b p-4">
            <div className="text-muted-foreground">
              Nenhuma equipa configurada.
            </div>
          </header>
        )}

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">
          {teams.length === 0 ? (
            me?.cargo === "TREINADOR_PRINCIPAL" ? (
              <TeamForm onSuccess={fetchData} />
            ) : (
              <Placeholder title="A aguardar que o Treinador Principal crie a Equipa..." />
            )
          ) : (
            <>
              {active === "dashboard" && <Dashboard />}
              {active === "plantel" ? (
                activeTeam ? (
                  <Squad activeTeam={activeTeam} />
                ) : (
                  <Placeholder title="Nenhum plantel configurado" />
                )
              ) : null}
              {active === "assiduidade" && <Attendance />}
              {active === "calendario" && <Placeholder title="Calendário" />}
              {active === "config" && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
