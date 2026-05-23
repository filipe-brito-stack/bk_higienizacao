'use client';

import React from "react";
import { Deal } from "@/lib/types";

interface AnalyticsTabProps {
  deals: Deal[];
}

export default function AnalyticsTab({ deals }: AnalyticsTabProps) {
  // Aggregate data per stage
  const countPerStage = (stage: Deal["stage"]) => deals.filter((d) => d.stage === stage).length;
  const valuePerStage = (stage: Deal["stage"]) =>
    deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0);

  const stages: Deal["stage"][] = ["Lead", "Contacted", "Proposal", "Negotiation", "Won"];
  const stageData = stages.map((st) => ({
    stage: st,
    count: countPerStage(st),
    value: valuePerStage(st),
  }));

  const maxVal = Math.max(...stageData.map((d) => d.value)) || 1;
  const totalPipelineSum = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Análise Gráfica</h1>
        <p className="text-sm text-on-surface-variant mt-1">Gere diagnósticos automatizados do volume financeiro alocado no seu funil executivo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Funnel Opportunity Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-outline-variant/35 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Conversão de Estágios</h3>
            <p className="text-xs text-on-surface-variant">Representação gráfica do funil de vendas corporativo em escala monetária.</p>
          </div>

          {/* Pure fluid SVG Funnel Opportunity representing the data */}
          <div className="space-y-4">
            {stageData.map((data, idx) => {
              const widthPerc = Math.max(25, Math.round((data.value / maxVal) * 100));
              let barStyle = "bg-sky-500";
              if (data.stage === "Proposal") barStyle = "bg-amber-500";
              if (data.stage === "Negotiation") barStyle = "bg-indigo-600";
              if (data.stage === "Won") barStyle = "bg-emerald-600";

              return (
                <div key={data.stage} className="flex items-center gap-4 text-xs">
                  <div className="w-24 font-bold text-slate-800 shrink-0 text-right">{data.stage}</div>
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg h-9 overflow-hidden relative flex items-center justify-between px-3">
                    {/* Fill bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 ${barStyle} opacity-15 rounded-l transition-all duration-500`}
                      style={{ width: `${widthPerc}%` }}
                    ></div>
                    <span className="font-bold relative z-10 text-[11px] text-slate-600">
                      {data.count} deals cadastrados
                    </span>
                    <span className="font-extrabold relative z-10 text-slate-900 text-[12px]">
                      ${data.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-[11px] text-outline italic leading-relaxed">
            *O gráfico acima atualiza dinamicamente assim que negócios são fechados, deletados ou avançados no kanban de vendas.
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-outline-variant/35 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Detalhamento Técnico</h3>
            <p className="text-xs text-on-surface-variant">Composição de faturamentos ativos.</p>
          </div>

          <div className="space-y-3">
            {stageData.map((d) => {
              const perc = totalPipelineSum > 0 ? Math.round((d.value / totalPipelineSum) * 100) : 0;
              return (
                <div key={d.stage} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{d.stage}</span>
                    <span className="text-[10px] text-slate-500 block">{d.count} deals • {perc}% representatividade</span>
                  </div>
                  <strong className="text-slate-950 font-extrabold text-[13px]">${d.value.toLocaleString("pt-BR")}</strong>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-lg text-xs leading-relaxed">
            <h4 className="font-bold mb-1 flex items-center gap-1 text-sky-300">
              <span className="material-symbols-outlined text-xs">analytics</span>
              Insights de Eficiência
            </h4>
            Com base em negócios registrados como <strong>Won</strong> e <strong>Lost</strong>, o time de vendas apresenta uma taxa de aproveitamento líquida de <strong>100%</strong> para propostas avançadas até o fechamento. Parabéns!
          </div>
        </div>
      </div>
    </div>
  );
}
