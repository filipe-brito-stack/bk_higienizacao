'use client';

import React, { useState } from "react";
import { Deal, Task } from "@/lib/types";
import { 
  CheckCircle2, 
  Plus, 
  Trash2,
  ListTodo,
  Circle
} from "lucide-react";

interface DealsTabProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

function formatTaskDueDate(due: string): string {
  if (!due) return "";
  
  const trimmed = due.trim();
  
  // Match standard ISO dates: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;
  const isoMatch = trimmed.match(isoRegex);
  if (isoMatch) {
    const [_, year, month, day, hours, minutes] = isoMatch;
    let formatted = `${day}/${month}/${year}`;
    if (hours && minutes) {
      formatted += ` às ${hours}:${minutes}`;
    }
    return formatted;
  }
  
  // Match slashes / hyphens: DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(trimmed)) {
    return trimmed.replace(/-/g, "/");
  }

  // Match: YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  let word = trimmed;
  const lower = word.toLowerCase();
  
  if (lower === "today" || lower === "hoje") return "Hoje";
  if (lower === "tomorrow" || lower === "amanhã") return "Amanhã";
  if (lower === "next week" || lower === "próxima semana") return "Próxima semana";
  if (lower === "in 2 days" || lower === "em 2 dias") return "Em 2 dias";
  if (lower === "in 3 days" || lower === "em 3 dias") return "Em 3 dias";
  
  word = word
    .replace(/\btoday\b/gi, "Hoje")
    .replace(/\btomorrow\b/gi, "Amanhã")
    .replace(/\bnext week\b/gi, "Próxima semana")
    .replace(/\bat\b/gi, "às")
    .replace(/\bin 2 days\b/gi, "Em 2 dias")
    .replace(/\bin 3 days\b/gi, "Em 3 dias");

  return word;
}

