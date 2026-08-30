"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Team } from "@/models/team";
import { type Utilizador } from "@/models/utilizador";
import { Bell, Check, ChevronsUpDown, Menu, LogOut, ChevronDown, User, X, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileForm } from "../settings/ProfileForm";
import { CreateTeamModal } from "../clube/CreateTeamModal";
import { useActiveTeam } from "@/context/ActiveTeamContext";

interface TopHeaderProps {
  teams?: Team[];
  activeTeam?: Team | null;
  me?: Utilizador | null;
  onTeamChange?: (team: Team) => void;
  onOpenMobileNav?: () => void;
  onRefreshMe?: () => void;
}

export function TopHeader({
  teams: propsTeams,
  activeTeam: propsActiveTeam,
  me: propsMe,
  onTeamChange: propsOnTeamChange,
  onOpenMobileNav,
  onRefreshMe: propsOnRefreshMe,
}: TopHeaderProps) {
  // Consumo direto do contexto global
  const context = useActiveTeam();
  const teams = propsTeams ?? context.teams;
  const activeTeam = propsActiveTeam !== undefined ? propsActiveTeam : context.activeTeam;
  const me = propsMe !== undefined ? propsMe : context.me;
  const handleTeamChange = propsOnTeamChange ?? context.setActiveTeam;
  const handleRefreshMe = propsOnRefreshMe ?? context.refreshData;

  const [open, setOpen] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 md:px-6 select-none">
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {activeTeam ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/[0.06]"
            >
              {activeTeam.emblemaUrl ? (
                <img 
                  src={activeTeam.emblemaUrl} 
                  alt={activeTeam.nome} 
                  className="size-6 object-contain drop-shadow-sm"
                />
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
                  {activeTeam.nome.charAt(0)}
                </span>
              )}
              <span className="max-w-[9rem] truncate sm:max-w-none">{activeTeam.nome}</span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </button>

            {open && (
              <div className="glass-strong absolute left-0 mt-2 w-64 overflow-hidden rounded-xl border p-1 shadow-2xl shadow-black/40">
                <p className="px-3 py-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                  Equipas
                </p>
                {teams?.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      handleTeamChange(team);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-foreground/5",
                      team.id === activeTeam.id ? "text-primary font-bold" : "text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {team.emblemaUrl ? (
                        <img 
                          src={team.emblemaUrl} 
                          alt="" 
                          className="size-5 object-contain drop-shadow-sm"
                        />
                      ) : (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-[10px] font-bold text-primary">
                          {team.nome.charAt(0)}
                        </span>
                      )}
                      <span className="truncate">{team.nome}</span>
                    </div>
                    {team.id === activeTeam.id && <Check className="size-4 shrink-0" />}
                  </button>
                ))}

                <div className="border-t border-border/50 my-1 pt-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowCreateTeamModal(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Criar Nova Equipa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm font-medium text-muted-foreground px-3">
            Dossier do Treinador
          </div>
        )}

        <CreateTeamModal
          isOpen={showCreateTeamModal}
          onClose={() => setShowCreateTeamModal(false)}
          onTeamCreated={(newTeam) => {
            handleRefreshMe();
            handleTeamChange(newTeam);
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-background" />
        </button>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-foreground/[0.03] py-1 pl-1 pr-2 hover:bg-foreground/[0.05] transition-colors"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-chart-2 text-xs font-bold text-primary-foreground">
              {me?.nomeCompleto?.charAt(0) || "U"}
            </span>
            <div className="hidden leading-tight text-left sm:block">
              <p className="text-sm font-medium">{me?.nomeCompleto || "Utilizador"}</p>
              <p className="text-[0.7rem] text-muted-foreground">{me?.cargo ? me.cargo.replace("_", " ") : "Desconhecido"}</p>
            </div>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors font-medium"
                >
                  <User className="size-4" />
                  O Meu Perfil
                </button>
                <button
                  onClick={async () => {
                    try {
                      await apiFetch("/auth/logout", { method: "POST" });
                      window.location.href = "/login";
                    } catch (err) {
                      window.location.href = "/login";
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                >
                  <LogOut className="size-4" />
                  Terminar Sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-5" />
            </button>
            <ProfileForm 
              initialData={me} 
              onSuccess={() => {
                setProfileModalOpen(false);
                handleRefreshMe();
              }} 
            />
          </div>
        </div>
      )}
    </header>
  );
}
