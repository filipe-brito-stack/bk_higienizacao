'use client';

import React, { useState } from "react";
import { Deal, Activity } from "@/lib/types";

interface PipelineTabProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

const STAGES: Deal["stage"][] = ["Lead", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

export default function PipelineTab({ deals, setDeals, setActivities }: PipelineTabProps) {
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newValueStr, setNewValueStr] = useState("");
  const [newStage, setNewStage] = useState<Deal["stage"]>("Lead");
  const [newProbability, setNewProbability] = useState(50);
  const [newOwner, setNewOwner] = useState("Alex");

  // Calculations of capital sums per stage
  const getStageTotal = (stage: Deal["stage"]) => {
    return deals
      .filter((d: Deal) => d.stage === stage)
      .reduce((sum, d) => sum + d.value, 0);
  };

  // Move deal stage
  const handleMoveStage = (dealId: string, direction: "prev" | "next") => {
    const deal = deals.find((d: Deal) => d.id === dealId);
    if (!deal) return;

    const currentIndex = STAGES.indexOf(deal.stage);
    let nextIndex = currentIndex;
    if (direction === "prev") nextIndex = Math.max(0, currentIndex - 1);
    if (direction === "next") nextIndex = Math.min(STAGES.length - 1, currentIndex + 1);

    const updatedStage = STAGES[nextIndex];
    if (updatedStage === deal.stage) return;

    const updatedProbability = updatedStage === "Won" ? 100 : updatedStage === "Lost" ? 0 : deal.probability;

    // 1. Update Deals
    setDeals((prev: Deal[]) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, stage: updatedStage, probability: updatedProbability }
          : d
      )
    );

    // 2. Add activity log
    const newActivity: Activity = {
      id: "act_move_" + dealId + "_" + updatedStage,
      type: updatedStage === "Won" ? "closed" : "contact",
      title: `Deal staged: ${deal.title}`,
      sub: `Progresso: ${deal.stage} → <b>${updatedStage}</b> ($${deal.value.toLocaleString()})`,
      time: "Just now",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);
  };

  // Create Opportunity
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(newValueStr.replace(/[^0-9.]/g, "")) || 0;
    if (!newTitle.trim() || !newCompany.trim() || valueNum <= 0) return;

    const createdId = "deal_" + Date.now();
    const createdDeal: Deal = {
      id: createdId,
      title: newTitle,
      company: newCompany,
      value: valueNum,
      stage: newStage,
      probability: newStage === "Won" ? 100 : newStage === "Lost" ? 0 : newProbability,
      owner: newOwner,
      closeDate: "2026-06-30",
    };

    setDeals((prev: Deal[]) => [createdDeal, ...prev]);

    // Log Activity
    const newActivity: Activity = {
      id: "act_add_" + createdId,
      type: "contact",
      title: `Opportunity Added: ${createdDeal.title}`,
      sub: `Sincronizado estágio <b>${createdDeal.stage}</b> com valor de $${createdDeal.value.toLocaleString()}`,
      time: "Just now",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);

    // Cleanup
    setNewTitle("");
    setNewCompany("");
    setNewValueStr("");
    setNewStage("Lead");
    setNewProbability(50);
    setShowAddDeal(false);
  };

  // Delete option from pipeline
  const handleDeleteDeal = (id: string, title: string) => {
    setDeals((prev: Deal[]) => prev.filter((d: Deal) => d.id !== id));
    const newActivity: Activity = {
      id: "act_delete_" + id,
      type: "contact",
      title: `Deal deleted: ${title}`,
      sub: `Opportunity removed from CRM pipeline`,
      time: "Just now",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Funil de Vendas</h1>
          <p className="text-sm text-on-surface-variant mt-1">Sintonize os estágios das suas oportunidades de faturamento com controle completo.</p>
        </div>
        <button
          onClick={() => setShowAddDeal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          Add Deal
        </button>
      </div>

      {/* Kanban Stages Grid viewport */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const totalSum = getStageTotal(stage);

          // Customize colors for headers representing progression
          let headerColor = "border-t-slate-300";
          let badgeColor = "bg-slate-100 text-slate-800";
          if (stage === "Lead") { headerColor = "border-t-sky-400"; badgeColor = "bg-sky-50 text-sky-700"; }
          if (stage === "Proposal") { headerColor = "border-t-amber-400"; badgeColor = "bg-amber-50 text-amber-700"; }
          if (stage === "Negotiation") { headerColor = "border-t-indigo-500"; badgeColor = "bg-indigo-50 text-indigo-700"; }
          if (stage === "Won") { headerColor = "border-t-emerald-500"; badgeColor = "bg-emerald-50 text-emerald-700 font-bold"; }
          if (stage === "Lost") { headerColor = "border-t-rose-300"; badgeColor = "bg-rose-50 text-rose-700"; }

          return (
            <div key={stage} className={`bg-slate-50 border-t-4 ${headerColor} rounded-lg p-3 min-w-[220px] shadow-xs flex flex-col justify-between min-h-[450px]`}>
              <div>
                {/* Header segment details */}
                <div className="flex justify-between items-center mb-1 bg-white p-1.5 rounded border border-slate-200/60">
                  <span className="text-xs font-bold text-on-surface">{stage}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {stageDeals.length}
                  </span>
                </div>
                {/* Capital Sum aggregate */}
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-3 px-1 text-right border-b border-dashed border-slate-200 pb-1.5">
                  Total: <span className="text-on-surface font-semibold">${totalSum.toLocaleString()}</span>
                </div>

                {/* Items wrapper */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white p-3 rounded-lg border border-outline-variant/35 shadow-xs hover:border-slate-800 transition-colors animate-fadeIn group">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{deal.company}</span>
                        <button
                          onClick={() => handleDeleteDeal(deal.id, deal.title)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-600 font-bold hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{deal.title}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-105">
                        <span className="text-[11px] font-extrabold text-slate-700">${deal.value.toLocaleString()}</span>
                        <div className="text-[9px] bg-slate-50 text-slate-500 px-1.5 rounded font-bold border">
                          {deal.probability}%
                        </div>
                      </div>

                      {/* Direction arrow shift controls */}
                      <div className="flex justify-between items-center mt-3 pt-1 border-t border-dotted border-slate-200 bg-slate-50 px-1 py-0.5 rounded">
                        <button
                          onClick={() => handleMoveStage(deal.id, "prev")}
                          disabled={stage === "Lead"}
                          className="text-xs font-bold hover:text-blue-600 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Voltar estágio"
                        >
                          ◀
                        </button>
                        <span className="text-[8px] uppercase tracking-wider text-outline font-semibold">Staging</span>
                        <button
                          onClick={() => handleMoveStage(deal.id, "next")}
                          disabled={stage === "Lost"}
                          className="text-xs font-bold hover:text-blue-600 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Avançar estágio"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="text-[10px] text-outline text-center py-8 italic">Sem deals ativos.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK DEAL CREATION OVERLAY */}
      {showAddDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Oportunidade (Deal)</h3>
              <button onClick={() => setShowAddDeal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Título do Deal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Licenciamento Enterprise"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Empresa do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Global Logistics Ltd"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Valor Unitário ($)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 85,000"
                  value={newValueStr}
                  onChange={(e) => setNewValueStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Estágio Inicial</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-850 font-bold"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Probabilidade (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProbability}
                    onChange={(e) => setNewProbability(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDeal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Criar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
