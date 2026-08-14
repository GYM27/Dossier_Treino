"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Team } from "@/models/team";
import { EventoCalendario, PlaneamentoMicrociclo } from "@/models/planeamento";
import { EventoFormModal } from "./EventoFormModal";
import { Calendar, ChevronDown, CheckCircle, Hotel, Target, Clock, MapPin, Trophy, Edit2, Trash2, LayoutGrid, CalendarDays, AlignLeft, Link as LinkIcon, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaneamentoSemanalProps {
  activeTeam: Team | null;
}

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const MESES_COMPLETO = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type ViewType = "month" | "week" | "day";

export function PlaneamentoSemanal({ activeTeam }: PlaneamentoSemanalProps) {
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

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>(undefined);
  const [eventoEdit, setEventoEdit] = useState<EventoCalendario | null>(null);
  const [nextNumeroTreino, setNextNumeroTreino] = useState<number>(1);
  
  // Estado Modal Sync
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
        // Garante que a baseDate no week view é uma segunda-feira
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

  const fetchSemana = async () => {
    if (!activeTeam?.id) return;
    setLoading(true);
    try {
      const start = startDateIso;
      const end = endDateIso;
      
      try {
        const eventosData = await apiFetch(`/eventos/equipa/${activeTeam.id}/semana?start=${start}&end=${end}`);
        setEventos(eventosData);
      } catch (e) {
        console.error("Erro ao carregar eventos:", e);
      }

      try {
        const dataIn = start.split('T')[0];
        const planeamento = await apiFetch(`/microciclos/equipa/${activeTeam.id}/semana?dataInicio=${dataIn}`);
        if (planeamento) {
          setPlanId(planeamento.id);
          setMorfociclo(planeamento.numeroMorfociclo);
        } else {
          setPlanId(null);
          setMorfociclo(1);
        }
      } catch (e) {
        console.log("Planeamento não encontrado para esta semana");
        setPlanId(null);
        setMorfociclo(1);
      }
    } catch (error) {
      console.error("Erro ao carregar semana:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemana();
  }, [activeTeam?.id, startDateIso, endDateIso]);

  const saveMorfociclo = async (val: number) => {
    if (!activeTeam?.id) return;
    const isoStart = startDateIso;
    const isoEnd = endDateIso;
    const payload = {
      dataInicio: isoStart,
      dataFim: isoEnd,
      numeroMicrociclo: 1,
      numeroMorfociclo: val,
      equipaId: activeTeam.id,
    };
    try {
      await apiFetch(`/microciclos/equipa/${activeTeam.id}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      fetchSemana();
    } catch (e) {
      console.error("Erro ao guardar morfociclo", e);
    }
  };

  const prevPeriod = () => {
    const d = new Date(baseDate);
    if (viewType === "day") d.setDate(d.getDate() - 1);
    else if (viewType === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setBaseDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(baseDate);
    if (viewType === "day") d.setDate(d.getDate() + 1);
    else if (viewType === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setBaseDate(d);
  };

  const renderHeaderDate = () => {
    if (viewType === "month") {
      return `${MESES_COMPLETO[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    }
    if (viewType === "day") {
      return `${baseDate.getDate()} ${MESES_COMPLETO[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    }
    // Week
    const d1 = diasDaVista[0];
    const d2 = diasDaVista[6];
    return `${d1.getDate()} ${MESES[d1.getMonth()]} — ${d2.getDate()} ${MESES[d2.getMonth()]}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = new Date(e.target.value);
    if (!isNaN(selected.getTime())) {
      setBaseDate(selected);
    }
  };

  const openNewEventModal = async (dayDate: Date) => {
    setEventoEdit(null);
    setModalDefaultDate(dayDate);
    
    // Obter o último número de treino para sugerir o próximo
    if (activeTeam?.id) {
      try {
        const lastNum = await apiFetch(`/eventos/equipa/${activeTeam.id}/ultimo-numero-treino`);
        setNextNumeroTreino(lastNum ? lastNum + 1 : 1);
      } catch (e) {
        setNextNumeroTreino(1);
      }
    } else {
      setNextNumeroTreino(1);
    }
    
    setIsModalOpen(true);
  };

  const openEditEventModal = (evento: EventoCalendario) => {
    setEventoEdit(evento);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (evento: Omit<EventoCalendario, "id">) => {
    if (!activeTeam?.id) return;
    try {
      if (eventoEdit?.id) {
        await apiFetch(`/eventos/${eventoEdit.id}`, {
          method: "PUT",
          body: JSON.stringify(evento),
        });
      } else {
        await apiFetch(`/eventos/equipa/${activeTeam.id}`, {
          method: "POST",
          body: JSON.stringify(evento),
        });
      }
      setIsModalOpen(false);
      fetchSemana();
    } catch (error) {
      console.error("Erro ao guardar evento", error);
      alert("Erro ao guardar o evento.");
    }
  };

  const handleDeleteEvent = async (eventoId: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este evento? Os registos de assiduidade associados também serão eliminados.")) return;
    
    try {
      await apiFetch(`/eventos/${eventoId}`, {
        method: "DELETE",
      });
      fetchSemana();
    } catch (error) {
      console.error("Erro ao eliminar evento", error);
      alert("Erro ao eliminar o evento.");
    }
  };

  const renderIconForEvento = (tipo: string) => {
    switch (tipo) {
      case "FOLGA": return <Hotel className="text-muted-foreground w-6 h-6 mb-1" />;
      case "JOGO": return <Trophy className="text-primary w-4 h-4 mt-0.5" />;
      default: return <Target className="text-primary w-4 h-4 mt-0.5" />;
    }
  };

  const renderWeekView = () => (
    <section className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {diasDaVista.map((dia, index) => {
        const dataIso = dia.toISOString().split("T")[0];
        const eventosDia = eventos.filter((e) => e.dataHoraInicio.startsWith(dataIso));
        const isMatchDay = eventosDia.some((e) => e.tipoEvento === "JOGO");

        return (
          <article
            key={dataIso}
            className={cn(
              "glass flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
              isMatchDay ? "border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/10" : ""
            )}
          >
            {/* Header do Dia */}
            <div className={cn("p-3 border-b", isMatchDay ? "border-primary/20 bg-primary/10" : "border-border bg-background/50")}>
              <div className="flex justify-between items-center">
                <h3 className={cn("text-xs font-bold uppercase tracking-wider", isMatchDay ? "text-primary" : "text-muted-foreground")}>
                  {DIAS_SEMANA[index]}
                </h3>
                <span className={cn("font-mono text-[10px]", isMatchDay ? "text-primary" : "text-muted-foreground")}>
                  {dia.getDate()}/{MESES[dia.getMonth()]}
                </span>
              </div>
            </div>

            {/* Eventos */}
            <div className="p-4 flex-1 flex flex-col min-h-[160px]">
              {eventosDia.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <button 
                    onClick={() => openNewEventModal(dia)}
                    className="p-3 border border-dashed border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest">+ Adicionar</span>
                  </button>
                </div>
              ) : (
                <>
                  {eventosDia.map((evt, i) => (
                    <div key={evt.id || i} className="mb-4 last:mb-0">
                      {evt.tipoEvento === "FOLGA" ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Hotel className="text-muted-foreground w-6 h-6 mb-1 opacity-60" />
                          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                            Folga
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className={cn(
                              "font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                              evt.tipoEvento === 'JOGO' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-foreground border-border'
                            )}>
                              {evt.tipoEvento === "TREINO" && evt.numeroTreino ? `Treino #${evt.numeroTreino}` : evt.tipoEvento}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => openEditEventModal(evt)} className="p-1 rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors" title="Editar">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => evt.id && handleDeleteEvent(evt.id)} className="p-1 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 mb-3">
                            {renderIconForEvento(evt.tipoEvento)}
                            <span className={cn("text-xs", evt.tipoEvento === 'JOGO' ? 'font-bold' : '')}>
                              {evt.tipoEvento === 'JOGO' && evt.equipaCasa && evt.equipaFora 
                                ? `${evt.equipaCasa} vs ${evt.equipaFora}` 
                                : evt.descricao}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-dashed border-border space-y-1.5">
                            <div className="flex items-center text-muted-foreground text-[11px]">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              <span className="font-mono">{evt.dataHoraInicio.slice(11, 16)}</span>
                            </div>
                            {evt.local && (
                              <div className="flex items-center text-muted-foreground text-[11px]">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                <span className="font-mono truncate">{evt.local}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-auto pt-4 flex justify-end">
                    <button onClick={() => openNewEventModal(dia)} className="text-muted-foreground hover:text-primary transition-colors">
                      <span className="font-mono text-[10px] uppercase">+ Novo</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {isMatchDay && (
              <div className="absolute bottom-2 right-2 opacity-30">
                <Trophy className="text-primary w-12 h-12" />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );

  const renderDayView = () => {
    const dia = diasDaVista[0];
    const dataIso = dia.toISOString().split("T")[0];
    const eventosDia = eventos.filter((e) => e.dataHoraInicio.startsWith(dataIso));

    return (
      <section className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{DIAS_SEMANA[dia.getDay() === 0 ? 6 : dia.getDay() - 1]}</h2>
            <p className="text-muted-foreground">{dia.getDate()} de {MESES_COMPLETO[dia.getMonth()]} de {dia.getFullYear()}</p>
          </div>
          <button 
            onClick={() => openNewEventModal(dia)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Adicionar Evento
          </button>
        </div>

        {eventosDia.length === 0 ? (
          <div className="glass p-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border/60">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">Sem eventos</h3>
            <p className="text-sm text-muted-foreground">O dia está livre.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventosDia.map((evt, i) => (
              <div key={evt.id || i} className="glass p-6 rounded-xl flex flex-col md:flex-row gap-6 border border-border hover:border-primary/30 transition-colors">
                <div className="flex flex-col items-center justify-center w-24 shrink-0 border-r border-border/50 pr-6">
                  <span className="text-xl font-bold font-mono text-foreground">{evt.dataHoraInicio.slice(11, 16)}</span>
                  {evt.dataHoraFim && <span className="text-xs text-muted-foreground font-mono mt-1">{evt.dataHoraFim.slice(11, 16)}</span>}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border",
                      evt.tipoEvento === 'JOGO' ? 'bg-primary/10 text-primary border-primary/20' : 
                      evt.tipoEvento === 'FOLGA' ? 'bg-muted text-muted-foreground border-transparent' : 
                      'bg-accent/30 text-accent-foreground border-border/50'
                    )}>
                      {evt.tipoEvento === "TREINO" && evt.numeroTreino ? `Treino #${evt.numeroTreino}` : evt.tipoEvento}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditEventModal(evt)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => evt.id && handleDeleteEvent(evt.id)} className="text-muted-foreground hover:text-danger transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-foreground mb-3">
                    {evt.tipoEvento === 'JOGO' && evt.equipaCasa && evt.equipaFora 
                      ? `${evt.equipaCasa} vs ${evt.equipaFora}` 
                      : (evt.descricao || evt.tipoEvento)}
                  </h4>
                  
                  {evt.local && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-2 opacity-70" />
                      {evt.local}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderMonthView = () => {
    return (
      <section className="glass rounded-xl overflow-hidden border border-border">
        {/* Cabeçalho da Semana */}
        <div className="grid grid-cols-7 bg-muted/30 border-b border-border">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="p-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {dia}
            </div>
          ))}
        </div>
        
        {/* Grelha de Dias */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {diasDaVista.map((dia, index) => {
            const dataIso = dia.toISOString().split("T")[0];
            const eventosDia = eventos.filter((e) => e.dataHoraInicio.startsWith(dataIso));
            const isCurrentMonth = dia.getMonth() === baseDate.getMonth();
            const isToday = dataIso === new Date().toISOString().split("T")[0];

            return (
              <div 
                key={dataIso} 
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-border/50 flex flex-col group transition-colors",
                  !isCurrentMonth ? "bg-muted/10 opacity-50" : "bg-background/30 hover:bg-muted/10",
                  index % 7 === 6 ? "border-r-0" : ""
                )}
                onClick={(e) => {
                  // Prevenir clique se clicar num evento
                  if ((e.target as HTMLElement).closest('.evento-pill')) return;
                  openNewEventModal(dia);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground font-bold" : (isCurrentMonth ? "text-foreground font-medium" : "text-muted-foreground")
                  )}>
                    {dia.getDate()}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                  {eventosDia.map(evt => (
                    <div 
                      key={evt.id} 
                      className={cn(
                        "evento-pill text-[9px] px-1.5 py-1 rounded-sm truncate font-medium cursor-pointer transition-transform hover:scale-[1.02]",
                        evt.tipoEvento === 'JOGO' ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground border border-border/50"
                      )}
                      onClick={(e) => { e.stopPropagation(); openEditEventModal(evt); }}
                    >
                      <span className="font-bold opacity-70 mr-1">{evt.dataHoraInicio.slice(11,16)}</span>
                      {evt.tipoEvento === "TREINO" && evt.numeroTreino ? `T#${evt.numeroTreino}` : evt.tipoEvento}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Cabeçalho de Controlos */}
        <section className="glass border border-border p-6 rounded-xl animate-fade-up">
          <div className="flex flex-wrap gap-8 md:gap-12 items-center justify-between">
            <div className="flex gap-8">
              {/* Morfociclo */}
              <div className="flex items-center gap-3">
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Morfociclo
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={morfociclo}
                    onChange={(e) => setMorfociclo(parseInt(e.target.value))}
                    onBlur={(e) => saveMorfociclo(parseInt(e.target.value))}
                    className="w-16 bg-transparent border-b border-border text-foreground font-bold text-2xl pr-2 focus:outline-none focus:border-primary transition-colors text-center"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Navegação de Data */}
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-2 mb-3">
                <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted/50 transition-all mr-4 border border-border">
                  <LinkIcon className="w-3.5 h-3.5" /> Sincronizar
                </button>
                <div className="flex bg-muted/30 border border-border p-1 rounded-lg">
                  <button onClick={() => setViewType('month')} className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'month' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    <LayoutGrid className="w-3.5 h-3.5" /> Mês
                  </button>
                  <button onClick={() => setViewType('week')} className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'week' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    <CalendarDays className="w-3.5 h-3.5" /> Semana
                  </button>
                  <button onClick={() => setViewType('day')} className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'day' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    <AlignLeft className="w-3.5 h-3.5" /> Dia
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-end">
                <button onClick={prevPeriod} className="p-2 glass rounded-lg hover:border-primary/50 text-muted-foreground transition-colors">
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                <h2 className="text-2xl font-bold text-foreground tracking-tight w-[280px] text-center">
                  {renderHeaderDate()}
                </h2>
                <button onClick={nextPeriod} className="p-2 glass rounded-lg hover:border-primary/50 text-muted-foreground transition-colors">
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                </button>
                <div className="relative">
                  <input 
                    type="date"
                    value={startDateIso.split('T')[0]}
                    onChange={handleDateChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Mudar data"
                  />
                  <button className="p-2 glass rounded-lg hover:border-primary/50 text-muted-foreground">
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
        {viewType === 'month' && renderMonthView()}
      </div>

      <EventoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        defaultDate={modalDefaultDate}
        eventoEdit={eventoEdit}
        defaultNumeroTreino={nextNumeroTreino}
      />

      {/* Modal de Sincronização iCal */}
      {isSyncModalOpen && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsSyncModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Sincronizar Calendário
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Copia o link abaixo e adiciona-o como <strong>"Subscrição de Calendário"</strong> no teu Google Calendar, iPhone ou Outlook. Todos os eventos serão sincronizados automaticamente!
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={`http://localhost:8080/api/eventos/equipa/${activeTeam.id}/ical`} 
                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground focus:outline-none" 
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:8080/api/eventos/equipa/${activeTeam.id}/ical`);
                  alert("Link copiado! Cola no teu calendário preferido.");
                }}
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                title="Copiar link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-6 text-[11px] text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
              <p><strong>Dica de Segurança:</strong> Este link é direto e não necessita de login, para que os telemóveis o consigam ler nativamente. Partilha-o apenas com os elementos do teu Staff Técnico.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
