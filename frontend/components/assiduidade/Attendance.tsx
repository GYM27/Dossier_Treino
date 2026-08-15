"use client";

import React from "react";
import { Team } from "@/models/team";
import { TipoAssiduidade } from "@/models/assiduidade";
import { useAttendance } from "./useAttendance";
import { AttendanceHeader } from "./AttendanceHeader";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceModal } from "./AttendanceModal";

interface AttendanceProps {
  activeTeam: Team | null;
}

export function Attendance({ activeTeam }: AttendanceProps) {
  const {
    loading,
    atletas,
    eventosRender,
    mounted,
    selectedCellModal,
    setSelectedCellModal,
    monthLabel,
    prevWeek,
    nextWeek,
    handleUpdateRegisto,
    getRegisto,
  } = useAttendance(activeTeam);

  const renderRegistoIcon = (tipo: TipoAssiduidade) => {
    switch (tipo) {
      case "PRESENTE":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg leading-none">
            .
          </div>
        );
      case "FALTA_INJUSTIFICADA":
      case "AUSENTE":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
            FI
          </div>
        );
      case "FALTA_JUSTIFICADA":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300 font-bold text-xs">
            FJ
          </div>
        );
      case "FALTA_AUTORIZADA":
      case "DISPENSADO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
            FA
          </div>
        );
      case "ATRASADO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
            A
          </div>
        );
      case "LESIONADO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
            L
          </div>
        );
      case "AO_SERVICO_SELECAO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
            S
          </div>
        );
      case "TREINO_CONDICIONADO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
            TC
          </div>
        );
      case "OUTRO":
        return (
          <div className="w-7 h-7 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
            O
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 mx-auto rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[10px]">
            ?
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-[1200px] mx-auto animate-in fade-in duration-200 select-none">
      {/* Header */}
      <AttendanceHeader
        monthLabel={monthLabel}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
      />

      {/* Matriz de Assiduidade */}
      <AttendanceTable
        atletas={atletas}
        eventosRender={eventosRender}
        loading={loading}
        getRegisto={getRegisto}
        selectedCellModal={selectedCellModal}
        onSelectCell={(cell) => setSelectedCellModal(cell)}
        renderRegistoIcon={renderRegistoIcon}
      />

      {/* Modal de Escolha de Presença */}
      <AttendanceModal
        isOpen={!!selectedCellModal}
        mounted={mounted}
        onClose={() => setSelectedCellModal(null)}
        onSelectTipo={(tipo) => {
          if (selectedCellModal) {
            handleUpdateRegisto(
              selectedCellModal.eventoId,
              selectedCellModal.atletaId,
              tipo
            );
          }
        }}
      />
    </div>
  );
}
