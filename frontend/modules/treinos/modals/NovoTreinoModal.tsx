"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Target, Users, Flame, Dumbbell } from "lucide-react";
import { Team } from "@/models/team";
import { SessaoTreino } from "@/models/sessao-treino";
import { treinoService, calendarioService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NovoTreinoModalProps {
  activeTeam: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onTreinoCreated: (treino: SessaoTreino) => void;
}

export function NovoTreinoModal({
  activeTeam,
  isOpen,
  onClose,
  onTreinoCreated,
}: NovoTreinoModalProps) {
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [horaInicio, setHoraInicio] = useState("19:00");
  const [duracaoMinutos, setDuracaoMinutos] = useState(90);
  const [local, setLocal] = useState("Arregaça");
  const [numeroTreino, setNumeroTreino] = useState(1);
  const [objetivo, setObjetivo] = useState("");
  const [numeroJogadores, setNumeroJogadores] = useState(20);
  const [intensidade, setIntensidade] = useState(3);
  const [material, setMaterial] = useState("Bolas, cones, coletes.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Buscar último número de treino da equipa para autoincrementar
  useEffect(() => {
    if (isOpen && activeTeam) {
      treinoService.getUltimoNumeroTreino(activeTeam.id)
        .then((num) => {
          if (typeof num === "number" && num > 0) {
            setNumeroTreino(num + 1);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, activeTeam]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Calcular dataHoraInicio e dataHoraFim para o Calendário
      const inicio = new Date(`${data}T${horaInicio}:00`);
      const fim = new Date(inicio.getTime() + duracaoMinutos * 60000);

      // Formatar para ISO local
      const dataHoraInicioStr = `${data}T${horaInicio}:00`;
      const horaFimStr = fim.toTimeString().substring(0, 5);
      const dataFimStr = fim.toISOString().split("T")[0];
      const dataHoraFimStr = `${dataFimStr}T${horaFimStr}:00`;

      // 2. Criar Evento no Calendário através do Serviço
      const eventoCriado = await calendarioService.criarEvento(activeTeam!.id, {
        tipoEvento: "TREINO",
        dataHoraInicio: dataHoraInicioStr,
        dataHoraFim: dataHoraFimStr,
        descricao: objetivo || `Treino #${numeroTreino}`,
        local: local,
        numeroTreino: numeroTreino,
      });

      // 3. Criar Sessão de Treino associada através do Serviço
      const sessaoCriada = await treinoService.criarTreino({
        eventoId: eventoCriado.id,
        equipaId: activeTeam!.id,
        numeroJogadores: numeroJogadores,
        objetivo: objetivo || `Treino #${numeroTreino}`,
        intensidadeGeral: intensidade,
        material: material,
      });

      onTreinoCreated(sessaoCriada);
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar treino:", err);
      setErrorMsg(err.message || "Ocorreu um erro ao criar o treino.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Novo Treino
              </h3>
              <p className="text-xs text-slate-400">
                Criar sessão e agendar no calendário da equipa
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Microciclo e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Nº Treino / Microciclo
              </label>
              <Input
                type="number"
                min={1}
                required
                value={numeroTreino}
                onChange={(e) => setNumeroTreino(parseInt(e.target.value) || 1)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Data
              </label>
              <Input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Hora de Início e Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Hora de Início
              </label>
              <Input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Duração Estimada (min)
              </label>
              <Input
                type="number"
                min={15}
                max={240}
                step={5}
                required
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(parseInt(e.target.value) || 90)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Local
            </label>
            <Input
              type="text"
              required
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Campo Principal, Arregaça"
              className="text-xs"
            />
          </div>

          {/* Objetivo Principal */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Objetivo Principal da Sessão
            </label>
            <Input
              type="text"
              required
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex: Organização Ofensiva - Criação e Finalização"
              className="text-xs"
            />
          </div>

          {/* Jogadores e Intensidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Nº Jogadores
              </label>
              <Input
                type="number"
                min={1}
                max={40}
                value={numeroJogadores}
                onChange={(e) => setNumeroJogadores(parseInt(e.target.value) || 20)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Intensidade (1 a 5)
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensidade(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      intensidade >= lvl
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="cyan"
              disabled={isSubmitting}
            >
              {isSubmitting ? "A criar..." : "Criar Treino"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
