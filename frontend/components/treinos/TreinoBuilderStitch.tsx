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

  const bgDark = "bg-[#0B0C10]";
  const bgSurface = "bg-[#181A20]";
  const borderSubtle = "border-[#23262E]";
  const textPrimary = "text-[#ffd165]";
  const textSecondary = "text-[#4ae176]";
  const textOnSurface = "text-[#ece1d1]";
  const textVariant = "text-[#8B949E]";
  const bgSurfaceVariant = "bg-[#23262E]"; // A bit lighter than surface

  // Fontes: usar Tailwind sans e mono para simplificar, ou classes padrão
  const fontMono = "font-mono text-xs font-medium tracking-wide";
  const fontCaps = "font-sans text-[10px] font-semibold uppercase tracking-widest";
  const fontHeadline = "font-sans text-xl font-semibold";
  const fontData = "font-mono text-3xl font-medium";

  return (
    <div className={`min-h-screen ${bgDark} ${textOnSurface} font-sans -m-4 md:-m-8 p-4 md:p-8 overflow-x-hidden`}>
      <div className="max-w-[1024px] mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <section
          className={`${bgSurface} border ${borderSubtle} p-6 flex flex-col gap-6 relative group overflow-hidden rounded-md`}
        >
          <div className="absolute inset-0 bg-[#ffd165]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          {/* Title and DateTime */}
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b ${borderSubtle} pb-4`}>
            <div className="w-full md:w-2/3">
              <label className={`${fontCaps} ${textVariant} mb-1 block`}>
                Session Title
              </label>
              <input
                className={`w-full bg-transparent border-none p-0 ${fontHeadline} ${textOnSurface} focus:ring-0 placeholder:text-muted-foreground outline-none`}
                type="text"
                defaultValue={treino?.objetivo || "Sessão #1 - Novo Treino"}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div>
                <label className={`${fontCaps} ${textVariant} mb-1 block`}>Date</label>
                <div
                  className={`${fontMono} ${textOnSurface} flex items-center gap-2 ${bgSurfaceVariant} px-3 py-1.5 border ${borderSubtle} rounded-sm`}
                >
                  <Calendar className="w-4 h-4" />{" "}
                  {treino?.data || "DD-MM-YYYY"}
                </div>
              </div>
              <div>
                <label className={`${fontCaps} ${textVariant} mb-1 block`}>Time</label>
                <div
                  className={`${fontMono} ${textOnSurface} flex items-center gap-2 ${bgSurfaceVariant} px-3 py-1.5 border ${borderSubtle} rounded-sm`}
                >
                  <Clock className="w-4 h-4" /> {treino?.hora || "00:00"}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${bgDark} p-3 border ${borderSubtle} flex flex-col justify-between rounded-sm`}>
              <span className={`${fontCaps} ${textVariant} mb-2`}>Microcycle</span>
              <span className={`${fontData} ${textPrimary}`}>
                {treino?.microciclo || "01"}
              </span>
            </div>
            <div className={`${bgDark} p-3 border ${borderSubtle} flex flex-col justify-between rounded-sm`}>
              <span className={`${fontCaps} ${textVariant} mb-2`}>Morfocycle</span>
              <span className={`${fontData} ${textPrimary}`}>
                {treino?.morfociclo || "01"}
              </span>
            </div>
            <div className={`${bgDark} p-3 border ${borderSubtle} flex flex-col justify-between col-span-2 md:col-span-1 rounded-sm`}>
              <span className={`${fontCaps} ${textVariant} mb-2`}>Phase</span>
              <span className={`${fontMono} ${textOnSurface} mt-auto`}>
                {treino?.fase || "Pré-Época"}
              </span>
            </div>
            <div className={`${bgDark} p-3 border ${borderSubtle} flex flex-col justify-between col-span-2 md:col-span-1 rounded-sm`}>
              <span className={`${fontCaps} ${textVariant} mb-2`}>Players</span>
              <span className={`${fontData} ${textOnSurface}`}>
                {treino?.numeroJogadores || "0"}
              </span>
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

        {/* Builder Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className={`${fontHeadline} ${textOnSurface}`}>Exercise Flow</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              className={`flex-1 sm:flex-none ${bgSurfaceVariant} ${textOnSurface} border ${borderSubtle} ${fontMono} py-2 px-4 hover:bg-[#2c303b] hover:border-[#ffd165] transition-colors flex items-center justify-center gap-2 rounded-sm`}
            >
              <PlusSquare className="w-[18px] h-[18px]" /> NEW DRILL
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className={`flex-1 sm:flex-none bg-[#ffd165] text-[#3f2e00] font-bold ${fontMono} py-2 px-4 hover:bg-[#ffdf9a] transition-colors flex items-center justify-center gap-2 rounded-sm`}
            >
              <Library className="w-[18px] h-[18px]" /> IMPORT LIBRARY
            </button>
          </div>
        </div>

        {/* Timeline / Exercises */}
        <div className="flex flex-col gap-6">
          {/* Mock Exercise 1 */}
          <article className={`${bgSurface} border ${borderSubtle} hover:border-[#ffd165]/50 transition-colors group flex flex-col md:flex-row relative rounded-sm`}>
            <div className={`absolute left-0 top-0 bottom-0 w-8 ${bgSurfaceVariant} border-r ${borderSubtle} flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity cursor-move z-10 hidden md:flex rounded-l-sm`}>
              <GripVertical className={textVariant} />
            </div>

            <div className={`w-full md:w-1/3 p-4 md:pl-12 ${bgDark} border-b md:border-b-0 md:border-r ${borderSubtle} relative min-h-[200px] flex items-center justify-center`}>
              <div className="w-full aspect-[4/3] bg-[#4ae176]/10 border border-[#4ae176]/20 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder for Tactical Board */}
                <div className="absolute inset-0 border-2 border-[#4ae176]/30 m-2"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#4ae176]/30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-[#4ae176]/30"></div>
                <span className={`${fontMono} ${textSecondary} opacity-50`}>
                  Tactical Board
                </span>
              </div>
              <button className={`absolute bottom-6 left-6 md:left-14 ${bgSurfaceVariant} border ${borderSubtle} ${fontCaps} ${textOnSurface} px-2 py-1 rounded-sm hover:border-[#ffd165] transition-colors flex items-center gap-1`}>
                <Maximize2 className="w-3 h-3" /> FULLSCREEN
              </button>
            </div>

            <div className="w-full md:w-2/3 p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <h4 className={`${fontHeadline} ${textPrimary} mb-1`}>Posse de bola com apoio frontal</h4>
                  <p className={`text-sm ${textVariant} border-l-2 ${borderSubtle} pl-3 mt-2`}>
                    <strong className={`${textOnSurface} block mb-1`}>Specific Objective(s)</strong>
                    Manter a posse, criar linhas de passe, procurar o apoio frontal para progredir.
                  </p>
                </div>
                <div className="mt-auto">
                  <strong className={`text-sm ${textOnSurface} block mb-1`}>Methodological Description</strong>
                  <p className={`text-sm ${textVariant}`}>
                    4x4 + 2 apoios exteriores. A equipa em posse tenta manter a bola e usar os apoios para ligar o jogo.
                  </p>
                </div>
              </div>

              {/* Metadata Column */}
              <div className={`w-full md:w-32 flex flex-row md:flex-col gap-2 md:gap-0 border-t md:border-t-0 md:border-l ${borderSubtle} pt-4 md:pt-0`}>
                <div className={`flex-1 p-2 md:p-4 border-r md:border-r-0 md:border-b ${borderSubtle} flex flex-col items-center justify-center text-center bg-black/20`}>
                  <Timer className={`w-[18px] h-[18px] ${textVariant} mb-1`} />
                  <span className={`${fontMono} ${textOnSurface}`}>10 min</span>
                </div>
                <div className={`flex-1 p-2 md:p-4 border-r md:border-r-0 md:border-b ${borderSubtle} flex flex-col items-center justify-center text-center bg-black/20`}>
                  <Users className={`w-[18px] h-[18px] ${textVariant} mb-1`} />
                  <span className={`${fontMono} ${textOnSurface}`}>10</span>
                </div>
                <div className={`flex-1 p-2 md:p-4 flex flex-col items-center justify-center text-center bg-black/20`}>
                  <Square className={`w-[18px] h-[18px] ${textVariant} mb-1`} />
                  <span className={`${fontMono} ${textOnSurface}`}>30x20m</span>
                </div>
              </div>
            </div>
          </article>

          {/* Mock Exercise Placeholder */}
          <article className={`${bgSurface} border ${borderSubtle} hover:border-[#ffd165]/50 transition-colors group flex flex-col md:flex-row relative opacity-70 rounded-sm`}>
            <div className={`w-full md:w-1/3 p-4 md:pl-12 ${bgDark} border-b md:border-b-0 md:border-r ${borderSubtle} relative flex items-center justify-center border-dashed border-2 m-4 md:m-0 md:border-y-0 md:border-l-0`}>
              <div className="text-center">
                <ImagePlus className={`w-8 h-8 ${textVariant} mx-auto mb-2`} />
                <p className={`${fontMono} ${textVariant}`}>Add Tactical Board</p>
              </div>
            </div>
            <div className={`w-full md:w-2/3 p-4 flex flex-col justify-center items-center text-center border-dashed border-2 ${borderSubtle} m-4 md:m-0 md:border-none`}>
              <Edit3 className={`w-8 h-8 ${textVariant} mb-2`} />
              <h4 className={`${fontHeadline} ${textOnSurface} mb-1`}>New Drill Slot</h4>
              <p className={`text-sm ${textVariant} mb-4`}>Click to configure objectives and metadata.</p>
              <button className={`${bgSurfaceVariant} border ${borderSubtle} ${fontMono} ${textOnSurface} py-1.5 px-4 hover:border-[#ffd165] hover:text-[#ffd165] transition-colors rounded-sm`}>
                EDIT DETAILS
              </button>
            </div>
          </article>
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
    </div>
  );
}
