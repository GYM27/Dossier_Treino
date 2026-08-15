import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface AttendanceHeaderProps {
  monthLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function AttendanceHeader({
  monthLabel,
  onPrevWeek,
  onNextWeek,
}: AttendanceHeaderProps) {
  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-800">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white tracking-wide">
          Centro de Controlo: Assiduidade
        </h3>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg w-fit">
          <button
            onClick={onPrevWeek}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Semana Anterior"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <Calendar className="text-cyan-400 w-4 h-4" />
          <span className="font-mono text-xs uppercase font-bold text-slate-200">
            {monthLabel}
          </span>
          <button
            onClick={onNextWeek}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Próxima Semana"
          >
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
}
