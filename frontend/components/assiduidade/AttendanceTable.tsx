import React from "react";
import { JogadorBase } from "./useAttendance";
import { EventoCalendario } from "@/models/planeamento";
import { RegistoAssiduidade, TipoAssiduidade } from "@/models/assiduidade";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
  atletas: JogadorBase[];
  eventosRender: (EventoCalendario & { numeroTreino?: number })[];
  loading: boolean;
  getRegisto: (eventoId: string, atletaId: string) => RegistoAssiduidade | undefined;
  selectedCellModal: { atletaId: string; eventoId: string } | null;
  onSelectCell: (cell: { atletaId: string; eventoId: string }) => void;
  renderRegistoIcon: (tipo: TipoAssiduidade) => React.ReactNode;
}

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export function AttendanceTable({
  atletas,
  eventosRender,
  loading,
  getRegisto,
  selectedCellModal,
  onSelectCell,
  renderRegistoIcon,
}: AttendanceTableProps) {
  return (
    <section className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#0c1222] border-b border-slate-800 sticky top-0 z-20">
              <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase sticky left-0 bg-[#0c1222] z-30 border-r border-slate-800 min-w-[200px]">
                Jogador
              </th>
              {eventosRender.length === 0 && (
                <th className="p-3 text-left border-l border-slate-800 text-slate-500 text-xs font-normal">
                  Nenhum evento agendado nesta semana.
                </th>
              )}
              {eventosRender.map((evento) => {
                const data = new Date(evento.dataHoraInicio);
                return (
                  <th
                    key={evento.id}
                    className="p-3 text-center border-l border-slate-800 min-w-[100px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-mono text-[10px]">
                        {DIAS_SEMANA[data.getDay()]} {data.getDate()}/{MESES[data.getMonth()]}
                      </span>
                      <span className="text-slate-500 font-mono text-[9px] mb-0.5">
                        {data.getHours().toString().padStart(2, "0")}:
                        {data.getMinutes().toString().padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          evento.tipoEvento === "JOGO" ? "text-amber-400" : "text-cyan-400"
                        )}
                      >
                        {evento.tipoEvento}
                      </span>
                      {evento.numeroTreino && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          Sessão {evento.numeroTreino}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {atletas.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={eventosRender.length + 1}
                  className="p-8 text-center text-slate-500 text-xs"
                >
                  Nenhum jogador encontrado neste plantel.
                </td>
              </tr>
            )}
            {atletas.map((atleta) => (
              <tr key={atleta.id} className="hover:bg-slate-900/40 transition-colors group">
                <td className="p-3 sticky left-0 bg-[#0f172a] group-hover:bg-[#131d33] z-10 border-r border-slate-800">
                  <div className="flex items-center gap-3">
                    {atleta.fotoUrl ? (
                      <img
                        src={atleta.fotoUrl}
                        alt="Foto"
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-cyan-400 font-bold">
                        {atleta.numeroCamisola}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-200">{atleta.nome}</span>
                  </div>
                </td>
                {eventosRender.length === 0 && <td className="bg-transparent" />}
                {eventosRender.map((evento) => {
                  if (!evento.id) return null;
                  const currentEventoId = evento.id;
                  const registo = getRegisto(currentEventoId, atleta.id);
                  const isSelected =
                    selectedCellModal?.atletaId === atleta.id &&
                    selectedCellModal?.eventoId === currentEventoId;

                  return (
                    <td
                      key={currentEventoId}
                      className={cn(
                        "p-2 border-l border-slate-800 text-center relative cursor-pointer hover:bg-slate-800/50 transition-colors",
                        isSelected ? "bg-cyan-500/10 ring-1 ring-cyan-500/40" : ""
                      )}
                      onClick={() =>
                        onSelectCell({
                          atletaId: atleta.id,
                          eventoId: currentEventoId,
                        })
                      }
                    >
                      {registo
                        ? renderRegistoIcon(registo.tipoAssiduidade)
                        : renderRegistoIcon("PRESENTE")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
