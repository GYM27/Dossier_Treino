import { useState, useMemo } from "react";
import { AttendanceRecord, AttendanceStatus } from "./types";

export function useAttendance(players: any[] = []) {
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() =>
    Object.fromEntries(players.map((p) => [p.id, { status: null }])),
  );
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const values = Object.values(records);
    return {
      presente: values.filter((r) => r.status === "presente").length,
      faltou: values.filter((r) => r.status === "faltou").length,
      atrasado: values.filter((r) => r.status === "atrasado").length,
      pendente: values.filter((r) => r.status === null).length,
    };
  }, [records]);

  function setStatus(id: string, status: AttendanceStatus) {
    setSaved(false);
    setRecords((prev) => ({
      ...prev,
      [id]: {
        status,
        minutesLate: status === "atrasado" ? (prev[id]?.minutesLate ?? 5) : undefined,
      },
    }));
  }

  function setMinutes(id: string, minutes: number) {
    setSaved(false);
    setRecords((prev) => ({ ...prev, [id]: { ...prev[id], minutesLate: minutes } }));
  }

  return {
    records,
    saved,
    setSaved,
    stats,
    setStatus,
    setMinutes,
  };
}
