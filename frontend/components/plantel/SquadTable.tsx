"use client";

import { Edit2 } from "lucide-react";
import { type JogadorFormatado } from "./useAtletasCrud";

interface SquadTableProps {
  players: JogadorFormatado[];
  onEdit: (player: JogadorFormatado) => void;
  onProfile: (playerId: string) => void;
}

export function SquadTable({ players, onEdit, onProfile }: SquadTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-background/30 backdrop-blur-sm shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-muted-foreground">
          <thead className="bg-foreground/[0.02] text-xs uppercase tracking-wider border-b border-border/50">
            <tr>
              <th scope="col" className="px-4 py-4 font-semibold w-16 text-center">
                Nº
              </th>
              <th scope="col" className="px-4 py-4 font-semibold">
                Atleta
              </th>
              <th scope="col" className="px-4 py-4 font-semibold">
                Posição
              </th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">
                Data Nascimento
              </th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">
                Mins
              </th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">
                Gls
              </th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">
                Ast
              </th>
              <th scope="col" className="pl-2 pr-4 py-4 font-semibold text-right w-20">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {players.map((player) => {
              // Separação do nome: Primeiro Nome + ÚLTIMO NOME
              const nameParts = player.name.split(" ");
              const firstName =
                nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
              const lastName = nameParts[nameParts.length - 1];

              // Mock das estatísticas
              const mins = Math.floor(Math.random() * 2500);
              const gls = Math.floor(Math.random() * 10);
              const ast = Math.floor(Math.random() * 15);

              // Função auxiliar para encurtar o nome da posição (ex: GUARDA_REDES -> GR)
              const formatPosition = (pos: string) => {
                const map: Record<string, string> = {
                  GUARDA_REDES: "GR",
                  DEFESA_CENTRAL: "DC",
                  DEFESA_DIREITO: "DD",
                  DEFESA_ESQUERDO: "DE",
                  MEDIO_DEFENSIVO: "MDF",
                  MEDIO_CENTRO: "MC",
                  MEDIO_OFENSIVO: "MO",
                  EXTREMO_DIREITO: "ED",
                  EXTREMO_ESQUERDO: "EE",
                  PONTA_DE_LANCA: "PL",
                };
                return map[pos] || pos;
              };

              return (
                <tr
                  key={player.id}
                  onClick={() => onProfile(player.id)}
                  className="group cursor-pointer transition-colors hover:bg-foreground/[0.03]"
                >
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="text-base font-black text-blue-500">
                      {player.number}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2.5 truncate">
                      {player.fotoUrl ? (
                        <img 
                          src={player.fotoUrl} 
                          alt={`Foto de ${player.name}`} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm border border-border/50" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-xs font-semibold text-muted-foreground border border-border/50">
                          {firstName ? firstName[0] : ""}
                          {lastName ? lastName[0] : ""}
                        </div>
                      )}
                      <span className="text-base font-black text-foreground">
                        {firstName ? `${firstName} ${lastName}` : lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span
                      className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-1 text-xs font-black uppercase text-foreground/70 ring-1 ring-inset ring-foreground/10"
                      title={player.position}
                    >
                      {formatPosition(player.posicaoPrincipal)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="font-medium text-foreground">
                      {player.dataNascimento || "--"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-foreground/80 align-middle">
                    {mins.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-foreground/80 align-middle">
                    {gls}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-foreground/80 align-middle">
                    {ast}
                  </td>
                  <td className="pl-2 pr-4 py-4 text-right align-middle">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(player);
                      }}
                      className="inline-flex items-center justify-center p-1.5 text-muted-foreground transition-all hover:bg-background hover:text-primary hover:shadow-sm rounded-md border border-transparent hover:border-border/50"
                      title="Editar Atleta"
                    >
                      <Edit2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
