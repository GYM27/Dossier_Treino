"use client";
import TacticalBoard from "@/components/prancheta/TacticalBoard";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function PranchetaPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveTactic = async (tacticData: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        nome: "Tática de Teste " + Date.now(),
        descricao: "Criado a partir da sandbox",
        categoria: "TATICO",
        nivelDificuldade: 3,
        dadosTaticos: tacticData
      };
      const response = await apiFetch("/exercicios", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      console.log("Gravado com sucesso:", response);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Erro ao gravar", e);
      alert("Erro ao gravar: " + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-[1600px] flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Prancheta Tática (Sandbox)</h1>
        {isSaving && <span className="text-yellow-400">A guardar na Base de Dados...</span>}
        {saveSuccess && <span className="text-emerald-400 font-bold">✓ Tática guardada no PostgreSQL!</span>}
      </div>
      <div className="w-full max-w-[1600px]">
        <TacticalBoard onSave={handleSaveTactic} />
      </div>
    </div>
  );
}
