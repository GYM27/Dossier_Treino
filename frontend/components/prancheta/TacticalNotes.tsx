"use client"

import React from "react";
import { FileText } from "lucide-react";

interface TacticalNotesProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TacticalNotes({ notes, onChange }: TacticalNotesProps) {
  return (
    <div className="w-[280px] bg-[#131b2f] rounded-2xl border border-slate-800/60 flex flex-col overflow-hidden flex-shrink-0">
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2">
         <FileText className="w-4 h-4 text-emerald-500" />
         <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Notas do Momento</h3>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <p className="text-xs text-slate-500 leading-relaxed mb-2">
          Escreve aqui o que os jogadores devem fazer neste quadro específico da jogada.
        </p>
        <textarea 
          className="flex-1 bg-[#0a0f1c] border border-slate-800/60 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none shadow-inner"
          placeholder="Ex: O extremo direito deve procurar o espaço vazio, enquanto o lateral sobe pela linha..."
          value={notes || ""}
          onChange={onChange}
        />
      </div>
    </div>
  );
}