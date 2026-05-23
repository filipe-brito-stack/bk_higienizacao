'use client';

import React, { useState } from "react";
import { Deal } from "@/lib/types";

interface DealsTabProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
}

export default function DealsTab({ deals, setDeals }: DealsTabProps) {
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editProbability, setEditProbability] = useState(50);

  // Dynamic calculations
  const totalPipelineVal = deals.reduce((sum, d) => sum + d.value, 0);
  const totalForecastVal = deals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
  const wonCount = deals.filter((d) => d.stage === "Won").length;

  const handleSaveEdit = (dealId: string) => {
    const valueNum = parseFloat(editPrice.replace(/[^0-9.]/g, "")) || 0;
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return {
          ...d,
          value: valueNum > 0 ? valueNum : d.value,
          probability: editProbability,
        };
      })
    );
    setEditingDealId(null);
  };

  const startEdit = (deal: Deal) => {
    setEditingDealId(deal.id);
    setEditPrice(deal.value.toString());
    setEditProbability(deal.probability);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top statistics section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Razão de Deals</h1>
        <p className="text-sm text-on-surface-variant mt-1">Sintetize faturamentos, ordens comerciais associadas e controle probabilities de fechamento.</p>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Capacidade Total</span>
          <h3 className="text-xl font-black text-slate-900">${totalPipelineVal.toLocaleString("pt-BR")}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma de todos os deals ativos e terminados.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Faturamento IA Ponderado (Est.)</span>
          <h3 className="text-xl font-black text-blue-600">${Math.round(totalForecastVal).toLocaleString("pt-BR")}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Ajustado de acordo com a probabilidade individual de cada estágio.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Taxa de Sucesso (Won)</span>
          <h3 className="text-xl font-black text-emerald-700">{wonCount} Fechados</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Quantitativo de oportunidades concluídas com sucesso.</p>
        </div>
      </div>

      {/* Main Deals Table */}
      <div className="bg-white rounded-xl border border-outline-variant/35 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              <tr>
                <th className="px-6 py-4">Negócio</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4 text-right">Valor estimado</th>
                <th className="px-6 py-4">Estágio</th>
                <th className="px-6 py-4 text-center">Probabilidade</th>
                <th className="px-6 py-4">Proprietário</th>
                <th className="px-6 py-4 text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium">
              {deals.map((deal) => {
                const isEditing = editingDealId === deal.id;

                return (
                  <tr key={deal.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950">{deal.title}</td>
                    <td className="px-6 py-4 text-slate-600">{deal.company}</td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="bg-white border rounded px-2 py-1 w-24 text-right text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                        />
                      ) : (
                        <span className="font-extrabold text-slate-850">${deal.value.toLocaleString("pt-BR")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        deal.stage === "Won" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        deal.stage === "Negotiation" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        deal.stage === "Proposal" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editProbability}
                          onChange={(e) => setEditProbability(parseInt(e.target.value) || 0)}
                          className="bg-white border rounded px-1 py-1 w-16 text-center text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-slate-600">{deal.probability}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{deal.owner}</td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleSaveEdit(deal.id)}
                            className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-black transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingDealId(null)}
                            className="border hover:bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-slate-600"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(deal)}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Editar params
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
