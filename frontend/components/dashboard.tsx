"use client";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Atleta } from "@/models/atleta";

const upcoming = [
  {
    day: "15",
    month: "OUT",
    title: "Treino Tático",
    time: "19:00",
    tone: "bg-primary",
  },
  {
    day: "18",
    month: "OUT",
    title: "Jogo vs. SC Braga",
    time: "16:00",
    tone: "bg-danger",
  },
  {
    day: "20",
    month: "OUT",
    title: "Treino de Recuperação",
    time: "10:30",
    tone: "bg-chart-2",
  },
  {
    day: "22",
    month: "OUT",
    title: "Análise de Vídeo",
    time: "18:00",
    tone: "bg-warning",
  },
];

export function Dashboard() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  useEffect(() => {
    apiFetch("/atletas")
      .then((dados) => setAtletas(dados))
      .catch((erro) => console.error("Erro ao carregar atletas:", erro));
  }, []);

  const metrics = [
    {
      label: "Atletas no plantel",
      value: atletas.length,
      sub: "+2 esta época",
      icon: Users,
    },
    {
      label: "Assiduidade média",
      value: "92%",
      sub: "últimos 30 dias",
      icon: TrendingUp,
    },
    { label: "Próximo evento", value: "Hoje", sub: `19`, icon: Calendar },
    {
      label: "Atrasos do mês",
      value: "7",
      sub: "-3 vs. mês anterior",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo, José
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumo da tua equipa e atividade recente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="glass animate-fade-up rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-semibold tracking-tight">Próximos Eventos</h2>
          <ul className="mt-4 space-y-2">
            {upcoming.map((e) => (
              <li
                key={e.title}
                className="flex items-center gap-4 rounded-xl border border-border bg-foreground/[0.02] p-3 transition-colors hover:bg-foreground/[0.05]"
              >
                <div className="flex size-12 flex-col items-center justify-center rounded-lg bg-foreground/[0.04] leading-none">
                  <span className="text-base font-bold">{e.day}</span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {e.month}
                  </span>
                </div>
                <span className={cn("h-8 w-1 rounded-full", e.tone)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold tracking-tight">
            Distribuição do Plantel
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              {
                label: "Guarda-Redes",
                value: atletas.filter(
                  (a) => a.posicaoPrincipal === "GUARDA_REDES",
                ).length,
                tone: "bg-warning",
              },
              {
                label: "Defesas",
                value: atletas.filter((a) => a.posicaoPrincipal === "DEFESA")
                  .length,
                tone: "bg-chart-2",
              },
              {
                label: "Médios",
                value: atletas.filter((a) => a.posicaoPrincipal === "MEDIO")
                  .length,
                tone: "bg-primary",
              },
              {
                label: "Avançados",
                value: atletas.filter((a) => a.posicaoPrincipal === "AVANCADO")
                  .length,
                tone: "bg-danger",
              },
            ].map((row) => (
              <li key={row.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
                  <div
                    className={cn("h-full rounded-full", row.tone)}
                    style={{ width: `${(row.value / atletas.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