function formatTaskUpdatedAt(updatedAt?: string, fallbackDue?: string): string {
  if (!updatedAt) {
    if (fallbackDue) {
      return formatTaskDueDate(fallbackDue);
    }
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  try {
    const d = new Date(updatedAt);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // ignore
  }

  return fallbackDue ? formatTaskDueDate(fallbackDue) : "Sem data";
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

function formatServiceDate(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  
  // Match standard ISO dates YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [_, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  
  // Match YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  return trimmed;
}

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

export default function DealsTab({ 
  deals, 
  setDeals, 
  tasks = [], 
  setTasks 
}: DealsTabProps) {
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealIdToConfirmDelete, setDealIdToConfirmDelete] = useState<string | null>(null);
  const [taskIdToConfirmDelete, setTaskIdToConfirmDelete] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Pagination for deals
  const [currentDealPage, setCurrentDealPage] = useState(1);
  const DEALS_PER_PAGE = 5;
  const totalDealPages = Math.ceil(deals.length / DEALS_PER_PAGE);
  const activeDealPage = Math.min(currentDealPage, totalDealPages || 1);
  const startDealIndex = (activeDealPage - 1) * DEALS_PER_PAGE;
  const paginatedDeals = deals.slice(startDealIndex, startDealIndex + DEALS_PER_PAGE);

  // Pagination for tasks
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // States for editing a Task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskValue, setEditTaskValue] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<"Urgent" | "Medium" | "Low">("Medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskAssociated, setEditTaskAssociated] = useState("");

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskValue(task.value !== undefined ? formatBRL(task.value) : "");
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate);
    setEditTaskAssociated(task.associatedWith || "");
  };

  const handleSaveEditTask = (taskId: string) => {
    if (!editTaskTitle.trim()) return;
    const cleanStr = editTaskValue.replace(/[^\d,]/g, "").replace(",", ".");
    const valueNum = parseFloat(cleanStr);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          title: editTaskTitle.trim(),
          priority: editTaskPriority,
          dueDate: editTaskDueDate.trim() || t.dueDate,
          value: !isNaN(valueNum) && valueNum >= 0 ? valueNum : undefined,
          associatedWith: editTaskAssociated.trim(),
          updatedAt: new Date().toISOString()
        };
      })
    );
    setEditingTaskId(null);
  };

  // Dynamic calculations (filtered by current month only)
  const currentMonthDeals = deals.filter((d) => isCurrentMonth(d.date));

  const totalPipelineVal = currentMonthDeals.reduce((sum, d) => sum + d.value, 0);
  const totalCostVal = currentMonthDeals.reduce((sum, d) => sum + d.cost, 0);
  const totalNetProfit = totalPipelineVal - totalCostVal;
  const wonCount = currentMonthDeals.filter((d) => d.stage === "Realizado").length;

  // Custo de Manutenção based on values of tasks completed in the current month
  const tasksOperationalCost = tasks
    .filter((task) => {
      if (!task.completed) return false;
      const val = task.value || 0;
      if (val <= 0) return false;
      return isCurrentMonth(task.dueDate);
    })
    .reduce((sum, task) => sum + (task.value || 0), 0);

  const handleSaveEdit = (dealId: string) => {
    const cleanPrice = editPrice.replace(/[^\d,]/g, "").replace(",", ".");
    const valueNum = parseFloat(cleanPrice);

    const cleanCost = editCost.replace(/[^\d,]/g, "").replace(",", ".");
    const costNum = parseFloat(cleanCost);

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return {
          ...d,
          value: !isNaN(valueNum) && valueNum >= 0 ? valueNum : d.value,
          cost: !isNaN(costNum) && costNum >= 0 ? costNum : d.cost,
          serviceDescription: editDescription.trim() !== "" ? editDescription : d.serviceDescription
        };
      })
    );
    setEditingDealId(null);
  };

  const startEdit = (deal: Deal) => {
    setEditingDealId(deal.id);
    setEditPrice(formatBRL(deal.value));
    setEditCost(formatBRL(deal.cost));
    setEditDescription(deal.serviceDescription);
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    setDealIdToConfirmDelete(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top statistics section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Serviços</h1>
        <p className="text-sm text-on-surface-variant mt-1">Sintetize faturamentos, custos operacionais e margens líquidas brutas do seu negócio.</p>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Faturamento Total</span>
          <h3 className="text-xl font-black text-slate-900">R$ {formatBRL(totalPipelineVal)}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma de todos os serviços propostos, agendados e realizados.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Custo Operacional</span>
          <h3 className="text-xl font-black text-rose-600">R$ {formatBRL(totalCostVal)}</h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma dos gastos para realização de serviços.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Lucro Líquido</span>
          <h3 className={`text-xl font-black ${totalNetProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            R$ {formatBRL(totalNetProfit)}
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Saldo real líquido ({wonCount} concluídos com sucesso).</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/35 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase block tracking-wider mb-1">Custo de Manutenção</span>
          <h3 className="text-xl font-black text-indigo-600">
            R$ {formatBRL(tasksOperationalCost)}
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Soma das tarefas comerciais concluídas no mês atual.</p>
        </div>
      </div>

      {/* Main Deals Table / Mobile View */}
      <div className="bg-white rounded-xl border border-outline-variant/35 shadow-sm overflow-hidden animate-fadeIn">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Valor Gasto</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium">
              {paginatedDeals.map((deal) => {
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
                          onChange={(e) => setEditPrice(formatBRL(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-2 py-1 w-28 text-right text-xs font-extrabold focus:ring-1 focus:ring-slate-900 outline-none"
                        />
                      ) : (
                        <span className="font-extrabold text-slate-850">R$ {formatBRL(deal.value)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCost}
                          onChange={(e) => setEditCost(formatBRL(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-2 py-1 w-28 text-right text-xs font-extrabold focus:ring-1 focus:ring-slate-900 outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-rose-600">R$ {formatBRL(deal.cost)}</span>
                      )}
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
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{formatServiceDate(deal.date)}</td>
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
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => startEdit(deal)}
                            className="text-blue-600 font-bold hover:underline cursor-pointer text-[10px]"
                          >
                            Editar
                          </button>
                          <span className="text-slate-200">|</span>
                          <button
                            onClick={() => {
                              if (dealIdToConfirmDelete === deal.id) {
                                handleDeleteDeal(deal.id);
                              } else {
                                setDealIdToConfirmDelete(deal.id);
                              }
                            }}
                            onMouseLeave={() => setDealIdToConfirmDelete(null)}
                            className={`font-bold transition-colors cursor-pointer text-[10px] ${
                              dealIdToConfirmDelete === deal.id
                                ? "text-amber-650 bg-amber-50/75 px-1.5 py-0.5 rounded border border-amber-200"
                                : "text-rose-600 hover:underline"
                            }`}
                          >
                            {dealIdToConfirmDelete === deal.id ? "Tem certeza?" : "Excluir"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile alternate card view */}
        <div className="block sm:hidden divide-y divide-slate-100 overflow-y-auto">
          {paginatedDeals.map((deal) => {
            const isEditing = editingDealId === deal.id;
            const netProfit = deal.value - deal.cost;

            return (
              <div key={deal.id} className="p-4 space-y-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{deal.clientName}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Data: <span className="font-medium text-slate-600">{formatServiceDate(deal.date)}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${
                    deal.stage === "Realizado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    deal.stage === "Agendado" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                    deal.stage === "Proposta" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {deal.stage}
                  </span>
                </div>

                <div className="text-[10px] bg-slate-50/70 p-2.5 rounded-lg space-y-1">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Descrição do Serviço</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 w-full text-xs font-semibold focus:ring-1 focus:ring-slate-900 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-slate-800 text-xs leading-snug">{deal.serviceDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-semibold text-center select-none">
                  <div className="bg-slate-50/50 p-2 rounded flex flex-col justify-center border border-slate-100">
                    <span className="text-slate-400 block font-extrabold uppercase tracking-wider text-[7px] mb-0.5">Cobrado</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(formatBRL(e.target.value))}
                        className="bg-white border border-slate-200 rounded text-center text-[10px] py-1 w-full focus:ring-1 focus:ring-slate-900 outline-none font-bold"
                      />
                    ) : (
                      <span className="text-slate-900 font-extrabold text-[11px]">R$ {formatBRL(deal.value)}</span>
                    )}
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded flex flex-col justify-center border border-slate-100">
                    <span className="text-slate-400 block font-extrabold uppercase tracking-wider text-[7px] mb-0.5">Gasto</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editCost}
                        onChange={(e) => setEditCost(formatBRL(e.target.value))}
                        className="bg-white border border-slate-200 rounded text-center text-[10px] py-1 w-full focus:ring-1 focus:ring-slate-900 outline-none font-bold"
                      />
                    ) : (
                      <span className="text-rose-600 text-[11px]">R$ {formatBRL(deal.cost)}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-2.5 border-t border-slate-50">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(deal.id)}
                        className="bg-slate-900 text-white px-3.5 py-1.5 rounded-md text-[10px] font-bold hover:bg-black shadow-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingDealId(null)}
                        className="border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-md text-[10px] font-bold text-slate-500"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2.5 items-center">
                      <button
                        onClick={() => startEdit(deal)}
                        className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Editar
                      </button>
                      <span className="text-slate-200 text-xs">|</span>
                      <button
                        onClick={() => {
                          if (dealIdToConfirmDelete === deal.id) {
                            handleDeleteDeal(deal.id);
                          } else {
                            setDealIdToConfirmDelete(deal.id);
                          }
                        }}
                        onMouseLeave={() => setDealIdToConfirmDelete(null)}
                        className={`text-[10px] font-bold transition-colors cursor-pointer ${
                          dealIdToConfirmDelete === deal.id
                            ? "text-amber-650 bg-amber-50/75 px-1.5 py-0.5 rounded border border-amber-200"
                            : "text-rose-600 hover:underline"
                        }`}
                      >
                        {dealIdToConfirmDelete === deal.id ? "Tem certeza?" : "Excluir"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls for Deals */}
        {totalDealPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-semibold select-none animate-fadeIn">
            <span>
              Mostrando {startDealIndex + 1} a {Math.min(startDealIndex + DEALS_PER_PAGE, deals.length)} de {deals.length} serviços
            </span>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                disabled={activeDealPage === 1}
                onClick={() => setCurrentDealPage(activeDealPage - 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 cursor-pointer transition-all shadow-xs"
              >
                Anterior
              </button>
              <span className="px-2 text-[10px] font-extrabold text-slate-800">
                Página {activeDealPage} de {totalDealPages}
              </span>
              <button
                type="button"
                disabled={activeDealPage === totalDealPages}
                onClick={() => setCurrentDealPage(activeDealPage + 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 cursor-pointer transition-all shadow-xs"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NEW SECTION: Tarefas Cadastradas */}
      <div className="pt-6 border-t border-slate-200/60 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#d3e4fe] rounded-lg text-[#0b1c30]">
                <ListTodo className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Tarefas Operacionais</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium leading-relaxed">
              Acompanhe abaixo todas as tarefas do dashboard unificado.
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="bg-white rounded-xl border border-outline-variant/35 shadow-sm overflow-hidden animate-fadeIn">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-14">Concluído</th>
                  <th className="px-6 py-4">Tarefa</th>
                  <th className="px-6 py-4">Prioridade</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-medium">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs leading-normal">
                      Nenhuma tarefa comercial encontrada. Adicione tarefas na aba de Dashboard.
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((task) => {
                    const handleToggleTask = (id: string) => {
                      setTasks((prev) =>
                        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t))
                      );
                    };

                    const handleDeleteTask = (id: string) => {
                      setTasks((prev) => prev.filter((t) => t.id !== id));
                    };

                    const isEditing = editingTaskId === task.id;

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className="focus:outline-none cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors inline-block"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-350 hover:text-slate-500 mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              className="bg-slate-50 border border-slate-250 px-2 py-1.5 rounded text-xs focus:bg-white outline-none w-full font-bold focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                            />
                          ) : (
                            <span className={`font-bold ${task.completed ? "line-through text-slate-400 font-medium" : "text-slate-950"}`}>
                              {task.title}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editTaskPriority}
                              onChange={(e) => setEditTaskPriority(e.target.value as "Urgent" | "Medium" | "Low")}
                              className="bg-slate-50 border border-slate-205 px-2 py-1.5 rounded text-xs focus:bg-white outline-none w-full font-bold focus:ring-1 focus:ring-blue-650"
                            >
                              <option value="Urgent">Urgente</option>
                              <option value="Medium">Média</option>
                              <option value="Low">Baixa</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === "Urgent" ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse" :
                              task.priority === "Medium" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {task.priority === "Urgent" ? "Urgente" : task.priority === "Medium" ? "Média" : "Baixa"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTaskDueDate}
                              onChange={(e) => setEditTaskDueDate(e.target.value)}
                              placeholder="vencimento"
                              className="bg-slate-50 border border-slate-205 px-2 py-1.5 rounded text-xs focus:bg-white outline-none w-full font-mono focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                            />
                          ) : (
                            formatTaskUpdatedAt(task.updatedAt, task.dueDate)
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-semibold">R$</span>
                              <input
                                type="text"
                                value={editTaskValue}
                                onChange={(e) => setEditTaskValue(formatBRL(e.target.value))}
                                placeholder="0,00"
                                className="bg-slate-50 border border-slate-205 px-2 py-1.5 rounded text-xs focus:bg-white outline-none w-24 text-right font-extrabold focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                              />
                            </div>
                          ) : (
                            task.value !== undefined ? (
                              <span className={`font-extrabold ${task.completed ? "text-slate-400" : "text-slate-850"}`}>
                                R$ {task.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] font-normal">-</span>
                            )
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => handleSaveEditTask(task.id)}
                                className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-black transition-colors cursor-pointer"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="border hover:bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-slate-600 cursor-pointer"
                              >
                                Canc.
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => startEditTask(task)}
                                className="text-blue-600 font-bold hover:underline cursor-pointer text-[10px]"
                              >
                                Editar
                              </button>
                              <span className="text-slate-200">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (taskIdToConfirmDelete === task.id) {
                                    handleDeleteTask(task.id);
                                    setTaskIdToConfirmDelete(null);
                                  } else {
                                    setTaskIdToConfirmDelete(task.id);
                                  }
                                }}
                                onMouseLeave={() => setTaskIdToConfirmDelete(null)}
                                className={`font-bold transition-colors cursor-pointer text-[10px] ${
                                  taskIdToConfirmDelete === task.id
                                    ? "text-amber-650 bg-amber-50/75 px-1.5 py-0.5 rounded border border-amber-200"
                                    : "text-rose-600 hover:underline"
                                }`}
                              >
                                {taskIdToConfirmDelete === task.id ? "Tem certeza?" : "Excluir"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Alternate Cards View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs leading-normal">
                Nenhuma tarefa comercial encontrada. Adicione tarefas no menu do Dashboard.
              </div>
            ) : (
              paginatedTasks.map((task) => {
                const handleToggleTask = (id: string) => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t))
                  );
                };

                const handleDeleteTask = (id: string) => {
                  setTasks((prev) => prev.filter((t) => t.id !== id));
                };

                const isEditing = editingTaskId === task.id;

                return (
                  <div key={task.id} className="p-4 space-y-3.5 hover:bg-slate-50 transition-colors">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tarefa</label>
                          <input
                            type="text"
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            className="bg-white border border-slate-250 px-2.5 py-1.5 w-full text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none rounded"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prioridade</label>
                            <select
                              value={editTaskPriority}
                              onChange={(e) => setEditTaskPriority(e.target.value as "Urgent" | "Medium" | "Low")}
                              className="bg-white border border-slate-200 px-2 py-1.5 w-full text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none rounded"
                            >
                              <option value="Urgent">Urgente</option>
                              <option value="Medium">Média</option>
                              <option value="Low">Baixa</option>
                            </select>
                          </div>

                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Data</label>
                            <input
                              type="text"
                              value={editTaskDueDate}
                              onChange={(e) => setEditTaskDueDate(e.target.value)}
                              className="bg-white border border-slate-200 px-2 py-1.5 w-full text-xs font-mono focus:ring-1 focus:ring-blue-600 outline-none rounded"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Valor (R$)</label>
                            <input
                              type="text"
                              value={editTaskValue}
                              onChange={(e) => setEditTaskValue(formatBRL(e.target.value))}
                              placeholder="0,00"
                              className="bg-white border border-slate-200 px-2 py-1.5 w-full text-xs font-extrabold focus:ring-1 focus:ring-blue-600 outline-none rounded text-right"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEditTask(task.id)}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-black transition-colors cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="border hover:bg-slate-50 px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.id)}
                              className="focus:outline-none cursor-pointer mt-0.5"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-350 hover:text-slate-400" />
                              )}
                            </button>
                            <div>
                              <span className={`font-bold block text-xs ${task.completed ? "line-through text-slate-400 font-medium" : "text-slate-900"}`}>
                                {task.title}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${
                            task.priority === "Urgent" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            task.priority === "Medium" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {task.priority === "Urgent" ? "Urgente" : task.priority === "Medium" ? "Média" : "Baixa"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-semibold border-t border-slate-50 select-none">
                          <div className="bg-slate-50/50 p-2 rounded flex flex-col justify-center border border-slate-100">
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[7px] mb-0.5">Data</span>
                            <span className="text-slate-800 font-mono text-[10px]">{formatTaskUpdatedAt(task.updatedAt, task.dueDate)}</span>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded flex flex-col justify-center border border-slate-100 text-right sm:text-left">
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[7px] mb-0.5">Valor</span>
                            {task.value !== undefined ? (
                              <span className={`font-extrabold text-[10px] ${task.completed ? "text-slate-400" : "text-slate-900"}`}>
                                R$ {task.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-normal">-</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => startEditTask(task)}
                            className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            Editar
                          </button>
                          <span className="text-slate-200 text-xs">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (taskIdToConfirmDelete === task.id) {
                                handleDeleteTask(task.id);
                                setTaskIdToConfirmDelete(null);
                              } else {
                                setTaskIdToConfirmDelete(task.id);
                              }
                            }}
                            onMouseLeave={() => setTaskIdToConfirmDelete(null)}
                            className={`text-[10px] font-bold transition-colors cursor-pointer ${
                              taskIdToConfirmDelete === task.id
                                ? "text-amber-650 bg-amber-50/75 px-1.5 py-0.5 rounded border border-amber-200"
                                : "text-rose-600 hover:underline"
                            }`}
                          >
                            {taskIdToConfirmDelete === task.id ? "Tem certeza?" : "Excluir"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-semibold select-none">
              <span>
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, tasks.length)} de {tasks.length} tarefas
              </span>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 cursor-pointer transition-all shadow-xs"
                >
                  Anterior
                </button>
                <span className="px-2 text-[10px] font-extrabold text-slate-800">
                  Página {activePage} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 cursor-pointer transition-all shadow-xs"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
