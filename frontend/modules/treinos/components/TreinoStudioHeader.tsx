import React from "react";
import { SessaoTreino } from "@/models/sessao-treino";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  Library,
  Sparkles,
  Eye,
  Edit2,
  Save,
  CheckCircle2,
} from "lucide-react";

interface TreinoStudioHeaderProps {
  treino: SessaoTreino;
  data: string;
  hora: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSaving: boolean;
  saveSuccess: boolean;
  onSaveMetadata: () => void;
  onOpenPrintModal: () => void;
  onOpenCatalogModal: () => void;
}

export function TreinoStudioHeader({
  treino,
  data,
  hora,
  isEditing,
  setIsEditing,
  isSaving,
  saveSuccess,
  onSaveMetadata,
  onOpenPrintModal,
  onOpenCatalogModal,
}: TreinoStudioHeaderProps) {
  return (
    <header className="p-4 border-b border-slate-800 bg-[#0d131f] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30" title="Mesociclo da Época">
            MESO #{treino.mesociclo || 1}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" title="Microciclo (Semana)">
            MICRO #{treino.microciclo || 1}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Unidade de Treino (Sessão)">
            UT #{treino.unidadeTreino || 1}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide">
              {treino.objetivo ? treino.objetivo.split("\n")[0] : `Treino - UT #${treino.unidadeTreino || 1}`}
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({treino.duracaoTotalMinutos || 0} min)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {data || "Sem data"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {hora}
            </span>
            {treino.local && (
              <span className="flex items-center gap-1 text-cyan-400/90 font-medium">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {treino.local}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="dark"
          size="sm"
          onClick={onOpenPrintModal}
          title="Exportar plano de treino para PDF"
        >
          <Printer className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>PDF</span>
        </Button>

        <Button
          variant="cyan"
          size="sm"
          onClick={onOpenCatalogModal}
          title="Adicionar exercício da Biblioteca"
        >
          <Library className="w-3.5 h-3.5 mr-1" />
          <span>Biblioteca</span>
        </Button>

        <Button
          variant="amber"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>Ver</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              <span>Editar</span>
            </>
          )}
        </Button>

        {isEditing && (
          <Button
            variant="emerald"
            size="sm"
            onClick={onSaveMetadata}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1" />
            )}
            <span>{saveSuccess ? "Gravado!" : "Guardar"}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
