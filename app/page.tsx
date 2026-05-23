'use client';

import React, { useState, useEffect } from "react";
import { Contact, Deal, Task, Activity, CRMGoals } from "@/lib/types";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  Handshake, 
  TrendingUp, 
  HelpCircle, 
  Settings, 
  Search, 
  Plus, 
  Bell, 
  Sparkles,
  Menu,
  X
} from "lucide-react";

// Import modules
import DashboardTab from "@/components/DashboardTab";
import ContactsTab from "@/components/ContactsTab";
import PipelineTab from "@/components/PipelineTab";
import DealsTab from "@/components/DealsTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import SettingsTab from "@/components/SettingsTab";
import SupportTab from "@/components/SupportTab";

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Jane Doe",
    email: "jane.doe@acme.corp",
    company: "Acme Corporation",
    role: "Senior VP Sales",
    status: "Customer",
    lastContact: "2 hours ago",
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
    lastContact: "Yesterday",
    phone: "+1 (555) 876-5432",
    owner: "Sarah Miller",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMzDxcw3E8i9B8dw3x535fnmjuUd0cwm7y5QHCMpSmqVaKWPjW4T89mjRqi_R91t3WoKpNsx90j19uGNnM74LsuzeXzvFWt5O5ElcPAUrZ9IkRm6q8zP8NL300z8eIlu6GR8ObbX7eVunGyMfJ1gLYoFnIUL0QizMN7SpFJT4h8LVHzo5g7nkioGrEjeMG_VOjEA_G6fA56gSi8LrLP6y7wCn1jaNi4eC4QVoVmldIXmesJBor_U1pUPWp6bJUgg81gKLKvm5mqmQ"
  },
  {
    id: "c3",
    name: "Sarah Hughes",
    email: "s.hughes@globalweb.com",
    company: "GlobalWeb",
    role: "Head of Operations",
    status: "Lead",
    lastContact: "Oct 12, 2023",
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
    lastContact: "Oct 08, 2023",
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
    lastContact: "Oct 05, 2023",
    phone: "+1 (555) 456-7890",
    owner: "Me",
    avatarUrl: "https://picsum.photos/seed/emily/120/120"
  }
];

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1",
    title: "Cloud Migration",
    company: "TechFlow Inc.",
    value: 120000,
    stage: "Proposal",
    probability: 60,
    owner: "Alex",
    closeDate: "2026-06-30"
  },
  {
    id: "d2",
    title: "Project Aurora",
    company: "Acme Corp",
    value: 42000,
    stage: "Won",
    probability: 100,
    owner: "Sarah Miller",
    closeDate: "2026-05-23"
  },
  {
    id: "d3",
    title: "Enterprise ERP Proposal",
    company: "Global Logistics Ltd",
    value: 240000,
    stage: "Proposal",
    probability: 70,
    owner: "Alex",
    closeDate: "2026-07-15"
  },
  {
    id: "d4",
    title: "Security Patch Optimization",
    company: "Cyberdyne Systems",
    value: 85000,
    stage: "Negotiation",
    probability: 80,
    owner: "Alex",
    closeDate: "2026-06-15"
  },
  {
    id: "d5",
    title: "Marketing Campaign Lead",
    company: "Spark Labs",
    value: 15000,
    stage: "Lead",
    probability: 20,
    owner: "Alex",
    closeDate: "2026-08-01"
  },
  {
    id: "d6",
    title: "FinCloud Ledger Expansion",
    company: "FinCloud",
    value: 467500,
    stage: "Won",
    probability: 100,
    owner: "Sarah Miller",
    closeDate: "2026-05-20"
  },
  {
    id: "d7",
    title: "Nexus Design System Onboarding",
    company: "Nexus Design",
    value: 250000,
    stage: "Won",
    probability: 100,
    owner: "Alex",
    closeDate: "2026-05-10"
  },
  {
    id: "d8",
    title: "Zenith Support Retainer",
    company: "Zenith Corp",
    value: 525000,
    stage: "Won",
    probability: 100,
    owner: "Alex",
    closeDate: "2026-05-02"
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Follow up with TechFlow Inc.",
    associatedWith: "Deal: Cloud Migration (Stage: Proposal)",
    completed: false,
    priority: "Urgent",
    dueDate: "Today"
  },
  {
    id: "t2",
    title: "Review quarterly contract - Zenith",
    associatedWith: "Zenith Retainer Support",
    completed: false,
    priority: "Medium",
    dueDate: "In 2 days"
  },
  {
    id: "t3",
    title: "Send introductory deck to Spark Labs",
    associatedWith: "Incoming lead from Website",
    completed: false,
    priority: "Low",
    dueDate: "Next week"
  },
  {
    id: "t4",
    title: "Team sync: Sales Q4 Strategy",
    associatedWith: "Nexus Boardroom Room 3",
    completed: false,
    priority: "Medium",
    dueDate: "Today at 3:00 PM"
  }
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "closed",
    title: "Deal Closed: Project Aurora ($42,000)",
    sub: "Closed by <b>Sarah Miller</b> • 2 hours ago",
    time: "2 hours ago"
  },
  {
    id: "a2",
    type: "email",
    title: "Email Opened: Proposal for Global Logistics Ltd",
    sub: "Sent by <b>You</b> • 4 hours ago",
    time: "4 hours ago"
  },
  {
    id: "a3",
    type: "contact",
    title: "New Contact Added: Robert Fox",
    sub: "Company: <b>Atlas Group</b> • 6 hours ago",
    time: "6 hours ago"
  },
  {
    id: "a4",
    type: "call",
    title: "Outbound Call: Follow-up with Cyberdyne",
    sub: "Duration: 12m 40s • Yesterday",
    time: "Yesterday"
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
    "dashboard" | "pipeline" | "contacts" | "deals" | "analytics" | "settings" | "support"
  >("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Search input bar focus scale behavior
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Handle client-side state hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      /* eslint-disable react-hooks/set-state-in-effect */
      try {
        const cachedContacts = localStorage.getItem("nexus_contacts");
        if (cachedContacts) setContacts(JSON.parse(cachedContacts));
      } catch (e) {
        console.error("Error loading cached contacts", e);
      }

      try {
        const cachedDeals = localStorage.getItem("nexus_deals");
        if (cachedDeals) setDeals(JSON.parse(cachedDeals));
      } catch (e) {
        console.error("Error loading cached deals", e);
      }

      try {
        const cachedTasks = localStorage.getItem("nexus_tasks");
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));
      } catch (e) {
        console.error("Error loading cached tasks", e);
      }

      try {
        const cachedActivities = localStorage.getItem("nexus_activities");
        if (cachedActivities) setActivities(JSON.parse(cachedActivities));
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
        <div className="flex items-center justify-between px-2 py-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-[18px] text-black tracking-tight leading-tight block">BK Higienização</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gestão de Vendas</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
            <span>Vendas</span>
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
            <span>Contatos</span>
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

          {/* Analytics link */}
          <button
            onClick={() => {
              setCurrentTab("analytics");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "analytics"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </button>
        </nav>

        {/* Support and Settings fixed section */}
        <div className="border-t border-[#eceef0] pt-4 mt-auto flex flex-col gap-1">
          <button
            onClick={() => {
              setCurrentTab("support");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === "support"
                ? "bg-[#d3e4fe] text-[#0b1c30]"
                : "text-slate-600 hover:bg-[#f2f4f6]"
            } cursor-pointer`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Suporte</span>
          </button>

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
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">search</span>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={globalSearchTerm}
                onChange={(e) => {
                  setGlobalSearchTerm(e.target.value);
                  if (currentTab !== "contacts") {
                    setCurrentTab("contacts");
                  }
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`pl-9 pr-3 py-1.5 bg-[#f2f4f6] text-xs font-semibold rounded-full border-transparent focus:bg-white focus:border-[#c6c6cd] transition-all outline-none ${
                  searchFocused ? "w-36 sm:w-72 md:w-80" : "w-24 sm:w-56 md:w-60"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* CTA action button */}
            <button
              onClick={() => {
                if (currentTab !== "pipeline") {
                  setCurrentTab("pipeline");
                }
              }}
              className="px-2.5 sm:px-4 py-2 bg-[#000000] hover:bg-slate-900 font-bold text-xs text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Deal</span>
            </button>

            <div className="h-6 w-px bg-[#eceef0] mx-0.5 sm:mx-1"></div>

            {/* Notification and support quick buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-full text-slate-500 relative transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-semibold">notifications</span>
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

              <button
                onClick={() => setCurrentTab("support")}
                className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-semibold">help_outline</span>
              </button>
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
            />
          )}

          {currentTab === "deals" && (
            <DealsTab
              deals={deals}
              setDeals={setDeals}
            />
          )}

          {currentTab === "analytics" && (
            <AnalyticsTab
              deals={deals}
            />
          )}

          {currentTab === "settings" && (
            <SettingsTab
              goals={goals}
              setGoals={setGoals}
              profileName={profileName}
              setProfileName={setProfileName}
              profilePic={profilePic}
              setProfilePic={setProfilePic}
            />
          )}

          {currentTab === "support" && (
            <SupportTab />
          )}
        </main>
      </div>
    </div>
  );
}
