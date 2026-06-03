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
  Sparkles,
  Menu,
  X,
  Lock,
  User,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modules
import DashboardTab from "@/components/DashboardTab";
import ContactsTab from "@/components/ContactsTab";
import PipelineTab from "@/components/PipelineTab";
import DealsTab from "@/components/DealsTab";
import SettingsTab from "@/components/SettingsTab";

// Import Supabase
import { 
  supabase,
  mapContactFromDB,
  mapContactToDB,
  mapDealFromDB,
  mapDealToDB,
  mapTaskFromDB,
  mapTaskToDB,
  mapActivityFromDB,
  mapActivityToDB,
  mapGoalsFromDB,
  mapGoalsToDB
} from "@/lib/supabase";


const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Jane Doe",
    email: "jane.doe@acme.corp",
    lastContact: "Há 2 horas",
    phone: "+1 (555) 234-5678"
  },
  {
    id: "c4",
    name: "Robert King",
    email: "robert@fincloud.biz",
    lastContact: "08 de Out, 2023",
    phone: "+1 (555) 987-6543"
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
    date: "2026-05-24"
  },
  {
    id: "d2",
    clientName: "Robert King",
    serviceDescription: "Impermeabilização de Estofados",
    value: 600,
    cost: 150,
    stage: "Realizado",
    date: "2026-05-23"
  },
  {
    id: "d6",
    clientName: "Robert King",
    serviceDescription: "Higienização de Poltronas e Cadeiras",
    value: 950,
    cost: 160,
    stage: "Realizado",
    date: "2026-05-20"
  },
  {
    id: "d8",
    clientName: "Jane Doe",
    serviceDescription: "Higienização Pós-Obra Residencial",
    value: 2500,
    cost: 650,
    stage: "Realizado",
    date: "2026-05-02"
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

const INITIAL_ACTIVITIES: Activity[] = [];

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
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CRM State databases
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [goals, setGoals] = useState<CRMGoals>(INITIAL_GOALS);

  // Active user details
  const [profileName, setProfileNameState] = useState("Bruno Kawaguchi");
  const [profilePic, setProfilePic] = useState("/bruno_profile_pic.png");

  const setProfileName = React.useCallback((name: string | ((prev: string) => string)) => {
    const cleanName = (val: string): string => {
      if (!val) return "Bruno Kawaguchi";
      const lower = val.toLowerCase();
      if (
        lower.includes("bkhigienizacaodf") ||
        lower.includes("bkhigienizacao") ||
        lower === "bruno" ||
        lower === "admin"
      ) {
        return "Bruno Kawaguchi";
      }
      return val;
    };

    if (typeof name === "function") {
      setProfileNameState((prev) => cleanName(name(prev)));
    } else {
      setProfileNameState(cleanName(name));
    }
  }, []);

  // Filter inactive trigger (from AI widget)
  const [filterInactiveOnly, setFilterInactiveOnly] = useState(false);

  // Supabase Real-time Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"connected" | "offline" | "error" | "idle">("idle");

  const syncFromDatabase = async (silent = false) => {
    if (!supabase) {
      setSyncStatus("offline");
      return;
    }
    
    if (!silent) setIsSyncing(true);
    
    try {
      // 1. Fetch contacts
      const { data: dbContacts, error: contactsErr } = await supabase
        .from("contacts")
        .select("*");
      if (contactsErr) throw contactsErr;
      if (dbContacts && dbContacts.length > 0) {
        setContacts(dbContacts.map(mapContactFromDB));
      }

      // 2. Fetch deals
      const { data: dbDeals, error: dealsErr } = await supabase
        .from("deals")
        .select("*");
      if (dealsErr) throw dealsErr;
      if (dbDeals && dbDeals.length > 0) {
        setDeals(dbDeals.map(mapDealFromDB));
      }

      // 3. Fetch tasks
      const { data: dbTasks, error: tasksErr } = await supabase
        .from("tasks")
        .select("*");
      if (tasksErr) throw tasksErr;
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks.map(mapTaskFromDB));
      }

      // 4. Fetch activities
      const { data: dbActivities, error: actErr } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });
      if (actErr) throw actErr;
      if (dbActivities) {
        setActivities(dbActivities.map(mapActivityFromDB));
      }

      // 5. Fetch goals
      const { data: dbGoals, error: goalsErr } = await supabase
        .from("goals")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
      if (goalsErr) throw goalsErr;
      if (dbGoals) {
        setGoals(mapGoalsFromDB(dbGoals));
      }

      // 6. Fetch profiles
      const { data: dbProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", "bruno")
        .maybeSingle();
      if (profileErr) throw profileErr;
      if (dbProfile) {
        if (dbProfile.name) setProfileName(dbProfile.name);
        if (dbProfile.avatar_url) setProfilePic(dbProfile.avatar_url);
      }
      
      setSyncStatus("connected");
    } catch (dbErr) {
      console.error("Error loading updates from Supabase:", dbErr);
      setSyncStatus("error");
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Handle client-side state hydration (LocalStorage + Supabase integration)
  useEffect(() => {
    async function initAndSyncData() {
      if (typeof window === "undefined") return;

      // 1. Initial LocalStorage hydration (gives instant UI load)
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
                  date
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
        if (cachedProfileName) {
          setProfileName(cachedProfileName === "Bruno" ? "Bruno Kawaguchi" : cachedProfileName);
        }
      } catch (e) {
        console.error("Error loading cached profile name", e);
      }

      try {
        const cachedProfilePic = localStorage.getItem("nexus_profile_pic");
        if (cachedProfilePic && !cachedProfilePic.includes("lh3.googleusercontent.com") && !cachedProfilePic.includes("unavatar.io")) {
          setProfilePic(cachedProfilePic);
        } else {
          setProfilePic("/bruno_profile_pic.png");
        }
      } catch (e) {
        console.error("Error loading cached profile pic", e);
      }

      try {
        const cachedLoggedIn = localStorage.getItem("nexus_logged_in") === "true";
        if (cachedLoggedIn) setIsAuthenticated(true);
      } catch (e) {
        console.error("Error loading cached auth state", e);
      }

      // 2. Load fresh updates from Supabase if keys are configured
      if (supabase) {
        setIsSyncing(true);
        try {
          const { data: dbContacts, error: contactsErr } = await supabase
            .from("contacts")
            .select("*");
          if (!contactsErr && dbContacts && dbContacts.length > 0) {
            setContacts(dbContacts.map(mapContactFromDB));
          }

          const { data: dbDeals, error: dealsErr } = await supabase
            .from("deals")
            .select("*");
          if (!dealsErr && dbDeals && dbDeals.length > 0) {
            setDeals(dbDeals.map(mapDealFromDB));
          }

          const { data: dbTasks, error: tasksErr } = await supabase
            .from("tasks")
            .select("*");
          if (!tasksErr && dbTasks && dbTasks.length > 0) {
            setTasks(dbTasks.map(mapTaskFromDB));
          }

          const { data: dbActivities, error: actErr } = await supabase
            .from("activities")
            .select("*")
            .order("created_at", { ascending: false });
          if (!actErr && dbActivities) {
            setActivities(dbActivities.map(mapActivityFromDB));
          }

          const { data: dbGoals, error: goalsErr } = await supabase
            .from("goals")
            .select("*")
            .eq("id", "singleton")
            .maybeSingle();
          if (!goalsErr && dbGoals) {
            setGoals(mapGoalsFromDB(dbGoals));
          }

          const { data: dbProfile, error: profileErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", "bruno")
            .maybeSingle();
          if (!profileErr && dbProfile) {
            if (dbProfile.name) setProfileName(dbProfile.name);
            if (dbProfile.avatar_url) setProfilePic(dbProfile.avatar_url);
          }
          setSyncStatus("connected");
        } catch (dbErr) {
          console.error("Error fetching from Supabase on init:", dbErr);
          setSyncStatus("error");
        } finally {
          setIsSyncing(false);
        }
      } else {
        setSyncStatus("offline");
      }

      setMounted(true);
    }

    initAndSyncData();
  }, []);

  // Sync cache changes to localStorage and Supabase online database
  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_contacts", JSON.stringify(contacts));

    const sb = supabase;
    if (sb) {
      const dbRows = contacts.map(c => mapContactToDB(c));
      if (dbRows.length > 0) {
        sb.from("contacts").upsert(dbRows).then(({ error }) => {
          if (error) {
            console.error("Error syncing contacts:", error.message || error, "Details:", error.details, "Hint:", error.hint, "Code:", error.code);
          }
        });
      }
      
      const currentIds = contacts.map(c => c.id).filter(Boolean);
      if (currentIds.length > 0) {
        sb.from("contacts").delete().filter("id", "not.in", `(${currentIds.join(",")})`).then(({ error }) => {
          if (error) console.error("Error pruning remote contacts:", error);
        });
      } else {
        sb.from("contacts").delete().neq("id", "").then(({ error }) => {
          if (error) console.error("Error pruning all remote contacts:", error);
        });
      }
    }
  }, [contacts, mounted, isSyncing]);

  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_deals", JSON.stringify(deals));

    if (supabase) {
      const dbRows = deals.map(d => mapDealToDB(d));
      if (dbRows.length > 0) {
        supabase.from("deals").upsert(dbRows).then(({ error }) => {
          if (error) console.error("Error syncing deals:", error);
        });
      }
      
      const currentIds = deals.map(d => d.id).filter(Boolean);
      if (currentIds.length > 0) {
        supabase.from("deals").delete().filter("id", "not.in", `(${currentIds.join(",")})`).then(({ error }) => {
          if (error) console.error("Error pruning remote deals:", error);
        });
      } else {
        supabase.from("deals").delete().neq("id", "").then(({ error }) => {
          if (error) console.error("Error pruning all remote deals:", error);
        });
      }
    }
  }, [deals, mounted, isSyncing]);

  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_tasks", JSON.stringify(tasks));

    if (supabase) {
      const dbRows = tasks.map(t => mapTaskToDB(t));
      if (dbRows.length > 0) {
        supabase.from("tasks").upsert(dbRows).then(({ error }) => {
          if (error) console.error("Error syncing tasks:", error);
        });
      }
      
      const currentIds = tasks.map(t => t.id).filter(Boolean);
      if (currentIds.length > 0) {
        supabase.from("tasks").delete().filter("id", "not.in", `(${currentIds.join(",")})`).then(({ error }) => {
          if (error) console.error("Error pruning remote tasks:", error);
        });
      } else {
        supabase.from("tasks").delete().neq("id", "").then(({ error }) => {
          if (error) console.error("Error pruning all remote tasks:", error);
        });
      }
    }
  }, [tasks, mounted, isSyncing]);

  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_activities", JSON.stringify(activities));

    if (supabase) {
      const dbRows = activities.map(a => mapActivityToDB(a));
      if (dbRows.length > 0) {
        supabase.from("activities").upsert(dbRows).then(({ error }) => {
          if (error) console.error("Error syncing activities:", error);
        });
      }
      
      const currentIds = activities.map(a => a.id).filter(Boolean);
      if (currentIds.length > 0) {
        supabase.from("activities").delete().filter("id", "not.in", `(${currentIds.join(",")})`).then(({ error }) => {
          if (error) console.error("Error pruning remote activities:", error);
        });
      } else {
        supabase.from("activities").delete().neq("id", "").then(({ error }) => {
          if (error) console.error("Error pruning all remote activities:", error);
        });
      }
    }
  }, [activities, mounted, isSyncing]);

  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_goals", JSON.stringify(goals));

    if (supabase) {
      const dbRow = mapGoalsToDB(goals);
      supabase.from("goals").upsert([dbRow]).then(({ error }) => {
        if (error) console.error("Error syncing goals:", error);
      });
    }
  }, [goals, mounted, isSyncing]);

  useEffect(() => {
    if (!mounted || isSyncing) return;
    localStorage.setItem("nexus_profile_name", profileName);
    localStorage.setItem("nexus_profile_pic", profilePic);

    if (supabase) {
      supabase.from("profiles").upsert({
        id: "bruno",
        name: profileName,
        avatar_url: profilePic,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error("Error syncing profile:", error);
      });
    }
  }, [profileName, profilePic, mounted, isSyncing]);


  // Execute review list click function on dashboard
  const handleReviewInactiveLeadsClick = () => {
    setFilterInactiveOnly(true);
    setCurrentTab("contacts");
  };

  const clearInactiveFilter = () => {
    setFilterInactiveOnly(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginError("Por favor, insira seu e-mail ou usuário.");
      return;
    }
    if (!passwordInput.trim()) {
      setLoginError("Por favor, insira sua senha.");
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError("");
    
    const lowerUser = usernameInput.trim().toLowerCase();
    
    // 1. Try master offline/local fallback credentials first
    if (
      (lowerUser === "bruno" && passwordInput === "bk1234") ||
      (lowerUser === "admin" && passwordInput === "admin")
    ) {
      const formattedName = usernameInput.trim().toLowerCase() === "bruno" ? "Bruno Kawaguchi" : usernameInput.trim();
      setProfileName(formattedName);
      setIsAuthenticated(true);
      setLoginError("");
      setIsLoggingIn(false);
      if (rememberMe) {
        localStorage.setItem("nexus_logged_in", "true");
        localStorage.setItem("nexus_profile_name", formattedName);
      }
      return;
    }

    // 2. Otherwise authenticate using Supabase Authentication!
    if (supabase) {
      try {
        const email = usernameInput.includes("@") ? usernameInput.trim() : `${usernameInput.trim()}@company.com`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: passwordInput,
        });

        if (error) {
          setLoginError(`Erro de autenticação: ${error.message}`);
          setIsLoggingIn(false);
          return;
        }

        if (data?.user) {
          const userEmail = data.user.email || "";
          const displayName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || userEmail.split("@")[0];
          
          setProfileName(displayName);
          setIsAuthenticated(true);
          setLoginError("");
          setIsLoggingIn(false);
          if (rememberMe) {
            localStorage.setItem("nexus_logged_in", "true");
            localStorage.setItem("nexus_profile_name", displayName);
          }
        }
      } catch (err: any) {
        setLoginError(`Erro de conexão com o Supabase: ${err.message || err}`);
        setIsLoggingIn(false);
      }
    } else {
      setLoginError("Credenciais inválidas ou serviço Supabase offline.");
      setIsLoggingIn(false);
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
                Usuário / E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Seu e-mail ou usuário (Ex: bruno)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-800/70 transition-all font-medium h-11"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 pl-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Senha Geral / Pessoal
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
              disabled={isLoggingIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 text-xs tracking-wider uppercase cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                "Acessar Painel administrativo"
              )}
            </button>
          </form>


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
            {/* Supabase Force Sync Button */}
            {mounted && (
              <button
                onClick={() => syncFromDatabase(false)}
                disabled={isSyncing}
                title="Sincronizar e carregar dados do banco de dados Supabase"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-tight uppercase transition-all ${
                  isSyncing
                    ? "bg-amber-50 border-amber-200 text-amber-600 cursor-wait animate-pulse"
                    : syncStatus === "connected"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50"
                    : syncStatus === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100/50"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                } shadow-xs cursor-pointer active:scale-95`}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>
                  {isSyncing ? "Puxando..." : syncStatus === "connected" ? "Atualizar Banco" : syncStatus === "error" ? "Erro" : "Puxar Banco"}
                </span>
              </button>
            )}

            {/* Active profile card */}
            <div
              onClick={() => setCurrentTab("settings")}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85"
            >
              <img
                src={profilePic}
                alt="Executive"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#c6c6cd]"
              />
              <div className="hidden lg:block">
                <span className="font-extrabold text-xs text-black block leading-none">
                  {profileName?.toLowerCase().includes("bkhigienizacaodf") || !profileName ? "Bruno Kawaguchi" : profileName}
                </span>
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
              setContacts={setContacts}
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
