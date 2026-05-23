'use client';

import React, { useState } from "react";
import { Contact, Activity } from "@/lib/types";

interface ContactsTabProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  filterInactiveOnly: boolean;
  clearFilters: () => void;
}

export default function ContactsTab({
  contacts,
  setContacts,
  setActivities,
  filterInactiveOnly,
  clearFilters,
}: ContactsTabProps) {
  // Search & Basic Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Customer" | "Lead">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Contact Creation States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState<"Customer" | "Lead">("Lead");
  const [newPhone, setNewPhone] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  // Contact Editing / Direct Link Manager States
  const [editableContact, setEditableContact] = useState<Contact | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Gemini AI Draft States
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string; body: string } | null>(null);
  const [draftTone, setDraftTone] = useState("Professional yet Warm");
  const [activeDraftContact, setActiveDraftContact] = useState<Contact | null>(null);
  const [isOpenDraftModal, setIsOpenDraftModal] = useState(false);

  // Predefined professional avatar CDN presets
  const AVATAR_PRESETS = [
    { name: "Executive 1 (Mockup Default 1)", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCarguWrWz5TWuyV6J_UVDN5rwVyzWcZMTtr52bjn07D7M9xSdszI53dsc5UF585772DUC5tWmmbHW55R7ThXndO9RlF_e6oI6SyhTXr9W1yTbwdiUO9Bglwg74xc8lGjvrINyxai500AmXaOvTlxAZUwmPf5pvVLcdJu9oJoeJ78_a37zTkMzjS6e4M0nZMgHfm3kB6XFBkxL3rwY0QlUsbiRTcbIylcaywtB6k9EukHfT19o1-PZYQOeK-TLPzKcY6LLKx0-VKqg" },
    { name: "Executive 2 (Mockup Default 2)", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMzDxcw3E8i9B8dw3x535fnmjuUd0cwm7y5QHCMpSmqVaKWPjW4T89mjRqi_R91t3WoKpNsx90j19uGNnM74LsuzeXzvFWt5O5ElcPAUrZ9IkRm6q8zP8NL300z8eIlu6GR8ObbX7eVunGyMfJ1gLYoFnIUL0QizMN7SpFJT4h8LVHzo5g7nkioGrEjeMG_VOjEA_G6fA56gSi8LrLP6y7wCn1jaNi4eC4QVoVmldIXmesJBor_U1pUPWp6bJUgg81gKLKvm5mqmQ" },
    { name: "Male executive blue suit", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80" },
    { name: "Female advisor corporate", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" },
  ];

  // Filters logic
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    // Filter by inactive if requested from the AI panel
    const matchesInactive = !filterInactiveOnly || c.lastContact.includes("Oct") || c.lastContact.includes("Days");

    return matchesSearch && matchesStatus && matchesInactive;
  });

  // Pagination logic
  const totalItems = filteredContacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  // Trigger quick notifications
  const triggerCopyNotification = (label: string) => {
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newCompany.trim()) return;

    const newContact: Contact = {
      id: Math.random().toString(),
      name: newName,
      email: newEmail,
      company: newCompany,
      role: newRole || "Advisor",
      status: newStatus,
      lastContact: "Just added",
      avatarUrl: newAvatarUrl || AVATAR_PRESETS[2].url,
      phone: newPhone || "+1 (555) 000-0000",
      owner: "Me",
    };

    setContacts((prev) => [newContact, ...prev]);

    // Log Activity
    const newActivity: Activity = {
      id: Math.random().toString(),
      type: "contact",
      title: `New Contact Created: ${newContact.name}`,
      sub: `Added as dynamic <b>${newContact.status}</b> to represent ${newContact.company}`,
      time: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Reset Creation Fields
    setNewName("");
    setNewEmail("");
    setNewCompany("");
    setNewRole("");
    setNewPhone("");
    setNewAvatarUrl("");
    setShowAddModal(false);
  };

  // Edit/Direct Link Update Handler
  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableContact) return;

    setContacts((prev) =>
      prev.map((c) => (c.id === editableContact.id ? editableContact : c))
    );

    // Log action
    const newActivity: Activity = {
      id: Math.random().toString(),
      type: "contact",
      title: `Contact profiles modified: ${editableContact.name}`,
      sub: `Direct avatar links and parameters synchronized`,
      time: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev]);

    setShowEditModal(false);
    setEditableContact(null);
  };

  // Delete Contact
  const handleDeleteContact = (contactId: string) => {
    const backupName = contacts.find((c) => c.id === contactId)?.name || "Contact";
    setContacts((prev) => prev.filter((c) => c.id !== contactId));

    // Log action
    const newActivity: Activity = {
      id: Math.random().toString(),
      type: "contact",
      title: `Contact deleted: ${backupName}`,
      sub: `Removed from database securely`,
      time: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (showEditModal) {
      setShowEditModal(false);
      setEditableContact(null);
    }
  };

  // Gemini Email generator trigger
  const handleOpenEmailDrafter = (contact: Contact) => {
    setActiveDraftContact(contact);
    setGeneratedDraft(null);
    setIsOpenDraftModal(true);
  };

  const executeDraftEmail = async () => {
    if (!activeDraftContact) return;
    setAiDraftLoading(true);
    try {
      const response = await fetch("/api/gemini/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: activeDraftContact,
          tone: draftTone,
          senderName: "Alex (Nexus CRM)",
        }),
      });
      const data = await response.json();
      if (data.success && data.email) {
        setGeneratedDraft(data.email);
      } else {
        throw new Error(data.error || "Gemini service draft error.");
      }
    } catch (err) {
      setGeneratedDraft({
        subject: `Follow-up comercial: Nexus CRM & ${activeDraftContact.company}`,
        body: `Prezado(a) ${activeDraftContact.name},\n\nGostaria de retomar nosso contato anterior para entender como estão as etapas operacionais em relação aos briefings definidos para a ${activeDraftContact.company}.\n\nComo ${activeDraftContact.role}, acreditamos que sua visão técnica agregaria enorme eficiência no alinhamento do projeto Nexus.\n\nFico no aguardo de uma breve confirmação para agendarmos 10 minutos na próxima terça.\n\nCordialmente,\nAlex\nNexus CRM Director`,
      });
    } finally {
      setAiDraftLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Diretório de Clientes</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gerencie leads, contatos corporativos e visualize links diretos das suas imagens.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary hover:bg-slate-900 text-on-primary rounded-lg text-xs font-bold transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          Add Contact
        </button>
      </div>

      {/* Active notification for copy action */}
      {copiedNotification && (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs flex justify-between items-center shadow-lg animate-fadeIn">
          <span>✔️ {copiedNotification}</span>
          <button onClick={() => setCopiedNotification(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Inactive Alert Banner */}
      {filterInactiveOnly && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-850 flex justify-between items-center">
          <div>
            <strong>Filtro Inteligente Ativo:</strong> Exibindo apenas contatos inativos sem contato recente nos últimos 7 dias.
          </div>
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 font-bold rounded-lg transition-colors"
          >
            Ver Todos
          </button>
        </div>
      )}

      {/* Table Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-outline-variant/35 rounded-lg">
            <button
              onClick={() => { setStatusFilter("All"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${statusFilter === "All" ? "bg-white text-on-surface shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Todos
            </button>
            <button
              onClick={() => { setStatusFilter("Customer"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${statusFilter === "Customer" ? "bg-white text-emerald-700 shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Customer
            </button>
            <button
              onClick={() => { setStatusFilter("Lead"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${statusFilter === "Lead" ? "bg-white text-blue-700 shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Leads
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-outline">search</span>
            <input
              type="text"
              placeholder="Filtrar por nome, empresa..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-outline-variant/40 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none w-48 md:w-60"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs justify-between md:justify-end">
          <span className="text-on-surface-variant font-medium">{filteredContacts.length} contatos encontrados</span>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("All"); clearFilters(); }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12">Id</th>
                <th className="px-6 py-4">Nome completo / Email</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Cargo comercial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Último contato</th>
                <th className="px-6 py-4 text-right">Ação executiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-outline italic">
                    Nenhum contato coincide com os filtros configurados.
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact, index) => {
                  const avatarInitials = contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4 text-outline font-medium">#{startIndex + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.name}
                              className="w-9 h-9 rounded-full object-cover border border-outline-variant/40"
                              onError={(e) => {
                                // fallback to initials if image link breaks
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                              {avatarInitials}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-on-surface block hover:underline cursor-pointer" onClick={() => { setEditableContact(contact); setShowEditModal(true); }}>
                              {contact.name}
                            </span>
                            <span className="text-[10px] text-outline tracking-tight mt-0.5 block">{contact.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{contact.company}</td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{contact.role}</td>
                      <td className="px-6 py-4">
                        {contact.status === "Customer" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                            Customer
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                            Lead
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{contact.lastContact}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* AI Email draft button */}
                          <button
                            onClick={() => handleOpenEmailDrafter(contact)}
                            className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 hover:text-blue-800 rounded text-[10px] font-bold transition-all text-on-surface-variant flex items-center gap-1 cursor-pointer"
                            title="Escrever email com IA de vendas"
                          >
                            <span className="material-symbols-outlined text-xs">mail</span>
                            Pitch IA
                          </button>
                          <button
                            onClick={() => { setEditableContact(contact); setShowEditModal(true); }}
                            className="p-1 px-1.5 hover:bg-slate-100 hover:text-black rounded text-[11px] font-bold transition-all text-outline"
                            title="Gerenciar links diretos e detalhes"
                          >
                            Imagem / Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-on-surface-variant">
          <span>Mostrando {paginatedContacts.length} de {filteredContacts.length} entradas</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 border border-slate-200 hover:bg-white rounded disabled:opacity-40"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded ${currentPage === i + 1 ? "bg-slate-900 text-white font-bold" : "hover:bg-white text-on-surface-variant border border-transparent hover:border-slate-200"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-2 border border-slate-200 hover:bg-white rounded disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL / DIRECT IMAGE LINK MANAGER */}
      {showEditModal && editableContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Gerenciar Contato & Links de Imagens</h3>
              <button onClick={() => { setShowEditModal(false); setEditableContact(null); }} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                {editableContact.avatarUrl ? (
                  <img
                    src={editableContact.avatarUrl}
                    alt={editableContact.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    JD
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{editableContact.name}</h4>
                  <p className="text-xs text-slate-500">{editableContact.company || "Sem Empresa"}</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                    Imagem de perfil ativa
                  </p>
                </div>
              </div>

              {/* Direct links parameters section */}
              <div className="space-y-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">link</span>
                    Link Direto da Imagem no HTML
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editableContact.avatarUrl || "");
                        triggerCopyNotification("Link direto copiado para a área de transferência!");
                      }}
                      className="text-[10px] font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Copiar Link
                    </button>
                    {editableContact.avatarUrl && (
                      <a
                        href={editableContact.avatarUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[10px] font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-200 px-2 py-0.5 rounded inline-block cursor-pointer"
                      >
                        Visualizar noutra aba ↗
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-blue-900 leading-relaxed">
                  Insira abaixo qualquer URL pública direta de arquivo de imagem (PNG, JPG, SVG, ou CDN como Google UserContent / Unsplash). O CRM interpretará as tags HTML para renderização nativa.
                </p>

                <input
                  type="url"
                  placeholder="Ex: https://picsum.photos/seed/alex/100"
                  value={editableContact.avatarUrl || ""}
                  onChange={(e) => setEditableContact({ ...editableContact, avatarUrl: e.target.value })}
                  className="w-full bg-white border border-blue-200 px-3 py-1.5 rounded text-xs outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
                />

                {/* Preset selectors to simplify user experience */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">CDN Presets Rápidos de Fotos Corporativas:</span>
                  <div className="flex flex-col gap-1">
                    {AVATAR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditableContact({ ...editableContact, avatarUrl: preset.url })}
                        className="text-[10px] text-left hover:text-blue-800 text-slate-600 bg-white p-1 px-2 border border-slate-100 hover:border-blue-200 rounded text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard text elements editing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editableContact.name}
                    onChange={(e) => setEditableContact({ ...editableContact, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={editableContact.email}
                    onChange={(e) => setEditableContact({ ...editableContact, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Empresa</label>
                  <input
                    type="text"
                    required
                    value={editableContact.company}
                    onChange={(e) => setEditableContact({ ...editableContact, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Cargo Comercial</label>
                  <input
                    type="text"
                    required
                    value={editableContact.role}
                    onChange={(e) => setEditableContact({ ...editableContact, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={editableContact.phone || ""}
                    onChange={(e) => setEditableContact({ ...editableContact, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Status de Relacionamento</label>
                  <select
                    value={editableContact.status}
                    onChange={(e) => setEditableContact({ ...editableContact, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-bold"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-between border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteContact(editableContact.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors border border-rose-100 cursor-pointer"
                >
                  Excluir Contato
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditableContact(null); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    Salvar Sincronização
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900">Adicionar Novo Contato Executivo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="joao@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Empresa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Acme S/A"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Cargo Comercial</label>
                  <input
                    type="text"
                    placeholder="Ex: Diretor de Compras"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    placeholder="+55 (11) 99999-9999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-bold"
                  >
                    <option value="Lead">Lead (Negociação)</option>
                    <option value="Customer">Customer (Fechado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">URL Direta para Imagem de Perfil (Opcional)</label>
                <input
                  type="url"
                  placeholder="Deixe em branco para usar placeholder de avatar do sistema"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Criar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GEMINI PITCH/EMAIL GENERATOR MODAL */}
      {isOpenDraftModal && activeDraftContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl p-6">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">ambient_lighting</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Roteiro de E-mail Inteligente Gemini</h3>
                  <p className="text-[10px] text-slate-500">Desenvolva pitches e follow-ups gerados de acordo com os atributos de {activeDraftContact.name}.</p>
                </div>
              </div>
              <button
                onClick={() => { setIsOpenDraftModal(false); setActiveDraftContact(null); setGeneratedDraft(null); }}
                className="text-slate-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                <div>
                  <span className="text-outline text-[10px] block font-bold uppercase tracking-wider">Destinatário</span>
                  <span className="font-bold text-slate-800">{activeDraftContact.name} ({activeDraftContact.company})</span>
                </div>
                <div>
                  <span className="text-outline text-[10px] block font-bold uppercase tracking-wider">Cargo/Status</span>
                  <span className="font-semibold text-slate-700">{activeDraftContact.role} • {activeDraftContact.status}</span>
                </div>
              </div>

              {/* Configure Tone selection */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-150">
                <span className="text-xs font-bold text-slate-700">Tom da Conversa:</span>
                <select
                  value={draftTone}
                  onChange={(e) => setDraftTone(e.target.value)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 px-3 py-1 rounded font-semibold outline-none"
                >
                  <option value="Professional yet Warm">Profissional e Caloroso (Ideal)</option>
                  <option value="Direct and Corporate">Direto e Corporativo</option>
                  <option value="Very Formal Enterprise">Formal Executivo (Enterprise)</option>
                  <option value="Urgent commercial pitch">Urgente / Gatilho Mental</option>
                </select>
              </div>

              {generatedDraft ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">Linha de Assunto:</span>
                    <p className="font-bold text-slate-900">{generatedDraft.subject}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-60 overflow-y-auto text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                    {generatedDraft.body}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        const fullEmailCopy = `Assunto: ${generatedDraft.subject}\n\n${generatedDraft.body}`;
                        navigator.clipboard.writeText(fullEmailCopy);
                        triggerCopyNotification("Copiado com sucesso para a área de transferência!");
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Copiar Conteúdo
                    </button>
                    <button
                      onClick={() => setGeneratedDraft(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Refazer Ajustes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  {aiDraftLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-600 font-semibold mt-1">Sintonizando com Gemini no Servidor...</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-600 mb-4 max-w-sm mx-auto leading-relaxed">
                        Gerar um pitch personalizado com o Gemini consome o histórico comercial sincronizado para preencher as variáveis do HTML corporativo.
                      </p>
                      <button
                        onClick={executeDraftEmail}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        Gerar Email Preditivo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
