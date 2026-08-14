"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Flag,
  Box,
  PlusSquare,
  Library,
  GripVertical,
  Maximize2,
  Timer,
  Users,
  Square,
  ImagePlus,
  Edit3,
} from "lucide-react";
import { SessaoTreino } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Exercicio } from "@/models/exercicio";
import { CatalogoExerciciosModal } from "./CatalogoExerciciosModal";
import { apiFetch } from "@/lib/api";
import { EventoFormModal } from "../calendario/EventoFormModal";
import { EventoCalendario } from "@/models/planeamento";

interface TreinoBuilderStitchProps {
  treino?: SessaoTreino | null; // Se null, é para criar novo
  activeTeam: Team;
  onGoBack: () => void;
}

export function TreinoBuilderStitch({
  treino,
  activeTeam,
  onGoBack,
}: TreinoBuilderStitchProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestMicrociclo, setLatestMicrociclo] = useState(1);
  
  // Controlled States para o Formulário do Cabeçalho
  const [titulo, setTitulo] = useState(treino?.objetivo || "Nova Sessão");
  const [data, setData] = useState(treino?.data || new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(treino?.hora || "19:00");
  const [duracao, setDuracao] = useState<number>(treino?.duracaoTotalMinutos || 90);
  const [local, setLocal] = useState("Arregaça");
  const [microciclo, setMicrociclo] = useState<number>(treino?.microciclo || 1);
  const [morfociclo, setMorfociclo] = useState<number>(treino?.morfociclo || 1);
  const [fase, setFase] = useState(treino?.fase || "Competitivo");
  const [jogadores, setJogadores] = useState<number>(treino?.numeroJogadores || 20);

  React.useEffect(() => {
    if (!treino && activeTeam) {
      apiFetch(`/eventos/equipa/${activeTeam.id}/ultimo-numero-treino`)
        .then(data => {
          if (typeof data === 'number') {
            setLatestMicrociclo(data + 1);
            setMicrociclo(data + 1);
          }
        })
        .catch(err => console.error("Erro ao obter último treino", err));
    }
  }, [treino, activeTeam]);

  const handleCreateEvento = async (evento: Omit<EventoCalendario, "id">) => {
    try {
      const eventoCriado = await apiFetch(`/eventos/equipa/${activeTeam?.id}`, {
        method: "POST",
        body: JSON.stringify(evento)
      });
      
      const treinoGerado = await apiFetch(`/treinos`, {
        method: "POST",
        body: JSON.stringify({
          eventoId: eventoCriado.id,
          equipaId: activeTeam.id,
          numeroJogadores: 20,
          objetivo: evento.descricao || "Nova Sessão"
        })
      });
      
      // Update local state to reflect the new training
      setTitulo(treinoGerado.objetivo || `Treino #${treinoGerado.microciclo}`);
      setData(treinoGerado.data);
      setHora(treinoGerado.hora);
      setDuracao(treinoGerado.duracaoTotalMinutos);
      setMicrociclo(treinoGerado.microciclo);
      setLocal(treinoGerado.local || local);
      
      setIsModalOpen(false);
      alert("Novo Treino criado com sucesso!");
    } catch (err: any) {
      console.error('Erro ao criar treino:', err);
      alert(`Erro ao criar treino: ${err.message || err}`);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Aqui teremos um PUT /api/treinos/{treino.id} futuramente
      
      // Simulação de gravação
      setTimeout(() => {
        setIsSaving(false);
        alert("Metadados atualizados com sucesso!");
      }, 500);
      
    } catch (e) {
      console.error(e);
      alert("Erro de ligação.");
      setIsSaving(false);
    }
  };
  
  // Cores do Stitch mapeadas para vars ou Tailwind arbitrário.
  // Vamos usar Tailwind arbitrário para garantir fidelidade ao design:
  // background-dark: #0B0C10
  // surface: #181A20
  // border-subtle: #23262E
  // primary: #ffd165
  // secondary: #4ae176
  // text: #ece1d1
  // text-variant: #d3c5ac
  // surface-variant: #242731 (Ajustado para condizer com o dark gray)

  const bgDark = "bg-background";
  const bgSurface = "glass";
  const borderSubtle = "border-border";
  const textPrimary = "text-primary";
  const textSecondary = "text-primary/80";
  const textOnSurface = "text-foreground";
  const textVariant = "text-muted-foreground";
  const bgSurfaceVariant = "bg-muted/50";
  
  // Estilos partilhados para os Cards (Grelha)
  const cardStyle = `${bgDark} px-3 py-1 border ${borderSubtle} flex flex-col justify-center rounded-sm`;
  const cardInputStyleBase = `bg-transparent border-none outline-none p-0 w-full h-[32px]`;

  // Fontes: usar Tailwind sans e mono para simplificar, ou classes padrão
  const fontMono = "font-mono text-xs font-medium tracking-wide";
  const fontCaps = "font-sans text-[10px] font-semibold uppercase tracking-widest";
  const fontHeadline = "font-sans text-xl font-semibold";
  const fontData = "font-mono text-2xl font-medium";

  return (
    <div className={`min-h-screen ${bgDark} ${textOnSurface} font-sans -m-4 md:-m-8 p-4 md:p-8 overflow-x-hidden`}>
      <div className="max-w-[1024px] mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <section
          className={`${bgSurface} border ${borderSubtle} p-6 flex flex-col gap-6 relative group overflow-hidden rounded-md`}
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          {/* Title and DateTime */}
          <div className={`flex flex-col md:flex-row justify-between items-end gap-4 border-b ${borderSubtle} pb-4`}>
            <div className="w-full md:w-1/4">
              <label className={`${fontCaps} ${textVariant} mb-1 block`}>
                Título / Objetivo
              </label>
              <input
                className={`w-full bg-transparent border-none p-0 ${fontHeadline} ${textOnSurface} focus:ring-0 placeholder:text-muted-foreground outline-none h-[28px]`}
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Organização Ofensiva"
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label className={`${fontCaps} ${textVariant} mb-1 block`}>
                Local
              </label>
              <input
                className={`w-full bg-transparent border-none p-0 ${fontHeadline} text-sm ${textOnSurface} focus:ring-0 outline-none h-[28px]`}
                type="text"
                list="locais-treino"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
              <datalist id="locais-treino">
                <option value="Arregaça" />
                <option value="Cernache" />
              </datalist>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div>
                <label className={`${fontCaps} ${textVariant} mb-1 block`}>Data</label>
                <div className={`${fontMono} ${textOnSurface} flex items-center gap-2 ${bgSurfaceVariant} px-2 py-1 border ${borderSubtle} rounded-sm h-[32px]`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-transparent border-none outline-none p-0 text-xs text-center" />
                </div>
              </div>
              <div>
                <label className={`${fontCaps} ${textVariant} mb-1 block`}>Hora</label>
                <div className={`${fontMono} ${textOnSurface} flex items-center gap-2 ${bgSurfaceVariant} px-2 py-1 border ${borderSubtle} rounded-sm h-[32px]`}>
                  <Clock className="w-3.5 h-3.5" /> 
                  <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="bg-transparent border-none outline-none p-0 text-xs w-[45px] text-center" />
                </div>
              </div>
              <div>
                <label className={`${fontCaps} ${textVariant} mb-1 block`}>Duração</label>
                <div className={`${fontMono} ${textOnSurface} flex items-center gap-2 ${bgSurfaceVariant} px-2 py-1 border ${borderSubtle} rounded-sm h-[32px]`}>
                  <Timer className="w-3.5 h-3.5" /> 
                  <input type="number" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="bg-transparent border-none outline-none p-0 text-xs w-[35px] text-center" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button onClick={() => setIsModalOpen(true)} className={`bg-transparent border border-primary text-primary font-bold ${fontMono} py-1 px-5 hover:bg-primary/10 transition-colors rounded-sm h-[32px] flex items-center justify-center`}>
                + NOVO TREINO
              </button>
              <button onClick={handleSave} disabled={isSaving} className={`bg-primary text-primary-foreground font-bold ${fontMono} py-1.5 px-5 hover:bg-primary/90 transition-colors rounded-sm shadow-md h-[32px] flex items-center`}>
                {isSaving ? "A GRAVAR..." : "GRAVAR TREINO"}
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={cardStyle}>
              <span className={`${fontCaps} ${textVariant} mb-0.5`}>Morfociclo (Semana)</span>
              <input type="number" value={morfociclo} onChange={(e) => setMorfociclo(Number(e.target.value))} className={`${cardInputStyleBase} ${fontData} ${textPrimary}`} />
            </div>
            <div className={cardStyle}>
              <span className={`${fontCaps} ${textVariant} mb-0.5`}>Unidade Treino</span>
              <input type="number" value={microciclo} onChange={(e) => setMicrociclo(Number(e.target.value))} className={`${cardInputStyleBase} ${fontData} ${textPrimary}`} />
            </div>
            <div className={cardStyle}>
              <span className={`${fontCaps} ${textVariant} mb-0.5`}>Fase</span>
              <input type="text" value={fase} onChange={(e) => setFase(e.target.value)} className={`${cardInputStyleBase} ${fontHeadline} ${textOnSurface} mt-auto`} />
            </div>
            <div className={cardStyle}>
              <span className={`${fontCaps} ${textVariant} mb-0.5`}>Jogadores</span>
              <input type="number" value={jogadores} onChange={(e) => setJogadores(Number(e.target.value))} className={`${cardInputStyleBase} ${fontData} ${textOnSurface}`} />
            </div>
          </div>

          {/* Objectives and Material */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t ${borderSubtle}`}>
            <div>
              <h3 className={`${fontCaps} ${textPrimary} mb-2 flex items-center gap-2`}>
                <Flag className="w-3.5 h-3.5" /> General Objectives
              </h3>
              <ul className="list-none space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className={`${textPrimary} mt-0.5`}>•</span> Transição defesa ataque
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${textPrimary} mt-0.5`}>•</span> Organização ofensiva
                </li>
              </ul>
            </div>
            <div>
              <h3 className={`${fontCaps} ${textVariant} mb-2 flex items-center gap-2`}>
                <Box className="w-3.5 h-3.5" /> Material
              </h3>
              <p className="text-sm">
                {treino?.material || "Bolas, cones, coletes."}
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className={`${fontHeadline} ${textOnSurface}`}>Exercícios do Treino</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              className={`flex-1 sm:flex-none ${bgSurfaceVariant} ${textOnSurface} border ${borderSubtle} ${fontMono} py-2 px-4 hover:bg-muted hover:border-primary transition-colors flex items-center justify-center gap-2 rounded-sm`}
            >
              <PlusSquare className="w-[18px] h-[18px]" /> NOVO EXERCÍCIO
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className={`flex-1 sm:flex-none bg-primary text-primary-foreground font-bold ${fontMono} py-2 px-4 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 rounded-sm`}
            >
              <Library className="w-[18px] h-[18px]" /> IMPORTAR BIBLIOTECA
            </button>
          </div>
        </div>

        {/* Timeline / Exercises */}
        <div className="flex flex-col gap-6">
          {(!treino?.exercicios || treino.exercicios.length === 0) ? (
            <div className={`p-12 text-center border-dashed border-2 ${borderSubtle} ${bgSurface} rounded-sm`}>
              <Library className={`w-12 h-12 ${textVariant} mx-auto mb-4 opacity-50`} />
              <h3 className={`${fontHeadline} ${textOnSurface} mb-2`}>Prancheta Vazia</h3>
              <p className={textVariant}>Clica em "Importar Biblioteca" para puxar exercícios guardados ou cria um de raiz.</p>
            </div>
          ) : (
            treino.exercicios.map((assoc, idx) => (
              <article key={assoc.id || idx} className={`${bgSurface} border ${borderSubtle} hover:border-primary/50 transition-colors group flex flex-col md:flex-row relative rounded-sm`}>
                <div className={`absolute left-0 top-0 bottom-0 w-8 ${bgSurfaceVariant} border-r ${borderSubtle} flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity cursor-move z-10 hidden md:flex rounded-l-sm`}>
                  <GripVertical className={textVariant} />
                </div>

                <div className={`w-full md:w-1/3 p-4 md:pl-12 ${bgDark} border-b md:border-b-0 md:border-r ${borderSubtle} relative min-h-[200px] flex items-center justify-center`}>
                  <div className="w-full aspect-[4/3] bg-primary/10 border border-primary/20 relative overflow-hidden flex items-center justify-center">
                    {/* Placeholder for Tactical Board */}
                    <div className="absolute inset-0 border-2 border-primary/30 m-2"></div>
                    <span className={`${fontMono} ${textSecondary} opacity-50`}>
                      Esquema Tático (Brevemente)
                    </span>
                  </div>
                  <button className={`absolute bottom-6 left-6 md:left-14 ${bgSurfaceVariant} border ${borderSubtle} ${fontCaps} ${textOnSurface} px-2 py-1 rounded-sm hover:border-primary transition-colors flex items-center gap-1`}>
                    <Maximize2 className="w-3 h-3" /> FULLSCREEN
                  </button>
                </div>

                <div className="w-full md:w-2/3 p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-4">
                    <div>
                      <h4 className={`${fontHeadline} ${textPrimary} mb-1`}>{assoc.exercicioNome}</h4>
                      <p className={`text-sm ${textVariant} border-l-2 ${borderSubtle} pl-3 mt-2`}>
                        <strong className={`${textOnSurface} block mb-1`}>Observações deste treino</strong>
                        {assoc.observacoesDoTreinador || "Sem observações específicas."}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Column */}
                  <div className={`w-full md:w-32 flex flex-row md:flex-col gap-2 md:gap-0 border-t md:border-t-0 md:border-l ${borderSubtle} pt-4 md:pt-0`}>
                    <div className={`flex-1 p-2 md:p-4 border-r md:border-r-0 md:border-b ${borderSubtle} flex flex-col items-center justify-center text-center bg-black/20`}>
                      <Timer className={`w-[18px] h-[18px] ${textVariant} mb-1`} />
                      <span className={`${fontMono} ${textOnSurface}`}>{assoc.duracaoMinutos} min</span>
                    </div>
                    <div className={`flex-1 p-2 md:p-4 flex flex-col items-center justify-center text-center bg-black/20`}>
                      <span className={`${fontCaps} text-muted-foreground mb-1`}>Ordem</span>
                      <span className={`${fontMono} ${textOnSurface}`}>#{assoc.ordem}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
      
      {showLibrary && (
        <CatalogoExerciciosModal
          onClose={() => setShowLibrary(false)}
          onSelect={(exercicio) => {
            console.log("Selecionado:", exercicio);
            setShowLibrary(false);
          }}
        />
      )}
      {isModalOpen && (
        <EventoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateEvento}
          eventoEdit={{
            tipoEvento: 'TREINO',
            numeroTreino: latestMicrociclo,
            descricao: `Treino #${latestMicrociclo}`,
            equipaCasa: activeTeam?.nome
          } as any}
        />
      )}
    </div>
  );
}
