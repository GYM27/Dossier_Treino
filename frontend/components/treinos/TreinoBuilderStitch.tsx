"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  Clock,
  Flag,
  Box,
  PlusSquare,
  PlaySquare,
  LayoutDashboard,
  Library,
  GripVertical,
  Maximize2,
  Timer,
  Users,
  Square,
  ImagePlus,
  Edit3,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { SessaoTreino, SessaoTreinoExercicio } from "@/models/sessao-treino";
import { Team } from "@/models/team";
import { Exercicio } from "@/models/exercicio";
import { CatalogoExerciciosModal } from "./CatalogoExerciciosModal";
import { apiFetch } from "@/lib/api";
import { EventoFormModal } from "../calendario/EventoFormModal";
import { EventoCalendario } from "@/models/planeamento";

// Import dinâmico do TacticalBoard (usa Canvas, precisa de SSR desligado)
const TacticalBoard = dynamic(() => import("@/components/prancheta/TacticalBoard"), { ssr: false });

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
  const [showPrancheta, setShowPrancheta] = useState(false);
  
  // Controlled States para o Formulário do Cabeçalho
  const [titulo, setTitulo] = useState(treino?.objetivo || "Nova Sessão");
  const [data, setData] = useState(treino?.data || new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(treino?.hora || "19:00");
  const [duracao, setDuracao] = useState<number>(treino?.duracaoTotalMinutos || 90);
  const [local, setLocal] = useState("Arregaça");
  const [microciclo, setMicrociclo] = useState<number>(treino?.microciclo || 1);
  const [morfociclo, setMorfociclo] = useState<number>(treino?.morfociclo || 1);

  // Estados para Objetivos Gerais e Material (editáveis)
  const [objetivosGerais, setObjetivosGerais] = useState<string[]>(
    treino?.objetivo ? treino.objetivo.split('\n').filter(o => o.trim()) : [""]
  );
  const [material, setMaterial] = useState(treino?.material || "Bolas, cones, coletes.");

  // Estado local dos exercícios (cópia editável)
  const [exerciciosLocais, setExerciciosLocais] = useState<SessaoTreinoExercicio[]>(
    treino?.exercicios || []
  );

  // Estado para o sessaoId (necessário para PUT/POST)
  const [sessaoId, setSessaoId] = useState<string | null>(treino?.id || null);

  // Estado para o modal do novo exercício
  const [novoExercicioNome, setNovoExercicioNome] = useState("");
  const [novoExercicioDuracao, setNovoExercicioDuracao] = useState(15);
  const [novoExercicioJogadores, setNovoExercicioJogadores] = useState<string>("16");
  const [novoExercicioEspaco, setNovoExercicioEspaco] = useState<string>("40x30m");
  const [novoExercicioPitchStyle, setNovoExercicioPitchStyle] = useState<"full" | "half" | "free">("full");
  const [novoExercicioCategoria, setNovoExercicioCategoria] = useState<string>("TATICO");
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
    if (!sessaoId) {
      alert("Crie um treino primeiro (+ NOVO TREINO)");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const objetivoString = objetivosGerais.filter(o => o.trim() !== "").join("\n");
      
      const payload = {
        eventoId: (treino as any)?.eventoId || "00000000-0000-0000-0000-000000000000",
        equipaId: activeTeam.id,
        objetivo: objetivoString,
        material: material,
        numeroJogadores: jogadores,
        intensidadeGeral: 3
      };
      
      await apiFetch(`/treinos/${sessaoId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      
      setIsSaving(false);
      alert("Metadados do treino gravados com sucesso!");
    } catch (e: any) {
      console.error(e);
      alert("Erro ao gravar treino: " + (e.message || "Erro desconhecido"));
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
              <div className="flex justify-between items-center mb-2">
                <h3 className={`${fontCaps} ${textPrimary} flex items-center gap-2`}>
                  <Flag className="w-3.5 h-3.5" /> Objetivos Gerais
                </h3>
                <button 
                  onClick={() => setObjetivosGerais([...objetivosGerais, ""])}
                  className={`text-xs ${textPrimary} flex items-center gap-1 hover:underline`}
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
              <ul className="list-none space-y-2 text-sm">
                {objetivosGerais.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`${textPrimary} mt-2`}>•</span>
                    <input
                      type="text"
                      className={`flex-1 bg-transparent border-b ${borderSubtle} focus:border-primary outline-none py-1 text-sm ${textOnSurface}`}
                      placeholder="Novo objetivo..."
                      value={obj}
                      onChange={(e) => {
                        const newObjs = [...objetivosGerais];
                        newObjs[idx] = e.target.value;
                        setObjetivosGerais(newObjs);
                      }}
                    />
                    <button 
                      onClick={() => setObjetivosGerais(objetivosGerais.filter((_, i) => i !== idx))}
                      className="mt-1 text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
                {objetivosGerais.length === 0 && (
                  <li className={`text-xs ${textVariant} italic`}>Nenhum objetivo definido.</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className={`${fontCaps} ${textVariant} mb-2 flex items-center gap-2`}>
                <Box className="w-3.5 h-3.5" /> Material
              </h3>
              <textarea
                className={`w-full h-24 bg-transparent border ${borderSubtle} rounded-sm p-2 text-sm ${textOnSurface} focus:border-primary outline-none resize-none`}
                placeholder="Ex: Bolas, cones, coletes..."
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className={`${fontHeadline} ${textOnSurface}`}>Exercícios do Treino</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPrancheta(true)}
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
          {(!exerciciosLocais || exerciciosLocais.length === 0) ? (
            <div className={`p-12 text-center border-dashed border-2 ${borderSubtle} ${bgSurface} rounded-sm`}>
              <Library className={`w-12 h-12 ${textVariant} mx-auto mb-4 opacity-50`} />
              <h3 className={`${fontHeadline} ${textOnSurface} mb-2`}>Prancheta Vazia</h3>
              <p className={textVariant}>Clica em "Importar Biblioteca" para puxar exercícios guardados ou cria um de raiz.</p>
            </div>
          ) : (
            exerciciosLocais.map((assoc, idx) => (
              <article key={assoc.id || idx} className={`${bgSurface} border ${borderSubtle} hover:border-primary/50 transition-colors group flex flex-col md:flex-row relative rounded-sm`}>
                <div className={`absolute left-0 top-0 bottom-0 w-8 ${bgSurfaceVariant} border-r ${borderSubtle} flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity cursor-move z-10 hidden md:flex rounded-l-sm`}>
                  <GripVertical className={textVariant} />
                </div>

                <div className={`w-full md:w-1/3 p-4 md:pl-12 ${bgDark} border-b md:border-b-0 md:border-r ${borderSubtle} relative min-h-[200px] flex items-center justify-center`}>
                  <div className="w-full aspect-[4/3] bg-primary/10 border border-primary/20 relative overflow-hidden flex items-center justify-center">
                    {assoc.dadosTaticos ? (
                       <div className="absolute inset-0 w-[200%] h-[200%] origin-top-left scale-50 pointer-events-none">
                         <TacticalBoard initialTacticData={assoc.dadosTaticos} />
                       </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 border-2 border-primary/30 m-2"></div>
                        <span className={`${fontMono} ${textSecondary} opacity-50 text-center px-4`}>
                          Esquema Tático (Sem Dados)
                        </span>
                      </>
                    )}
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
          onSelect={async (exercicio) => {
            if (!sessaoId) {
               alert("Grave a sessão de treino primeiro para adicionar exercícios.");
               setShowLibrary(false);
               return;
            }
            try {
               setIsSaving(true);
               const assocPayload = {
                  exercicioId: exercicio.id,
                  ordem: exerciciosLocais.length + 1,
                  duracaoMinutos: 15,
                  observacoesDoTreinador: ""
               };
               const atualizada = await apiFetch(`/treinos/${sessaoId}/exercicios`, {
                  method: "POST",
                  body: JSON.stringify(assocPayload)
               });
               setExerciciosLocais(atualizada.exercicios || []);
            } catch(e: any) {
               alert("Erro: " + e.message);
            } finally {
               setIsSaving(false);
               setShowLibrary(false);
            }
          }}
        />
      )}
      
      {showPrancheta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
          <div className={`w-full max-w-[1600px] max-h-[95vh] bg-card border ${borderSubtle} rounded-md shadow-2xl flex flex-col overflow-hidden`}>
            {/* Header */}
            {/* Header */}
            <div className={`p-3.5 border-b ${borderSubtle} flex justify-between items-center bg-[#0d1527] gap-3`}>
              <div className="flex gap-3 items-center flex-1 flex-wrap">
                <button 
                  onClick={() => setShowPrancheta(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="font-bold text-base text-white shrink-0 flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-cyan-400" />
                  Prancheta Tática
                </h2>
                
                {/* Inputs do Topo: Campo, Nome, Tempo, Jogadores, Espaço */}
                <div className="flex items-center gap-2 flex-1 max-w-5xl flex-wrap">
                  {/* Campo (Full vs Half vs Free) */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 pl-1 flex items-center gap-1">
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      Campo
                    </span>
                    <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800">
                      <button
                        onClick={() => setNovoExercicioPitchStyle("full")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          novoExercicioPitchStyle === "full"
                            ? "bg-yellow-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Campo Inteiro (Com Balizas e Áreas)"
                      >
                        Full
                      </button>
                      <button
                        onClick={() => setNovoExercicioPitchStyle("half")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          novoExercicioPitchStyle === "half"
                            ? "bg-yellow-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Meio Campo (Com Meia Lua e Grande Área)"
                      >
                        Half
                      </button>
                      <button
                        onClick={() => setNovoExercicioPitchStyle("free")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          novoExercicioPitchStyle === "free"
                            ? "bg-yellow-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Relvado Livre (Sem Áreas nem Balizas)"
                      >
                        Free
                      </button>
                    </div>
                  </div>

                  {/* Nome */}
                  <input 
                    type="text" 
                    placeholder="Nome do Exercício..." 
                    value={novoExercicioNome}
                    onChange={e => setNovoExercicioNome(e.target.value)}
                    className="flex-1 min-w-[170px] bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 placeholder:text-slate-600"
                  />

                  {/* Tempo */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 w-24 shrink-0">
                    <Timer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <input 
                      type="number" 
                      value={novoExercicioDuracao}
                      onChange={e => setNovoExercicioDuracao(Number(e.target.value))}
                      className="w-full bg-transparent border-none outline-none p-0 text-xs text-slate-200"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">min</span>
                  </div>

                  {/* Jogadores */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 w-28 shrink-0">
                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Jogadores..."
                      value={novoExercicioJogadores}
                      onChange={e => setNovoExercicioJogadores(e.target.value)}
                      className="w-full bg-transparent border-none outline-none p-0 text-xs text-slate-200 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Espaço */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 w-28 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Espaço..."
                      value={novoExercicioEspaco}
                      onChange={e => setNovoExercicioEspaco(e.target.value)}
                      className="w-full bg-transparent border-none outline-none p-0 text-xs text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic shrink-0 hidden md:block">
                Usa o botão <span className="font-semibold text-yellow-400">"Guardar"</span> na lateral para finalizar.
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 bg-[#0a0f1c]">
              <TacticalBoard 
                initialTacticData={{
                  pitchStyle: novoExercicioPitchStyle,
                  tempo: String(novoExercicioDuracao),
                  numeroJogadores: novoExercicioJogadores,
                  espaco: novoExercicioEspaco,
                }}
                onSave={async (tacticData: any) => {
                  try {
                    setIsSaving(true);
                    
                    const payload = {
                      nome: novoExercicioNome || "Novo Exercício Tático",
                      descricao: tacticData.descricaoMetodologica || "Criado no treino builder.",
                      objetivosEspecificos: tacticData.objetivoEspecifico || "",
                      espaco: novoExercicioEspaco || tacticData.espaco || "",
                      jogadoresEnvolvidos: parseInt(novoExercicioJogadores) || (tacticData.numeroJogadores ? parseInt(tacticData.numeroJogadores) : null),
                      categoria: novoExercicioCategoria,
                      nivelDificuldade: 3,
                      dadosTaticos: {
                        ...tacticData,
                        tempo: String(novoExercicioDuracao),
                        numeroJogadores: novoExercicioJogadores,
                        espaco: novoExercicioEspaco
                      }
                    };
                    const response = await apiFetch("/exercicios", {
                      method: "POST",
                      body: JSON.stringify(payload)
                    });
                    
                    if (sessaoId && response.id) {
                       const assocPayload = {
                          exercicioId: response.id,
                          ordem: exerciciosLocais.length + 1,
                          duracaoMinutos: novoExercicioDuracao,
                          observacoesDoTreinador: ""
                       };
                       const atualizada = await apiFetch(`/treinos/${sessaoId}/exercicios`, {
                          method: "POST",
                          body: JSON.stringify(assocPayload)
                       });
                       
                       setExerciciosLocais(atualizada.exercicios || []);
                       alert("Exercício guardado e associado com sucesso!");
                    } else {
                       alert("Exercício gravado no catálogo (mas guarde o Treino 1º para o associar).");
                    }
                    
                    setShowPrancheta(false);
                    setNovoExercicioNome("");
                  } catch (e: any) {
                    alert("Erro ao gravar exercício: " + e.message);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
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
