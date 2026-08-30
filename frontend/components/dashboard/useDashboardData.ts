"use client";

import { useState, useEffect, useCallback } from "react";
import { atletaService } from "@/services/atletaService";
import { calendarioService } from "@/services/calendarioService";
import { assiduidadeService } from "@/services/assiduidadeService";
import { EventoCalendario } from "@/models/planeamento";
import { RegistoAssiduidade } from "@/models/assiduidade";

export interface AtletaDashboard {
  id: string;
  nome: string;
  posicaoPrincipal: string;
  dataNascimento?: string;
  numeroCamisola?: number;
  fotoUrl?: string;
}

export interface ProximoEventoFormatado {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  type: "TREINO" | "JOGO" | "FOLGA" | "OUTRO";
  location?: string;
  tone: string;
}

export interface Aniversariante {
  id: string;
  nome: string;
  dia: number;
  idade: number;
  posicao: string;
}

export interface DistribuicaoPosicoes {
  guardaRedes: number;
  defesas: number;
  medios: number;
  avancados: number;
}

export interface DashboardData {
  loading: boolean;
  totalAtletas: number;
  taxaAssiduidade: string;
  totalAtrasos: number;
  proximoEventoLabel: string;
  proximoEventoSub: string;
  distribuicaoPosicoes: DistribuicaoPosicoes;
  proximosEventos: ProximoEventoFormatado[];
  aniversariosMes: Aniversariante[];
  atletas: AtletaDashboard[];
  refresh: () => Promise<void>;
}

const MESES_ABREV = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

export function useDashboardData(equipaId: string | undefined): DashboardData {
  const [loading, setLoading] = useState(false);
  const [atletas, setAtletas] = useState<AtletaDashboard[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [registos, setRegistos] = useState<RegistoAssiduidade[]>([]);

  const fetchData = useCallback(async () => {
    if (!equipaId) {
      setAtletas([]);
      setEventos([]);
      setRegistos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Intervalo de 14 dias para eventos
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Segunda-feira
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 13);
      end.setHours(23, 59, 59, 999);

      const [atletasRes, eventosRes, registosRes] = await Promise.allSettled([
        atletaService.getAtletasByEquipa(equipaId),
        calendarioService.getEventosSemana(equipaId, start.toISOString(), end.toISOString()),
        assiduidadeService.getRegistosByEquipaEMes(equipaId, currentYear, currentMonth),
      ]);

      if (atletasRes.status === "fulfilled" && Array.isArray(atletasRes.value)) {
        setAtletas(atletasRes.value);
      } else {
        setAtletas([]);
      }

      if (eventosRes.status === "fulfilled" && Array.isArray(eventosRes.value)) {
        setEventos(eventosRes.value);
      } else {
        setEventos([]);
      }

      if (registosRes.status === "fulfilled" && Array.isArray(registosRes.value)) {
        setRegistos(registosRes.value);
      } else {
        setRegistos([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [equipaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 1. Distribuição de Posições
  const distribuicaoPosicoes: DistribuicaoPosicoes = {
    guardaRedes: atletas.filter((a) => a.posicaoPrincipal === "GUARDA_REDES").length,
    defesas: atletas.filter((a) => a.posicaoPrincipal === "DEFESA").length,
    medios: atletas.filter((a) => a.posicaoPrincipal === "MEDIO").length,
    avancados: atletas.filter((a) => a.posicaoPrincipal === "AVANCADO").length,
  };

  // 2. Taxa de Assiduidade e Atrasos
  let taxaAssiduidade = "100%";
  let totalAtrasos = 0;
  if (registos.length > 0) {
    const presentesOuAtrasados = registos.filter(
      (r) => r.tipoAssiduidade === "PRESENTE" || r.tipoAssiduidade === "ATRASADO"
    ).length;
    totalAtrasos = registos.filter((r) => r.tipoAssiduidade === "ATRASADO").length;
    const taxa = Math.round((presentesOuAtrasados / registos.length) * 100);
    taxaAssiduidade = `${taxa}%`;
  }

  // 3. Próximos Eventos Formatados
  const proximosEventos: ProximoEventoFormatado[] = eventos
    .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())
    .map((e) => {
      const d = new Date(e.dataHoraInicio);
      const isJogo = e.tipoEvento === "JOGO";
      return {
        id: e.id || `ev_${Math.random()}`,
        title: e.descricao || (isJogo ? "Jogo Oficial" : "Sessão de Treino"),
        day: d.getDate().toString().padStart(2, "0"),
        month: MESES_ABREV[d.getMonth()] || "OUT",
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: e.tipoEvento,
        location: e.local,
        tone: isJogo ? "bg-amber-500" : "bg-cyan-500",
      };
    });

  // 4. Próximo Evento (Card de Métrica)
  let proximoEventoLabel = "Sem eventos";
  let proximoEventoSub = "agendados";
  if (proximosEventos.length > 0) {
    const next = proximosEventos[0];
    proximoEventoLabel = next.day + " " + next.month;
    proximoEventoSub = next.time + " (" + (next.type === "JOGO" ? "Jogo" : "Treino") + ")";
  }

  // 5. Aniversários do Mês
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  const aniversariosMes: Aniversariante[] = atletas
    .filter((a) => {
      if (!a.dataNascimento) return false;
      const bDate = new Date(a.dataNascimento);
      return bDate.getMonth() === currentMonthIdx;
    })
    .map((a) => {
      const bDate = new Date(a.dataNascimento!);
      const birthYear = bDate.getFullYear();
      return {
        id: a.id,
        nome: a.nome,
        dia: bDate.getDate(),
        idade: currentYear - birthYear,
        posicao: a.posicaoPrincipal,
      };
    })
    .sort((a, b) => a.dia - b.dia);

  return {
    loading,
    totalAtletas: atletas.length,
    taxaAssiduidade,
    totalAtrasos,
    proximoEventoLabel,
    proximoEventoSub,
    distribuicaoPosicoes,
    proximosEventos,
    aniversariosMes,
    atletas,
    refresh: fetchData,
  };
}
