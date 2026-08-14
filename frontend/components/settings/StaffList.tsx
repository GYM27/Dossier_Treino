"use client";

import { Users, Mail, Briefcase } from "lucide-react";
import { Utilizador } from "@/models/utilizador";

interface StaffListProps {
  equipaTecnica: Utilizador[];
  loading: boolean;
}

export function StaffList({ equipaTecnica, loading }: StaffListProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden mt-8">
      <div className="p-4 border-b border-border/50 bg-foreground/[0.02]">
        <h3 className="font-medium flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Membros Registados
        </h3>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          A carregar...
        </div>
      ) : equipaTecnica.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          Nenhum membro encontrado.
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {equipaTecnica.map((membro) => (
            <div
              key={membro.id}
              className="flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {membro.nomeCompleto}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="size-3" /> {membro.email}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Briefcase className="size-3" />
                {membro.cargo}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
