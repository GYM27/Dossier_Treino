"use client";

import { useState, useEffect } from "react";
import { adversarioService, type Adversario } from "@/services/adversarioService";
import { cn } from "@/lib/utils";
import { Calendar, Shield, Users, LayoutDashboard, Menu } from "lucide-react";

export default function ScoutingPage() {
  const [adversarios, setAdversarios] = useState<Adversario[]>([]);
  const [nome, setNome] = useState("");
  const [sistemaTatico, setSistemaTatico] = useState("");
  const [pontosFortes, setPontosFortes] = useState("");
  const [pontosFracos, setPontosFracos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [editando, setEditando] = useState(false);
  const [adversarioId, setAdversarioId] = useState<string | null>(null);

  // Carregar do localStorage ao montar a página
  useEffect(() => {
    const savedNome = localStorage.getItem("scouting_nome");
    const savedSistema = localStorage.getItem("scouting_sistema");
    const savedFortes = localStorage.getItem("scouting_fortes");
    const savedFracos = localStorage.getItem("scouting_fracos");
    const savedObs = localStorage.getItem("scouting_obs");
    const savedEditando = localStorage.getItem("scouting_editando");
    const savedId = localStorage.getItem("scouting_id");

    if (savedNome) setNome(savedNome);
    if (savedSistema) setSistemaTatico(savedSistema);
    if (savedFortes) setPontosFortes(savedFortes);
    if (savedFracos) setPontosFracos(savedFracos);
    if (savedObs) setObservacoes(savedObs);
    if (savedEditando === "true") setEditando(true);
    if (savedId) setAdversarioId(savedId);

    // Limpar storage após restaurar (evita que dados antigos persistam demais)
    localStorage.removeItem("scouting_nome");
    localStorage.removeItem("scouting_sistema");
    localStorage.removeItem("scouting_fortes");
    localStorage.removeItem("scouting_fracos");
    localStorage.removeItem("scouting_obs");
    localStorage.removeItem("scouting_editando");
    localStorage.removeItem("scouting_id");
  }, []);

  useEffect(() => {
    carregarAdversarios();
  }, []);

  const carregarAdversarios = async () => {
    const data = await adversarioService.listarTodos();
    setAdversarios(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editando && adversarioId) {
      await adversarioService.atualizar(adversarioId, {
        nome,
        sistemaTaticoPref: sistemaTatico,
        pontosFortes,
        pontosFracos,
        observacoesGerais: observacoes,
      });
      limparFormularioLocalStorage();
    } else {
      await adversarioService.criar({
        nome,
        sistemaTaticoPref: sistemaTatico,
        pontosFortes,
        pontosFracos,
        observacoesGerais: observacoes,
      });
    }
    carregarAdversarios();
    limparFormularioLocalStorage();
  };

  const editar = (id: string, adv: Adversario) => {
    setEditando(true);
    setAdversarioId(id);
    setNome(adv.nome);
    setSistemaTatico(adv.sistemaTaticoPref || "");
    setPontosFortes(adv.pontosFortes || "");
    setPontosFracos(adv.pontosFracos || "");
    setObservacoes(adv.observacoesGerais || "");
  };

  const excluir = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este adversário?")) {
      await adversarioService.eliminar(id);
      carregarAdversarios();
    }
  };

  const limparFormularioLocalStorage = () => {
    localStorage.setItem("scouting_nome", "");
    localStorage.setItem("scouting_sistema", "");
    localStorage.setItem("scouting_fortes", "");
    localStorage.setItem("scouting_fracos", "");
    localStorage.setItem("scouting_obs", "");
    localStorage.setItem("scouting_editando", "false");
    localStorage.setItem("scouting_id", "");
    setNome("");
    setSistemaTatico("");
    setPontosFortes("");
    setPontosFracos("");
    setObservacoes("");
    setAdversarioId(null);
    setEditando(false);
  };

  const limparFormulario = () => {
    setNome("");
    setSistemaTatico("");
    setPontosFortes("");
    setPontosFracos("");
    setObservacoes("");
    setAdversarioId(null);
    setEditando(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white">
            <Menu className="inline-block mr-2 h-5 w-5" /> Scouting
          </h1>
          <p className="text-slate-400 mt-1">
            Gestão de análise e observação de adversários para o planeamento tático.
          </p>
        </header>

        {/* List Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Adversários Registados
          </h2>
          <div className="overflow-x-auto rounded-lg border rounded border-slate-600">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-slate-500 bg-slate-800">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Sistema Tático</th>
                  <th className="p-4">Pontos Fortes</th>
                  <th className="p-4">Pontos Fracos</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {adversarios.map((adv) => (
                  <tr key={adv.id} className="border-b border-slate-700 hover:bg-slate-800">
                    <td className="p-4 font-medium">{adv.nome}</td>
                    <td className="p-4">{adv.sistemaTaticoPref || "—"}</td>
                    <td className="p-4 truncate max-w-xs">{adv.pontosFortes || "—"}</td>
                    <td className="p-4 truncate max-w-xs">{adv.pontosFracos || "—"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => editar(adv.id || "", adv)}
                        className="mr-2 text-yellow-400 hover:text-yellow-300 text underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(adv.id || "")}
                        className="text-red-400 hover:text-red-300 text underline"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adversarios.length === 0 && (
            <p className="text-slate-500 mt-4">Nenhum adversário registado ainda.</p>
          )}
        </section>

        {/* Form Section (Add/Edit) */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            {editando ? "Editar Adversário" : "Novo Adversário"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Nome do Adversário</label>
              <input
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  localStorage.setItem("scouting_nome", e.target.value);
                }}
                required
                className="w-full rounded border border-slate-600 bg-slate-900 text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Sistema Tático (ex: 4-3-3)</label>
              <input
                value={sistemaTatico}
                onChange={(e) => {
                  setSistemaTatico(e.target.value);
                  localStorage.setItem("scouting_sistema", e.target.value);
                }}
                className="w-full rounded border border-slate-600 bg-slate-900 text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 4-3-3, 1-4-2-4"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Pontos Fortes</label>
              <textarea
                value={pontosFortes}
                onChange={(e) => {
                  setPontosFortes(e.target.value);
                  localStorage.setItem("scouting_fortes", e.target.value);
                }}
                rows={2}
                className="w-full rounded border border-slate-600 bg-slate-900 text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Transição rápida, bom golpe de esquina"
              ></textarea>
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Pontos Fracos</label>
              <textarea
                value={pontosFracos}
                onChange={(e) => {
                  setPontosFracos(e.target.value);
                  localStorage.setItem("scouting_fracos", e.target.value);
                }}
                rows={2}
                className="w-full rounded border border-slate-600 bg-slate-900 text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Fraco nas bolas paradas defensivas"
              ></textarea>
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-medium">Observações Gerais</label>
              <textarea
                value={observacoes}
                onChange={(e) => {
                  setObservacoes(e.target.value);
                  localStorage.setItem("scouting_obs", e.target.value);
                }}
                rows={3}
                className="w-full rounded border border-slate-600 bg-slate-900 text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Observações livremente"
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
                disabled={editando && !adversarioId}
              >
                {editando ? "Atualizar" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="flex-1 bg-slate-600 text-white py-2 rounded hover:bg-slate-500 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}