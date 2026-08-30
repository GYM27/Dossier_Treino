"use client";

import React from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Placeholder } from "@/components/ui/Placeholder";

export default function DashboardPage() {
  const { activeTeam } = useActiveTeam();

  if (!activeTeam) {
    return <Placeholder title="Selecione uma equipa no topo para ver o resumo do Dashboard" />;
  }

  return <Dashboard />;
}
