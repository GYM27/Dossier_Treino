"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Exercicio } from "@/models/exercicio";
import { exercicioService } from "@/services/exercicioService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Search,
  Save,
  Trash2,
  Copy,
  Layers,
  Users,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

// Importação dinâmica da Prancheta Tática para evitar erros de SSR com o Canvas HTML5
const TacticalBoard = dynamic(() => import("@/components/prancheta/TacticalBoard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#070b14] text-slate-500 text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span>A carregar Prancheta Tática...</span>
      </div>
    </div>
  ),
});

const CATEGORIAS: Array<{ value: string; label: string; color: string }> = [
  { value: "TODOS", label: "Todos", color: "bg-slate-700 text-slate-200" },
  { value: "AQUECIMENTO", label: "Aquecimento", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "TECNICO", label: "Técnico", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "TATICO", label: "Tático", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { value: "FISICO", label: "Físico", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { value: "GUARDA_REDES", label: "Guarda-Redes", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "LUDICO", label: "Lúdico", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

export function PranchetaStudio() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("TODOS");

  // Estados do Formulário de Edição
  const [nome, setNome] = useState("Novo Exercício Tático");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<Exercicio["categoria"]>("TATICO");
  const [nivelDificuldade, setNivelDificuldade] = useState(3);
  const [espaco, setEspaco] = useState("Meio-Campo (50x40m)");
  const [jogadoresEnvolvidos, setJogadoresEnvolvidos] = useState(14);
  const [objetivosEspecificos, setObjetivosEspecificos] = useState("");
  const [tacticData, setTacticData] = useState<any>(null);

  // Estados de Operação / Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carregar lista de exercícios do servidor
  const carregarExercicios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await exercicioService.getExercicios();
      setExercicios(data || []);

      // Se não houver nenhum selecionado e a lista tiver elementos, seleciona o primeiro
      if (data && data.length > 0 && !selectedExercicio) {
        carregarDetalhesExercicio(data[0]);
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo de exercícios:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExercicio]);

  useEffect(() => {
    carregarExercicios();
  }, []);

  // Preencher os campos do estúdio com os dados do exercício selecionado
  const carregarDetalhesExercicio = (ex: Exercicio) => {
    setSelectedExercicio(ex);
    setNome(ex.nome || "Sem Nome");
    setDescricao(ex.descricao || "");
    setCategoria(ex.categoria || "TATICO");
    setNivelDificuldade(ex.nivelDificuldade || 3);
    setEspaco(ex.espaco || "Meio-Campo");
    setJogadoresEnvolvidos(ex.jogadoresEnvolvidos || 14);
    setObjetivosEspecificos(ex.objetivosEspecificos || "");
    setTacticData(ex.dadosTaticos || null);
    setErrorMsg(null);
  };

  // Iniciar criação de um novo exercício a partir do zero
  const handleNovoExercicio = () => {
    setSelectedExercicio(null);
    setNome("Novo Exercício Tático");
    setDescricao("");
    setCategoria("TATICO");
    setNivelDificuldade(3);
    setEspaco("Meio-Campo (50x40m)");
    setJogadoresEnvolvidos(14);
    setObjetivosEspecificos("");
    setTacticData(null);
    setErrorMsg(null);
  };

  // Callback chamado quando a prancheta desenha ou altera algo
  const handleSaveTacticBoard = (data: any) => {
    setTacticData(data);
  };

  // Gravar ou Atualizar o Exercício na Base de Dados
  const handleGuardarExercicio = async () => {
    if (!nome.trim()) {
      setErrorMsg("O nome do exercício é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const payload: Partial<Exercicio> = {
        nome: nome.trim(),
        descricao: descricao.trim() || nome.trim(),
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        objetivosEspecificos: objetivosEspecificos,
        dadosTaticos: tacticData,
      };

      if (selectedExercicio?.id) {
        // Atualizar exercício existente (PUT)
        const atualizado = await exercicioService.atualizarExercicio(selectedExercicio.id, payload);
        setSelectedExercicio(atualizado);
        setExercicios((prev) => prev.map((e) => (e.id === atualizado.id ? atualizado : e)));
      } else {
        // Criar novo exercício (POST)
        const criado = await exercicioService.criarExercicio(payload);
        setSelectedExercicio(criado);
        setExercicios((prev) => [criado, ...prev]);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error("Erro ao gravar exercício:", err);
      setErrorMsg(err.message || "Erro ao gravar o exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicar o exercício atual como uma nova cópia
  const handleDuplicarExercicio = async () => {
    if (!selectedExercicio) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Exercicio> = {
        nome: `${nome} (Cópia)`,
        descricao: descricao,
        categoria: categoria,
        nivelDificuldade: nivelDificuldade,
        espaco: espaco,
        jogadoresEnvolvidos: jogadoresEnvolvidos,
        objetivosEspecificos: objetivosEspecificos,
        dadosTaticos: tacticData,
      };
      const copia = await exercicioService.criarExercicio(payload);
      setSelectedExercicio(copia);
      setExercicios((prev) => [copia, ...prev]);
      setNome(copia.nome);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error("Erro ao duplicar exercício:", err);
      setErrorMsg("Erro ao duplicar o exercício.");
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar exercício
  const handleEliminarExercicio = async () => {
    if (!selectedExercicio?.id) return;
    if (!confirm(`Tem a certeza que deseja eliminar o exercício "${selectedExercicio.nome}"?`)) return;

    try {
      await exercicioService.eliminarExercicio(selectedExercicio.id);
      const restantes = exercicios.filter((e) => e.id !== selectedExercicio.id);
      setExercicios(restantes);
      if (restantes.length > 0) {
        carregarDetalhesExercicio(restantes[0]);
      } else {
        handleNovoExercicio();
      }
    } catch (err) {
      console.error("Erro ao eliminar exercício:", err);
      alert("Erro ao eliminar o exercício. Pode estar associado a um treino existente.");
    }
  };

  // Filtros de Pesquisa e Categoria
  const exerciciosFiltrados = exercicios.filter((ex) => {
    const matchesSearch =
      (ex.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.objetivosEspecificos || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoriaFilter === "TODOS" || ex.categoria === categoriaFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-[#070b14] border border-slate-800/80 rounded-2xl shadow-2xl select-none">
      {/* 📁 PAINEL ESQUERDO: Catálogo de Exercícios */}
      <aside className="w-80 md:w-88 flex flex-col bg-[#111827] border-r border-slate-800 h-full shrink-0">
        {/* Topo do Catálogo com Ação Novo */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#0d131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  Exercícios
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  {exercicios.length} {exercicios.length === 1 ? "exercício criado" : "exercícios criados"}
                </p>
              </div>
            </div>

            <button
              onClick={handleNovoExercicio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
              title="Criar novo exercício na prancheta"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo</span>
            </button>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar exercícios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b]/70 border border-slate-700/60 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Filtros de Categoria */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS.map((cat) => {
              const isSelected = categoriaFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaFilter(cat.value)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold tracking-wider whitespace-nowrap transition-all",
                    isSelected
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "bg-[#1e293b]/80 text-slate-400 hover:bg-[#334155] hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>A carregar biblioteca...</span>
            </div>
          ) : exerciciosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400 text-xs gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">Nenhum exercício encontrado</p>
                <p className="text-[11px] text-slate-500">
                  Clique em "+ Novo" para desenhar o primeiro exercício na prancheta.
                </p>
              </div>
            </div>
          ) : (
            exerciciosFiltrados.map((ex) => {
              const isSelected = selectedExercicio?.id === ex.id;
              const catBadge = CATEGORIAS.find((c) => c.value === ex.categoria) || CATEGORIAS[3];

              return (
                <div
                  key={ex.id}
                  onClick={() => carregarDetalhesExercicio(ex)}
                  className={cn(
                    "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/50"
                      : "bg-[#162032]/60 border-slate-800/80 hover:bg-[#1e293b]/60 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border",
                        catBadge.color
                      )}
                    >
                      {catBadge.label}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                      <span>★</span>
                      <span>{ex.nivelDificuldade || 3}/5</span>
                    </div>
                  </div>

                  <h3
                    className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-200"
                    )}
                  >
                    {ex.nome}
                  </h3>

                  {ex.objetivosEspecificos && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {ex.objetivosEspecificos}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                    <span className="truncate">{ex.espaco || "Campo"}</span>
                    <span>{ex.jogadoresEnvolvidos ? `${ex.jogadoresEnvolvidos} atletas` : ""}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 🎨 PAINEL PRINCIPAL: Estúdio da Prancheta Tática */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d]">
        {/* Barra Superior do Estúdio */}
        <header className="p-4 border-b border-slate-800 bg-[#0d131f] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  {nome || "Novo Exercício"}
                </h1>
                {selectedExercicio ? (
                  <Badge variant="cyan" className="text-[10px] py-0.5">
                    Guardado na BD
                  </Badge>
                ) : (
                  <Badge variant="amber" className="text-[10px] py-0.5">
                    Novo (Não Gravado)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Desenhe esquemas táticos interativos e organize a biblioteca do clube
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="dark"
              size="sm"
              onClick={() => setShowMetadataPanel(!showMetadataPanel)}
              title="Mostrar/Esconder dados do exercício"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>{showMetadataPanel ? "Esconder Ficha" : "Ficha Técnica"}</span>
            </Button>

            {selectedExercicio && (
              <>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleDuplicarExercicio}
                  disabled={isSaving}
                  title="Criar uma cópia deste exercício"
                >
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>Duplicar</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEliminarExercicio}
                  disabled={isSaving}
                  title="Eliminar exercício do catálogo"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Eliminar</span>
                </Button>
              </>
            )}

            <Button
              variant="cyan"
              size="sm"
              onClick={handleGuardarExercicio}
              disabled={isSaving}
              title="Guardar alterações no catálogo"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-1" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{saveSuccess ? "Gravado com Sucesso!" : "Guardar Exercício"}</span>
            </Button>
          </div>
        </header>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Corpo do Estúdio: Ficha Técnica (Esquerda/Colapsável) + Prancheta Tática (Direita) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {showMetadataPanel && (
            <div className="w-full lg:w-84 bg-[#0f172a] border-r border-slate-800 p-5 overflow-y-auto flex flex-col gap-4 shrink-0 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ficha do Exercício
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {categoria}
                </span>
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Nome do Exercício *
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Saída de Pressão 3v2"
                  className="text-xs"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full bg-[#162032] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="AQUECIMENTO">Aquecimento</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="TATICO">Tático</option>
                  <option value="FISICO">Físico</option>
                  <option value="GUARDA_REDES">Guarda-Redes</option>
                  <option value="LUDICO">Lúdico</option>
                </select>
              </div>

              {/* Espaço e Jogadores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Espaço
                  </label>
                  <Input
                    value={espaco}
                    onChange={(e) => setEspaco(e.target.value)}
                    placeholder="40x30m"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Nº Jogadores
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={jogadoresEnvolvidos}
                    onChange={(e) => setJogadoresEnvolvidos(parseInt(e.target.value) || 14)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dificuldade */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Nível de Dificuldade (1 a 5)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNivelDificuldade(lvl)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                        nivelDificuldade >= lvl
                          ? "bg-cyan-500 text-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objetivos Específicos */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Objetivos / Comportamentos
                </label>
                <Textarea
                  rows={4}
                  value={objetivosEspecificos}
                  onChange={(e) => setObjetivosEspecificos(e.target.value)}
                  placeholder="Ex: Foco na velocidade de circulação, desmarques de apoio e atração do adversário..."
                  className="text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* 🕹️ Quadro Tático Interativo */}
          <div className="flex-1 bg-[#070b14] p-3 overflow-hidden flex flex-col items-center justify-center relative">
            <div className="w-full h-full max-h-[820px] flex items-center justify-center">
              <TacticalBoard
                key={selectedExercicio?.id || "novo-exercicio"}
                initialTacticData={tacticData}
                onSave={handleSaveTacticBoard}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
