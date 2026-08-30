"use client";

import React from "react";
import { Attendance } from "@/components/assiduidade/Attendance";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { Placeholder } from "@/components/ui/Placeholder";

export default function AssiduidadePage() {
  const { activeTeam } = useActiveTeam();

  if (!activeTeam) {
    return <Placeholder title="Selecione uma equipa para consultar o registo de assiduidade" />;
  }

  return <Attendance activeTeam={activeTeam} />;
}
