"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PlaneamentoSemanal } from "@/components/calendario/PlaneamentoSemanal";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Placeholder } from "@/components/ui/Placeholder";

export default function CalendarioPage() {
  const { activeTeam } = useActiveTeam();
  const router = useRouter();

  if (!activeTeam) {
    return <Placeholder title="Selecione uma equipa para visualizar o calendário semanal" />;
  }

  const handlePlanTreino = (evento: any) => {
    if (evento?.id) {
      router.push(`/treinos?treinoId=${evento.id}`);
    } else {
      router.push("/treinos");
    }
  };

  return (
    <PlaneamentoSemanal
      activeTeam={activeTeam}
      onPlanTreino={handlePlanTreino}
    />
  );
}
