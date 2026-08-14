export type AttendanceStatus = "presente" | "faltou" | "atrasado" | null;

export interface AttendanceRecord {
  status: AttendanceStatus;
  minutesLate?: number;
}