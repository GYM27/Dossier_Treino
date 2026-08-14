/**
 * AtletaFormModal.tsx — Modal para Criar ou Editar um Atleta.
 *
 * Responsabilidade ÚNICA: Renderizar o formulário dentro de um modal.
 * Não sabe nada de API (não faz fetch). Recebe os dados e callbacks via props.
 * O componente pai (Squad) é quem decide o que fazer quando o formulário é submetido.
 */
"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { OPCOES_POSICAO, OPCOES_PE } from "./constants"
import type { AtletaFormData } from "./constants"

// ── Props do Componente ─────────────────────────────────────────────────────
interface AtletaFormModalProps {
  formData: AtletaFormData                        // Os dados actuais do formulário
  onChange: (dados: AtletaFormData) => void        // Callback: "O utilizador alterou um campo"
  onSubmit: (e: React.FormEvent) => void           // Callback: "O utilizador clicou Guardar"
  onClose: () => void                              // Callback: "O utilizador quer fechar o modal"
  isSubmitting: boolean                            // Flag: Estamos a gravar no backend?
  isEditing: boolean                               // Flag: Modo Editar vs Criar?
}

// ── Estilos reutilizáveis ───────────────────────────────────────────────────
// Extraímos a classe CSS do input para uma constante, evitando repetição brutal.
const INPUT_STYLE = "w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"

export function AtletaFormModal({
  formData,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  isEditing,
}: AtletaFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#131b2f] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800/60 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? "Editar Atleta" : "Criar Novo Atleta"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Avatar Preview */}
          <div className="flex justify-center mb-2">
            {formData.fotoUrl ? (
              <img 
                src={formData.fotoUrl} 
                alt="Pré-visualização da foto" 
                className="w-24 h-24 rounded-full object-cover border-4 border-[#0a0f1c] shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0a0f1c] flex items-center justify-center border-4 border-slate-800 shadow-xl">
                <span className="text-3xl font-bold text-slate-600">
                  {formData.nome ? formData.nome.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nome Completo (ocupa 2 colunas) */}
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-400">Nome Completo</label>
              <input
                required
                value={formData.nome}
                onChange={e => onChange({ ...formData, nome: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>

            {/* Fotografia (URL) (ocupa 2 colunas) */}
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-400">URL da Fotografia (Opcional)</label>
              <input
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={formData.fotoUrl || ""}
                onChange={e => onChange({ ...formData, fotoUrl: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Data de Nascimento</label>
              <input
                type="date"
                value={formData.dataNascimento || ""}
                onChange={e => onChange({ ...formData, dataNascimento: e.target.value })}
                className={INPUT_STYLE}
              />
              <p className="text-xs text-slate-500 mt-1">Opcional - Caso não tenha, pode deixar em branco</p>
            </div>

            {/* Nº Camisola */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Nº Camisola</label>
              <input
                required
                type="number"
                min="1"
                max="99"
                value={formData.numeroCamisola}
                onChange={e => onChange({ ...formData, numeroCamisola: parseInt(e.target.value) })}
                className={INPUT_STYLE}
              />
            </div>

            {/* Posição Principal (select gerado a partir das constantes) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Posição Principal</label>
              <select
                value={formData.posicaoPrincipal}
                onChange={e => onChange({ ...formData, posicaoPrincipal: e.target.value })}
                className={INPUT_STYLE}
              >
                {OPCOES_POSICAO.map(op => (
                  <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
                ))}
              </select>
            </div>

            {/* Pé Preferido (select gerado a partir das constantes) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Pé Preferido</label>
              <select
                value={formData.pePreferido}
                onChange={e => onChange({ ...formData, pePreferido: e.target.value })}
                className={INPUT_STYLE}
              >
                {OPCOES_PE.map(op => (
                  <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
                ))}
              </select>
            </div>

            {/* Altura */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Altura (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={formData.alturaCm || ""}
                onChange={e => onChange({ ...formData, alturaCm: parseInt(e.target.value) || 0 })}
                className={INPUT_STYLE}
              />
            </div>

            {/* Peso */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="150"
                value={formData.pesoKg || ""}
                onChange={e => onChange({ ...formData, pesoKg: parseFloat(e.target.value) || 0 })}
                className={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Rodapé: Botões de Ação */}
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {isSubmitting ? "A guardar..." : (isEditing ? "Atualizar Atleta" : "Guardar Atleta")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
