import { useState, useEffect } from "react";
import { EventoCalendario } from "@/models/planeamento";

export function useEventoForm(
  isOpen: boolean,
  defaultDate?: Date,
  eventoEdit?: EventoCalendario | null,
  defaultNumeroTreino?: number
) {
  const [formData, setFormData] = useState<
    Omit<EventoCalendario, "id" | "dataHoraFim">
  >({
    tipoEvento: "TREINO",
    dataHoraInicio: "",
    descricao: "",
    local: "Arregaça",
    numeroTreino: 1,
    equipaCasa: "União 1919",
    equipaFora: "",
  });
  const [duracao, setDuracao] = useState(90);
  const [localOption, setLocalOption] = useState<"Arregaça" | "Cernache" | "Outro">("Arregaça");

  const [availableTeams] = useState<string[]>([
    "União 1919",
    "Académica OAF",
    "Naval 1893",
    "Marialvas",
    "Tourizense",
  ]);
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
          numeroTreino: defaultNumeroTreino || 1,
          equipaCasa: "União 1919",
          equipaFora: "",
        });
        setDuracao(90);
        setIsCustomCasa(false);
        setIsCustomFora(false);
      }
    }
  }, [isOpen, defaultDate, eventoEdit, defaultNumeroTreino]);

  return {
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
  };
}
