import React, { useState } from 'react';
import { Team } from '@/models/team';
import { Placeholder } from '@/components/ui/Placeholder';
import { TreinoBuilderStitch } from './TreinoBuilderStitch';

export function TreinosOrchestrator({ activeTeam }: { activeTeam: Team | null }) {
  const [isBuilding, setIsBuilding] = useState(true); // Forcing to true for now to show the UI

  if (!activeTeam) {
    return <Placeholder title="Nenhuma equipa selecionada" />;
  }

  if (isBuilding) {
    return <TreinoBuilderStitch activeTeam={activeTeam} onGoBack={() => setIsBuilding(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Treinos</h1>
        <button onClick={() => setIsBuilding(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 transition-colors">
          Novo Treino
        </button>
      </div>
      <p className="text-muted-foreground">Lista de treinos aparecerá aqui.</p>
    </div>
  );
}
