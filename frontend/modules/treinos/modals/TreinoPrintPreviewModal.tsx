"use client";

import React, { useEffect } from "react";
import { SessaoTreino } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Printer, X } from "lucide-react";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";

interface TreinoPrintPreviewModalProps {
  treino: SessaoTreino;
  activeTeam: Team;
  onClose: () => void;
}

export function TreinoPrintPreviewModal({ treino, activeTeam, onClose }: TreinoPrintPreviewModalProps) {
  
  // Bloquear scroll do body enquanto o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exercicios = treino.exercicios || [];
  const totalMinutos = exercicios.reduce((acc, curr) => acc + (curr.duracaoMinutos || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col print:static print:inset-auto print:bg-white print:z-auto">
      {/* Navbar de Controlo (Não impressa) */}
      <div className="print:hidden h-16 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-white font-bold text-sm">Pré-visualização de Impressão</h2>
            <p className="text-xs text-slate-400">Verifique os desenhos e layout antes de exportar</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Exportar para PDF
        </button>
      </div>

      {/* Área de Documento (Impressa) */}
      <div className="flex-1 overflow-y-auto bg-slate-800 p-8 print:p-0 print:bg-white print:overflow-visible">
        {/* Folha A4 simulada (na web) e a 100% no print */}
        <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-2xl print:shadow-none p-10 print:p-0 print:w-full print:max-w-none text-slate-900">
          
          {/* Cabeçalho do Documento */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                {activeTeam.nome || "Plano de Sessão"}
              </h1>
              <h2 className="text-xl font-bold text-slate-700">
                {treino.objetivo || `Sessão #${treino.microciclo || 1}`}
              </h2>
            </div>
            <div className="text-right flex flex-col gap-1 text-sm font-medium text-slate-600">
              <p>Data: <span className="font-bold text-slate-900">{treino.data || "--/--/----"}</span></p>
              <p>Hora: <span className="font-bold text-slate-900">{treino.hora || "--:--"}</span></p>
              <p>Microciclo: <span className="font-bold text-slate-900">{treino.microciclo || 1}</span></p>
            </div>
          </div>

          {/* Info Secundária */}
          <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="block text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Jogadores</span>
              <span className="font-semibold text-slate-900">{treino.numeroJogadores || 0} convocados</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="block text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Duração Total</span>
              <span className="font-semibold text-slate-900">{totalMinutos} minutos</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="block text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Material</span>
              <span className="font-semibold text-slate-900">{treino.material || "Não definido"}</span>
            </div>
          </div>

          {/* Exercícios */}
          <div className="space-y-12">
            {exercicios.map((ex, idx) => (
              <div key={ex.id || idx} className="break-inside-avoid border-t border-slate-200 pt-8 first:border-0 first:pt-0">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{ex.exercicioNome}</h3>
                      <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {ex.duracaoMinutos} min
                      </span>
                    </div>
                    {ex.observacoesDoTreinador && (
                      <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                        {ex.observacoesDoTreinador}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tactical Board Render - BIG */}
                <div className="w-full aspect-[4/2.5] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner mt-4 relative flex items-center justify-center">
                  <TacticalBoardThumbnail 
                    tacticData={ex.dadosTaticos} 
                    className="w-full h-full" 
                  />
                  {/* Se não houver tática, mostramos uma msg na impressora */}
                  {!ex.dadosTaticos && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium">
                      Sem desenho tático
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
