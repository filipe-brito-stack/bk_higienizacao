'use client';

import React, { useState } from "react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

export default function SupportTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "model",
      content: "Olá Alex! Sou seu Treinador de Vendas e Assistência Administrativa Nexus CRM. Como posso te apoiar hoje com suas negociações, metas comerciais ou links diretos das suas imagens?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/gemini/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "model",
            content: data.reply,
          },
        ]);
      } else {
        throw new Error(data.error || "Support service response error.");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          content: "Lamentamos, mas ocorreu um erro temporário de comunicação com o servidor Gemini. Sincronize sua conexão e tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const FAQS = [
    { q: "Como configurar as metas do CRM?", a: "Acesse a aba 'Configurações' no menu lateral esquerdo para atualizar parâmetros de faturamento." },
    { q: "Posso alterar o link das minhas fotos?", a: "Sim, selecione 'Contatos' e clique em 'Imagem / Editar' para cadastrar URLs diretas de CDNs (Google, Unsplash ou Imgur)." },
    { q: "O faturamento atualiza sozinho?", a: "Sim, os indicadores e gráficos somam dinamicamente os negócios marcados como estágio 'Won' no Kanban." },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Suporte ao Vendedor</h1>
        <p className="text-sm text-on-surface-variant mt-1">Esclareça dúvidas operacionais com o Gemini AI Co-Pilot em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat box viewport */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-outline-variant/35 shadow-sm flex flex-col justify-between h-[520px]">
          {/* Messages listing */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] text-xs ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Visual Initials icons */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm border ${
                  m.role === "user" ? "bg-slate-900 text-white border-slate-950" : "bg-blue-600 text-white border-blue-500"
                }`}>
                  {m.role === "user" ? "AL" : "AI"}
                </div>

                <div className={`p-3.5 rounded-xl border leading-relaxed font-semibold ${
                  m.role === "user"
                    ? "bg-slate-900 text-white border-slate-950 rounded-tr-none"
                    : "bg-white text-slate-800 border-outline-variant/30 rounded-tl-none whitespace-pre-wrap shadow-xs"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 italic font-semibold">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                Gemini está elaborando resposta executiva...
              </div>
            )}
          </div>

          {/* Quick Chat Input box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              required
              placeholder="Pergunte ao Gemini: 'Como aumentar minhas vendas hoje?'"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-850"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Enviar dúvida
            </button>
          </form>
        </div>

        {/* Static interactive Onboarding FAQs */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-outline-variant/35 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Guias Rápidos Recomendados</h3>
          
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 text-xs">
                <span className="font-extrabold text-slate-900 block mb-1">❓ {faq.q}</span>
                <p className="text-slate-650 leading-relaxed text-[11px] font-medium">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg text-[10px] leading-relaxed">
            <strong>Dica de Produtividade:</strong> Digite uma dúvida relacionada a prospecção de leads frios para o Gemini traçar modelos de gatilhos corporativos.
          </div>
        </div>
      </div>
    </div>
  );
}
