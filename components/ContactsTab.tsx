'use client';

import React, { useState } from "react";
import { Contact, Activity } from "@/lib/types";
import { Search } from "lucide-react";

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
  const [newStatus, setNewStatus] = useState<"Customer" | "Lead">("Customer");
  const [newPhone, setNewPhone] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [newBirthMonth, setNewBirthMonth ] = useState("");
  const [newBirthYear, setNewBirthYear] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Contact Editing / Direct Link Manager States
  const [editableContact, setEditableContact] = useState<Contact | null>(null);
  const [editBirthDateInput, setEditBirthDateInput] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Helper to format/validate birth date as DD/MM
  const handleBirthDateInputChange = (val: string, isEdit: boolean) => {
    // Strip non-numbers
    const cleanNumbers = val.replace(/\D/g, "");
    // Limit to 4 characters (DDMM)
    const limited = cleanNumbers.slice(0, 4);
    
    let formatted = "";
    let day = "";
    let month = "";
    
    if (limited.length > 0) {
      day = limited.slice(0, 2);
      if (limited.length > 2) {
        month = limited.slice(2, 4);
        formatted = `${day}/${month}`;
      } else {
        formatted = day;
      }
    }
    
    if (isEdit) {
      setEditBirthDateInput(formatted);
      if (editableContact) {
        setEditableContact({
          ...editableContact,
          birthMonth: day || undefined,
          birthYear: month || undefined,
        });
      }
    } else {
      setBirthDateInput(formatted);
      setNewBirthMonth(day);
      setNewBirthYear(month);
    }
  };



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
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    // Filter by inactive if requested from the AI panel
    const matchesInactive = !filterInactiveOnly || 
      c.lastContact.includes("Oct") || 
      c.lastContact.includes("Out") || 
      c.lastContact.toLowerCase().includes("days") || 
      c.lastContact.toLowerCase().includes("dias");

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

  // Geolocation Grabber helper
  const captureCurrentLocation = (isEdit: boolean) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocalização não é suportada por este dispositivo.");
      return;
    }

    if (isEdit) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEditableContact((prev) =>
            prev
              ? {
                  ...prev,
                  latitude,
                  longitude,
                  address: prev.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                }
              : null
          );
          alert("Sua localização atual aproximada foi capturada com sucesso!");
        },
        (error) => {
          console.error("Erro ao obter geolocalização:", error);
          alert("Não foi possível acessar a localização. Verifique as permissões de GPS.");
        }
      );
    } else {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setNewLatitude(latitude);
          setNewLongitude(longitude);
          setNewAddress((prev) => prev || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsLocating(false);
          alert("Sua localização atual aproximada foi capturada com sucesso!");
        },
        (error) => {
          console.error("Erro ao obter geolocalização:", error);
          alert("Não foi possível acessar a localização. Verifique as permissões de GPS.");
          setIsLocating(false);
        }
      );
    }
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newContact: Contact = {
      id: Math.random().toString(),
      name: newName,
      email: newEmail,
      company: "",
      role: "",
      status: newStatus,
      lastContact: "Recém adicionado",
      avatarUrl: newAvatarUrl || AVATAR_PRESETS[2].url,
      phone: newPhone || "+1 (555) 000-0000",
      owner: "Eu",
      birthMonth: newBirthMonth || undefined,
      birthYear: newBirthYear || undefined,
      address: newAddress || undefined,
      latitude: newLatitude !== null ? newLatitude : undefined,
      longitude: newLongitude !== null ? newLongitude : undefined,
    };

    setContacts((prev) => [newContact, ...prev]);

    // Log Activity
    const newActivity: Activity = {
      id: Math.random().toString(),
      type: "contact",
      title: `Novo Cliente Criado: ${newContact.name}`,
      sub: `Adicionado como representante dinâmico`,
      time: "Agora mesmo",
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Reset Creation Fields
    setNewName("");
    setNewEmail("");
    setNewCompany("");
    setNewRole("");
    setNewPhone("");
    setNewAvatarUrl("");
    setNewBirthMonth("");
    setNewBirthYear("");
    setNewAddress("");
    setNewLatitude(null);
    setNewLongitude(null);
    setBirthDateInput("");
    setShowAddModal(false);
  };

  // Open edit modal and initialize state
  const handleOpenEditModal = (contact: Contact) => {
    setEditableContact(contact);
    if (contact.birthMonth && contact.birthYear) {
      setEditBirthDateInput(`${contact.birthMonth}/${contact.birthYear}`);
    } else {
      setEditBirthDateInput("");
    }
    setShowEditModal(true);
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
      title: `Perfil do Cliente Modificado: ${editableContact.name}`,
      sub: `Links diretos de avatar e parâmetros sincronizados`,
      time: "Agora mesmo",
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
      title: `Cliente Excluído: ${backupName}`,
      sub: `Removido do banco de dados com segurança`,
      time: "Agora mesmo",
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (showEditModal) {
      setShowEditModal(false);
      setEditableContact(null);
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
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all active:scale-95 self-start sm:self-auto shadow-md hover:shadow-lg cursor-pointer"
        >
          Adicionar Cliente
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
            <strong>Filtro Inteligente Ativo:</strong> Exibindo apenas clientes inativos sem contato recente nos últimos 7 dias.
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline/70 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por nome..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-outline-variant/40 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none w-44 md:w-56"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(["All", "Customer", "Lead"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status === "All" ? "Todos" : status === "Customer" ? "Clientes" : "Leads"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs justify-between md:justify-end">
          <span className="text-on-surface-variant font-medium">{filteredContacts.length} clientes encontrados</span>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("All"); clearFilters(); }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Main Table / Mobile Cards view */}
      <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant/40 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              <tr>
                <th className="px-6 py-4">Nome / Email</th>
                <th className="px-6 py-4">Aniversário</th>
                <th className="px-6 py-4">Endereço / Localização</th>
                <th className="px-6 py-4">Último contato</th>
                <th className="px-6 py-4 text-right">Ação executiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs text-slate-700">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-outline italic">
                    Nenhum cliente coincide com os filtros configurados.
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
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-on-surface block hover:underline cursor-pointer" onClick={() => handleOpenEditModal(contact)}>
                            {contact.name}
                          </span>
                          <span className="text-[10px] text-outline tracking-tight mt-0.5 block">{contact.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">
                        {contact.birthMonth && contact.birthYear ? (
                          <span>{contact.birthMonth}/{contact.birthYear}</span>
                        ) : (
                          <span className="text-slate-400 italic">Não informado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium max-w-[180px] truncate">
                        {contact.address ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="truncate" title={contact.address}>{contact.address}</span>
                            {contact.latitude !== undefined && contact.longitude !== undefined && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${contact.latitude},${contact.longitude}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[9px] text-blue-600 hover:text-blue-850 hover:underline flex items-center gap-0.5 font-bold"
                              >
                                📍 Ver no mapa
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Não informado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{contact.lastContact}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                           <button
                            onClick={() => handleOpenEditModal(contact)}
                            className="p-1 px-1.5 hover:bg-slate-100 hover:text-black rounded text-[11px] font-bold transition-all text-outline"
                            title="Editar detalhes do cliente"
                          >
                            Editar
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

        {/* Mobile / Tablet Card View */}
        <div className="block sm:hidden divide-y divide-slate-100 overflow-y-auto">
          {paginatedContacts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-xs">
              Nenhum cliente coincide com os filtros configurados.
            </div>
          ) : (
            paginatedContacts.map((contact) => (
              <div key={contact.id} className="p-4 space-y-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span 
                      onClick={() => handleOpenEditModal(contact)}
                      className="font-bold text-slate-900 text-xs block hover:underline cursor-pointer"
                    >
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{contact.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    contact.status === "Customer" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {contact.status === "Customer" ? "Cliente" : "Lead"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 pt-1 font-medium border-t border-slate-50">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] mb-0.5">Aniversário</span>
                    <span>{contact.birthMonth && contact.birthYear ? `${contact.birthMonth}/${contact.birthYear}` : <span className="text-slate-300 italic">Não informado</span>}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] mb-0.5">Último Contato</span>
                    <span>{contact.lastContact}</span>
                  </div>
                </div>

                {contact.address && (
                  <div className="text-[10px] text-slate-500 border-t border-slate-50 pt-1.5">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] mb-0.5">Endereço</span>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <span className="truncate block max-w-xs">{contact.address}</span>
                      {contact.latitude !== undefined && contact.longitude !== undefined && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${contact.latitude},${contact.longitude}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[9px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                        >
                          📍 Ver localização no mapa
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => handleOpenEditModal(contact)}
                    className="px-3.5 py-1.5 bg-slate-100 active:bg-slate-200 text-slate-700 font-bold transition-all rounded-md text-[10px] h-9 flex items-center justify-center min-w-[70px]"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
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

      {/* EDIT MODAL */}
      {showEditModal && editableContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Editar Cliente</h3>
              <button onClick={() => { setShowEditModal(false); setEditableContact(null); }} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateContact} className="space-y-4">
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
                  <label className="text-[11px] font-bold text-slate-555 block mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={editableContact.phone || ""}
                    onChange={(e) => setEditableContact({ ...editableContact, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                {/* Aniversário (Dia e Mês) - EDIT */}
                <div>
                  <label className="text-[11px] font-bold text-slate-550 block mb-1">Aniversário (DD/MM)</label>
                  <input
                    type="text"
                    placeholder="Ex: 25/12"
                    value={editBirthDateInput}
                    onChange={(e) => handleBirthDateInputChange(e.target.value, true)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>



              {/* Endereço com Geolocalização Opcional - EDIT */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-550">Endereço</label>
                  <button
                    type="button"
                    onClick={() => captureCurrentLocation(true)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer font-bold border border-slate-200"
                  >
                    📍 Obter Localização Atual
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Cidade..."
                  value={editableContact.address || ""}
                  onChange={(e) => setEditableContact({ ...editableContact, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-between border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteContact(editableContact.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors border border-rose-100 cursor-pointer"
                >
                  Excluir Cliente
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
              <h3 className="text-base font-bold text-slate-900">Adicionar Novo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Nome</label>
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
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    placeholder="+55 (11) 99999-9999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>

                {/* Aniversário (Dia e Mês) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-505 block mb-1">Aniversário (DD/MM)</label>
                  <input
                    type="text"
                    placeholder="Ex: 25/12"
                    value={birthDateInput}
                    onChange={(e) => handleBirthDateInputChange(e.target.value, false)}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-3 py-1.5 rounded text-xs focus:bg-white outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>



              {/* Endereço com Geolocalização Opcional */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500">Endereço</label>
                  <button
                    type="button"
                    onClick={() => captureCurrentLocation(false)}
                    disabled={isLocating}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50 font-bold border border-slate-200"
                  >
                    📍 {isLocating ? "Obtendo GPS..." : "Capturar Localização Atual"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Cidade..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
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
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
