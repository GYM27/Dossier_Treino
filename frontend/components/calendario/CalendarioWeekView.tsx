import React from "react";
import { EventoCalendario } from "@/models/planeamento";
import { Hotel, Trophy, Target, Clock, MapPin, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarioWeekViewProps {
  diasDaVista: Date[];
  eventos: EventoCalendario[];
  onNewEvent: (dayDate: Date) => void;
  onEditEvent: (evento: EventoCalendario) => void;
  onDeleteEvent: (eventoId: string) => void;
}

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export function CalendarioWeekView({
  diasDaVista,
  eventos,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarioWeekViewProps) {
  const renderIconForEvento = (tipo: string) => {
    switch (tipo) {
      case "FOLGA":
        return <Hotel className="text-slate-500 w-5 h-5 mb-1" />;
      case "JOGO":
        return <Trophy className="text-amber-400 w-4 h-4 mt-0.5" />;
      default:
        return <Target className="text-cyan-400 w-4 h-4 mt-0.5" />;
    }
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
      {diasDaVista.map((dia, index) => {
        const dataIso = dia.toISOString().split("T")[0];
        const eventosDia = eventos.filter((e) => e.dataHoraInicio.startsWith(dataIso));
        const isMatchDay = eventosDia.some((e) => e.tipoEvento === "JOGO");

        return (
          <article
            key={dataIso}
            className={cn(
              "bg-[#0f172a] rounded-xl border flex flex-col relative overflow-hidden transition-all duration-200 hover:border-slate-700",
              isMatchDay ? "border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" : "border-slate-800/80"
            )}
          >
            {/* Header do Dia */}
            <div
              className={cn(
                "px-3 py-2.5 border-b flex justify-between items-center",
                isMatchDay ? "border-amber-500/20 bg-amber-500/10" : "border-slate-800 bg-[#0c1222]"
              )}
            >
              <h3 className={cn("text-xs font-bold uppercase tracking-wider", isMatchDay ? "text-amber-400" : "text-slate-400")}>
                {DIAS_SEMANA[index]}
              </h3>
              <span className={cn("font-mono text-[10px] font-semibold", isMatchDay ? "text-amber-300" : "text-slate-400")}>
                {dia.getDate()}/{MESES[dia.getMonth()]}
              </span>
            </div>

            {/* Lista de Eventos do Dia */}
            <div className="p-3 flex-1 flex flex-col min-h-[160px]">
              {eventosDia.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <button
                    onClick={() => onNewEvent(dia)}
                    className="px-3 py-2 border border-dashed border-slate-700 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors text-slate-500 text-[10px] font-mono uppercase tracking-widest"
                  >
                    + Adicionar
                  </button>
                </div>
              ) : (
                <>
                  {eventosDia.map((evt, i) => (
                    <div key={evt.id || i} className="mb-3 last:mb-0 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {evt.tipoEvento === "FOLGA" ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Hotel className="text-slate-500 w-5 h-5 mb-1 opacity-60" />
                          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            Folga
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={cn(
                                "font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold border",
                                evt.tipoEvento === "JOGO"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              )}
                            >
                              {evt.tipoEvento === "TREINO" && evt.numeroTreino ? `Treino #${evt.numeroTreino}` : evt.tipoEvento}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEditEvent(evt)}
                                className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => evt.id && onDeleteEvent(evt.id)}
                                className="p-1 rounded text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 mb-2">
                            {renderIconForEvento(evt.tipoEvento)}
                            <span className={cn("text-xs font-semibold text-white", evt.tipoEvento === "JOGO" ? "text-amber-200" : "")}>
                              {evt.tipoEvento === "JOGO" && evt.equipaCasa && evt.equipaFora
                                ? `${evt.equipaCasa} vs ${evt.equipaFora}`
                                : evt.descricao}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 space-y-1">
                            <div className="flex items-center text-slate-400 text-[10px]">
                              <Clock className="w-3 h-3 mr-1 text-slate-500" />
                              <span className="font-mono">{evt.dataHoraInicio.slice(11, 16)}</span>
                            </div>
                            {evt.local && (
                              <div className="flex items-center text-slate-400 text-[10px]">
                                <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                                <span className="font-mono truncate">{evt.local}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  <div className="mt-auto pt-2 flex justify-end">
                    <button
                      onClick={() => onNewEvent(dia)}
                      className="text-slate-400 hover:text-cyan-400 text-[10px] font-mono uppercase font-semibold transition-colors"
                    >
                      + Novo
                    </button>
                  </div>
                </>
              )}
            </div>

            {isMatchDay && (
              <div className="absolute bottom-1 right-1 opacity-20 pointer-events-none">
                <Trophy className="text-amber-400 w-10 h-10" />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
