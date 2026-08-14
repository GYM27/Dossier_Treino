"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, Check, X, Clock, HelpCircle, Activity, Globe, Bed } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { Team } from "@/models/team";
import { EventoCalendario } from "@/models/calendario";
import { RegistoAssiduidade, RegistoAssiduidadeUpdate, TipoAssiduidade } from "@/models/assiduidade";

interface JogadorBase {
  id: string;
  nome: string;
  numeroCamisola: number;
  fotoUrl?: string;
}

interface AttendanceProps {
  activeTeam: Team | null;
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export function Attendance({ activeTeam }: AttendanceProps) {
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [loading, setLoading] = useState(false);
  const [atletas, setAtletas] = useState<JogadorBase[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [registos, setRegistos] = useState<RegistoAssiduidade[]>([]);

  // Para garantir que o portal só é renderizado no cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Estado para o modal de opções de assiduidade
  const [selectedCellModal, setSelectedCellModal] = useState<{atletaId: string, eventoId: string} | null>(null);

  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  const startDateIso = startDate.toISOString().split("T")[0] + "T00:00:00";
  const endDateIso = endDate.toISOString().split("T")[0] + "T23:59:59";

  const fetchDadosSemana = async () => {
    if (!activeTeam?.id) return;
    setLoading(true);
    try {
      const [atletasData, eventosData, registosData] = await Promise.all([
        apiFetch(`/atletas?equipaId=${activeTeam.id}`),
        apiFetch(`/eventos/equipa/${activeTeam.id}/semana?start=${startDateIso}&end=${endDateIso}`),
        apiFetch(`/assiduidade/equipa/${activeTeam.id}/semana?start=${startDateIso}&end=${endDateIso}`)
      ]);
      setAtletas(atletasData || []);
      setEventos(eventosData || []);
      setRegistos(registosData || []);
    } catch (error) {
      toast.error("Erro ao carregar dados da semana.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDadosSemana();
  }, [activeTeam, baseDate]);

  const eventosRender = useMemo(() => {
    let treinoCount = 0;
    return eventos.map(evento => {
      if (evento.tipoEvento === 'TREINO') {
        treinoCount++;
        return { ...evento, numeroTreino: treinoCount };
      }
      return { ...evento, numeroTreino: undefined };
    });
  }, [eventos]);


  const prevMonth = () => {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1));
  };

  const monthLabel = `${MESES[baseDate.getMonth()]} ${baseDate.getFullYear()}`;

  const handleUpdateRegisto = async (eventoId: string, atletaId: string, tipo: TipoAssiduidade) => {
    const existente = registos.find(r => r.eventoId === eventoId && r.atletaId === atletaId);
    
    // Fechar Modal
    setSelectedCellModal(null);
    
    const previousRegistos = [...registos];
    
    if (existente) {
      const updated = { ...existente, tipoAssiduidade: tipo };
      setRegistos(prev => prev.map(r => r.id === existente.id ? updated : r));
    } else {
      // Fake optimista para não haver lag (id será sobreposto no fetch seguinte)
      const fakeNew: RegistoAssiduidade = { id: 'temp-' + Date.now(), eventoId, atletaId, tipoAssiduidade: tipo, justificacao: null, minutosAtraso: null };
      setRegistos(prev => [...prev, fakeNew]);
    }

    try {
      const payload: RegistoAssiduidadeUpdate = { tipoAssiduidade: tipo };
      await apiFetch(`/assiduidade/evento/${eventoId}/atleta/${atletaId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      // Poderiamos fazer fetch novamente, mas optimista é suficiente para a UX fluida
    } catch (err) {
      toast.error("Erro ao atualizar assiduidade.");
      setRegistos(previousRegistos); // rollback
    }
  };

  const getEventForDay = (date: Date) => {
    return eventos.find(e => new Date(e.dataHoraInicio).getDate() === date.getDate());
  };

  const getRegisto = (eventoId: string, atletaId: string) => {
    return registos.find(r => r.eventoId === eventoId && r.atletaId === atletaId);
  };

  const renderRegistoIcon = (tipo: TipoAssiduidade) => {
    switch(tipo) {
      case "PRESENTE":
        return <div className="w-8 h-8 mx-auto rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success shadow-sm font-bold text-lg leading-none">.</div>;
      case "FALTA_INJUSTIFICADA":
      case "AUSENTE": // Para compatibilidade
        return <div className="w-8 h-8 mx-auto rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center text-danger shadow-sm font-bold text-xs">FI</div>;
      case "FALTA_JUSTIFICADA":
        return <div className="w-8 h-8 mx-auto rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger/80 shadow-sm font-bold text-xs">FJ</div>;
      case "FALTA_AUTORIZADA":
        return <div className="w-8 h-8 mx-auto rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-sm font-bold text-xs">FA</div>;
      case "ATRASADO":
        return <div className="w-8 h-8 mx-auto rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center text-warning shadow-sm font-bold text-xs">A</div>;
      case "LESIONADO":
        return <div className="w-8 h-8 mx-auto rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm font-bold text-xs">L</div>;
      case "AO_SERVICO_SELECAO":
        return <div className="w-8 h-8 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm font-bold text-xs">S</div>;
      case "TREINO_CONDICIONADO":
        return <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-sm font-bold text-xs">TC</div>;
      case "OUTRO":
        return <div className="w-8 h-8 mx-auto rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-sm font-bold text-xs">O</div>;
      case "DISPENSADO": // Legacy fallback to FA
        return <div className="w-8 h-8 mx-auto rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-sm font-bold text-xs">FA</div>;
      default:
        return <div className="w-8 h-8 mx-auto rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px]">?</div>;
    }
  };

  return (
    <div className="flex flex-col gap-[40px] pb-12 w-full max-w-[1200px] mx-auto animate-fade-up">
      {/* Context Header: Date Range & Stats Summary */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-foreground">Centro de Controlo: Assiduidade</h3>
          <div className="flex items-center gap-3 bg-muted/10 border border-border px-3 py-2 rounded-sm w-fit">
            <button onClick={prevMonth} className="p-1 hover:bg-foreground/10 rounded">
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <Calendar className="text-muted-foreground w-4 h-4" />
            <span className="font-mono text-xs uppercase text-foreground">{monthLabel}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-foreground/10 rounded">
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>

      </section>

      {/* The Matrix Container */}
      <section className="flex-1 glass border border-border relative overflow-hidden flex flex-col rounded-sm">
        <div className="overflow-auto matrix-scroll flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border sticky top-0 z-20 shadow-sm">
                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase sticky left-0 bg-background/95 backdrop-blur z-30 border-r border-border min-w-[200px]">
                  Jogador
                </th>
                {eventosRender.length === 0 && (
                  <th className="p-3 text-left border-l border-border/30 text-muted-foreground text-sm font-normal">
                    Nenhum evento agendado neste mês.
                  </th>
                )}
                {eventosRender.map((evento) => {
                  const data = new Date(evento.dataHoraInicio);
                  return (
                    <th key={evento.id} className="p-3 text-center border-l border-border/30 min-w-[100px]">
                      <div className="flex flex-col items-center">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {DIAS_SEMANA[data.getDay()]} {data.getDate()}/{MESES[data.getMonth()]}
                        </span>
                        <span className="text-muted-foreground font-mono text-[9px] opacity-70 mb-1">
                          {data.getHours().toString().padStart(2, '0')}:{data.getMinutes().toString().padStart(2, '0')}
                        </span>
                        <span className={cn("text-xs font-semibold", evento.tipoEvento === 'JOGO' ? 'text-primary' : 'text-foreground')}>
                          {evento.tipoEvento}
                        </span>
                        {evento.numeroTreino && (
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">Sessão {evento.numeroTreino}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {atletas.length === 0 && !loading && (
                <tr>
                  <td colSpan={eventosRender.length + 1} className="p-8 text-center text-muted-foreground text-sm">
                    Nenhum jogador encontrado neste plantel.
                  </td>
                </tr>
              )}
              {atletas.map((atleta) => (
                <tr key={atleta.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="p-3 sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border/30 group-hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      {atleta.fotoUrl ? (
                        <img 
                          src={atleta.fotoUrl} 
                          alt="Foto" 
                          className="w-6 h-6 rounded-full object-cover border border-border/50" 
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground">
                          {atleta.numeroCamisola}
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">{atleta.nome}</span>
                    </div>
                  </td>
                  {eventosRender.length === 0 && <td className="bg-transparent" />}
                  {eventosRender.map((evento) => {
                    const registo = getRegisto(evento.id, atleta.id);
                    const isSelected = selectedCellModal?.atletaId === atleta.id && selectedCellModal?.eventoId === evento.id;

                    return (
                      <td 
                        key={evento.id} 
                        className={cn(
                          "p-2 border-l border-border/30 text-center relative cursor-pointer interactive-cell border",
                          isSelected ? "border-primary/50 bg-foreground/5" : "border-transparent"
                        )}
                        onClick={() => setSelectedCellModal({ atletaId: atleta.id, eventoId: evento.id })}
                      >
                        {registo ? renderRegistoIcon(registo.tipoAssiduidade) : (
                          <div className="w-8 h-8 mx-auto rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px]">
                            ?
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Opções de Assiduidade */}
      {selectedCellModal && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedCellModal(null)}
          />
          
          {/* Modal Centrado Absolutamente */}
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-card border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <h3 className="font-semibold text-foreground">Registar Presença</h3>
              <button onClick={() => setSelectedCellModal(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto">
              {/* PRESENTE */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "PRESENTE")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-success/10 hover:border-success/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success font-bold text-xl group-hover:scale-110 transition-transform">.</div>
                <span className="text-xs font-medium text-foreground text-center">Presente</span>
              </button>
              
              {/* FALTA JUSTIFICADA */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "FALTA_JUSTIFICADA")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-danger/10 hover:border-danger/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger/80 font-bold text-sm group-hover:scale-110 transition-transform">FJ</div>
                <span className="text-xs font-medium text-foreground text-center">Falta Just.</span>
              </button>

              {/* FALTA INJUSTIFICADA */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "FALTA_INJUSTIFICADA")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-danger/20 hover:border-danger/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center text-danger font-bold text-sm group-hover:scale-110 transition-transform">FI</div>
                <span className="text-xs font-medium text-foreground text-center">Falta Injust.</span>
              </button>

              {/* FALTA AUTORIZADA */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "FALTA_AUTORIZADA")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-orange-500/10 hover:border-orange-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-sm group-hover:scale-110 transition-transform">FA</div>
                <span className="text-xs font-medium text-foreground text-center">Falta Aut.</span>
              </button>

              {/* LESÃO */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "LESIONADO")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 font-bold text-sm group-hover:scale-110 transition-transform">L</div>
                <span className="text-xs font-medium text-foreground text-center">Lesão</span>
              </button>

              {/* SELEÇÃO */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "AO_SERVICO_SELECAO")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/10 hover:border-primary/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 transition-transform">S</div>
                <span className="text-xs font-medium text-foreground text-center">Seleção</span>
              </button>

              {/* ATRASO */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "ATRASADO")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-warning/10 hover:border-warning/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center text-warning font-bold text-sm group-hover:scale-110 transition-transform">A</div>
                <span className="text-xs font-medium text-foreground text-center">Atraso</span>
              </button>

              {/* TREINO CONDICIONADO */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "TREINO_CONDICIONADO")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-blue-500/10 hover:border-blue-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-sm group-hover:scale-110 transition-transform">TC</div>
                <span className="text-xs font-medium text-foreground text-center">Condicionado</span>
              </button>

              {/* OUTRO */}
              <button onClick={() => handleUpdateRegisto(selectedCellModal.eventoId, selectedCellModal.atletaId, "OUTRO")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors group">
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground font-bold text-sm group-hover:scale-110 transition-transform">O</div>
                <span className="text-xs font-medium text-foreground text-center">Outro(s)</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
