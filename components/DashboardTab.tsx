'use client';

import React, { useState } from "react";
import { Contact, Deal, Task, Activity, CRMGoals } from "@/lib/types";
import { DollarSign, Filter, Briefcase, Timer, TrendingUp, TrendingDown, Sparkles, Info, CheckCircle2, Mail, UserPlus, Phone, Award, AlertTriangle, Trash2 } from "lucide-react";

function formatBRL(value: string | number): string {
  if (value === undefined || value === null || value === "") return "";
  
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  const clean = value.replace(/\D/g, "");
  if (!clean) return "";
  
  const numeric = parseFloat(clean) / 100;
  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isCurrentMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  const paddedMonth = month.toString().padStart(2, "0");
  const clean = dateStr.trim();
  const lower = clean.toLowerCase();
  
  if (
    lower.includes("hoje") ||
    lower.includes("amanhã") ||
    lower.includes("today") ||
    lower.includes("tomorrow") ||
    lower.includes("em 2 dias") ||
    lower.includes("em 3 dias") ||
    lower.includes("próxima semana") ||
    lower.includes("next week")
  ) {
    return true;
  }
  
  if (clean.startsWith(`${year}-${paddedMonth}`)) {
    return true;
  }
  
  const brSuffix = `/${paddedMonth}/${year}`;
  if (clean.includes(brSuffix)) {
    return true;
  }
  
  return false;
}

function parseDealDate(dateStr: string): { month: number; year: number } | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  
  // Try YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1, // 0-11
    };
  }
  
  // Try DD/MM/YYYY
  const brMatch = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return {
      year: parseInt(brMatch[3], 10),
      month: parseInt(brMatch[2], 10) - 1, // 0-11
    };
  }

  // Try relative words like "Hoje" etc.
  const lower = clean.toLowerCase();
  if (
    lower.includes("hoje") ||
    lower.includes("amanhã") ||
    lower.includes("today") ||
    lower.includes("tomorrow") ||
    lower.includes("em 2 dias") ||
    lower.includes("em 3 dias") ||
    lower.includes("próxima semana") ||
    lower.includes("next week")
  ) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  }
  
  return null;
}

function getMonthYearList() {
  const result = [];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      monthIdx: d.getMonth(),
      year: d.getFullYear(),
      name: monthNames[d.getMonth()],
    });
  }
  return result;
}

interface DashboardTabProps {
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  goals: CRMGoals;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  onReviewInactiveLeads: () => void;
}

