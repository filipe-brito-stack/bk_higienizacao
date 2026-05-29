export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: "Customer" | "Lead";
  lastContact: string;
  avatarUrl?: string;
  phone: string;
  owner: string;
  birthMonth?: string;
  birthYear?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface Deal {
  id: string;
  clientName: string; // Autocomplete do cliente
  serviceDescription: string; // Descrição do serviço
  value: number; // Valor recebido/cobrado
  cost: number; // Valor gasto para realizar o serviço (custo)
  stage: "Proposta" | "Agendado" | "Realizado";
  date: string; // Data da oportunidade/serviço preenchida por padrão
  owner: string;
  photoBefore?: string;
  photoAfter?: string;
}

export interface Task {
  id: string;
  title: string;
  associatedWith: string;
  completed: boolean;
  priority: "Urgent" | "Medium" | "Low";
  dueDate: string;
  value?: number;
}

export interface Activity {
  id: string;
  type: "closed" | "email" | "contact" | "call";
  title: string;
  sub: string;
  time: string;
}

export interface CRMGoals {
  monthlyRevenueTarget: number;
  monthlyRevenueReached: number;
  newCustomersTarget: number;
  newCustomersReached: number;
  leadQualityScore: number;
}
