import { type Team } from "@/models/team";
import { Info } from "lucide-react";

interface ClubStatsTabProps {
  team: Team;
}

export function ClubStatsTab({ team }: ClubStatsTabProps) {
  return (
    <div className="space-y-6">
      
      {/* GERAL */}
      <div className="glass overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-4 py-3 flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Geral</h3>
          <Info className="size-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0">
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">27</div>
            <div className="mt-1 text-sm text-muted-foreground">jogadores</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">25</div>
            <div className="mt-1 text-sm text-muted-foreground">treinos</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">3</div>
            <div className="mt-1 text-sm text-muted-foreground">competições oficiais</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">6</div>
            <div className="mt-1 text-sm text-muted-foreground">jogos oficiais</div>
          </div>
        </div>
      </div>

      {/* TREINOS */}
      <div className="glass overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-4 py-3 flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Treinos</h3>
          <Info className="size-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0">
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">3</div>
            <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">agosto<br/>2025</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">13</div>
            <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">setembro<br/>2025</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">9</div>
            <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">outubro<br/>2025</div>
          </div>
          <div className="p-6">
            {/* Espaço vazio para manter a grelha estilo imagem */}
          </div>
        </div>
      </div>

      {/* COMPETIÇÕES OFICIAIS */}
      <div className="glass overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-border/50 bg-foreground/[0.02] px-4 py-3 flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Competições oficiais</h3>
          <Info className="size-4 text-muted-foreground" />
        </div>
        
        {/* Sumário */}
        <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0 border-b border-border/50">
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-foreground">6</div>
            <div className="mt-1 text-sm text-muted-foreground">jogos</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-emerald-500">3</div>
            <div className="mt-1 text-sm text-emerald-500 font-medium">vitórias</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-blue-500">1</div>
            <div className="mt-1 text-sm text-blue-500 font-medium">empates</div>
          </div>
          <div className="p-6 text-center transition-colors hover:bg-foreground/[0.02]">
            <div className="text-4xl font-bold tracking-tighter text-rose-500">2</div>
            <div className="mt-1 text-sm text-rose-500 font-medium">derrotas</div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-foreground/[0.02] text-xs font-semibold text-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-3 flex items-center gap-1">
                  Competição <Info className="size-3" />
                </th>
                <th className="px-6 py-3 text-center">Jogos</th>
                <th className="px-6 py-3 text-center">Vitórias</th>
                <th className="px-6 py-3 text-center">Empates</th>
                <th className="px-6 py-3 text-center">Derrotas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-3 font-medium text-foreground">1 Divisao AF Leiria</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
              </tr>
              <tr className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-3 font-medium text-foreground">1 Divisão</td>
                <td className="px-6 py-3 text-center">6</td>
                <td className="px-6 py-3 text-center">3</td>
                <td className="px-6 py-3 text-center">1</td>
                <td className="px-6 py-3 text-center">2</td>
              </tr>
              <tr className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-3 font-medium text-foreground">1ª Distrital AF Leiria</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
                <td className="px-6 py-3 text-center">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
