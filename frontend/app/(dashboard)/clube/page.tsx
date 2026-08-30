"use client";

import React from "react";
import { ClubePage } from "@/components/clube/ClubePage";
import { useActiveTeam } from "@/context/ActiveTeamContext";

export default function ClubeRoutePage() {
  const { activeTeam, teams, setActiveTeam, refreshData } = useActiveTeam();

  return (
    <ClubePage
      activeTeam={activeTeam}
      teams={teams}
      onTeamChange={setActiveTeam}
      onRefreshMe={refreshData}
    />
  );
}
