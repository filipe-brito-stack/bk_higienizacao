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
  const [editCost, setEditCost] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Dynamic calculations
  const totalPipelineVal = deals.reduce((sum, d) => sum + d.value, 0);
  const totalCostVal = deals.reduce((sum, d) => sum + d.cost, 0);
  const totalNetProfit = totalPipelineVal - totalCostVal;
  const wonCount = deals.filter((d) => d.stage === "Realizado").length;

  const handleSaveEdit = (dealId: string) => {
    const valueNum = parseFloat(editPrice.replace(/[^0-9.]/g, "")) || 0;
    const costNum = parseFloat(editCost.replace(/[^0-9.]/g, "")) || 0;

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return {
          ...d,
          value: valueNum >= 0 ? valueNum : d.value,
          cost: costNum >= 0 ? costNum : d.cost,
          serviceDescription: editDescription.trim() !== "" ? editDescription : d.serviceDescription
        };
      })
    );
    setEditingDealId(null);
  };

  const startEdit = (deal: Deal) => {
    setEditingDealId(deal.id);
    setEditPrice(deal.value.toString());
    setEditCost(deal.cost.toString());
    setEditDescription(deal.serviceDescription);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top statistics section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Serviços</h1>
        <p className="text-sm text-on-surface-variant mt-1">Sintetize faturamentos, custos operacionais e margens líquidas brutas do seu negócio.</p>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Faturamento Total</span>
          <h3 className="text-xl font-black text-slate-900">R$ {totalPipelineVal.toLocaleString("pt-BR")}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma de todos os serviços propostos, agendados e realizados.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Custo Total Operacional</span>
          <h3 className="text-xl font-black text-rose-600">R$ {totalCostVal.toLocaleString("pt-BR")}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma de todos os gastos declarados para realização de serviços.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs col-span-1">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Lucro Líquido Acumulado</span>
          <h3 className={`text-xl font-black ${totalNetProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            R$ {totalNetProfit.toLocaleString("pt-BR")}
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Saldo real líquido ({wonCount} concluídos com sucesso).</p>
        </div>
      </div>

      {/* Main Deals Table */}
      <div className="bg-white rounded-xl border border-outline-variant/35 shadow-sm overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Descrição do Serviço</th>
                <th className="px-6 py-4 text-right">Valor Cobrado</th>
                <th className="px-6 py-4 text-right">Valor Gasto</th>
                <th className="px-6 py-4 text-right">Lucro Líquido</th>
                <th className="px-6 py-4">Estágio</th>
                <th className="px-6 py-4">Data do Serviço</th>
                <th className="px-6 py-4 text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium">
              {deals.map((deal) => {
                const isEditing = editingDealId === deal.id;
                const netProfit = deal.value - deal.cost;

                return (
                  <tr key={deal.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950">{deal.clientName}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="bg-white border rounded px-2 py-1 w-full text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                        />
                      ) : (
                        deal.serviceDescription
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="bg-white border rounded px-2 py-1 w-20 text-right text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                        />
                      ) : (
                        <span className="font-extrabold text-slate-850">R$ {deal.value.toLocaleString("pt-BR")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCost}
                          onChange={(e) => setEditCost(e.target.value)}
                          className="bg-white border rounded px-2 py-1 w-20 text-right text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-rose-600">R$ {deal.cost.toLocaleString("pt-BR")}</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${netProfit >= 0 ? "text-slate-800" : "text-rose-750"}`}>
                      R$ {netProfit.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        deal.stage === "Realizado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse" :
                        deal.stage === "Agendado" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        deal.stage === "Proposta" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{deal.date}</td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleSaveEdit(deal.id)}
                            className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-black transition-colors cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingDealId(null)}
                            className="border hover:bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-slate-600 cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(deal)}
                          className="text-blue-600 font-bold hover:underline cursor-pointer text-[10px]"
                        >
                          Editar
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
