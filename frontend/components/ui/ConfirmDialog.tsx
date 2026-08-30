"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog — Modal de confirmação acessível, assíncrono e sem bloquear a thread do browser.
 * Substitui os confirm() nativos mantendo a consistência visual da aplicação.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
      />

      {/* Card Dialog */}
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              variant === "danger" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
              variant === "warning" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
              variant === "default" && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            )}
          >
            {variant === "danger" || variant === "warning" ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 space-y-1.5 pt-0.5">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="text-xs text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          {!isLoading && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            variant={variant === "danger" ? "destructive" : "cyan"}
            className={cn(
              "font-semibold min-w-[90px]",
              variant === "danger" && "bg-rose-600 hover:bg-rose-700 text-white"
            )}
          >
            {isLoading ? (
              <Spinner size="sm" color="white" className="mr-1.5" />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : content;
}
