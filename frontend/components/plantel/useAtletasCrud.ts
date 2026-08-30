/**
 * useAtletasCrud.ts — Hook Custom para operações CRUD de Atletas.
 *
 * Responsabilidade ÚNICA: Gerir o estado dos atletas e comunicar com a API.
 * Encapsula: fetch, create, update, e toda a lógica de estado do formulário.
 *
 * ── Porquê um Hook Custom? ──────────────────────────────────────────────────
 * Hooks custom são a forma do React de reutilizar lógica com estado.
 * Imagina-os como "mini-cérebros" que podem ser ligados a qualquer componente.
 * Assim, se amanhã quiséssemos mostrar atletas na Dashboard, bastava escrever:
 *   const { atletas, loading } = useAtletasCrud(equipeId)
 * ...sem duplicar uma única linha de código!
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { atletaService } from "@/services";
import { ATLETA_VAZIO } from "./constants";
import type { AtletaFormData } from "./constants";

// ── Interface para o jogador já formatado para o Frontend ───────────────────
export interface JogadorFormatado {
  id: string;
  name: string;
  country: string;
  flag: string;
  age: number;
  number: number;
  positionGroup: string;
  position: string;
  foot: string;
  status: string;
  fotoUrl?: string;
  // Campos originais do Backend (necessários para pré-preencher o formulário de edição)
  dataNascimento: string;
  posicaoPrincipal: string;
  pePreferido: string;
  alturaCm: number;
  pesoKg: number;
}

// ── Tipo para o estado interno do hook, incluindo dados "memorizados" ────────
type HookState = {
  formData: AtletaFormData;
  // Guardar dados "memorizados" do último atleta editado/criado (para manter dados entre renders/submissões)
  memorizedData: AtletaFormData | null;
};

// ── Função auxiliar: Converte o DTO do Backend para o formato do Frontend ───
function formatarAtletaDTO(dto: any): JogadorFormatado {
  return {
    id: dto.id,
    name: dto.nome,
    country: dto.nacionalidade || "Portugal",
    flag: "🇵🇹",
    age: dto.idade,
    number: dto.numeroCamisola || 0,
    positionGroup: dto.posicaoPrincipal.includes("GUARDA_REDES")
      ? "Guarda-Redes"
      : dto.posicaoPrincipal.includes("DEFESA") ||
          dto.posicaoPrincipal.includes("LATERAL")
        ? "Defesas"
        : dto.posicaoPrincipal.includes("MEDIO")
          ? "Médios"
          : "Avançados",
    position: dto.posicaoPrincipal.replace(/_/g, " "),
    foot: dto.pePreferido,
    status: "DISPONÍVEL",
    fotoUrl: dto.fotoUrl,
    dataNascimento: dto.dataNascimento,
    posicaoPrincipal: dto.posicaoPrincipal,
    pePreferido: dto.pePreferido,
    alturaCm: dto.alturaCm,
    pesoKg: dto.pesoKg,
  };
}

// ── O Hook Custom ───────────────────────────────────────────────────────────
export function useAtletasCrud(equipaId: string) {
  // Estado da lista de jogadores
  const [jogadores, setJogadores] = useState<JogadorFormatado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Estado do modal de formulário (com memorização de dados) ────────────────
  // O 'memorizedData' mantém os valores que o utilizador já preencheu,
  // para que não tenha que re-digitá-los sempre que abre o modal.
  const [memorizedData, setMemorizedData] = useState<AtletaFormData | null>(
    null,
  );

  const [showModal, setShowModal] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado real do formulário com setter (setFormData)
  const [formData, setFormData] = useState<AtletaFormData>({ ...ATLETA_VAZIO });

  // ── Buscar os atletas ao Backend ────────────────────────────────────────
  const fetchJogadores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await atletaService.getAtletasByEquipa(equipaId);
      setJogadores(data.map(formatarAtletaDTO));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [equipaId]);

  // Recarregar sempre que a equipa muda
  useEffect(() => {
    if (equipaId) {
      fetchJogadores();
    }
  }, [equipaId, fetchJogadores]);

  // ── Abrir modal em modo CRIAR ───────────────────────────────────────────
  const abrirModalCriar = useCallback(() => {
    // Quando cria novo, limpar a memória para começar do zero
    setMemorizedData(null);
    setEditingPlayerId(null);
    setShowModal(true);
  }, []);

  // ── Abrir modal em modo EDITAR ──────────────────────────────────────────
  const abrirModalEditar = useCallback((jogador: JogadorFormatado) => {
    const dadosPreenchidos = {
      dataNascimento: jogador.dataNascimento || "",
      nome: jogador.name,
      nacionalidade: jogador.country || "Portugal",
      posicaoPrincipal: jogador.posicaoPrincipal || "GUARDA_REDES",
      pePreferido: jogador.pePreferido || "DESTRO",
      numeroCamisola: jogador.number,
      alturaCm: jogador.alturaCm || 180,
      pesoKg: jogador.pesoKg || 75,
      fotoUrl: jogador.fotoUrl || "",
    };
    
    // Memorizar e atualizar o formulário IMEDIATAMENTE para o ecrã refletir os dados
    setMemorizedData(dadosPreenchidos);
    setFormData(dadosPreenchidos);
    setEditingPlayerId(jogador.id);
    setShowModal(true);
  }, []);

  // ── Fechar modal ────────────────────────────────────────────────────────
  const fecharModal = useCallback(() => {
    setShowModal(false);
    // NÃO limpar memorizedData aqui - queremos que os dados permaneçam
    // para que o próximo aperto em "Editar" mantenha os valores já preenchidos
  }, []);

  // ── Submeter formulário (Criar ou Atualizar) ────────────────────────────
  const submeterFormulario = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const payload = {
          nome: formData.nome,
          dataNascimento: formData.dataNascimento,
          nacionalidade: formData.nacionalidade,
          posicaoPrincipal: formData.posicaoPrincipal,
          pePreferido: formData.pePreferido,
          numeroCamisola: formData.numeroCamisola,
          alturaCm: formData.alturaCm,
          pesoKg: formData.pesoKg,
          fotoUrl: formData.fotoUrl,
        };

        if (editingPlayerId) {
          await atletaService.atualizarAtleta(editingPlayerId, payload);
        } else {
          await atletaService.criarAtleta(equipaId, payload);
        }

        // ✅ Após submit bem-sucedido: MEMORIZAR os dados que foram enviados
        // Isso permite que ao abrir o modal novamente, os campos já venham preenchidos
        setMemorizedData({ ...formData });

        setShowModal(false);
        fetchJogadores(); // Recarrega a lista instantaneamente
      } catch (err: any) {
        toast.error("Erro ao guardar atleta: " + (err.message || "Erro desconhecido"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [equipaId, formData, editingPlayerId, fetchJogadores],
  );

  // ── Devolver tudo empacotado ─────────────────────────────────────────────
  return {
    // Dados da lista
    jogadores,
    loading,
    error,
    // Estado do modal
    showModal,
    editingPlayerId,
    isSubmitting,
    formData,
    setFormData, // Necessário para o AtletaFormModal fazer o onChange
    // Ações
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    submeterFormulario,
  };
}
