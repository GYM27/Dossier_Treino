"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Search,
  Sparkles,
  Film,
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "clube"
  | "plantel"
  | "calendario"
  | "treinos"
  | "prancheta"
  | "prancheta-dinamica"
  | "assiduidade"
  | "config"
  | "scouting";

export type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { key: "clube", label: "Clube", href: "/clube", icon: Shield },
  { key: "plantel", label: "Plantel", href: "/plantel", icon: Users },
  { key: "calendario", label: "Calendário", href: "/calendario", icon: Calendar },
  { key: "treinos", label: "Planos de Treino", href: "/treinos", icon: Dumbbell },
  { key: "prancheta", label: "Prancheta Tática", href: "/prancheta", icon: Sparkles },
  { key: "prancheta-dinamica", label: "Prancheta Dinâmica", href: "/prancheta-dinamica", icon: Film },
  { key: "assiduidade", label: "Assiduidade", href: "/assiduidade", icon: CheckSquare },
  { key: "scouting", label: "Scouting", href: "/scouting", icon: Search },
  { key: "config", label: "Configurações", href: "/config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r p-4 md:flex select-none">
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
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
