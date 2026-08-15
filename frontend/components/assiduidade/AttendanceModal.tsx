import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TipoAssiduidade } from "@/models/assiduidade";

interface AttendanceModalProps {
  isOpen: boolean;
  mounted: boolean;
  onClose: () => void;
  onSelectTipo: (tipo: TipoAssiduidade) => void;
}

const OPCOES: { tipo: TipoAssiduidade; label: string; badge: string; colorCls: string }[] = [
  { tipo: "PRESENTE", label: "Presente", badge: ".", colorCls: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 text-xl font-bold" },
  { tipo: "FALTA_JUSTIFICADA", label: "Falta Just.", badge: "FJ", colorCls: "bg-rose-500/10 border-rose-500/20 text-rose-300 text-sm font-bold" },
  { tipo: "FALTA_INJUSTIFICADA", label: "Falta Injust.", badge: "FI", colorCls: "bg-rose-500/20 border-rose-500/30 text-rose-400 text-sm font-bold" },
  { tipo: "FALTA_AUTORIZADA", label: "Falta Aut.", badge: "FA", colorCls: "bg-amber-500/20 border-amber-500/30 text-amber-400 text-sm font-bold" },
  { tipo: "LESIONADO", label: "Lesão", badge: "L", colorCls: "bg-purple-500/20 border-purple-500/30 text-purple-400 text-sm font-bold" },
  { tipo: "AO_SERVICO_SELECAO", label: "Seleção", badge: "S", colorCls: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 text-sm font-bold" },
  { tipo: "ATRASADO", label: "Atraso", badge: "A", colorCls: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 text-sm font-bold" },
  { tipo: "TREINO_CONDICIONADO", label: "Condicionado", badge: "TC", colorCls: "bg-blue-500/20 border-blue-500/30 text-blue-400 text-sm font-bold" },
  { tipo: "OUTRO", label: "Outro(s)", badge: "O", colorCls: "bg-slate-700/40 border-slate-700 text-slate-400 text-sm font-bold" },
];

export function AttendanceModal({
  isOpen,
  mounted,
  onClose,
  onSelectTipo,
}: AttendanceModalProps) {
  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#070b14] shrink-0">
          <h3 className="font-bold text-white text-sm">Registar Presença</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto">
          {OPCOES.map((op) => (
            <button
              key={op.tipo}
              onClick={() => onSelectTipo(op.tipo)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors group"
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${op.colorCls} group-hover:scale-110 transition-transform`}
              >
                {op.badge}
              </div>
              <span className="text-xs font-medium text-slate-300 text-center">
                {op.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
