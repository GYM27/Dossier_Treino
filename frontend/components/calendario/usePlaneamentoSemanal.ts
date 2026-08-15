import { useState, useEffect, useMemo, useCallback } from "react";
import { Team } from "@/models/team";
import { EventoCalendario } from "@/models/planeamento";
import { calendarioService } from "@/services";

export type ViewType = "month" | "week" | "day";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const MESES_COMPLETO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function usePlaneamentoSemanal(activeTeam: Team | null) {
  // Estado para a data base (segunda-feira da semana selecionada)
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [morfociclo, setMorfociclo] = useState<number>(1);
  const [planId, setPlanId] = useState<string | null>(null);

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>(undefined);
  const [eventoEdit, setEventoEdit] = useState<EventoCalendario | null>(null);
  const [nextNumeroTreino, setNextNumeroTreino] = useState<number>(1);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("week");

  // Calcula os dias visíveis consoante a vista
  const diasDaVista = useMemo(() => {
    if (viewType === "day") {
      return [baseDate];
    }

    if (viewType === "week") {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(baseDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff + i);
        return d;
      });
    }

    // Month view: 42 dias (6 semanas)
    const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 para Segunda, 6 para Domingo

    const startCalendarDate = new Date(firstDayOfMonth);
    startCalendarDate.setDate(startCalendarDate.getDate() - offset);

    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(startCalendarDate);
      d.setDate(startCalendarDate.getDate() + i);
      return d;
    });
  }, [baseDate, viewType]);

  const startDateIso = diasDaVista[0].toISOString().split("T")[0] + "T00:00:00";
  const endDateIso = diasDaVista[diasDaVista.length - 1].toISOString().split("T")[0] + "T23:59:59";

  // Carregar eventos e morfociclos da semana
  const fetchSemana = useCallback(async () => {
    if (!activeTeam?.id) return;
    setLoading(true);
    try {
      const start = startDateIso;
      const end = endDateIso;

      try {
        const eventosData = await calendarioService.getEventosSemana(activeTeam.id, start, end);
        setEventos(eventosData || []);
      } catch (e) {
        console.error("Erro ao carregar eventos:", e);
      }

      try {
        const dataIn = start.split("T")[0];
        const planeamento = await calendarioService.getMicrocicloSemana(activeTeam.id, dataIn);
        if (planeamento) {
          setPlanId(planeamento.id);
          setMorfociclo(planeamento.numeroMorfociclo);
        } else {
          setPlanId(null);
          setMorfociclo(1);
        }
      } catch (e) {
        setPlanId(null);
        setMorfociclo(1);
      }
    } catch (error) {
      console.error("Erro ao carregar semana:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTeam?.id, startDateIso, endDateIso]);

  useEffect(() => {
    fetchSemana();
  }, [fetchSemana]);

  const saveMorfociclo = useCallback(
    async (val: number) => {
      if (!activeTeam?.id) return;
      const payload = {
        dataInicio: startDateIso,
        dataFim: endDateIso,
        numeroMicrociclo: 1,
        numeroMorfociclo: val,
        equipaId: activeTeam.id,
      };
      try {
        await calendarioService.salvarMicrociclo(activeTeam.id, payload);
        fetchSemana();
      } catch (e) {
        console.error("Erro ao guardar morfociclo", e);
      }
    },
    [activeTeam?.id, startDateIso, endDateIso, fetchSemana]
  );

  const prevPeriod = useCallback(() => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      if (viewType === "day") d.setDate(d.getDate() - 1);
      else if (viewType === "week") d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewType]);

  const nextPeriod = useCallback(() => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      if (viewType === "day") d.setDate(d.getDate() + 1);
      else if (viewType === "week") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewType]);

  const renderHeaderDate = useCallback(() => {
    if (viewType === "month") {
      return `${MESES_COMPLETO[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    }
    if (viewType === "day") {
      return `${baseDate.getDate()} ${MESES_COMPLETO[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    }
    const d1 = diasDaVista[0];
    const d2 = diasDaVista[6] || d1;
    return `${d1.getDate()} ${MESES[d1.getMonth()]} — ${d2.getDate()} ${MESES[d2.getMonth()]}`;
  }, [baseDate, diasDaVista, viewType]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = new Date(e.target.value);
    if (!isNaN(selected.getTime())) {
      setBaseDate(selected);
    }
  }, []);

  const openNewEventModal = useCallback(
    async (dayDate: Date) => {
      setEventoEdit(null);
      setModalDefaultDate(dayDate);

      if (activeTeam?.id) {
        try {
          const lastNum = await calendarioService.getUltimoNumeroTreino(activeTeam.id);
          setNextNumeroTreino(lastNum ? lastNum + 1 : 1);
        } catch {
          setNextNumeroTreino(1);
        }
      } else {
        setNextNumeroTreino(1);
      }

      setIsModalOpen(true);
    },
    [activeTeam?.id]
  );

  const openEditEventModal = useCallback((evento: EventoCalendario) => {
    setEventoEdit(evento);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = useCallback(
    async (evento: Omit<EventoCalendario, "id">) => {
      if (!activeTeam?.id) return;
      try {
        if (eventoEdit?.id) {
          await calendarioService.atualizarEvento(eventoEdit.id, evento);
        } else {
          await calendarioService.criarEvento(activeTeam.id, evento);
        }
        setIsModalOpen(false);
        fetchSemana();
      } catch (error) {
        console.error("Erro ao guardar evento", error);
        alert("Erro ao guardar o evento.");
      }
    },
    [activeTeam?.id, eventoEdit?.id, fetchSemana]
  );

  const handleDeleteEvent = useCallback(
    async (eventoId: string) => {
      if (
        !confirm(
          "Tem a certeza que deseja eliminar este evento? Os registos de assiduidade associados também serão eliminados."
        )
      )
        return;

      try {
        await calendarioService.eliminarEvento(eventoId);
        fetchSemana();
      } catch (error) {
        console.error("Erro ao eliminar evento", error);
        alert("Erro ao eliminar o evento.");
      }
    },
    [fetchSemana]
  );

  return {
    baseDate,
    setBaseDate,
    viewType,
    setViewType,
    diasDaVista,
    eventos,
    loading,
    morfociclo,
    planId,
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
    fetchSemana,
  };
}
