import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Team } from "@/models/team";
import { EventoCalendario } from "@/models/planeamento";
import { RegistoAssiduidade, RegistoAssiduidadeUpdate, TipoAssiduidade } from "@/models/assiduidade";
import { assiduidadeService, atletaService, calendarioService } from "@/services";

export interface JogadorBase {
  id: string;
  nome: string;
  numeroCamisola: number;
  fotoUrl?: string;
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export function useAttendance(activeTeam: Team | null) {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [atletas, setAtletas] = useState<JogadorBase[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [registos, setRegistos] = useState<RegistoAssiduidade[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCellModal, setSelectedCellModal] = useState<{ atletaId: string; eventoId: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular início e fim da semana (Segunda a Domingo)
  const { startDate, endDate, startDateIso, endDateIso } = useMemo(() => {
    const currentDay = baseDate.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      startDate: start,
      endDate: end,
      startDateIso: start.toISOString().split("T")[0] + "T00:00:00",
      endDateIso: end.toISOString().split("T")[0] + "T23:59:59",
    };
  }, [baseDate]);

  const fetchDadosSemana = useCallback(async () => {
    if (!activeTeam?.id) return;
    setLoading(true);
    try {
      const [atletasData, eventosData, registosData] = await Promise.all([
        atletaService.getAtletasByEquipa(activeTeam.id),
        calendarioService.getEventosSemana(activeTeam.id, startDateIso, endDateIso),
        assiduidadeService.getRegistosSemana(activeTeam.id, startDateIso, endDateIso),
      ]);
      setAtletas(atletasData || []);
      setEventos(eventosData || []);
      setRegistos(registosData || []);
    } catch {
      toast.error("Erro ao carregar dados da semana.");
    } finally {
      setLoading(false);
    }
  }, [activeTeam?.id, startDateIso, endDateIso]);

  useEffect(() => {
    fetchDadosSemana();
  }, [fetchDadosSemana]);

  const eventosRender = useMemo(() => {
    let treinoCount = 0;
    return eventos.map((evento) => {
      if (evento.tipoEvento === "TREINO") {
        treinoCount++;
        return { ...evento, numeroTreino: treinoCount };
      }
      return { ...evento, numeroTreino: undefined };
    });
  }, [eventos]);

  const prevWeek = useCallback(() => {
    setBaseDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  }, []);

  const nextWeek = useCallback(() => {
    setBaseDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  }, []);

  const monthLabel = `${startDate.getDate()} ${MESES[startDate.getMonth()]} - ${endDate.getDate()} ${MESES[endDate.getMonth()]}`;

  const handleUpdateRegisto = useCallback(
    async (eventoId: string, atletaId: string, tipo: TipoAssiduidade) => {
      const existente = registos.find((r) => r.eventoId === eventoId && r.atletaId === atletaId);

      setSelectedCellModal(null);

      const previousRegistos = [...registos];

      if (existente) {
        const updated = { ...existente, tipoAssiduidade: tipo };
        setRegistos((prev) => prev.map((r) => (r.id === existente.id ? updated : r)));
      } else {
        const fakeNew: RegistoAssiduidade = {
          id: "temp-" + Date.now(),
          eventoId,
          atletaId,
          tipoAssiduidade: tipo,
        };
        setRegistos((prev) => [...prev, fakeNew]);
      }

      try {
        const payload: RegistoAssiduidadeUpdate = { tipoAssiduidade: tipo };
        await assiduidadeService.atualizarAssiduidade(eventoId, atletaId, payload);
      } catch {
        toast.error("Erro ao atualizar assiduidade.");
        setRegistos(previousRegistos); // rollback
      }
    },
    [registos]
  );

  const getEventForDay = useCallback(
    (date: Date) => {
      return eventos.find((e) => new Date(e.dataHoraInicio).getDate() === date.getDate());
    },
    [eventos]
  );

  const getRegisto = useCallback(
    (eventoId: string, atletaId: string) => {
      return registos.find((r) => r.eventoId === eventoId && r.atletaId === atletaId);
    },
    [registos]
  );

  return {
    baseDate,
    loading,
    atletas,
    eventos,
    registos,
    mounted,
    selectedCellModal,
    setSelectedCellModal,
    startDate,
    endDate,
    eventosRender,
    monthLabel,
    prevWeek,
    nextWeek,
    handleUpdateRegisto,
    getEventForDay,
    getRegisto,
  };
}
