"use client";

import { EventoCalendario } from "@/models/planeamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventoForm } from "./useEventoForm";
import { EventoFormEquipas } from "./EventoFormEquipas";

interface EventoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evento: Omit<EventoCalendario, "id">) => void;
  defaultDate?: Date;
  eventoEdit?: EventoCalendario | null;
  defaultNumeroTreino?: number;
}

export function EventoFormModal({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  eventoEdit,
  defaultNumeroTreino,
}: EventoFormModalProps) {
  const {
    formData,
    setFormData,
    duracao,
    setDuracao,
    localOption,
    setLocalOption,
    availableTeams,
    isCustomCasa,
    setIsCustomCasa,
    isCustomFora,
    setIsCustomFora,
  } = useEventoForm(isOpen, defaultDate, eventoEdit, defaultNumeroTreino);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.dataHoraInicio) {
      alert("Por favor, preencha a data e hora de início.");
      return;
    }
    const start = new Date(formData.dataHoraInicio);
    if (isNaN(start.getTime())) {
      alert("Data de início inválida.");
      return;
    }

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
              <Input
                type="number"
                min={1}
                value={formData.numeroTreino || 1}
                onChange={(e) =>
                  setFormData({ ...formData, numeroTreino: parseInt(e.target.value) || 1 })
                }
                className="mt-1 font-mono"
              />
            </div>
          )}

          {formData.tipoEvento === "JOGO" && (
            <EventoFormEquipas
              formData={formData}
              setFormData={setFormData}
              availableTeams={availableTeams}
              isCustomCasa={isCustomCasa}
              setIsCustomCasa={setIsCustomCasa}
              isCustomFora={isCustomFora}
              setIsCustomFora={setIsCustomFora}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Início
              </label>
              <Input
                type="datetime-local"
                value={formData.dataHoraInicio}
                onChange={(e) =>
                  setFormData({ ...formData, dataHoraInicio: e.target.value })
                }
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Duração (minutos)
              </label>
              <Input
                type="number"
                min={0}
                step={5}
                value={duracao}
                onChange={(e) => setDuracao(parseInt(e.target.value) || 0)}
                className="mt-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título / Descrição
            </label>
            <Input
              type="text"
              value={formData.descricao || ""}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              className="mt-1"
              placeholder="Ex: Treino de Finalização"
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
                <Input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Nome do local (ex: Estádio)"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
          >
            Guardar Evento
          </Button>
        </div>
      </div>
    </div>
  );
}
