"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CalendarDays,
  Cake,
  ArrowRight,
  Shield,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { useDashboardData } from "./useDashboardData";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { activeTeam, me } = useActiveTeam();
  const {
    loading,
    totalAtletas,
    taxaAssiduidade,
    totalAtrasos,
    proximoEventoLabel,
    proximoEventoSub,
    distribuicaoPosicoes,
    proximosEventos,
    aniversariosMes,
    atletas,
  } = useDashboardData(activeTeam?.id);

  const metrics = [
    {
      label: "Atletas no plantel",
      value: totalAtletas,
      sub: activeTeam ? `${activeTeam.nome}` : "Nenhuma equipa",
      icon: Users,
      color: "text-cyan-400 bg-cyan-500/10",
    },
    {
      label: "Assiduidade média",
      value: taxaAssiduidade,
      sub: "últimos 30 dias",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Próximo evento",
      value: proximoEventoLabel,
      sub: proximoEventoSub,
      icon: Calendar,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      label: "Atrasos do mês",
      value: totalAtrasos.toString(),
      sub: "registados em treino/jogo",
      icon: Clock,
      color: "text-rose-400 bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header com Saudação e Identificação da Equipa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Bem-vindo, {me?.nomeCompleto || "Treinador"}</span>
          </h1>
          <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>Resumo operacional e atividade recente de</span>
            <Badge variant="outline" className="text-xs bg-slate-800/80 border-slate-700 text-cyan-300">
              <Shield className="size-3 mr-1" />
              {activeTeam?.nome || "Sem equipa ativa"}
            </Badge>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Spinner size="sm" color="cyan" />
            <span>A atualizar indicadores...</span>
          </div>
        )}
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">{m.label}</p>
                <span className={cn("flex size-9 items-center justify-center rounded-xl", m.color)}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold tracking-tight text-slate-100">
                  {m.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 truncate">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Grid Principal: Próximos Eventos, Distribuição e Aniversários */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna 1 & 2: Próximos Eventos Reais */}
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-lg lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-cyan-400" />
              <h2 className="font-semibold text-slate-100 text-lg tracking-tight">
                Próximos Eventos da Equipa
              </h2>
            </div>
            <Link href="/calendario">
              <Button size="sm" variant="ghost" className="text-xs text-cyan-400 hover:text-cyan-300">
                Ver Calendário Completo
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {proximosEventos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
              <Calendar className="size-10 text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">Sem eventos agendados para as próximas semanas</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Planeia os treinos ou jogos no calendário para manter a equipa organizada.
              </p>
              <Link href="/calendario">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold">
                  Agendar no Calendário
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5 flex-1">
              {proximosEventos.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 transition-colors hover:bg-slate-800/40"
                >
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-800/80 leading-none border border-slate-700/50">
                    <span className="text-base font-bold text-slate-100">{e.day}</span>
                    <span className="text-[0.65rem] font-semibold text-cyan-400 mt-0.5">
                      {e.month}
                    </span>
                  </div>
                  <span className={cn("h-9 w-1.5 rounded-full shrink-0", e.tone)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-200 truncate">{e.title}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[0.65rem] px-1.5 py-0",
                          e.type === "JOGO"
                            ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                            : "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                        )}
                      >
                        {e.type === "JOGO" ? "Jogo Oficial" : "Treino"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {e.time}
                      </span>
                      {e.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="size-3" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna 3: Distribuição do Plantel & Aniversários */}
        <div className="space-y-6">
          {/* Distribuição do Plantel */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-100 text-base tracking-tight">
                Distribuição do Plantel
              </h2>
              <Link href="/plantel">
                <span className="text-xs text-cyan-400 hover:underline">Ver Plantel</span>
              </Link>
            </div>

            <ul className="space-y-3">
              {[
                {
                  label: "Guarda-Redes",
                  value: distribuicaoPosicoes.guardaRedes,
                  tone: "bg-amber-400",
                },
                {
                  label: "Defesas",
                  value: distribuicaoPosicoes.defesas,
                  tone: "bg-blue-500",
                },
                {
                  label: "Médios",
                  value: distribuicaoPosicoes.medios,
                  tone: "bg-cyan-400",
                },
                {
                  label: "Avançados",
                  value: distribuicaoPosicoes.avancados,
                  tone: "bg-rose-500",
                },
              ].map((row) => {
                const percentage = totalAtletas > 0 ? (row.value / totalAtletas) * 100 : 0;
                return (
                  <li key={row.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{row.label}</span>
                      <span className="font-mono text-slate-200">
                        {row.value} <span className="text-slate-400">({Math.round(percentage)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", row.tone)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Aniversários do Mês */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3.5">
              <Cake className="size-4 text-pink-400" />
              <h2 className="font-semibold text-slate-100 text-base tracking-tight">
                Aniversários do Mês
              </h2>
            </div>

            {aniversariosMes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Nenhum atleta faz anos neste mês.
              </p>
            ) : (
              <ul className="space-y-2">
                {aniversariosMes.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 font-bold text-[0.7rem]">
                        {a.dia}
                      </span>
                      <span className="font-medium text-slate-200">{a.nome}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{a.idade} anos</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;