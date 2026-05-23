'use client';

import React, { useState } from "react";
import { CRMGoals } from "@/lib/types";

interface SettingsTabProps {
  goals: CRMGoals;
  setGoals: React.Dispatch<React.SetStateAction<CRMGoals>>;
  profileName: string;
  setProfileName: (name: string) => void;
  profilePic: string;
  setProfilePic: (pic: string) => void;
}

export default function SettingsTab({
  goals,
  setGoals,
  profileName,
  setProfileName,
  profilePic,
  setProfilePic,
}: SettingsTabProps) {
  const [revenueTarget, setRevenueTarget] = useState(goals.monthlyRevenueTarget.toString());
  const [customersTarget, setCustomersTarget] = useState(goals.newCustomersTarget.toString());
  const [tempName, setTempName] = useState(profileName);
  const [tempPic, setTempPic] = useState(profilePic);
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

    setProfileName(tempName);
    setProfilePic(tempPic);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const AVATAR_PRESETS = [
    { name: "Executive 1 (Sharp Studio Mockup Default)", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCarguWrWz5TWuyV6J_UVDN5rwVyzWcZMTtr52bjn07D7M9xSdszI53dsc5UF585772DUC5tWmmbHW55R7ThXndO9RlF_e6oI6SyhTXr9W1yTbwdiUO9Bglwg74xc8lGjvrINyxai500AmXaOvTlxAZUwmPf5pvVLcdJu9oJoeJ78_a37zTkMzjS6e4M0nZMgHfm3kB6XFBkxL3rwY0QlUsbiRTcbIylcaywtB6k9EukHfT19o1-PZYQOeK-TLPzKcY6LLKx0-VKqg" },
    { name: "Executive 2 (Alternate studio crop)", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMzDxcw3E8i9B8dw3x535fnmjuUd0cwm7y5QHCMpSmqVaKWPjW4T89mjRqi_R91t3WoKpNsx90j19uGNnM74LsuzeXzvFWt5O5ElcPAUrZ9IkRm6q8zP8NL300z8eIlu6GR8ObbX7eVunGyMfJ1gLYoFnIUL0QizMN7SpFJT4h8LVHzo5g7nkioGrEjeMG_VOjEA_G6fA56gSi8LrLP6y7wCn1jaNi4eC4QVoVmldIXmesJBor_U1pUPWp6bJUgg81gKLKvm5mqmQ" },
    { name: "Standard Picsum Random Placeholder", url: "https://picsum.photos/seed/executive/120/120" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Configurações Gerais</h1>
        <p className="text-sm text-on-surface-variant mt-1">Sincronize variáveis globais de performance e modifique perfis com facilidade.</p>
      </div>

      {isSaved && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg text-xs font-bold animate-fadeIn">
          ✔ Parâmetros sincronizados com sucesso e persistidos na base de dados local!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Configuration section */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/35 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-2">Perfil do Usuário Ativo</h3>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Nome de Exibição</label>
            <input
              type="text"
              required
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-bold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500">Link Direto da Imagem de Perfil (Avatar)</label>
              {tempPic && (
                <a
                  href={tempPic}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[9px] font-bold text-blue-600 underline"
                >
                  Abrir Original
                </a>
              )}
            </div>

            <input
              type="url"
              required
              value={tempPic}
              onChange={(e) => setTempPic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800"
            />

            {/* Presets selectors for active profile picture */}
            <div className="mt-2.5">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Escolha a partir dos CDNs Presets:</span>
              <div className="flex flex-col gap-1">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTempPic(preset.url)}
                    className="text-[10px] text-left hover:text-blue-800 text-slate-600 bg-slate-50 p-1 px-2 border border-slate-200/50 hover:border-slate-300 rounded text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-semibold block mb-1.5">Visualização Prévia:</span>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
              <img
                src={tempPic || AVATAR_PRESETS[1].url}
                alt="Preview"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">{tempName}</span>
                <span className="text-[10px] text-slate-500">Diretor Comercial • Nexus Enterprise</span>
              </div>
            </div>
          </div>
        </div>

        {/* Targets configurations */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/35 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-2">Metas Operacionais do CRM</h3>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Meta de Faturamento Mensal ($)</label>
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

          <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700 space-y-2 border">
            <span className="font-bold text-slate-900 block">💡 Nota de Arquitetura:</span>
            As configurações editadas ficam armazenadas com persistência no local-state. Ao carregar o Painel Geral, as porcentagens de metas e previsões IA de receita recalcularão estas variáveis em tempo de execução.
          </div>

          <div className="pt-4 text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Sincronizar Todas as Configurações
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
