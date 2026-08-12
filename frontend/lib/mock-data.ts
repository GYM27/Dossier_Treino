export type Foot = "Direito" | "Esquerdo" | "Ambos"

export type PositionGroup = "Guarda-Redes" | "Defesa" | "Médio" | "Avançado"

export type Player = {
  id: string
  name: string
  age: number
  country: string
  flag: string
  position: string
  positionGroup: PositionGroup
  foot: Foot
  number: number
}

export type Team = {
  id: string
  name: string
}

export const teams: Team[] = [
  { id: "seniores", name: "Seniores — Época 25/26" },
  { id: "sub23", name: "Sub-23 — Época 25/26" },
  { id: "sub19", name: "Juniores A (Sub-19)" },
]

export const players: Player[] = [
  {
    id: "1",
    name: "Cristiano Ronaldo",
    age: 39,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Avançado Centro",
    positionGroup: "Avançado",
    foot: "Direito",
    number: 7,
  },
  {
    id: "2",
    name: "Rúben Dias",
    age: 28,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Defesa Central",
    positionGroup: "Defesa",
    foot: "Direito",
    number: 4,
  },
  {
    id: "3",
    name: "Bruno Fernandes",
    age: 31,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Médio Ofensivo",
    positionGroup: "Médio",
    foot: "Direito",
    number: 8,
  },
  {
    id: "4",
    name: "Diogo Costa",
    age: 26,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Guarda-Redes",
    positionGroup: "Guarda-Redes",
    foot: "Direito",
    number: 1,
  },
  {
    id: "5",
    name: "João Cancelo",
    age: 31,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Lateral Direito",
    positionGroup: "Defesa",
    foot: "Direito",
    number: 20,
  },
  {
    id: "6",
    name: "Rafael Leão",
    age: 26,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Extremo Esquerdo",
    positionGroup: "Avançado",
    foot: "Direito",
    number: 17,
  },
  {
    id: "7",
    name: "Vitinha",
    age: 25,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Médio Centro",
    positionGroup: "Médio",
    foot: "Direito",
    number: 16,
  },
  {
    id: "8",
    name: "Nuno Mendes",
    age: 23,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Lateral Esquerdo",
    positionGroup: "Defesa",
    foot: "Esquerdo",
    number: 19,
  },
  {
    id: "9",
    name: "Bernardo Silva",
    age: 31,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Médio Ala",
    positionGroup: "Médio",
    foot: "Esquerdo",
    number: 10,
  },
  {
    id: "10",
    name: "Gonçalo Ramos",
    age: 24,
    country: "Portugal",
    flag: "🇵🇹",
    position: "Avançado Centro",
    positionGroup: "Avançado",
    foot: "Direito",
    number: 9,
  },
  {
    id: "11",
    name: "Pepe Reina",
    age: 30,
    country: "Espanha",
    flag: "🇪🇸",
    position: "Defesa Central",
    positionGroup: "Defesa",
    foot: "Ambos",
    number: 3,
  },
  {
    id: "12",
    name: "Otávio Monteiro",
    age: 30,
    country: "Brasil",
    flag: "🇧🇷",
    position: "Extremo Direito",
    positionGroup: "Avançado",
    foot: "Esquerdo",
    number: 25,
  },
]

export const positionColors: Record<PositionGroup, string> = {
  "Guarda-Redes": "bg-warning/15 text-warning border-warning/30",
  Defesa: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Médio: "bg-primary/15 text-primary border-primary/30",
  Avançado: "bg-danger/15 text-danger border-danger/30",
}

export type AttendanceStatus = "presente" | "faltou" | "atrasado" | null

export type AttendanceRecord = {
  status: AttendanceStatus
  minutesLate?: number
}

export const currentEvent = {
  type: "Treino",
  date: "15 Outubro 2025",
  time: "19:00",
  location: "Campo Nº 1 — Centro de Estágios",
}
