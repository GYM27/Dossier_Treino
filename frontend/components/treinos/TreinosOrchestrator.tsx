import React, { useState } from 'react';
import { Team } from '@/models/team';
import { Placeholder } from '@/components/ui/Placeholder';
import { TreinoBuilderStitch } from './TreinoBuilderStitch';

export function TreinosOrchestrator({ activeTeam }: { activeTeam: Team | null }) {
  if (!activeTeam) {
    return <Placeholder title="Nenhuma equipa selecionada" />;
  }

  return <TreinoBuilderStitch activeTeam={activeTeam} onGoBack={() => {}} />;
}
