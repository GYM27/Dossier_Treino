import React from "react";
import { EventoCalendario } from "@/models/planeamento";
import { Calendar, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarioDayViewProps {
  dia: Date;
  eventos: EventoCalendario[];
  onNewEvent: (dayDate: Date) => void;
  onEditEvent: (evento: EventoCalendario) => void;
  onDeleteEvent: (eventoId: string) => void;
}

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const MESES_COMPLETO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CalendarioDayView({
  dia,
  eventos,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarioDayViewProps) {
  const dataIso = dia.toISOString().split("T")[0];
  const eventosDia = eventos.filter((e) => e.dataHoraInicio.startsWith(dataIso));

  return (
    <section className="max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {DIAS_SEMANA[dia.getDay()]}
          </h2>
          <p className="text-sm text-slate-400">
            {dia.getDate()} de {MESES_COMPLETO[dia.getMonth()]} de {dia.getFullYear()}
          </p>
        </div>
        <Button variant="cyan" onClick={() => onNewEvent(dia)}>
          + Adicionar Evento
        </Button>
      </div>

      {eventosDia.length === 0 ? (
        <div className="bg-[#0f172a] p-12 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
          <h3 className="text-base font-semibold text-slate-300 mb-1">Sem eventos</h3>
          <p className="text-xs text-slate-500">O dia está livre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventosDia.map((evt, i) => (
            <div
              key={evt.id || i}
              className="bg-[#0f172a] p-5 rounded-xl flex flex-col md:flex-row gap-5 border border-slate-800 hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="flex flex-col items-center justify-center w-20 shrink-0 border-r border-slate-800 pr-4">
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {evt.dataHoraInicio.slice(11, 16)}
                </span>
                {evt.dataHoraFim && (
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {evt.dataHoraFim.slice(11, 16)}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold border",
                      evt.tipoEvento === "JOGO"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : evt.tipoEvento === "FOLGA"
                          ? "bg-slate-800 text-slate-400 border-slate-700"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    )}
                  >
                    {evt.tipoEvento === "TREINO" && evt.numeroTreino ? `Treino #${evt.numeroTreino}` : evt.tipoEvento}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEditEvent(evt)}
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => evt.id && onDeleteEvent(evt.id)}
                      className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-2">
                  {evt.tipoEvento === "JOGO" && evt.equipaCasa && evt.equipaFora
                    ? `${evt.equipaCasa} vs ${evt.equipaFora}`
                    : evt.descricao || evt.tipoEvento}
                </h4>

                {evt.local && (
                  <div className="flex items-center text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    <span>{evt.local}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
