"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TreinosOrchestrator } from "@/modules/treinos/TreinosOrchestrator";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Spinner } from "@/components/ui/Spinner";
import { Placeholder } from "@/components/ui/Placeholder";

function TreinosContent() {
  const { activeTeam } = useActiveTeam();
  const searchParams = useSearchParams();
  const initialTreinoId = searchParams?.get("treinoId") || null;

  if (!activeTeam) {
    return <Placeholder title="Selecione uma equipa para aceder aos planos de treino" />;
  }

  return (
    <TreinosOrchestrator
      activeTeam={activeTeam}
      initialTreinoId={initialTreinoId}
    />
  );
}

export default function TreinosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Spinner size="md" color="cyan" />
          <span className="text-sm">A carregar estúdio de treinos...</span>
        </div>
      }
    >
      <TreinosContent />
    </Suspense>
  );
}
