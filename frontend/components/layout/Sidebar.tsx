"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  CheckSquare,
  Shield,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "clube"
  | "plantel"
  | "calendario"
  | "assiduidade"
  | "treinos"
  | "config";

type NavItem = {
  key: NavKey;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clube", label: "Clube", icon: Shield },
  { key: "plantel", label: "Plantel", icon: Users },
  { key: "calendario", label: "Calendário", icon: Calendar },
  { key: "treinos", label: "Treinos", icon: Dumbbell },
  { key: "assiduidade", label: "Assiduidade", icon: CheckSquare },
  { key: "config", label: "Configurações", icon: Settings },
];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}) {
  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r p-4 md:flex">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ClipboardList className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Dossier</p>
          <p className="text-xs text-muted-foreground">do Treinador</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        <p className="px-3 pb-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-[18px] transition-transform group-hover:scale-110",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
