import React from "react";
import { EventoCalendario } from "@/models/planeamento";
import { cn } from "@/lib/utils";

interface CalendarioMonthViewProps {
  baseDate: Date;
  diasDaVista: Date[];
  eventos: EventoCalendario[];
  onNewEvent: (dayDate: Date) => void;
  onEditEvent: (evento: EventoCalendario) => void;
  onPlanTreino?: (evento: EventoCalendario) => void;
}

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

export function CalendarioMonthView({
  baseDate,
  diasDaVista,
  eventos,
  onNewEvent,
  onEditEvent,
  onPlanTreino,
}: CalendarioMonthViewProps) {
  return (
    <section className="bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Cabeçalho da Semana */}
      <div className="grid grid-cols-7 bg-[#0c1222] border-b border-slate-800">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="p-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
          >
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
                "min-h-[110px] p-2 border-b border-r border-slate-800/80 flex flex-col group transition-colors",
                !isCurrentMonth ? "bg-slate-950/40 opacity-40" : "bg-[#0f172a] hover:bg-slate-900/60",
                index % 7 === 6 ? "border-r-0" : ""
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={cn(
                    "text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-cyan-500 text-slate-950" : isCurrentMonth ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  {dia.getDate()}
                </span>
                <button
                  onClick={() => onNewEvent(dia)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-400 text-xs font-bold transition-opacity p-0.5"
                  title="Novo Evento"
                >
                  +
                </button>
              </div>

              {/* Badges de Eventos */}
              <div className="space-y-1 overflow-y-auto flex-1 max-h-[85px] custom-scrollbar">
                {eventosDia.map((evt, i) => (
                  <button
                    key={evt.id || i}
                    onClick={() => onEditEvent(evt)}
                    className={cn(
                      "w-full text-left p-1 rounded text-[10px] font-medium truncate block border transition-colors",
                      evt.tipoEvento === "JOGO"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                        : evt.tipoEvento === "FOLGA"
                          ? "bg-slate-800 text-slate-400 border-slate-700"
                          : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                    )}
                  >
                    <span className="font-mono mr-1 text-[9px] opacity-75">
                      {evt.dataHoraInicio.slice(11, 16)}
                    </span>
                    {evt.tipoEvento === "TREINO" && evt.numeroTreino
                      ? `T#${evt.numeroTreino}`
                      : evt.tipoEvento === "JOGO" && evt.equipaCasa && evt.equipaFora
                        ? `${evt.equipaCasa} v ${evt.equipaFora}`
                        : evt.descricao || evt.tipoEvento}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
