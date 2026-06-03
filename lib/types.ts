export interface Contact {
  id: string;
  name: string;
  email: string;
  lastContact: string;
  phone: string;
  birthMonth?: string;
  birthYear?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  updatedAt?: string;
}

export interface Deal {
  id: string;
  clientName: string; // Autocomplete do cliente
  serviceDescription: string; // Descrição do serviço
  value: number; // Valor recebido/cobrado
  cost: number; // Valor gasto para realizar o serviço (custo)
  stage: "Proposta" | "Agendado" | "Realizado";
  date: string; // Data da oportunidade/serviço preenchida por padrão
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
