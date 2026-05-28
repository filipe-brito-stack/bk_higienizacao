'use client';

import React, { useState } from "react";
import { CRMGoals } from "@/lib/types";

interface SettingsTabProps {
  goals: CRMGoals;
  setGoals: React.Dispatch<React.SetStateAction<CRMGoals>>;
}

export default function SettingsTab({
  goals,
  setGoals,
}: SettingsTabProps) {
  const [revenueTarget, setRevenueTarget] = useState(goals.monthlyRevenueTarget.toString());
  const [customersTarget, setCustomersTarget] = useState(goals.newCustomersTarget.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const revNum = parseFloat(revenueTarget) || 1500000;
    const custNum = parseInt(customersTarget) || 200;

    setGoals((prev) => ({
      ...prev,
      monthlyRevenueTarget: revNum,
      newCustomersTarget: custNum,
    }));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Configurações Gerais</h1>
        <p className="text-sm text-on-surface-variant mt-1">Defina metas e visualize parâmetros operacionais globais do sistema.</p>
      </div>

      {isSaved && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg text-xs font-bold animate-fadeIn">
          ✔ Parâmetros sincronizados com sucesso e persistidos na base de dados local!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Targets configurations */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/35 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-2">Metas Operacionais do CRM</h3>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Meta de Faturamento Mensal (R$)</label>
            <input
              type="number"
              required
              value={revenueTarget}
              onChange={(e) => setRevenueTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-extrabold text-base"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Meta de Novos Clientes (Contas)</label>
            <input
              type="number"
              required
              value={customersTarget}
              onChange={(e) => setCustomersTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-bold"
            />
          </div>



          <div className="pt-4 text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
