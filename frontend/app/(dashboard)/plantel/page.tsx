"use client";

import React from "react";
import { Squad } from "@/components/plantel/Squad";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Placeholder } from "@/components/ui/Placeholder";

export default function PlantelPage() {
  const { activeTeam } = useActiveTeam();

  if (!activeTeam) {
    return <Placeholder title="Nenhuma equipa selecionada para visualização do plantel" />;
  }

  return <Squad activeTeam={activeTeam} />;
}
