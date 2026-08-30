"use client";

import { type Team } from "@/models/team";
import { Info, Users, Dumbbell, Trophy, Calendar, Sparkles, Activity, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Atleta } from "@/models/atleta";
import { SessaoTreino } from "@/models/sessao-treino";
import { Spinner } from "@/components/ui/Spinner";

interface ClubStatsTabProps {
  team: Team;
}

interface EventoItem {
  id: string;
  tipoEvento: string;
  dataHoraInicio: string;
  descricao?: string;
  local?: string;
  equipaCasa?: string;
  equipaFora?: string;
}

export function ClubStatsTab({ team }: ClubStatsTabProps) {
  const [loading, setLoading] = useState(true);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [treinos, setTreinos] = useState<SessaoTreino[]>([]);
  const [eventos, setEventos] = useState<EventoItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadTeamData() {
      setLoading(true);
      try {
        const [atletasRes, treinosRes, eventosRes] = await Promise.allSettled([
          apiFetch<Atleta[]>(`/atletas/equipa/${team.id}`),
          apiFetch<SessaoTreino[]>(`/treinos/equipa/${team.id}`),
          apiFetch<EventoItem[]>(`/eventos/equipa/${team.id}`),
        ]);

        if (isMounted) {
          if (atletasRes.status === "fulfilled" && Array.isArray(atletasRes.value)) {
            setAtletas(atletasRes.value);
          } else {
            setAtletas([]);
          }

          if (treinosRes.status === "fulfilled" && Array.isArray(treinosRes.value)) {
            setTreinos(treinosRes.value);
          } else {
            setTreinos([]);
          }

          if (eventosRes.status === "fulfilled" && Array.isArray(eventosRes.value)) {
            setEventos(eventosRes.value);
          } else {
            setEventos([]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados estatísticos da equipa:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (team?.id) {
      loadTeamData();
    }

    return () => {
      isMounted = false;
    };
  }, [team.id]);

  // Cálculos Dinâmicos
  const totalJogadores = atletas.length;
  const totalTreinos = treinos.length;
  const jogos = eventos.filter((e) => e.tipoEvento === "JOGO");
  const totalJogos = jogos.length;

  // Distribuição por Posições
  const guardaRedes = atletas.filter((a) => a.posicaoPrincipal === "GR" || a.posicaoPrincipal?.toLowerCase().includes("guarda")).length;
  const defesas = atletas.filter((a) => ["DEF", "DC", "DD", "DE", "LE", "LD"].includes(a.posicaoPrincipal || "") || a.posicaoPrincipal?.toLowerCase().includes("defesa") || a.posicaoPrincipal?.toLowerCase().includes("lateral")).length;
  const medios = atletas.filter((a) => ["MED", "MDC", "MC", "MO"].includes(a.posicaoPrincipal || "") || a.posicaoPrincipal?.toLowerCase().includes("médio") || a.posicaoPrincipal?.toLowerCase().includes("volante")).length;
  const avancados = atletas.filter((a) => ["AV", "PL", "EXT", "ED", "EE"].includes(a.posicaoPrincipal || "") || a.posicaoPrincipal?.toLowerCase().includes("avan") || a.posicaoPrincipal?.toLowerCase().includes("extremo") || a.posicaoPrincipal?.toLowerCase().includes("ponta")).length;
  const outros = totalJogadores - (guardaRedes + defesas + medios + avancados);

  // Distribuição Mensal de Treinos
  const treinosPorMes: { [key: string]: number } = {};
  treinos.forEach((t) => {
    if (t.data) {
      try {
        const d = new Date(t.data);
        const mesAno = d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
        treinosPorMes[mesAno] = (treinosPorMes[mesAno] || 0) + 1;
      } catch (e) {
        // Fallback ignorar formato inválido
      }
    }
  });

  const mesesComTreinos = Object.entries(treinosPorMes);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <Spinner size="xl" color="primary" />
        <p className="text-xs text-muted-foreground">A carregar estatísticas reais de {team.nome}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. GERAL: Dados em Tempo Real da Equipa */}
      <div className="glass overflow-hidden rounded-2xl shadow-sm border border-border/50">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Resumo Geral • {team.nome}</h3>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-foreground/5 px-2.5 py-1 rounded-md">
            {team.escalao || "Plantel"} • {team.epocaNome || "2025/2026"}
          </span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0">
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-extrabold tracking-tighter text-foreground font-mono">
              {totalJogadores}
            </div>
            <div className="mt-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Users className="size-3.5 text-primary" />
              <span>Jogadores Inscritos</span>
            </div>
          </div>

          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-extrabold tracking-tighter text-emerald-400 font-mono">
              {totalTreinos}
            </div>
            <div className="mt-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Dumbbell className="size-3.5 text-emerald-400" />
              <span>Sessões de Treino</span>
            </div>
          </div>

          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-extrabold tracking-tighter text-cyan-400 font-mono">
              {totalJogos}
            </div>
            <div className="mt-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Trophy className="size-3.5 text-cyan-400" />
              <span>Jogos Agendados</span>
            </div>
          </div>

          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-extrabold tracking-tighter text-amber-400 font-mono">
              {eventos.length}
            </div>
            <div className="mt-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Calendar className="size-3.5 text-amber-400" />
              <span>Eventos Calendário</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPOSIÇÃO DO PLANTEL DA EQUIPA */}
      <div className="glass overflow-hidden rounded-2xl shadow-sm border border-border/50">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-cyan-400" />
            <h3 className="font-bold text-foreground text-sm">Estrutura do Plantel por Posições</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalJogadores} {totalJogadores === 1 ? "atleta" : "atletas"} no plantel
          </span>
        </div>

        {totalJogadores > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50 p-2">
            <div className="p-4 text-center">
              <span className="text-2xl font-bold text-amber-400 font-mono">{guardaRedes}</span>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Guarda-Redes</p>
            </div>
            <div className="p-4 text-center">
              <span className="text-2xl font-bold text-blue-400 font-mono">{defesas}</span>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Defesas</p>
            </div>
            <div className="p-4 text-center">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{medios}</span>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Médios</p>
            </div>
            <div className="p-4 text-center">
              <span className="text-2xl font-bold text-rose-400 font-mono">{avancados}</span>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Avançados</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Shield className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Ainda não adicionou atletas a esta equipa.</p>
            <p className="text-xs text-muted-foreground">Aceda ao menu &quot;Plantel&quot; para registar os jogadores deste escalão.</p>
          </div>
        )}
      </div>

      {/* 3. DISTRIBUIÇÃO MENSAL DE TREINOS DA EQUIPA */}
      <div className="glass overflow-hidden rounded-2xl shadow-sm border border-border/50">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-4 text-emerald-400" />
            <h3 className="font-bold text-foreground text-sm">Distribuição de Treinos por Mês</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Total de {totalTreinos} {totalTreinos === 1 ? "sessão" : "sessões"}
          </span>
        </div>

        {mesesComTreinos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
            {mesesComTreinos.map(([mes, count]) => (
              <div key={mes} className="bg-foreground/[0.02] border border-border/40 p-4 rounded-xl text-center">
                <span className="text-3xl font-extrabold text-foreground font-mono">{count}</span>
                <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                  {mes}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Dumbbell className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Nenhuma sessão de treino registada nesta equipa.</p>
            <p className="text-xs text-muted-foreground">Crie ou associe sessões no menu &quot;Planos de Treino&quot; ou &quot;Calendário&quot;.</p>
          </div>
        )}
      </div>

      {/* 4. JOGOS E EVENTOS DA EQUIPA */}
      <div className="glass overflow-hidden rounded-2xl shadow-sm border border-border/50">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            <h3 className="font-bold text-foreground text-sm">Jogos & Encontros Registados</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalJogos} {totalJogos === 1 ? "jogo" : "jogos"} no calendário
          </span>
        </div>

        {jogos.length > 0 ? (
          <div className="divide-y divide-border/30">
            {jogos.map((j) => (
              <div key={j.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {j.equipaCasa || team.nome} vs {j.equipaFora || "Adversário"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {j.local || "Campo do Clube"} • {j.dataHoraInicio ? new Date(j.dataHoraInicio).toLocaleDateString("pt-PT") : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md">
                  Jogo Oficial
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Trophy className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Sem jogos agendados para esta equipa.</p>
            <p className="text-xs text-muted-foreground">Adicione encontros e competições através do Calendário.</p>
          </div>
        )}
      </div>
    </div>
  );
}
