"use client";

import React from "react";
import { Team } from "@/models/team";
import { usePlaneamentoSemanal } from "./usePlaneamentoSemanal";
import { CalendarioHeader } from "./CalendarioHeader";
import { CalendarioWeekView } from "./CalendarioWeekView";
import { CalendarioMonthView } from "./CalendarioMonthView";
import { CalendarioDayView } from "./CalendarioDayView";
import { EventoFormModal } from "./EventoFormModal";
import { CalendarioSyncModal } from "./CalendarioSyncModal";

interface PlaneamentoSemanalProps {
  activeTeam: Team | null;
}

export function PlaneamentoSemanal({ activeTeam }: PlaneamentoSemanalProps) {
  const {
    baseDate,
    viewType,
    setViewType,
    diasDaVista,
    eventos,
    loading,
    morfociclo,
    isModalOpen,
    setIsModalOpen,
    modalDefaultDate,
    eventoEdit,
    nextNumeroTreino,
    isSyncModalOpen,
    setIsSyncModalOpen,
    prevPeriod,
    nextPeriod,
    renderHeaderDate,
    handleDateChange,
    openNewEventModal,
    openEditEventModal,
    handleSaveEvent,
    handleDeleteEvent,
    saveMorfociclo,
  } = usePlaneamentoSemanal(activeTeam);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header com Navegação e Morfociclo */}
      <CalendarioHeader
        baseDate={baseDate}
        viewType={viewType}
        setViewType={setViewType}
        morfociclo={morfociclo}
        saveMorfociclo={saveMorfociclo}
        renderHeaderDate={renderHeaderDate}
        prevPeriod={prevPeriod}
        nextPeriod={nextPeriod}
        handleDateChange={handleDateChange}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Conteúdo Dinâmico Consoante a Vista */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs gap-2">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>A carregar planeamento...</span>
        </div>
      ) : viewType === "week" ? (
        <CalendarioWeekView
          diasDaVista={diasDaVista}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onDeleteEvent={handleDeleteEvent}
        />
      ) : viewType === "month" ? (
        <CalendarioMonthView
          baseDate={baseDate}
          diasDaVista={diasDaVista}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
        />
      ) : (
        <CalendarioDayView
          dia={diasDaVista[0]}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* Modal de Formulário de Evento */}
      <EventoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        defaultDate={modalDefaultDate}
        eventoEdit={eventoEdit}
        defaultNumeroTreino={nextNumeroTreino}
      />

      {/* Modal de Sincronização iCal Isolado */}
      <CalendarioSyncModal
        isOpen={isSyncModalOpen}
        activeTeam={activeTeam}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
