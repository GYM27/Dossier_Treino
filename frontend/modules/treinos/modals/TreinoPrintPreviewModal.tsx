"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SessaoTreino } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import {
  Printer,
  X,
  Clock,
  Users,
  MapPin,
  Target,
  FileText,
  Zap,
} from "lucide-react";
import { TacticalBoardThumbnail } from "@/components/prancheta/TacticalBoardThumbnail";

interface TreinoPrintPreviewModalProps {
  treino: SessaoTreino;
  activeTeam: Team;
  onClose: () => void;
}

export function TreinoPrintPreviewModal({
  treino,
  activeTeam,
  onClose,
}: TreinoPrintPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exercicios = treino.exercicios || [];
  const totalMinutos = exercicios.reduce(
    (acc, curr) => acc + (curr.duracaoMinutos || 0),
    0,
  );

  const periodoTexto =
    treino.periodo === "PREPARATORIO"
      ? "PERÍODO PREPARATÓRIO"
      : treino.periodo === "TRANSICAO"
        ? "PERÍODO DE TRANSIÇÃO"
        : "PERÍODO COMPETITIVO";

  if (!mounted) return null;

  return createPortal(
    <div
      id="dossier-print-portal"
      className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-sm flex flex-col print:static print:inset-auto print:bg-white print:z-auto"
    >
      {/* 1. Barra de Controlo no Ecrã (NUNCA impressa) */}
      <div className="print:hidden h-14 border-b border-slate-800 bg-[#090d16] flex items-center justify-between px-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Fechar Pré-Visualização"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-white font-bold text-sm tracking-wide">
              Folha Oficial de Treino
            </h2>
            <p className="text-[11px] text-slate-400">
              Formato A4 pronto para impressão ou exportação em PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Área de Scroll no Ecrã / Documento de Impressão */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible flex justify-center">
        <div
          id="dossier-print-sheet"
          className="w-full max-w-[210mm] bg-white text-slate-900 font-sans shadow-2xl print:shadow-none p-5 md:p-6 print:p-0 print:w-full print:max-w-none box-border"
        >
          {/* 📋 CABEÇALHO TABULAR OFICIAL */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-3.5 bg-white print-avoid-break">
            {/* Topo do Cabeçalho: Título da Equipa e Badge de Período */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex justify-between items-center">
              <h1 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                PLANO DE TREINO — {activeTeam.nome?.toUpperCase() || "CLUBE"}{activeTeam.escalao ? ` • ${activeTeam.escalao.toUpperCase()}` : ""}
              </h1>
              <span className="text-[10px] font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-300 uppercase tracking-wide">
                {periodoTexto}
              </span>
            </div>

            {/* Linha 1: 5 Colunas de Periodização e Métricas */}
            <div className="grid grid-cols-5 border-b border-slate-300 text-[11px] bg-white">
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  MESOCICLO
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  #{treino.mesociclo || 1}
                </span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  MICROCICLO
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  Semana #{treino.microciclo || 1}
                </span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  UNIDADE TREINO
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  UT #{treino.unidadeTreino || 1}
                </span>
              </div>
              <div className="p-2 border-r border-slate-300">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  Nº JOGADORES
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {treino.numeroJogadores || 0} atletas
                </span>
              </div>
              <div className="p-2">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  VOLUME TOTAL
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {totalMinutos} min
                </span>
              </div>
            </div>

            {/* Linha 2: Data, Hora e Local */}
            <div className="grid grid-cols-5 border-b border-slate-300 text-[11px] bg-white">
              <div className="p-2 border-r border-slate-300 col-span-3">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  DATA & HORA
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {treino.data || "--/--/----"} às {treino.hora || "--:--"}
                </span>
              </div>
              <div className="p-2 col-span-2">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  LOCAL
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {treino.local || "Arregaça"}
                </span>
              </div>
            </div>

            {/* Linha 3: Material e Objetivos Gerais */}
            <div className="grid grid-cols-12 text-[11px] bg-white">
              <div className="p-2 border-r border-slate-300 col-span-4">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  MATERIAL
                </span>
                <span className="font-medium text-slate-800 text-xs">
                  {treino.material || "Bolas, cones, coletes."}
                </span>
              </div>
              <div className="p-2 col-span-8">
                <span className="text-slate-500 block text-[8.5px] font-bold uppercase tracking-wider mb-0.5">
                  OBJETIVOS GERAIS DA SESSÃO
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {treino.objetivo || "Sub sub princípios defensivos"}
                </span>
              </div>
            </div>
          </div>

          {/* ⚽ EXERCÍCIOS DA SESSÃO */}
          <div className="space-y-3.5">
            {exercicios.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className="print-avoid-break border border-slate-300 rounded-lg overflow-hidden bg-white shadow-none"
              >
                {/* Topo do Exercício */}
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs tracking-wide">
                    {ex.exercicioNome}
                  </h3>
                </div>

                {/* Corpo do Exercício: 3 Colunas (Relvado | Metodologia | Métricas) */}
                <div className="grid grid-cols-12 gap-2.5 p-2.5 items-stretch bg-white">
                  {/* 1. Coluna Esquerda (5 de 12): Relvado Tático */}
                  <div className="col-span-5 flex flex-col justify-center">
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

                  {/* 2. Coluna Central (5 de 12): Metodologia */}
                  <div className="col-span-5 flex flex-col justify-between gap-1.5 bg-slate-50 p-2 rounded border border-slate-200 text-[10px] leading-snug">
                    {/* Objetivo(s) específico(s) */}
                    <div>
                      <div className="flex items-center gap-1 text-cyan-800 font-bold uppercase tracking-wider text-[8.5px] mb-0.5">
                        <Target className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                        <span>OBJETIVO(S) ESPECÍFICO(S)</span>
                      </div>
                      <p className="text-slate-900 font-bold text-[10px] leading-tight">
                        {ex.objetivosEspecificos ||
                          ex.dadosTaticos?.objetivoEspecifico ||
                          "A definir na prancheta."}
                      </p>
                    </div>

                    {/* Divisória */}
                    <div className="border-t border-slate-200" />

                    {/* Descrição e Organização Metodológica */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wider text-[8.5px] mb-0.5">
                        <FileText className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                        <span>DESCRIÇÃO E ORGANIZAÇÃO METODOLÓGICA</span>
                      </div>
                      <p className="text-slate-700 font-normal text-[9.5px] leading-snug whitespace-pre-line">
                        {ex.descricao ||
                          ex.dadosTaticos?.descricaoMetodologica ||
                          "Sem descrição metodológica adicional."}
                      </p>
                    </div>

                    {/* Observações do Treinador se existirem */}
                    {ex.observacoesDoTreinador && (
                      <div className="pt-1 border-t border-slate-200">
                        <span className="text-[8.5px] font-bold text-amber-800 uppercase tracking-wider block">
                          Observações:
                        </span>
                        <p className="text-slate-600 italic text-[9.5px]">
                          {ex.observacoesDoTreinador}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Coluna Direita (2 de 12): Métricas Verticais */}
                  <div className="col-span-2 flex flex-col items-center justify-around bg-slate-50 p-1.5 rounded border border-slate-200 text-center">
                    {/* Tempo */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {ex.duracaoMinutos || 15} min
                      </span>
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> TEMPO
                      </span>
                    </div>

                    <div className="w-full border-t border-slate-200 my-0.5" />

                    {/* Número */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {ex.jogadoresEnvolvidos || 20}
                      </span>
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Users className="w-2 h-2" /> NÚMERO
                      </span>
                    </div>

                    <div className="w-full border-t border-slate-200 my-0.5" />

                    {/* Espaço */}
                    <div className="flex flex-col items-center">
                      <span
                        className="text-[10px] font-bold text-slate-800 truncate max-w-[75px]"
                        title={ex.espaco || "15×10m"}
                      >
                        {ex.espaco || "15×10m"}
                      </span>
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <MapPin className="w-2 h-2" /> ESPAÇO
                      </span>
                    </div>

                    {/* Carga */}
                    {(ex.carga || ex.dadosTaticos?.carga) && (
                      <>
                        <div className="w-full border-t border-slate-200 my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-[8.5px] font-bold text-amber-900 leading-tight text-center">
                            {ex.carga || ex.dadosTaticos?.carga}
                          </span>
                          <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                            <Zap className="w-2 h-2 text-amber-600" /> CARGA
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {exercicios.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 text-xs">
                Nenhum exercício associado a esta sessão. Adicione exercícios
                através do estúdio.
              </div>
            )}
          </div>

          {/* Rodapé Oficial da Folha */}
          <div className="border-t border-slate-200 pt-3 mt-6 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
            <span>{activeTeam.nome || "Dossier do Treinador"}{activeTeam.escalao ? ` • ${activeTeam.escalao}` : ""} • Plano de Treino Oficial</span>
            <span>{treino.data || new Date().toISOString().split("T")[0]}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
