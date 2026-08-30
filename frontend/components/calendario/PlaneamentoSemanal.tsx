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
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface PlaneamentoSemanalProps {
  activeTeam: Team | null;
  onPlanTreino?: (evento: any) => void;
}

export function PlaneamentoSemanal({ activeTeam, onPlanTreino }: PlaneamentoSemanalProps) {
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
    confirmDialog,
    setConfirmDialog,
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
          <Spinner size="lg" color="cyan" />
          <span>A carregar planeamento...</span>
        </div>
      ) : viewType === "week" ? (
        <CalendarioWeekView
          diasDaVista={diasDaVista}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onDeleteEvent={handleDeleteEvent}
          onPlanTreino={onPlanTreino}
        />
      ) : viewType === "month" ? (
        <CalendarioMonthView
          baseDate={baseDate}
          diasDaVista={diasDaVista}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onPlanTreino={onPlanTreino}
        />
      ) : (
        <CalendarioDayView
          dia={diasDaVista[0]}
          eventos={eventos}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onDeleteEvent={handleDeleteEvent}
          onPlanTreino={onPlanTreino}
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

      {/* Modal de Confirmação Acessível */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