export default function DashboardTab({
  contacts,
  deals,
  tasks,
  activities,
  goals,
  setTasks,
  setActivities,
  onReviewInactiveLeads,
}: DashboardTabProps) {
  // AI Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summary?: string;
    achievements?: string[];
    risks?: string[];
    recommendations?: { title: string; description: string }[];
    predictedRevenue?: string;
  } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Quick Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskValue, setNewTaskValue] = useState("");
  const [newTaskAssociated, setNewTaskAssociated] = useState("Tarefa Direta");
  const [newTaskPriority, setNewTaskPriority] = useState<"Urgent" | "Medium" | "Low">("Medium");

  // Chart Month Interactivity
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [selectedMonthDataState, setSelectedMonthDataState] = useState<{
    month: string;
    value: string;
    label: string;
  } | null>(null);

  // Dynamically generate months and calculate values from Supabase Deals
  const last6Months = getMonthYearList();
  const currentMonthName = last6Months[5].name;

  const monthlyValues = last6Months.map((m, index) => {
    const isCurrent = index === 5;
    const monthDeals = deals.filter((d) => {
      const parsed = parseDealDate(d.date);
      return parsed && parsed.month === m.monthIdx && parsed.year === m.year;
    });

    let sum = 0;
    if (isCurrent) {
      // Current month: include all stages (Realizado, Agendado, Proposta) to project overall deals value
      sum = monthDeals
        .filter((d) => d.stage === "Realizado" || d.stage === "Agendado" || d.stage === "Proposta")
        .reduce((s, d) => s + d.value, 0);
    } else {
      // Historical months: only count actual realized deals value
      sum = monthDeals
        .filter((d) => d.stage === "Realizado")
        .reduce((s, d) => s + d.value, 0);
    }

    return {
      monthObj: m,
      value: sum,
      isCurrent,
    };
  });

  const maxVal = Math.max(...monthlyValues.map((v) => v.value), 10000);

  const chartData = monthlyValues.map((mv, index) => {
    const pct = Math.max(10, Math.floor((mv.value / maxVal) * 100));
    
    let formattedLabel = "";
    if (mv.value >= 1000) {
      formattedLabel = `R$ ${(mv.value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
      if (mv.isCurrent) formattedLabel += " (atual)";
    } else {
      formattedLabel = `R$ ${mv.value.toLocaleString("pt-BR")}`;
      if (mv.isCurrent) formattedLabel += " (atual)";
    }

    return {
      key: mv.monthObj.name,
      month: mv.monthObj.name,
      value: formattedLabel,
      numericValue: mv.value,
      pctHeight: pct,
      isCurrent: mv.isCurrent,
    };
  });

  // Load selection defaults or user chosen month
  const currentMonthData = chartData[5];
  const selectedMonthData = selectedMonthDataState || (currentMonthData ? {
    month: currentMonthData.month,
    value: currentMonthData.value,
    label: "Faturamento Projetado"
  } : null);

  // Dynamic calculations - filtered by current month as requested
  const totalRevenue = deals
    .filter((d) => isCurrentMonth(d.date) && d.stage === "Realizado")
    .reduce((sum, d) => sum + d.value, 0);

  const totalCost = deals
    .filter((d) => isCurrentMonth(d.date) && d.stage === "Realizado")
    .reduce((sum, d) => sum + d.cost, 0);

  const netProfit = totalRevenue - totalCost;

  const activeDealsCount = deals.filter(
    (d) => isCurrentMonth(d.date) && d.stage !== "Realizado"
  ).length;

  const urgentTasksCount = tasks.filter((t) => !t.completed && t.priority === "Urgent").length;

  // Goals calculations
  const revenueTarget = goals.monthlyRevenueTarget || 1500000;
  const currentMonthRevenueReached = deals
    .filter((d) => isCurrentMonth(d.date) && d.stage === "Realizado")
    .reduce((sum, d) => sum + d.value, 0);
  const revenueProgressPct = Math.min(100, Math.round((currentMonthRevenueReached / revenueTarget) * 100));

  const customersTarget = goals.newCustomersTarget || 200;
  const currentMonthCustomers = contacts.length;
  const customersProgressPct = Math.min(100, Math.round((currentMonthCustomers / customersTarget) * 100));

  // Rule: Sum of Monthly Revenue target percentage and New Customers target percentage, divided by 2
  const leadScore = Math.round((revenueProgressPct + customersProgressPct) / 2);

  // Toggle tasks
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t))
    );
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const cleanStr = newTaskValue.replace(/[^\d,]/g, "").replace(",", ".");
    const parsedValue = cleanStr ? parseFloat(cleanStr) : undefined;

    const newTask: Task = {
      id: Math.random().toString(),
      title: newTaskTitle,
      associatedWith: newTaskAssociated,
      completed: false,
      priority: newTaskPriority,
      dueDate: "Hoje",
      value: isNaN(parsedValue ?? NaN) ? undefined : parsedValue,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Add activity log
    const valorMsg = parsedValue && !isNaN(parsedValue) ? ` (Valor: R$ ${parsedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "";
    const newActivity: Activity = {
      id: Math.random().toString(),
      type: "contact",
      title: `Tarefa criada: ${newTaskTitle}`,
      sub: `Definida com prioridade ${newTaskPriority === "Urgent" ? "Urgente" : newTaskPriority === "Medium" ? "Média" : "Baixa"}${valorMsg}`,
      time: "Agora mesmo",
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Reset fields
    setNewTaskTitle("");
    setNewTaskPriority("Medium");
    setNewTaskValue("");
  };

  // Trigger Gemini AI Insights
  const generateInsights = async () => {
    setAiLoading(true);
    setShowAiModal(true);
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, deals, tasks }),
      });
      const data = await response.json();
      if (data.success && data.insights) {
        setAiInsights(data.insights);
      } else {
        throw new Error(data.error || "Failed to process analytics snapshot.");
      }
    } catch (err: any) {
      setAiInsights({
        summary: "Erro ao carregar insights preditivos.",
        achievements: ["Sua receita alcançou R$ 1.28M impulsionada por fechamentos recentes."],
        risks: ["Alguns clientes importantes estão sem interação registrada há mais de 3 dias."],
        recommendations: [
          {
            title: "Contato imediato via email",
            description: "Escreva para Jane Doe da Acme Corporation para discutir novas propostas comerciais."
          }
        ],
        predictedRevenue: "Previsão padrão estimada em R$ 1.5M com base nas probabilidades cadastradas."
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Bem-vindo de volta, <b>Kawaguchi</b>. Aqui está o desempenho do seu pipeline hoje.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Valor Total Recebido */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Este Mês
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Valor Recebido</p>
          <h2 className="text-2xl font-extrabold text-on-surface mt-1">
            R$ {formatBRL(totalRevenue)}
          </h2>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Custo Operacional */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              Custo do Mês
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Custo Operacional</p>
          <h2 className="text-2xl font-extrabold text-on-surface mt-1">
            R$ {formatBRL(totalCost)}
          </h2>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Valor Recebido Líquido */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              Lucro do Mês
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Valor Recebido Líquido</p>
          <h2 className="text-2xl font-extrabold text-on-surface mt-1">
            R$ {formatBRL(netProfit)}
          </h2>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Deals Ativos no Funil */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/40 shadow-sm group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              Ativos do Mês
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Serviços ativos</p>
          <h2 className="text-2xl font-extrabold text-on-surface mt-1">{activeDealsCount}</h2>
        </div>
      </section>

      {/* Main Bar Chart & Goals Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Funnel Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Receita Semestral</h3>
                <p className="text-xs text-on-surface-variant">Desempenho histórico de faturamento focado no faturamento executivo.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Receita Realizada
                </span>
              </div>
            </div>

            {/* Displaying selected segment details */}
            {selectedMonthData && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs animate-fadeIn">
                <span>Mês Selecionado: <strong>{selectedMonthData.month}</strong></span>
                <span>Faturamento: <strong className="text-blue-600">{selectedMonthData.value}</strong></span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {selectedMonthData.label}
                </span>
              </div>
            )}

            {/* Simulated Chart using customized styled tailwind elements for perfect reactivity */}
            <div className="h-64 flex items-end gap-3 md:gap-6 px-2 border-b border-outline-variant/30 pb-2 pt-4">
              {chartData.map((d) => (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  onMouseEnter={() => setHoveredMonth(d.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  onClick={() => setSelectedMonthDataState({ month: d.month, value: d.value, label: d.isCurrent ? "Faturamento Projetado" : "Receita Realizada" })}
                >
                  <div className="relative w-full flex justify-center items-end h-full">
                    {/* Hover indicator tooltip */}
                    {(hoveredMonth === d.month || (selectedMonthData && selectedMonthData.month === d.month)) && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap animate-fadeIn">
                        {d.value}
                      </div>
                    )}
                    <div
                      style={{ height: `${d.pctHeight}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 min-h-[16px] ${
                        selectedMonthData && selectedMonthData.month === d.month
                          ? "bg-blue-600 shadow-md transform scale-x-105"
                          : d.isCurrent
                          ? "bg-blue-500/30 border-t-2 border-dashed border-blue-500"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[11px] font-semibold ${selectedMonthData && selectedMonthData.month === d.month ? "text-blue-600 font-bold" : "text-on-surface-variant"}`}>
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-outline mt-3 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Clique em qualquer barra do gráfico para detalhar o faturamento individualizado.
          </p>
        </div>

        {/* Monthly Goals progress widgets */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface mb-6">Metas Comerciais do Mês</h3>
            <div className="space-y-6">
              {/* Revenue target progression */}
              <div>
                <div className="flex justify-between items-center mb-1 bg-slate-50 p-1.5 rounded">
                  <span className="text-xs font-semibold text-on-surface-variant">Faturamento Mensal</span>
                  <span className="text-xs font-bold text-on-surface">{revenueProgressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div style={{ width: `${revenueProgressPct}%` }} className="bg-slate-950 h-full rounded-full transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-1 px-1">
                  <span>Meta de R$ {(revenueTarget >= 1000000) ? `${(revenueTarget/1000000).toLocaleString('pt-BR', {maximumFractionDigits: 2})}M` : `${(revenueTarget/1000).toLocaleString('pt-BR')}k`}</span>
                  <span>Alcançado: R$ {(currentMonthRevenueReached >= 1000000) ? `${(currentMonthRevenueReached/1000000).toLocaleString('pt-BR', {maximumFractionDigits: 2})}M` : `${(currentMonthRevenueReached/1000).toLocaleString('pt-BR')}k`}</span>
                </div>
              </div>

              {/* Customer count progression */}
              <div>
                <div className="flex justify-between items-center mb-1 bg-slate-50 p-1.5 rounded">
                  <span className="text-xs font-semibold text-on-surface-variant">Novos Clientes</span>
                  <span className="text-xs font-bold text-on-surface">{customersProgressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div style={{ width: `${customersProgressPct}%` }} className="bg-blue-600 h-full rounded-full transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-1 px-1">
                  <span>Meta de {customersTarget} contas</span>
                  <span>Ativos: {currentMonthCustomers}</span>
                </div>
              </div>

              {/* Lead quality scorecard */}
              <div>
                <div className="flex justify-between items-center mb-1 bg-slate-50 p-1.5 rounded">
                  <span className="text-xs font-semibold text-on-surface-variant">Score de Qualidade dos Leads</span>
                  <span className="text-xs font-bold text-on-surface">{leadScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div style={{ width: `${leadScore}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-1 px-1">
                  <span>Média Executiva</span>
                  <span>{(leadScore / 20).toFixed(1)} de 5 estrelas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Tasks & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks card */}
        <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">Tarefas</h3>
                <p className="text-xs text-on-surface-variant">Agendamentos e ações comerciais.</p>
              </div>
              {urgentTasksCount > 0 && (
                <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold animate-pulse">
                  {urgentTasksCount} Urgentes
                </span>
              )}
            </div>

            {/* Quick adding task inline form */}
            <form onSubmit={handleAddTask} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nova Tarefa Comercial</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Ex: Ligar para Sarah Miller"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-white border border-outline-variant/50 px-3 py-2 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none h-11 sm:h-9"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="0,00"
                    value={newTaskValue}
                    onChange={(e) => setNewTaskValue(formatBRL(e.target.value))}
                    className="w-full bg-white border border-outline-variant/50 px-3 py-2 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none h-11 sm:h-9 text-right font-extrabold"
                  />
                </div>
                <div className="sm:col-span-3 flex gap-2 w-full">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="flex-grow bg-white border border-outline-variant/50 px-1.5 py-2 rounded text-[11px] outline-none text-on-surface-variant h-11 sm:h-9"
                  >
                    <option value="Urgent">Urgente</option>
                    <option value="Medium">Média</option>
                    <option value="Low">Baixa</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all h-11 sm:h-9 flex items-center justify-center shrink-0 cursor-pointer"
                    title="Adicionar Tarefa"
                  >
                    <span className="text-sm font-semibold">+</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Tasks listing with scroll limit */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-outline italic text-center py-6">Nenhuma tarefa pendente registrada.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-start gap-3.5 p-3 md:p-3.5 rounded-lg border border-outline-variant/25 hover:bg-slate-50/80 active:bg-slate-100/60 transition-colors cursor-pointer select-none ${
                      task.completed ? "opacity-55 bg-slate-50/50" : "bg-white shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-5 w-5 rounded border-slate-350 text-slate-900 focus:ring-slate-950 cursor-pointer transition-all"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className={`text-xs font-bold leading-tight ${task.completed ? "line-through text-slate-400" : "text-slate-905"}`}>
                          {task.title}
                        </p>
                        {task.value !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.2 font-extrabold rounded-md border ${
                            task.completed 
                              ? "bg-slate-100 text-slate-400 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}>
                            R$ {task.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-1 items-center">
                        <span className="font-semibold text-slate-600">{task.associatedWith}</span>
                        <span className="text-slate-300">•</span>
                        <span>Prazo: <span className="font-bold text-slate-850 bg-slate-100 px-1 py-0.2 rounded">{task.dueDate}</span></span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      {task.priority === "Urgent" && (
                        <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-2 py-1 border border-rose-100 rounded-md tracking-wider">HOJE</span>
                      )}
                      {task.priority === "Medium" && (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-1 border border-amber-100 rounded-md tracking-wider">MÉDIO</span>
                      )}
                      {task.priority === "Low" && (
                        <span className="text-[9px] font-bold text-slate-650 bg-slate-100 px-2 py-1 border border-slate-200 rounded-md tracking-wider">AVULSO</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities timeline card */}
        <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-on-surface">Histórico de Atividades</h3>
              <p className="text-xs text-on-surface-variant">Log de atualizações em tempo real.</p>
            </div>
            <div className="flex items-center gap-2">
              {activities.length > 0 && (
                <button
                  id="btn-clear-activities"
                  onClick={() => {
                    if (confirmClear) {
                      setActivities([]);
                      setConfirmClear(false);
                    } else {
                      setConfirmClear(true);
                    }
                  }}
                  onMouseLeave={() => setConfirmClear(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-tight transition-all active:scale-95 cursor-pointer ${
                    confirmClear
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-rose-200 bg-rose-50 hover:bg-rose-100/80 text-rose-700"
                  }`}
                  title="Apagar todas as atividades"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmClear ? "Confirmar exclusão?" : "Limpar Histórico"}</span>
                </button>
              )}
              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">Histórico</span>
            </div>
          </div>

          <div className={`relative space-y-4 max-h-96 overflow-y-auto pr-1 ${activities.length > 0 ? "before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100" : ""}`}>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Trash2 className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Histórico de atividades vazio</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">Todas as atividades foram removidas. Conforme você interagir com contatos ou negócios, novas atividades serão logadas aqui.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="relative pl-12 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                  {/* Timeline circle icon indicator */}
                  <div className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 antialiased shadow-sm">
                    {activity.type === "closed" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      </div>
                    )}
                    {activity.type === "email" && (
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-700" />
                      </div>
                    )}
                    {activity.type === "contact" && (
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-amber-700" />
                      </div>
                    )}
                    {activity.type === "call" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-indigo-700" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface">
                      <strong className="text-on-surface font-semibold">{activity.title.split(":")[0]}:</strong>
                      {activity.title.split(":")[1] || activity.title}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/95 mt-0.5" dangerouslySetInnerHTML={{ __html: activity.sub }} />
                    {/* On mobile, show time badge below the content */}
                    <span className="sm:hidden inline-block mt-1.5 text-[9px] text-[#556980] font-semibold whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {activity.time}
                    </span>
                  </div>
                  {/* On desktop, show time badge on the right side */}
                  <span className="hidden sm:inline-block text-[9px] text-[#556980] font-semibold whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-100 self-start">
                    {activity.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* GEMINI AI ANALYTICS DIALOG/MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Relatório de Insights Preditivos</h3>
                    <p className="text-xs text-slate-500">Mapeamento inteligente da saúde do pipeline gerado por Gemini IA.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1 px-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 font-bold transition-all"
                >
                  ✕
                </button>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-600 font-medium">Lendo banco de dados e preparando prognóstico...</p>
                  <p className="text-[10px] text-slate-400">Essa operação utiliza chamada de rede segura para Gemini no servidor.</p>
                </div>
              ) : (
                <div className="space-y-5 text-slate-800">
                  {/* Summary */}
                  <div className="bg-slate-900 text-white p-4 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Diagnóstico Geral</p>
                    <p className="text-sm leading-relaxed">{aiInsights?.summary}</p>
                  </div>

                  {/* Achievements and progress indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 block mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4 text-emerald-700" />
                        Pontos Fortes Detectados
                      </span>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-emerald-950">
                        {aiInsights?.achievements?.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
                      <span className="text-xs font-bold text-rose-800 block mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        Alertas de Risco
                      </span>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-rose-950">
                        {aiInsights?.risks?.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Concrete recommendation list */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ações Sugeridas Recomendadas pelo Gemini</h4>
                    <div className="space-y-2">
                      {aiInsights?.recommendations?.map((rec, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{rec.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predicted Revenue */}
                  <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100 rounded-lg text-xs flex justify-between items-center">
                    <span>💡 Forecast de faturamento para próximo mês:</span>
                    <strong className="font-bold text-blue-950">{aiInsights?.predictedRevenue}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 text-right">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 font-bold rounded-lg transition-colors"
              >
                Voltar ao Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
