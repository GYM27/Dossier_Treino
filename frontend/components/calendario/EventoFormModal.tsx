"use client";

import { useState, useEffect } from "react";
import { EventoCalendario } from "@/models/planeamento";
import { X } from "lucide-react";

interface EventoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evento: Omit<EventoCalendario, "id">) => void;
  defaultDate?: Date;
  eventoEdit?: EventoCalendario | null;
}

export function EventoFormModal({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  eventoEdit,
}: EventoFormModalProps) {
  const [formData, setFormData] = useState<
    Omit<EventoCalendario, "id" | "dataHoraFim">
  >({
    tipoEvento: "TREINO",
    dataHoraInicio: "",
    descricao: "",
    local: "",
    numeroTreino: 1,
    equipaCasa: "União 1919",
    equipaFora: "",
  });
  const [duracao, setDuracao] = useState(90);
  const [localOption, setLocalOption] = useState<"Arregaça" | "Cernache" | "Outro">("Arregaça");

  // Estado para opções de equipas no dropdown
  const [availableTeams, setAvailableTeams] = useState<string[]>(["União 1919", "Académica OAF", "Naval 1893", "Marialvas", "Tourizense"]);
  const [isCustomCasa, setIsCustomCasa] = useState(false);
  const [isCustomFora, setIsCustomFora] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (eventoEdit) {
        const isPadrao = eventoEdit.local === "Arregaça" || eventoEdit.local === "Cernache";
        setLocalOption(isPadrao ? (eventoEdit.local as any) : (eventoEdit.local ? "Outro" : "Arregaça"));
        setFormData({
          tipoEvento: eventoEdit.tipoEvento,
          dataHoraInicio: eventoEdit.dataHoraInicio,
          descricao: eventoEdit.descricao || "",
          local: eventoEdit.local || "Arregaça",
          numeroTreino: eventoEdit.numeroTreino || 1,
          equipaCasa: eventoEdit.equipaCasa || "União 1919",
          equipaFora: eventoEdit.equipaFora || "",
        });
        const ms =
          new Date(eventoEdit.dataHoraFim).getTime() -
          new Date(eventoEdit.dataHoraInicio).getTime();
        setDuracao(Math.max(0, Math.floor(ms / 60000)));
      } else {
        const start = defaultDate ? new Date(defaultDate) : new Date();
        start.setHours(10, 0, 0, 0);

        // Format to YYYY-MM-DDTHH:mm
        const formatDateTime = (d: Date) => {
          const tzoffset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
        };

        setLocalOption("Arregaça");
        setFormData({
          tipoEvento: "TREINO",
          dataHoraInicio: formatDateTime(start),
          descricao: "",
          local: "Arregaça",
          numeroTreino: 1,
          equipaCasa: "União 1919",
          equipaFora: "",
        });
        setDuracao(90);
        setIsCustomCasa(false);
        setIsCustomFora(false);
      }
    }
  }, [isOpen, defaultDate, eventoEdit]);

  if (!isOpen) return null;

  const handleSave = () => {
    const start = new Date(formData.dataHoraInicio);
    const end = new Date(start.getTime() + duracao * 60000);

    const formatDateTime = (d: Date) => {
      const tzoffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
    };

    onSave({
      ...formData,
      dataHoraFim: formatDateTime(end),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-xl p-6 shadow-xl animate-fade-up border border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          {eventoEdit ? "Editar Evento" : "Novo Evento"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo de Evento
            </label>
            <select
              value={formData.tipoEvento}
              onChange={(e) =>
                setFormData({ ...formData, tipoEvento: e.target.value as any })
              }
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="TREINO">Treino</option>
              <option value="JOGO">Jogo</option>
              <option value="FOLGA">Folga</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          {formData.tipoEvento === "TREINO" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nº do Treino (Microciclo)
              </label>
              <input
                type="number"
                min="1"
                value={formData.numeroTreino || 1}
                onChange={(e) =>
                  setFormData({ ...formData, numeroTreino: parseInt(e.target.value) || 1 })
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {formData.tipoEvento === "JOGO" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Equipa da Casa
                </label>
                {!isCustomCasa ? (
                  <select
                    value={availableTeams.includes(formData.equipaCasa || "") ? formData.equipaCasa : (formData.equipaCasa ? "outro" : "")}
                    onChange={(e) => {
                      if (e.target.value === "outro") {
                        setIsCustomCasa(true);
                        setFormData({ ...formData, equipaCasa: "" });
                      } else {
                        setFormData({ ...formData, equipaCasa: e.target.value });
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="" disabled>Selecione...</option>
                    {availableTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="outro">+ Nova Equipa...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={formData.equipaCasa || ""}
                      onChange={(e) => setFormData({ ...formData, equipaCasa: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      placeholder="Nome da equipa"
                      autoFocus
                    />
                    <button type="button" onClick={() => setIsCustomCasa(false)} className="p-2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Equipa de Fora
                </label>
                {!isCustomFora ? (
                  <select
                    value={availableTeams.includes(formData.equipaFora || "") ? formData.equipaFora : (formData.equipaFora ? "outro" : "")}
                    onChange={(e) => {
                      if (e.target.value === "outro") {
                        setIsCustomFora(true);
                        setFormData({ ...formData, equipaFora: "" });
                      } else {
                        setFormData({ ...formData, equipaFora: e.target.value });
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="" disabled>Selecione...</option>
                    {availableTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="outro">+ Nova Equipa...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={formData.equipaFora || ""}
                      onChange={(e) => setFormData({ ...formData, equipaFora: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      placeholder="Nome da equipa"
                      autoFocus
                    />
                    <button type="button" onClick={() => setIsCustomFora(false)} className="p-2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Início
              </label>
              <input
                type="datetime-local"
                value={formData.dataHoraInicio}
                onChange={(e) =>
                  setFormData({ ...formData, dataHoraInicio: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Duração (minutos)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={duracao}
                onChange={(e) => setDuracao(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título / Descrição
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Ex: Treino Tático MD-2"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Local
            </label>
            <div className="flex gap-2 mt-1">
              <select
                value={localOption}
                onChange={(e) => {
                  const val = e.target.value as "Arregaça" | "Cernache" | "Outro";
                  setLocalOption(val);
                  if (val !== "Outro") {
                    setFormData({ ...formData, local: val });
                  } else {
                    setFormData({ ...formData, local: "" });
                  }
                }}
                className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none ${localOption === "Outro" ? "max-w-[130px]" : ""}`}
              >
                <option value="Arregaça">Arregaça</option>
                <option value="Cernache">Cernache</option>
                <option value="Outro">Outro...</option>
              </select>
              
              {localOption === "Outro" && (
                <input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Nome do local (ex: Estádio)"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Guardar Evento
          </button>
        </div>
      </div>
    </div>
  );
}
