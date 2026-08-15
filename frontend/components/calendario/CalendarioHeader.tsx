import React from "react";
import { ViewType } from "./usePlaneamentoSemanal";
import { Calendar, ChevronDown, LayoutGrid, CalendarDays, AlignLeft, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarioHeaderProps {
  baseDate: Date;
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  morfociclo: number;
  saveMorfociclo: (val: number) => void;
  renderHeaderDate: () => string;
  prevPeriod: () => void;
  nextPeriod: () => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSyncModal: () => void;
}

export function CalendarioHeader({
  baseDate,
  viewType,
  setViewType,
  morfociclo,
  saveMorfociclo,
  renderHeaderDate,
  prevPeriod,
  nextPeriod,
  handleDateChange,
  onOpenSyncModal,
}: CalendarioHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Morfociclo Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
            Morfociclo:
          </span>
          <div className="relative">
            <select
              value={morfociclo}
              onChange={(e) => saveMorfociclo(Number(e.target.value))}
              aria-label="Selecionar Morfociclo"
              className="bg-slate-800/80 border border-slate-700 text-cyan-400 font-mono text-xs rounded-lg px-2.5 py-1.5 pr-8 appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer font-bold"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  Morfociclo {num}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date Display and Navigation */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 hover:border-slate-600 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <span className="font-mono text-xs font-bold text-slate-200">
              {renderHeaderDate()}
            </span>
            <input
              type="date"
              aria-label="Escolher data do calendário"
              onChange={handleDateChange}
              value={baseDate.toISOString().split("T")[0]}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800/80">
            <button
              onClick={prevPeriod}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Período Anterior"
            >
              <ChevronDown className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Próximo Período"
            >
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewType("month")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1",
              viewType === "month"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Mês</span>
          </button>
          <button
            onClick={() => setViewType("week")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1",
              viewType === "week"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            <CalendarDays className="w-3 h-3" />
            <span>Semana</span>
          </button>
          <button
            onClick={() => setViewType("day")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1",
              viewType === "day"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            <AlignLeft className="w-3 h-3" />
            <span>Dia</span>
          </button>
        </div>

        {/* Sync Modal Trigger */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          title="Sincronizar com Google Calendar ou Apple iCal"
        >
          <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sincronizar</span>
        </button>
      </div>
    </header>
  );
}
