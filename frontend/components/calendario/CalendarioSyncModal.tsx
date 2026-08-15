import React from "react";
import { Team } from "@/models/team";
import { X, Copy, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarioSyncModalProps {
  isOpen: boolean;
  activeTeam: Team | null;
  onClose: () => void;
}

export function CalendarioSyncModal({
  isOpen,
  activeTeam,
  onClose,
}: CalendarioSyncModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !activeTeam) return null;

  const icalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/ical/${activeTeam.id}.ics`;

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header do Modal */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Sincronizar Calendário (iCal)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruções */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Usa o link seguro abaixo para subscrever o calendário dos treinos e jogos no <strong className="text-white">Google Calendar</strong>, <strong className="text-white">Apple Calendar</strong> ou <strong className="text-white">Outlook</strong>:
        </p>

        {/* Caixa de Cópia de URL */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <input
            readOnly
            aria-label="URL de subscrição iCal"
            value={icalUrl}
            className="bg-transparent text-xs text-cyan-400 font-mono w-full focus:outline-none select-all"
          />
          <Button
            variant={copied ? "emerald" : "cyan"}
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
