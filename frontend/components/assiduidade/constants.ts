import { CircleCheck, CircleX, Clock } from "lucide-react";
import { AttendanceStatus } from "./types";

export const currentEvent = { 
  type: "Treino", 
  date: "15 Outubro", 
  time: "19:00", 
  location: "Campo Nº 1" 
};

export const statusOptions: {
  key: Exclude<AttendanceStatus, null>
  label: string
  icon: typeof CircleCheck
  active: string
}[] = [
  {
    key: "presente",
    label: "Presente",
    icon: CircleCheck,
    active: "bg-success/20 text-success ring-1 ring-success/40",
  },
  {
    key: "faltou",
    label: "Faltou",
    icon: CircleX,
    active: "bg-danger/20 text-danger ring-1 ring-danger/40",
  },
  {
    key: "atrasado",
    label: "Atrasado",
    icon: Clock,
    active: "bg-warning/20 text-warning ring-1 ring-warning/40",
  },
];
