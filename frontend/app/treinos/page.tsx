"use client";

import { TreinosOrchestrator } from "@/modules/treinos/TreinosOrchestrator";
import { useState } from "react";

export default function TreinosPage() {
  const [activeTeam, setActiveTeam] = useState(null);

  // Recuperar a equipa ativa do localStorage ou contexto
  // (a lógica de carregamento de dados já está no Orchestrator)

  return (
    <TreinosOrchestrator activeTeam={activeTeam} />
  );
}