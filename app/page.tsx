'use client';

import React, { useState, useEffect } from "react";
import { Contact, Deal, Task, Activity, CRMGoals } from "@/lib/types";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  Handshake, 
  Settings, 
  Search, 
  Plus, 
  Bell, 
  Sparkles,
  Menu,
  X,
  Lock,
  User,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modules
import DashboardTab from "@/components/DashboardTab";
import ContactsTab from "@/components/ContactsTab";
import PipelineTab from "@/components/PipelineTab";
import DealsTab from "@/components/DealsTab";
import SettingsTab from "@/components/SettingsTab";

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Jane Doe",
    email: "jane.doe@acme.corp",
    company: "Acme Corporation",
    role: "Senior VP Sales",
    status: "Customer",
    lastContact: "Há 2 horas",
    phone: "+1 (555) 234-5678",
    owner: "Me",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCarguWrWz5TWuyV6J_UVDN5rwVyzWcZMTtr52bjn07D7M9xSdszI53dsc5UF585772DUC5tWmmbHW55R7ThXndO9RlF_e6oI6SyhTXr9W1yTbwdiUO9Bglwg74xc8lGjvrINyxai500AmXaOvTlxAZUwmPf5pvVLcdJu9oJoeJ78_a37zTkMzjS6e4M0nZMgHfm3kB6XFBkxL3rwY0QlUsbiRTcbIylcaywtB6k9EukHfT19o1-PZYQOeK-TLPzKcY6LLKx0-VKqg"
  },
  {
    id: "c2",
    name: "Michael Wood",
    email: "m.wood@techstart.io",
    company: "TechStart Inc.",
    role: "CTO",
    status: "Lead",
    lastContact: "Ontem",
    phone: "+1 (555) 876-5432",
    owner: "Sarah Miller",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMzDxcw3E8i9B8dw3x535fnmjuUd0cwm7y5QHCMpSmqVaKWPjW4T89mjRqi_R91t3WoKpNsx90j19uGNnM74LsuzeXzvFWt5O5ElcPAUrZ9IkRm6q8zP8NL300z8eIlu6GR8ObbX7eVunGyMfJ1gLYoFnIUL0QizMN7SpFJT4h8LVHzo5g7nkioGrEjeMG_VOjEA_G6fA56gSi8LrLP6y7wCn1jaNi4eC4QVoVmldIXmesJBor_U1pUPWp6bJUgg1gKLKvm5mqmQ"
  },
  {
    id: "c3",
    name: "Sarah Hughes",
    email: "s.hughes@globalweb.com",
    company: "GlobalWeb",
    role: "Head of Operations",
    status: "Lead",
    lastContact: "12 de Out, 2023",
    phone: "+1 (555) 345-6789",
    owner: "Me",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "c4",
    name: "Robert King",
    email: "robert@fincloud.biz",
    company: "FinCloud",
    role: "Procurement Director",
    status: "Customer",
    lastContact: "08 de Out, 2023",
    phone: "+1 (555) 987-6543",
    owner: "Sarah Miller",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "c5",
    name: "Emily Lewis",
    email: "emily@nexus.design",
    company: "Nexus Design",
    role: "Creative Lead",
    status: "Lead",
    lastContact: "05 de Out, 2023",
    phone: "+1 (555) 456-7890",
    owner: "Me",
    avatarUrl: "https://picsum.photos/seed/emily/120/120"
  }
];

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1",
    clientName: "Jane Doe",
    serviceDescription: "Higienização Completa de Sofá de Canto",
    value: 450,
    cost: 80,
    stage: "Proposta",
    date: "2026-05-24",
    owner: "Alex"
  },
  {
    id: "d2",
    clientName: "Robert King",
    serviceDescription: "Impermeabilização de Estofados",
    value: 600,
    cost: 150,
    stage: "Realizado",
    date: "2026-05-23",
    owner: "Sarah Miller"
  },
  {
    id: "d3",
    clientName: "Michael Wood",
    serviceDescription: "Lavagem e Secagem de Tapetes Persas",
    value: 1200,
    cost: 300,
    stage: "Proposta",
    date: "2026-05-24",
    owner: "Alex"
  },
  {
    id: "d4",
    clientName: "Sarah Hughes",
    serviceDescription: "Higienização Automotiva e Polimento",
    value: 850,
    cost: 180,
    stage: "Agendado",
    date: "2026-05-24",
    owner: "Alex"
  },
  {
    id: "d5",
    clientName: "Emily Lewis",
    serviceDescription: "Limpeza de Colchão Casal King",
    value: 350,
    cost: 50,
    stage: "Proposta",
    date: "2026-05-24",
    owner: "Alex"
  },
  {
    id: "d6",
    clientName: "Robert King",
    serviceDescription: "Higienização de Poltronas e Cadeiras",
    value: 950,
    cost: 160,
    stage: "Realizado",
    date: "2026-05-20",
    owner: "Sarah Miller"
  },
  {
    id: "d7",
    clientName: "Emily Lewis",
    serviceDescription: "Limpeza de Cortinas e Persianas",
    value: 700,
    cost: 120,
    stage: "Realizado",
    date: "2026-05-10",
    owner: "Alex"
  },
  {
    id: "d8",
    clientName: "Jane Doe",
    serviceDescription: "Higienização Pós-Obra Residencial",
    value: 2500,
    cost: 650,
    stage: "Realizado",
    date: "2026-05-02",
    owner: "Alex"
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Acompanhamento com TechFlow Inc.",
    associatedWith: "Serviço: Higienização Completa (Estágio: Proposta)",
    completed: false,
    priority: "Urgent",
    dueDate: "Hoje",
    value: 1250.00
  },
  {
    id: "t2",
    title: "Revisar contrato trimestral - Zenith",
    associatedWith: "Suporte Recorrente Zenith",
    completed: false,
    priority: "Medium",
    dueDate: "Em 2 dias",
    value: 450.00
  },
  {
    id: "t3",
    title: "Enviar apresentação institucional para Spark Labs",
    associatedWith: "Lead recebida pelo Website",
    completed: false,
    priority: "Low",
    dueDate: "Próxima semana"
  },
  {
    id: "t4",
    title: "Alinhamento da equipe: Estratégia de Vendas T4",
    associatedWith: "Sala de Reuniões Nexus - Sala 3",
    completed: false,
    priority: "Medium",
    dueDate: "Hoje às 15:00"
  }
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "closed",
    title: "Serviço Fechado: Projeto Aurora (R$ 42.000)",
    sub: "Fechado por <b>Sarah Miller</b> • Há 2 horas",
    time: "Há 2 horas"
  },
  {
    id: "a2",
    type: "email",
    title: "E-mail Aberto: Proposta para Global Logistics Ltd",
    sub: "Enviado por <b>Você</b> • Há 4 horas",
    time: "Há 4 horas"
  },
  {
    id: "a3",
    type: "contact",
    title: "Novo Cliente Adicionado: Robert Fox",
    sub: "Empresa: <b>Atlas Group</b> • Há 6 horas",
    time: "Há 6 horas"
  },
  {
    id: "a4",
    type: "call",
    title: "Ligação Realizada: Acompanhamento com Cyberdyne",
    sub: "Duração: 12m 40s • Ontem",
    time: "Ontem"
  }
];

