"use client";

import { Attendance } from "@/components/assiduidade/Attendance";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ClubePage } from "@/components/clube/ClubePage";
import { Placeholder } from "@/components/ui/Placeholder";
import { Squad } from "@/components/plantel/Squad";
import { Sidebar, type NavKey } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { PlaneamentoSemanal } from "@/components/calendario/PlaneamentoSemanal";
import { TreinosOrchestrator } from "@/components/treinos/TreinosOrchestrator";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  SettingsIcon,
  Users,
} from "lucide-react";
import { Team } from "@/models/team";
import { Utilizador } from "@/models/utilizador";
import { useState, useEffect, useCallback } from "react";
import { Settings } from "@/components/settings/Settings";
import { TeamForm } from "@/components/settings/TeamForm";

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
      <MobileDrawer
        isOpen={mobileOpen}
        active={active}
        onNavigate={navigate}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          teams={teams}
          activeTeam={activeTeam}
          me={me}
          onTeamChange={setActiveTeam}
          onOpenMobileNav={() => setMobileOpen(true)}
          onRefreshMe={fetchData}
        />

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">
          {teams.length === 0 ? (
            me?.cargo === "TREINADOR_PRINCIPAL" ? (
              <TeamForm onSuccess={fetchData} />
            ) : (
              <Placeholder title="A aguardar que o Treinador Principal crie a Equipa..." />
            )
          ) : (
            <>
              {active === "dashboard" && (
                <Dashboard activeTeam={activeTeam} me={me} />
              )}
              {active === "clube" && <ClubePage activeTeam={activeTeam} onRefreshMe={fetchData} />}
              {active === "plantel" ? (
                activeTeam ? (
                  <Squad activeTeam={activeTeam} />
                ) : (
                  <Placeholder title="Nenhum plantel configurado" />
                )
              ) : null}
              {active === "assiduidade" && <Attendance activeTeam={activeTeam} />}
              {active === "calendario" && <PlaneamentoSemanal activeTeam={activeTeam} />}
              {active === "treinos" && <TreinosOrchestrator activeTeam={activeTeam} />}
              {active === "config" && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
