"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Users,
  Dumbbell,
  Sparkles,
  Shield,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { type NavKey } from "./Sidebar";

interface MobileNavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

const mobileNav: MobileNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clube", label: "Clube", icon: Shield },
  { key: "plantel", label: "Plantel", icon: Users },
  { key: "calendario", label: "Calendário", icon: Calendar },
  { key: "treinos", label: "Planos de Treino", icon: Dumbbell },
  { key: "prancheta", label: "Prancheta Tática", icon: Sparkles },
  { key: "assiduidade", label: "Assiduidade", icon: CheckSquare },
  { key: "scouting", label: "Scouting", icon: Search },
  { key: "config", label: "Configurações", icon: Settings },
];

interface MobileDrawerProps {
  isOpen: boolean;
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onClose: () => void;
}

export function MobileDrawer({
  isOpen,
  active,
  onNavigate,
  onClose,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-strong animate-fade-up absolute left-0 top-0 h-full w-72 border-r p-4">
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm font-semibold">Dossier do Treinador</p>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
