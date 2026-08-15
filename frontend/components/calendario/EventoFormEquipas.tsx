import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EventoFormEquipasProps {
  formData: any;
  setFormData: (data: any) => void;
  availableTeams: string[];
  isCustomCasa: boolean;
  setIsCustomCasa: (val: boolean) => void;
  isCustomFora: boolean;
  setIsCustomFora: (val: boolean) => void;
}

export function EventoFormEquipas({
  formData,
  setFormData,
  availableTeams,
  isCustomCasa,
  setIsCustomCasa,
  isCustomFora,
  setIsCustomFora,
}: EventoFormEquipasProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Equipa da Casa
        </label>
        {!isCustomCasa ? (
          <select
            value={
              availableTeams.includes(formData.equipaCasa || "")
                ? formData.equipaCasa
                : formData.equipaCasa
                  ? "outro"
                  : ""
            }
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
            <option value="" disabled>
              Selecione...
            </option>
            {availableTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="outro">+ Nova Equipa...</option>
          </select>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="text"
              value={formData.equipaCasa || ""}
              onChange={(e) =>
                setFormData({ ...formData, equipaCasa: e.target.value })
              }
              placeholder="Nome da equipa"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCustomCasa(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Equipa de Fora
        </label>
        {!isCustomFora ? (
          <select
            value={
              availableTeams.includes(formData.equipaFora || "")
                ? formData.equipaFora
                : formData.equipaFora
                  ? "outro"
                  : ""
            }
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
            <option value="" disabled>
              Selecione...
            </option>
            {availableTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="outro">+ Nova Equipa...</option>
          </select>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="text"
              value={formData.equipaFora || ""}
              onChange={(e) =>
                setFormData({ ...formData, equipaFora: e.target.value })
              }
              placeholder="Nome da equipa"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCustomFora(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