const INITIAL_GOALS: CRMGoals = {
  monthlyRevenueTarget: 1500000,
  monthlyRevenueReached: 1284500,
  newCustomersTarget: 200,
  newCustomersReached: 130,
  leadQualityScore: 94
};

export default function RootPage() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<
    "dashboard" | "pipeline" | "contacts" | "deals" | "settings"
  >("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // CRM State databases
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [goals, setGoals] = useState<CRMGoals>(INITIAL_GOALS);

  // Active user details
  const [profileName, setProfileName] = useState("Bruno");
  const [profilePic, setProfilePic] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCarguWrWz5TWuyV6J_UVDN5rwVyzWcZMTtr52bjn07D7M9xSdszI53dsc5UF585772DUC5tWmmbHW55R7ThXndO9RlF_e6oI6SyhTXr9W1yTbwdiUO9Bglwg74xc8lGjvrINyxai500AmXaOvTlxAZUwmPf5pvVLcdJu9oJoeJ78_a37zTkMzjS6e4M0nZMgHfm3kB6XFBkxL3rwY0QlUsbiRTcbIylcaywtB6k9EukHfT19o1-PZYQOeK-TLPzKcY6LLKx0-VKqg"
  );

  // Filter inactive trigger (from AI widget)
  const [filterInactiveOnly, setFilterInactiveOnly] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Handle client-side state hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      /* eslint-disable react-hooks/set-state-in-effect */
      try {
        const cachedContacts = localStorage.getItem("nexus_contacts");
        if (cachedContacts) {
          const parsed = JSON.parse(cachedContacts);
          if (Array.isArray(parsed)) {
            const seenContacts = new Set<string>();
            const filtered = parsed.filter((c: any) => {
              if (!c || !c.id) return false;
              if (seenContacts.has(c.id)) return false;
              seenContacts.add(c.id);
              return true;
            });
            setContacts(filtered);
          }
        }
      } catch (e) {
        console.error("Error loading cached contacts", e);
      }

      try {
        const cachedDeals = localStorage.getItem("nexus_deals");
        if (cachedDeals) {
          const parsed = JSON.parse(cachedDeals);
          if (Array.isArray(parsed)) {
            const seenDeals = new Set<string>();
            const migrated = parsed
              .map((d: any) => {
                const clientName = d.clientName || d.company || "Cliente Desconhecido";
                const serviceDescription = d.serviceDescription || d.title || "Serviço sem descrição";
                const cost = d.cost !== undefined ? d.cost : Math.round((d.value || 0) * 0.2);
                const value = d.value !== undefined ? d.value : 0;
                const stage = (["Proposta", "Agendado", "Realizado"].includes(d.stage)) ? d.stage : "Proposta";
                const date = d.date || d.closeDate || "2026-05-24";
                return {
                  id: d.id,
                  clientName,
                  serviceDescription,
                  value,
                  cost,
                  stage,
                  date,
                  owner: d.owner || "Alex"
                };
              })
              .filter((d) => {
                if (!d.id) return false;
                if (seenDeals.has(d.id)) return false;
                seenDeals.add(d.id);
                return true;
              });
            setDeals(migrated);
          }
        }
      } catch (e) {
        console.error("Error loading cached deals", e);
      }

      try {
        const cachedTasks = localStorage.getItem("nexus_tasks");
        if (cachedTasks) {
          const parsed = JSON.parse(cachedTasks);
          if (Array.isArray(parsed)) {
            const seenTasks = new Set<string>();
            const filtered = parsed.filter((t: any) => {
              if (!t || !t.id) return false;
              if (seenTasks.has(t.id)) return false;
              seenTasks.add(t.id);
              return true;
            });
            setTasks(filtered);
          }
        }
      } catch (e) {
        console.error("Error loading cached tasks", e);
      }

      try {
        const cachedActivities = localStorage.getItem("nexus_activities");
        if (cachedActivities) {
          const parsed = JSON.parse(cachedActivities);
          if (Array.isArray(parsed)) {
            const seenActivities = new Set<string>();
            const filtered = parsed.filter((a: any) => {
              if (!a || !a.id) return false;
              if (seenActivities.has(a.id)) return false;
              seenActivities.add(a.id);
              return true;
            });
            setActivities(filtered);
          }
        }
      } catch (e) {
        console.error("Error loading cached activities", e);
      }

      try {
        const cachedGoals = localStorage.getItem("nexus_goals");
        if (cachedGoals) setGoals(JSON.parse(cachedGoals));
      } catch (e) {
        console.error("Error loading cached goals", e);
      }

      try {
        const cachedProfileName = localStorage.getItem("nexus_profile_name");
        if (cachedProfileName) setProfileName(cachedProfileName);
      } catch (e) {
        console.error("Error loading cached profile name", e);
      }

      try {
        const cachedProfilePic = localStorage.getItem("nexus_profile_pic");
        if (cachedProfilePic) setProfilePic(cachedProfilePic);
      } catch (e) {
        console.error("Error loading cached profile pic", e);
      }

      try {
        const cachedLoggedIn = localStorage.getItem("nexus_logged_in") === "true";
        if (cachedLoggedIn) setIsAuthenticated(true);
      } catch (e) {
        console.error("Error loading cached auth state", e);
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    setMounted(true);
  }, []);

  // Sync cache changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_contacts", JSON.stringify(contacts));
  }, [contacts, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_deals", JSON.stringify(deals));
  }, [deals, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_tasks", JSON.stringify(tasks));
  }, [tasks, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_activities", JSON.stringify(activities));
  }, [activities, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_goals", JSON.stringify(goals));
  }, [goals, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_profile_name", profileName);
  }, [profileName, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nexus_profile_pic", profilePic);
  }, [profilePic, mounted]);

  // Execute review list click function on dashboard
  const handleReviewInactiveLeadsClick = () => {
    setFilterInactiveOnly(true);
    setCurrentTab("contacts");
  };

  const clearInactiveFilter = () => {
    setFilterInactiveOnly(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginError("Por favor, insira seu usuário.");
      return;
    }
    if (!passwordInput.trim()) {
      setLoginError("Por favor, insira sua senha.");
      return;
    }
    
    const lowerUser = usernameInput.trim().toLowerCase();
    if (
      (lowerUser === "bruno" && passwordInput === "bk1234") ||
      (lowerUser === "admin" && passwordInput === "admin")
    ) {
      const formattedName = usernameInput.trim().toLowerCase() === "bruno" ? "Bruno" : usernameInput.trim();
      setProfileName(formattedName);
      setIsAuthenticated(true);
      setLoginError("");
      if (rememberMe) {
        localStorage.setItem("nexus_logged_in", "true");
        localStorage.setItem("nexus_profile_name", formattedName);
      }
    } else {
      setLoginError("Usuário ou senha inválidos. Dica: bruno / bk1234.");
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#030d1a] text-slate-300 min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-slate-800/80 p-2 flex items-center justify-center shadow-lg border border-slate-700/50">
            <div className="w-10 h-10 border-4 border-slate-600 border-t-white rounded-full animate-spin" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Carregando Sistema...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#030d1a] text-slate-200 min-h-screen flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans w-full">
        {/* Subtle background glow decorative elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
        >
          {/* Logo Heading Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden flex items-center justify-center p-2.5 shadow-xl border border-slate-700/50 mb-4 hover:scale-[1.03] transition-transform duration-300">
              <img
                src="/logo.png"
                alt="BK Higienização"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/10">
                Área Administrativa
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white mt-3.5 tracking-tight">
                BK Higienização
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-medium max-w-xs uppercase tracking-wider">
                Sistema Interno de CRM e Gestão de Serviços
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 pl-0.5">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Seu usuário (Ex: bruno)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-800/70 transition-all font-medium h-11"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 pl-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Senha Geral
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Sua senha de acesso"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-800/70 transition-all font-medium h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                Lembrar-me neste aparelho
              </label>
            </div>

            {/* Error Message Box */}
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 font-bold leading-relaxed shadow-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 text-xs tracking-wider uppercase cursor-pointer"
            >
              Acessar Painel administrativo
            </button>
          </form>

          {/* Quick Access Helper hint box */}
          <div className="mt-8 pt-5 border-t border-slate-800/60 text-center">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">
              Acesso de Produção
            </span>
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-normal inline-block w-full">
              Dica: Utilize o administrador principal <br />
              Usuário: <strong className="text-blue-400">bruno</strong> e Senha: <strong className="text-blue-400">bk1234</strong>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-slate-800 min-h-screen antialiased flex">
      {/* SIDEBAR BACKDROP ON MOBILE/TABLET */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/45 z-45 md:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR NAVIGATION (POLISHED WITH HIGH INTENT AS SHOWN IN DESIGN METADATA) */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-white border-r border-[#eceef0] flex flex-col p-4 gap-2 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-3 px-2 py-3 mb-4 border-b border-[#eceef0] pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#030d1a] overflow-hidden flex items-center justify-center p-1.5 shadow-md border border-slate-150">
                <img
                  src="/logo.png"
                  alt="BK Higienização"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-extrabold text-[15px] text-slate-900 tracking-tight leading-tight block">BK Higienização</span>
                <span className="text-[9px] text-[#0b1c30] font-bold uppercase tracking-wider block bg-[#d3e4fe] px-2 py-0.5 rounded-full mt-1.5 text-center">Gestão de Serviços</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer animate-fadeIn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-grow flex flex-col gap-1">
          {/* Dashboard action nav link */}
          <button
            onClick={() => {
              setCurrentTab("dashboard");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "dashboard"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Pipeline kanban action link */}
          <button
            onClick={() => {
              setCurrentTab("pipeline");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "pipeline"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <KanbanSquare className="w-4 h-4" />
            <span>Workflow</span>
          </button>

          {/* Contacts action link */}
          <button
            onClick={() => {
              setCurrentTab("contacts");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "contacts"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
          </button>

          {/* Deals ledger link */}
          <button
            onClick={() => {
              setCurrentTab("deals");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "deals"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <Handshake className="w-4 h-4" />
            <span>Serviços</span>
          </button>
        </nav>

        {/* Settings fixed section */}
        <div className="border-t border-[#eceef0] pt-4 mt-auto flex flex-col gap-1">
          <button
            onClick={() => {
              setCurrentTab("settings");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "settings"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              localStorage.removeItem("nexus_logged_in");
              setSidebarOpen(false);
            }}
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-all cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* PRIMARY CENTRAL PANEL AREA */}
      <div className="md:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Header navbar bar */}
        <header className="h-16 bg-white border-b border-[#eceef0] flex justify-between items-center px-4 md:px-8 sticky top-0 z-40 shadow-xs">
          {/* Quick search input or mobile menu button */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-slate-650 hover:bg-slate-105 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification and support quick buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-full text-slate-500 relative transition-colors cursor-pointer flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-600 rounded-full border border-white animate-pulse"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 shadow-2xl rounded-lg w-72 p-4 z-50 animate-fadeIn">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-3 border-b pb-1">Notificações Recentes</span>
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    <div className="text-xs p-1">
                      <p className="font-bold">Deal Fechado com Sucesso! 🚀</p>
                      <p className="text-[10px] text-slate-550">Zenith Support Retainer faturou $525,000.</p>
                    </div>
                    <div className="text-xs p-1 border-t pt-1.5 border-dashed">
                      <p className="font-bold">12 Leads Frios Detectados</p>
                      <p className="text-[10px] text-slate-550">Utilize IA para gerar emails de reengajamento.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Active profile card */}
            <div
              onClick={() => setCurrentTab("settings")}
              className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[#eceef0] cursor-pointer hover:opacity-85"
            >
              <img
                src={profilePic}
                alt="Executive"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#c6c6cd]"
              />
              <div className="hidden lg:block">
                <span className="font-extrabold text-xs text-black block leading-none">{profileName}</span>
                <span className="text-[9px] text-slate-500 mt-0.5 block font-bold uppercase tracking-wider">Enterprise User</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="p-4 md:p-8 max-w-[1440px] mx-auto w-full flex-grow">
          {currentTab === "dashboard" && (
            <DashboardTab
              contacts={contacts}
              deals={deals}
              tasks={tasks}
              activities={activities}
              goals={goals}
              setTasks={setTasks}
              setActivities={setActivities}
              onReviewInactiveLeads={handleReviewInactiveLeadsClick}
            />
          )}

          {currentTab === "contacts" && (
            <ContactsTab
              contacts={contacts}
              setContacts={setContacts}
              setActivities={setActivities}
              filterInactiveOnly={filterInactiveOnly}
              clearFilters={clearInactiveFilter}
            />
          )}

          {currentTab === "pipeline" && (
            <PipelineTab
              deals={deals}
              setDeals={setDeals}
              setActivities={setActivities}
              contacts={contacts}
            />
          )}

          {currentTab === "deals" && (
            <DealsTab
              deals={deals}
              setDeals={setDeals}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {currentTab === "settings" && (
            <SettingsTab
              goals={goals}
              setGoals={setGoals}
            />
          )}
        </main>
      </div>
    </div>
  );
}
