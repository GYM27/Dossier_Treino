import { Exercicio } from "./exercicio";

export interface PastaItem {
  id: string;
  nome: string;
  parentId?: string | null;
}

export interface PastaDropdownOption {
  id: string;
  nome: string;
  label: string;
  level: number;
}

export const STORAGE_KEY_PASTAS = "prancheta_pastas_hierarquia_v2";

export const DEFAULT_MAIN_PASTAS: PastaItem[] = [
  { id: "org-ofensiva", nome: "Organização Ofensiva", parentId: null },
  { id: "org-defensiva", nome: "Organização Defensiva", parentId: null },
  { id: "trans-ofensiva", nome: "Transição Ofensiva", parentId: null },
  { id: "trans-defensiva", nome: "Transição Defensiva", parentId: null },
  { id: "bolas-paradas", nome: "Bolas Paradas", parentId: null },
];

export const matchesPasta = (ex: Exercicio, pastaItem: PastaItem): boolean => {
  const exPasta = (ex.dadosTaticos?.pasta || ex.dadosTaticos?.pastaId || "").trim().toLowerCase();
  if (!exPasta) {
    if (pastaItem.id === "org-ofensiva" && (ex.categoria === "TATICO" || ex.categoria === "TECNICO")) return true;
    return false;
  }
  return (
    exPasta === pastaItem.id.toLowerCase() ||
    exPasta === pastaItem.nome.toLowerCase() ||
    exPasta.includes(pastaItem.nome.toLowerCase())
  );
};

export const getExercisesForFolderAndDescendants = (
  folderId: string,
  allPastas: PastaItem[],
  exerciciosList: Exercicio[]
): Exercicio[] => {
  const currentFolder = allPastas.find((p) => p.id === folderId);
  if (!currentFolder) return [];

  const childFolders = allPastas.filter((p) => p.parentId === folderId);
  const childExercises = childFolders.flatMap((child) =>
    getExercisesForFolderAndDescendants(child.id, allPastas, exerciciosList)
  );

  const directExercises = exerciciosList.filter((ex) => matchesPasta(ex, currentFolder));

  const map = new Map<string, Exercicio>();
  [...directExercises, ...childExercises].forEach((ex) => map.set(ex.id, ex));
  return Array.from(map.values());
};

export const buildHierarchicalOptions = (
  pastasList: PastaItem[],
  parentId: string | null = null,
  level = 0
): PastaDropdownOption[] => {
  const items = pastasList.filter((p) => (p.parentId || null) === parentId);
  const result: PastaDropdownOption[] = [];

  for (const item of items) {
    const indent = level > 0 ? "\u00A0\u00A0\u00A0\u00A0".repeat(level) + "└─ " : "📁 ";
    result.push({
      id: item.id,
      nome: item.nome,
      label: `${indent}${item.nome}`,
      level,
    });
    const children = buildHierarchicalOptions(pastasList, item.id, level + 1);
    result.push(...children);
  }
  return result;
};

export const loadStoredPastas = (): PastaItem[] => {
  if (typeof window === "undefined") return DEFAULT_MAIN_PASTAS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PASTAS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingNames = new Set(parsed.map((p: any) => (p.nome || "").toLowerCase()));
        const missingDefaults = DEFAULT_MAIN_PASTAS.filter(
          (def) => !existingNames.has(def.nome.toLowerCase())
        );
        return [...parsed, ...missingDefaults];
      }
    }
  } catch (_) {}
  return DEFAULT_MAIN_PASTAS;
};

export const saveStoredPastas = (pastas: PastaItem[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PASTAS, JSON.stringify(pastas));
  } catch (_) {}
};
