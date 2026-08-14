/**
 * PlayerCard.tsx — Cartão visual de Alta Competição para um Atleta.
 *
 * Responsabilidade ÚNICA: Renderizar os dados de um jogador num cartão bonito.
 * Não sabe nada de formulários, API ou estado global.
 * Recebe os dados via props e comunica a intenção de "Editar" via callback.
 */
"use client";

import { cn } from "@/lib/utils";
import { Edit2, User } from "lucide-react";

// ── Props do Componente ─────────────────────────────────────────────────────
// Definimos uma interface explícita em vez de usar `any`.
// Isto torna o código auto-documentado: quem ler sabe exactamente o que o cartão precisa.
interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    number: number;
    position: string;
    age: number;
  };
  index: number; // Posição na lista (para escalonar a animação de entrada)
  onEdit: () => void; // Callback: "O utilizador quer editar este jogador"
  onProfile: () => void; // Callback: "O utilizador quer ver o perfil detalhado"
}

export function PlayerCard({
  player,
  index,
  onEdit,
  onProfile,
}: PlayerCardProps) {
  // ── Tratamento do Nome ──────────────────────────────────────────────────
  // Separamos o nome em "Primeiro Nome" (normal) e "ÚLTIMO NOME" (bold maiúsculo)
  // para replicar o estilo de videojogo de simulação desportiva.
  const nameParts = player.name.split(" ");
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  const lastName = nameParts[nameParts.length - 1];

  const mins = Math.floor(Math.random() * 2500);
  const gls = Math.floor(Math.random() * 10);
  const ast = Math.floor(Math.random() * 15);

  return (
    <div
      onClick={onProfile}
      className="glass animate-fade-up group relative overflow-hidden rounded-xl p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 h-[170px] border border-slate-800 cursor-pointer"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Background Número (Marca d'água gigante) */}
      <span className="pointer-events-none absolute -right-2 -bottom-2 text-[6rem] leading-none font-black text-slate-800/20 transition-colors group-hover:text-primary/5 z-0">
        {player.number}
      </span>

      <div className="relative z-10 flex flex-col h-full">
        {/* Botão de Editar (Flutuante à direita) */}
        <div className="absolute right-0 top-1 flex gap-1.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evita que o clique no Editar abra também o perfil!
              onEdit();
            }}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-all bg-background/50 backdrop-blur-sm p-1.5 rounded-md border border-border/50"
          >
            <Edit2 className="size-3.5" />
          </button>
        </div>

        {/* Middle: Grande Número Dourado e Nome */}
        <div className="mt-4 mb-3">
          <span className="block text-3xl font-serif font-bold text-[#eab308] tracking-tighter drop-shadow-sm mb-1.5">
            {String(player.number).padStart(2, "0")}
          </span>

          <div className="flex flex-col leading-tight mb-1.5">
            {firstName && (
              <span className="text-xs font-medium text-slate-300">
                {firstName}
              </span>
            )}
            <h3 className="text-lg font-black uppercase tracking-tight">
              {lastName}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[0.6rem] font-bold tracking-[0.2em] text-slate-400 uppercase">
            <span>{player.position}</span>
            <span className="size-1 rounded-full bg-slate-600" />
            <span>{player.age || "--"} ANOS</span>
          </div>
        </div>

        {/* Rodapé: Estatísticas de Alta Competição */}
        <div className="pt-2 border-t border-slate-700/50 grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-bold tracking-widest text-slate-500 uppercase">
              Mins
            </span>
            <span className="text-sm font-bold text-slate-200">
              {mins.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-bold tracking-widest text-slate-500 uppercase">
              Gls
            </span>
            <span className="text-sm font-bold text-slate-200">{gls}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-bold tracking-widest text-slate-500 uppercase">
              Ast
            </span>
            <span className="text-sm font-bold text-slate-200">{ast}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
