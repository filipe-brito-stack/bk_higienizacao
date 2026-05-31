'use client';

import React, { useState } from "react";
import { Deal, Activity, Contact } from "@/lib/types";

interface PipelineTabProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  contacts?: Contact[];
}

const STAGES: Deal["stage"][] = ["Proposta", "Agendado", "Realizado"];

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

// Module-level helpers to generate identifiers.
// Keeping these outside of the React component prevents ESLint purity/render complaints.
function generateDealId(clientName: string, count: number): string {
  const sanitizedName = clientName.trim().replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `deal_${count + 1}_${sanitizedName}_${timestamp}_${rand}`;
}

function generateActivityId(dealId: string, action: string): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `act_${action}_${dealId}_${timestamp}_${rand}`;
}

function formatToBRL(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (!cleanValue) return "";
  const numericValue = parseInt(cleanValue, 10);
  return (numericValue / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatBRLValue(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PipelineTab({ deals, setDeals, setActivities, contacts = [] }: PipelineTabProps) {
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<Deal["stage"] | "Todos">("Todos");
  
  // Custom form states
  const [clientSearch, setClientSearch] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [newValueStr, setNewValueStr] = useState("");
  const [newCostStr, setNewCostStr] = useState("");
  const [newStage, setNewStage] = useState<Deal["stage"]>("Proposta");
  const [photoBefore, setPhotoBefore] = useState("");
  const [photoAfter, setPhotoAfter] = useState("");
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (type === "before") {
          setPhotoBefore(reader.result);
        } else {
          setPhotoAfter(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter client suggestions for autocomplete list
  const filteredContacts = (contacts || []).filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Calculations of capital sums per stage
  const getStageTotal = (stage: Deal["stage"]) => {
    return deals
      .filter((d: Deal) => d.stage === stage && (stage !== "Realizado" || isCurrentMonth(d.date)))
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

    // 1. Update Deals
    setDeals((prev: Deal[]) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, stage: updatedStage }
          : d
      )
    );

    // 2. Add activity log
    const newActivity: Activity = {
      id: generateActivityId(dealId, `move_${updatedStage}`),
      type: updatedStage === "Realizado" ? "closed" : "contact",
      title: `Estágio alterado: ${deal.serviceDescription}`,
      sub: `Progresso: ${deal.stage} → <b>${updatedStage}</b> (R$ ${formatBRLValue(deal.value)})`,
      time: "Agora mesmo",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);
  };

  // Create Opportunity
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(newValueStr.replace(/\D/g, "")) / 100 || 0;
    const costNum = parseFloat(newCostStr.replace(/\D/g, "")) / 100 || 0;
    if (!clientSearch.trim() || !newDescription.trim() || valueNum < 0) return;

    const createdId = generateDealId(clientSearch, deals.length);
    const createdDeal: Deal = {
      id: createdId,
      clientName: clientSearch.trim(),
      serviceDescription: newDescription.trim(),
      value: valueNum,
      cost: costNum,
      stage: newStage,
      date: newDate,
      photoBefore: photoBefore || undefined,
      photoAfter: photoAfter || undefined,
    };

    setDeals((prev: Deal[]) => [createdDeal, ...prev]);

    // Log Activity
    const newActivity: Activity = {
      id: generateActivityId(createdId, "add"),
      type: "contact",
      title: `Serviço cadastrado: ${createdDeal.serviceDescription}`,
      sub: `Cliente: ${createdDeal.clientName} | Estágio: ${createdDeal.stage} | Valor: R$ ${formatBRLValue(createdDeal.value)}`,
      time: "Agora mesmo",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);

    // Cleanup
    setClientSearch("");
    setNewDescription("");
    setNewValueStr("");
    setNewCostStr("");
    setPhotoBefore("");
    setPhotoAfter("");
    setSelectedDefaultDate();
    setNewStage("Proposta");
    setShowAddDeal(false);
  };

  const setSelectedDefaultDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setNewDate(`${yyyy}-${mm}-${dd}`);
  };

  // Delete option from pipeline
  const handleDeleteDeal = (id: string, description: string) => {
    setDeals((prev: Deal[]) => prev.filter((d: Deal) => d.id !== id));
    const newActivity: Activity = {
      id: generateActivityId(id, "delete"),
      type: "contact",
      title: `Serviço removido: ${description}`,
      sub: `Serviço removido do fluxo de trabalho.`,
      time: "Agora mesmo",
    };
    setActivities((v: Activity[]) => [newActivity, ...v]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Workflow</h1>
          <p className="text-sm text-on-surface-variant mt-1">Sintonize os estágios das suas oportunidades e processos com controle completo.</p>
        </div>
        <button
          onClick={() => {
            setSelectedDefaultDate();
            setShowAddDeal(true);
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          Novo Serviço
        </button>
      </div>

      {/* Mobile Stage Selector Tab bar */}
      <div className="md:hidden flex bg-white p-1 rounded-lg border border-slate-200/80 gap-1 shadow-xs select-none">
        {(["Todos", ...STAGES] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStageFilter(tab)}
            className={`flex-1 text-center py-2.5 rounded-md text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
              activeStageFilter === tab
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Kanban Stages Grid viewport */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
        {STAGES.filter((stage) => activeStageFilter === "Todos" || activeStageFilter === stage).map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage && (stage !== "Realizado" || isCurrentMonth(d.date)));
          const totalSum = getStageTotal(stage);

          // Customize colors for headers representing progression
          let headerColor = "border-t-slate-300";
          let badgeColor = "bg-slate-100 text-slate-800";
          if (stage === "Proposta") { headerColor = "border-t-amber-400"; badgeColor = "bg-amber-50 text-amber-700"; }
          if (stage === "Agendado") { headerColor = "border-t-indigo-500"; badgeColor = "bg-indigo-50 text-indigo-700"; }
          if (stage === "Realizado") { headerColor = "border-t-emerald-500"; badgeColor = "bg-emerald-50 text-emerald-700 font-bold"; }

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
                  Total: <span className="text-on-surface font-semibold">R$ {formatBRLValue(totalSum)}</span>
                </div>

                {/* Items wrapper */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white p-3 rounded-lg border border-outline-variant/35 shadow-xs hover:border-slate-800 transition-colors animate-fadeIn group">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{deal.clientName}</span>
                        <button
                          onClick={() => handleDeleteDeal(deal.id, deal.serviceDescription)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-600 font-bold hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{deal.serviceDescription}</p>
                      
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-500">Valor Cobrado:</span>
                          <span className="font-extrabold text-emerald-700">R$ {formatBRLValue(deal.value)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-500">Gasto p/ Realizar:</span>
                          <span className="font-semibold text-rose-600">R$ {formatBRLValue(deal.cost)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-dotted border-slate-200 pt-1">
                          <span className="text-slate-500">Saldo Líquido:</span>
                          <span className={`font-extrabold ${(deal.value - deal.cost) >= 0 ? "text-slate-800" : "text-rose-700"}`}>
                            R$ {formatBRLValue(deal.value - deal.cost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                          <span>Data do serviço:</span>
                          <span className="font-semibold">{deal.date}</span>
                        </div>

                        {/* Imagens de Evidência (Antes e Depois) */}
                        {(deal.photoBefore || deal.photoAfter) && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">Evidências do Serviço</span>
                            <div className="grid grid-cols-2 gap-2">
                              {deal.photoBefore ? (
                                <div 
                                  onClick={() => setActiveModalImage(deal.photoBefore!)}
                                  className="relative h-12 rounded bg-slate-50 border border-slate-200 overflow-hidden cursor-pointer group"
                                  title="Expandir Foto Antes"
                                >
                                  <img 
                                    src={deal.photoBefore} 
                                    alt="Antes" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                                    Antes
                                  </div>
                                </div>
                              ) : (
                                <div className="h-12 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[8px] text-slate-400 italic">
                                  Sem Foto Antes
                                </div>
                              )}

                              {deal.photoAfter ? (
                                <div 
                                  onClick={() => setActiveModalImage(deal.photoAfter!)}
                                  className="relative h-12 rounded bg-slate-50 border border-slate-200 overflow-hidden cursor-pointer group"
                                  title="Expandir Foto Depois"
                                >
                                  <img 
                                    src={deal.photoAfter} 
                                    alt="Depois" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-[#0d2a4a]/75 text-white text-[8px] font-bold text-center py-0.5">
                                    Depois
                                  </div>
                                </div>
                              ) : (
                                <div className="h-12 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[8px] text-slate-400 italic">
                                  Sem Foto Depois
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Direction arrow shift controls */}
                      <div className="flex justify-between items-center mt-3 pt-1 border-t border-dotted border-slate-200 bg-slate-50 px-1 py-0.5 rounded">
                        <button
                          onClick={() => handleMoveStage(deal.id, "prev")}
                          disabled={stage === "Proposta"}
                          className="text-xs font-bold hover:text-blue-600 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Voltar estágio"
                        >
                          ◀
                        </button>
                        <span className="text-[8px] uppercase tracking-wider text-outline font-semibold">Staging</span>
                        <button
                          onClick={() => handleMoveStage(deal.id, "next")}
                          disabled={stage === "Realizado"}
                          className="text-xs font-bold hover:text-blue-600 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Avançar estágio"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="text-[10px] text-outline text-center py-8 italic">Sem serviços ativos.</p>
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
              <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Serviço</h3>
              <button onClick={() => setShowAddDeal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              {/* Autocomplete do Cliente */}
              <div className="relative">
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente (ou busque na lista)..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientSuggestions(true);
                  }}
                  onFocus={() => setShowClientSuggestions(true)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                />
                {showClientSuggestions && (
                  <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => {
                          setClientSearch(contact.name);
                          setShowClientSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium border-b border-slate-100 last:border-b-0 cursor-pointer flex flex-col"
                      >
                        <span className="font-bold">{contact.name}</span>
                        <span className="text-[10px] text-slate-400">{contact.email}</span>
                      </button>
                    ))}
                    {filteredContacts.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500 italic">Nenhum cliente correspondente. Digite para criar novo.</div>
                    )}
                  </div>
                )}
                {showClientSuggestions && clientSearch.trim() !== "" && (
                  <div className="flex items-center justify-between text-[10px] bg-slate-100 px-2 py-1.5 rounded mt-1">
                    <span className="text-slate-600">Usando o nome digitado</span>
                    <button
                      type="button"
                      onClick={() => setShowClientSuggestions(false)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Confirmar
                    </button>
                  </div>
                )}
              </div>

              {/* Descrição do serviço */}
              <div>
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Descrição do Serviço</label>
                <textarea
                  required
                  placeholder="Ex: Lavagem de sofá retrátil 3 lugares com impermeabilização"
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium resize-none"
                />
              </div>

              {/* Data (preenchida automaticamente com data atual, editável) */}
              <div>
                <label className="text-[11px] font-bold text-slate-550 block mb-1">Data do Serviço</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                />
              </div>

              {/* Estágio Inicial */}
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

              {/* Valores em colunas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Valor Cobrado</label>
                  <input
                    type="text"
                    required
                    placeholder="R$ 0,00"
                    value={newValueStr}
                    onChange={(e) => setNewValueStr(formatToBRL(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Valor Gasto p/ Realizar <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={newCostStr}
                    onChange={(e) => setNewCostStr(formatToBRL(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-850 font-semibold"
                  />
                </div>
              </div>

              {/* Fotos do Serviço (Antes e Depois) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Foto Antes <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <div className="flex flex-col gap-2">
                    {photoBefore ? (
                      <div className="relative w-full h-24 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group">
                        <img src={photoBefore} alt="Antes Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoBefore("")}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                        <span className="text-lg">📷</span>
                        <span className="text-[9px] text-slate-500 font-bold mt-1">Carregar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, "before")}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Foto Depois <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <div className="flex flex-col gap-2">
                    {photoAfter ? (
                      <div className="relative w-full h-24 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group">
                        <img src={photoAfter} alt="Depois Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoAfter("")}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                        <span className="text-lg">📷</span>
                        <span className="text-[9px] text-slate-500 font-bold mt-1">Carregar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, "after")}
                        />
                      </label>
                    )}
                  </div>
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
                  Criar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* FULL SCREEN PHOTO LIGHT MODAL REVIEW */}
      {activeModalImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn cursor-zoom-out"
          onClick={() => setActiveModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeModalImage} 
              alt="Ampliada" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg" 
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
