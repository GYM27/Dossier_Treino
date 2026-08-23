"use client";

import React, { useEffect } from "react";
import { SessaoTreino } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Printer, X, Clock, Users, MapPin, Target, FileText, Zap } from "lucide-react";
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
            <h2 className="text-white font-bold text-sm">Folha de Plano de Treino (PDF / Impressão)</h2>
            <p className="text-xs text-slate-400">Layout profissional estruturado com relvado e fichas metodológicas</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Área de Documento (Impressa) */}
      <div className="flex-1 overflow-y-auto bg-slate-800 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible">
        {/* Folha A4 simulada */}
        <div className="max-w-[215mm] mx-auto bg-white min-h-[297mm] shadow-2xl print:shadow-none p-6 md:p-8 print:p-0 print:w-full print:max-w-none text-slate-900 font-sans text-xs">
          
          {/* 📋 Cabeçalho Tabular Oficial do Plano de Treino */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-5 bg-slate-50">
            {/* Topo: Título da Equipa e Plano */}
            <div className="bg-slate-200 px-4 py-2 border-b border-slate-300 flex justify-between items-center">
              <h1 className="text-base font-black uppercase text-slate-900 tracking-wider">
                Plano de Treino — {activeTeam.nome || "Plantel Principal"}
              </h1>
              <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                {treino.fase || "Período Competitivo"}
              </span>
            </div>

            {/* Grelha de Metadados: Linha 1 (Periodização e Métricas) */}
            <div className="grid grid-cols-5 border-b border-slate-300 text-[11px]">
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Mesociclo</span>
                <span className="font-bold text-slate-900">#{treino.mesociclo || 1}</span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Microciclo</span>
                <span className="font-bold text-slate-900">Semana #{treino.microciclo || 1}</span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Unidade Treino</span>
                <span className="font-bold text-slate-900">UT #{treino.unidadeTreino || 1}</span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Nº Jogadores</span>
                <span className="font-bold text-slate-900">{treino.numeroJogadores || 0} atletas</span>
              </div>
              <div className="p-2">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Volume Total</span>
                <span className="font-bold text-slate-900">{totalMinutos} min</span>
              </div>
            </div>

            {/* Grelha de Metadados: Linha 2 */}
            <div className="grid grid-cols-4 border-b border-slate-300 text-[11px] bg-white">
              <div className="p-2 border-r border-slate-300 col-span-2">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Data & Hora</span>
                <span className="font-bold text-slate-900">{treino.data || "--/--/----"} às {treino.hora || "--:--"}</span>
              </div>
              <div className="p-2 border-r border-slate-300 col-span-2">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Local</span>
                <span className="font-bold text-slate-900">{treino.local || "Campo de Treinos"}</span>
              </div>
            </div>

            {/* Grelha de Metadados: Linha 3 (Material e Objetivos) */}
            <div className="grid grid-cols-12 text-[11px] bg-slate-50">
              <div className="p-2.5 border-r border-slate-300 col-span-4">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Material</span>
                <span className="font-medium text-slate-800">{treino.material || "Bolas, cones, coletes e balizas."}</span>
              </div>
              <div className="p-2.5 col-span-8">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Objetivos Gerais da Sessão</span>
                <span className="font-bold text-slate-900">{treino.objetivo || "Organização e dinâmica coletiva."}</span>
              </div>
            </div>
          </div>

          {/* ⚽ Lista de Exercícios (Grelha de 3 Secções por Exercício) */}
          <div className="space-y-4">
            {exercicios.map((ex, idx) => (
              <div 
                key={ex.id || idx} 
                className="break-inside-avoid border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs"
              >
                {/* Topo do Exercício */}
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{ex.exercicioNome}</h3>
                    {ex.categoria && (
                      <span className="text-[9px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                        {ex.categoria}
                      </span>
                    )}
                  </div>
                </div>

                {/* Corpo do Exercício: 3 Colunas (Relvado | Metodologia | Badges) */}
                <div className="grid grid-cols-12 gap-3 p-3 items-stretch">
                  
                  {/* 1. Esquerda (5 cols): Relvado Tático */}
                  <div className="col-span-5 flex flex-col items-center justify-center">
                    <div className="w-full aspect-[16/10] bg-[#1b4332] rounded border border-slate-400 overflow-hidden relative shadow-inner">
                      <TacticalBoardThumbnail 
                        tacticData={ex.dadosTaticos} 
                        className="w-full h-full" 
                      />
                      {!ex.dadosTaticos && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-[10px]">
                          Sem desenho tático
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Centro (5 cols): Metodologia (Objetivos e Descrição) */}
                  <div className="col-span-5 flex flex-col justify-between gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                    {/* Objetivo(s) específico(s) */}
                    <div>
                      <div className="flex items-center gap-1 text-cyan-800 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                        <Target className="w-3 h-3 text-cyan-600" />
                        <span>Objetivo(s) específico(s)</span>
                      </div>
                      <p className="text-slate-800 font-semibold leading-relaxed">
                        {ex.objetivosEspecificos || ex.dadosTaticos?.objetivoEspecifico || "Definido no quadro tático."}
                      </p>
                    </div>

                    {/* Divisória */}
                    <div className="border-t border-slate-200" />

                    {/* Descrição e Organização Metodológica */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>Descrição e Organização Metodológica</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {ex.descricao || ex.dadosTaticos?.descricaoMetodologica || "Sem descrição metodológica adicional."}
                      </p>
                    </div>

                    {/* Notas do Treinador se houver */}
                    {ex.observacoesDoTreinador && (
                      <div className="pt-1.5 border-t border-slate-200">
                        <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">
                          Observações:
                        </span>
                        <p className="text-slate-600 italic">
                          {ex.observacoesDoTreinador}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Direita (2 cols): Coluna de Badges (Tempo, Número, Espaço, Carga) */}
                  <div className="col-span-2 flex flex-col items-center justify-around bg-slate-50 p-2 rounded border border-slate-200 text-center">
                    {/* Tempo */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {ex.duracaoMinutos || 10} min
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> tempo
                      </span>
                    </div>

                    <div className="w-full border-t border-slate-200 my-1" />

                    {/* Número */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-800">
                        {ex.jogadoresEnvolvidos ? `${ex.jogadoresEnvolvidos}` : "Todos"}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> número
                      </span>
                    </div>

                    <div className="w-full border-t border-slate-200 my-1" />

                    {/* Espaço */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]" title={ex.espaco || "Meio-Campo"}>
                        {ex.espaco || "Meio-Campo"}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> espaço
                      </span>
                    </div>

                    {/* Carga / Séries / Pausas */}
                    {(ex.carga || ex.dadosTaticos?.carga) && (
                      <>
                        <div className="w-full border-t border-slate-200 my-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-amber-900 leading-tight text-center">
                            {ex.carga || ex.dadosTaticos?.carga}
                          </span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                            <Zap className="w-2 h-2 text-amber-600" /> carga
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
