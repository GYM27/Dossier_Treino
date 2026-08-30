"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PastaItem, DEFAULT_MAIN_PASTAS } from "@/models/pasta";

export interface UsePranchetaPastasReturn {
  pastas: PastaItem[];
  setPastas: React.Dispatch<React.SetStateAction<PastaItem[]>>;
  pasta: string;
  setPasta: (nomePasta: string) => void;
  expandedPastas: Record<string, boolean>;
  setExpandedPastas: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  drawerMode: "PASTAS" | "TODOS";
  setDrawerMode: (mode: "PASTAS" | "TODOS") => void;
  isCreatingPasta: boolean;
  setIsCreatingPasta: (val: boolean) => void;
  creatingParentId: string | null;
  setCreatingParentId: (id: string | null) => void;
  novaPastaNome: string;
  setNovaPastaNome: (nome: string) => void;
  handleCriarNovaPasta: (nomeOverride?: string, parentOverride?: string | null) => void;
  handleIniciarCriacaoSubpasta: (e: React.MouseEvent, parentId: string) => void;
  handleEliminarPasta: (pastaId: string, nomePasta: string) => void;
  togglePastaExpanded: (pastaId: string) => void;
}

const STORAGE_KEY = "prancheta_pastas_hierarquia_v2";

export function usePranchetaPastas(): UsePranchetaPastasReturn {
  const [pastas, setPastas] = useState<PastaItem[]>(DEFAULT_MAIN_PASTAS);
  const [pasta, setPasta] = useState<string>("Organização Ofensiva");
  const [expandedPastas, setExpandedPastas] = useState<Record<string, boolean>>({
    "org-ofensiva": true,
    "org-defensiva": true,
    "trans-ofensiva": true,
    "trans-defensiva": true,
    "bolas-paradas": true,
  });
  const [drawerMode, setDrawerMode] = useState<"PASTAS" | "TODOS">("PASTAS");
  const [isCreatingPasta, setIsCreatingPasta] = useState(false);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [novaPastaNome, setNovaPastaNome] = useState("");

  // Carregar do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingNames = new Set(parsed.map((p: any) => (p.nome || "").toLowerCase()));
          const missingDefaults = DEFAULT_MAIN_PASTAS.filter(
            (def) => !existingNames.has(def.nome.toLowerCase())
          );
          setPastas([...parsed, ...missingDefaults]);
          return;
        }
      }
    } catch (_) {}
    setPastas(DEFAULT_MAIN_PASTAS);
  }, []);

  const handleCriarNovaPasta = useCallback(
    (nomeOverride?: string, parentOverride?: string | null) => {
      const limpo = (nomeOverride !== undefined ? nomeOverride : novaPastaNome).trim();
      const parentId = parentOverride !== undefined ? parentOverride : creatingParentId;

      if (!limpo) return;

      if (
        pastas.some(
          (p) =>
            p.nome.toLowerCase() === limpo.toLowerCase() &&
            (p.parentId || null) === (parentId || null)
        )
      ) {
        toast.warning("Já existe uma pasta com esse nome neste nível.");
        return;
      }

      const newId = `pasta-${Date.now()}`;
      const novaPasta: PastaItem = {
        id: newId,
        nome: limpo,
        parentId: parentId || null,
      };

      const atualizadas = [...pastas, novaPasta];
      setPastas(atualizadas);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizadas));
      } catch (_) {}

      setPasta(limpo);
      setNovaPastaNome("");
      setIsCreatingPasta(false);
      setCreatingParentId(null);
      setExpandedPastas((prev) => ({
        ...prev,
        [newId]: true,
        ...(parentId ? { [parentId]: true } : {}),
      }));
    },
    [novaPastaNome, pastas, creatingParentId]
  );

  const handleIniciarCriacaoSubpasta = useCallback(
    (e: React.MouseEvent, parentId: string) => {
      e.stopPropagation();
      setCreatingParentId(parentId);
      setNovaPastaNome("");
      setIsCreatingPasta(true);
      setExpandedPastas((prev) => ({ ...prev, [parentId]: true }));
    },
    []
  );

  const handleEliminarPasta = useCallback((pastaId: string, nomePasta: string) => {
    setPastas((prev) => {
      const atualizadas = prev.filter((p) => p.id !== pastaId && p.parentId !== pastaId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizadas));
      } catch (_) {}
      return atualizadas;
    });
    toast.success(`Pasta "${nomePasta}" eliminada com sucesso!`);
  }, []);

  const togglePastaExpanded = useCallback((pastaId: string) => {
    setExpandedPastas((prev) => ({
      ...prev,
      [pastaId]: !prev[pastaId],
    }));
  }, []);

  return {
    pastas,
    setPastas,
    pasta,
    setPasta,
    expandedPastas,
    setExpandedPastas,
    drawerMode,
    setDrawerMode,
    isCreatingPasta,
    setIsCreatingPasta,
    creatingParentId,
    setCreatingParentId,
    novaPastaNome,
    setNovaPastaNome,
    handleCriarNovaPasta,
    handleIniciarCriacaoSubpasta,
    handleEliminarPasta,
    togglePastaExpanded,
  };
}
