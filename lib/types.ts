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
  title: string;
  company: string;
  value: number;
  stage: "Lead" | "Contacted" | "Proposal" | "Negotiation" | "Won" | "Lost";
  probability: number; // e.g., 85 for 85%
  owner: string;
  closeDate: string;
}

export interface Task {
  id: string;
  title: string;
  associatedWith: string;
  completed: boolean;
  priority: "Urgent" | "Medium" | "Low";
  dueDate: string;
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
