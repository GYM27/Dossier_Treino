import React, { useEffect, useState } from "react";
import { Exercicio } from "@/models/exercicio";
import { apiFetch } from "@/lib/api";
import { X, Search, CheckCircle } from "lucide-react";

interface CatalogoExerciciosModalProps {
  onClose: () => void;
  onSelect: (exercicio: Exercicio) => void;
}

export function CatalogoExerciciosModal({
  onClose,
  onSelect,
}: CatalogoExerciciosModalProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/exercicios");
        setExercicios(data);
      } catch (err) {
        console.error("Erro ao carregar exercícios", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = exercicios.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#181A20] border border-[#23262E] rounded-md shadow-2xl flex flex-col h-[80vh] max-h-[800px]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#23262E]">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Library</h2>
            <p className="text-sm text-[#8B949E]">Select a drill from the global catalog.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#23262E] bg-[#0B0C10]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
            <input
              type="text"
              placeholder="Search drills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181A20] border border-[#23262E] rounded-sm py-2 pl-9 pr-4 text-white focus:outline-none focus:border-[#ffd165] transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-[#8B949E] mt-10">Loading catalog...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#8B949E] mt-10">No drills found.</p>
          ) : (
            filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="group flex gap-4 p-4 border border-[#23262E] bg-[#0B0C10] hover:border-[#ffd165] cursor-pointer rounded-sm transition-all"
              >
                <div className="w-24 h-24 bg-[#23262E] flex-shrink-0 flex items-center justify-center border border-[#23262E]/50">
                   <span className="text-xs text-[#8B949E] font-mono">No Image</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-lg font-bold text-[#ffd165] mb-1">{ex.nome}</h4>
                  <p className="text-sm text-[#ece1d1] line-clamp-2 mb-2">
                    {ex.objetivosEspecificos || ex.descricao}
                  </p>
                  <div className="flex gap-4 mt-auto">
                    <span className="text-xs font-mono text-[#8B949E] bg-[#181A20] px-2 py-1 rounded-sm border border-[#23262E]">
                      {ex.categoria}
                    </span>
                    <span className="text-xs font-mono text-[#8B949E] bg-[#181A20] px-2 py-1 rounded-sm border border-[#23262E]">
                      Dificuldade: {ex.nivelDificuldade}/5
                    </span>
                  </div>
                </div>
                <div className="w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle className="text-[#4ae176]" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
