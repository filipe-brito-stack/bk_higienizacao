import { createClient } from "@supabase/supabase-js";
import { Contact, Deal, Task, Activity, CRMGoals } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helpers to map database rows to application models
export function mapContactFromDB(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    lastContact: row.last_contact || "Há pouco tempo",
    phone: row.phone || "",
    birthMonth: row.birth_month || undefined,
    birthYear: row.birth_year || undefined,
    address: row.address || undefined,
    latitude: row.latitude !== null ? row.latitude : undefined,
    longitude: row.longitude !== null ? row.longitude : undefined,
  };
}

export function mapContactToDB(contact: Partial<Contact>): any {
  const row: any = {};
  if (contact.id !== undefined) row.id = contact.id;
  if (contact.name !== undefined) row.name = contact.name;
  if (contact.email !== undefined) row.email = contact.email;
  if (contact.lastContact !== undefined) row.last_contact = contact.lastContact;
  if (contact.phone !== undefined) row.phone = contact.phone;
  if (contact.birthMonth !== undefined) row.birth_month = contact.birthMonth;
  if (contact.birthYear !== undefined) row.birth_year = contact.birthYear;
  if (contact.address !== undefined) row.address = contact.address;
  if (contact.latitude !== undefined) row.latitude = contact.latitude;
  if (contact.longitude !== undefined) row.longitude = contact.longitude;
  return row;
}

export function mapDealFromDB(row: any): Deal {
  return {
    id: row.id,
    clientName: row.client_name,
    serviceDescription: row.service_description,
    value: Number(row.value) || 0,
    cost: Number(row.cost) || 0,
    stage: row.stage as Deal["stage"],
    date: row.date,
    owner: row.owner || "Alex",
    photoBefore: row.photo_before || undefined,
    photoAfter: row.photo_after || undefined,
  };
}

export function mapDealToDB(deal: Partial<Deal>): any {
  const row: any = {};
  if (deal.id !== undefined) row.id = deal.id;
  if (deal.clientName !== undefined) row.client_name = deal.clientName;
  if (deal.serviceDescription !== undefined) row.service_description = deal.serviceDescription;
  if (deal.value !== undefined) row.value = deal.value;
  if (deal.cost !== undefined) row.cost = deal.cost;
  if (deal.stage !== undefined) row.stage = deal.stage;
  if (deal.date !== undefined) row.date = deal.date;
  if (deal.owner !== undefined) row.owner = deal.owner;
  if (deal.photoBefore !== undefined) row.photo_before = deal.photoBefore;
  if (deal.photoAfter !== undefined) row.photo_after = deal.photoAfter;
  return row;
}

export function mapTaskFromDB(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    associatedWith: row.associated_with || "",
    completed: Boolean(row.completed),
    priority: row.priority as Task["priority"],
    dueDate: row.due_date,
    value: row.value !== null ? Number(row.value) : undefined,
  };
}

export function mapTaskToDB(task: Partial<Task>): any {
  const row: any = {};
  if (task.id !== undefined) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.associatedWith !== undefined) row.associated_with = task.associatedWith;
  if (task.completed !== undefined) row.completed = task.completed;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.dueDate !== undefined) row.due_date = task.dueDate;
  if (task.value !== undefined) row.value = task.value;
  return row;
}

export function mapActivityFromDB(row: any): Activity {
  return {
    id: row.id,
    type: row.type as Activity["type"],
    title: row.title,
    sub: row.sub || "",
    time: row.time,
  };
}

export function mapActivityToDB(activity: Partial<Activity>): any {
  const row: any = {};
  if (activity.id !== undefined) row.id = activity.id;
  if (activity.type !== undefined) row.type = activity.type;
  if (activity.title !== undefined) row.title = activity.title;
  if (activity.sub !== undefined) row.sub = activity.sub;
  if (activity.time !== undefined) row.time = activity.time;
  return row;
}

export function mapGoalsFromDB(row: any): CRMGoals {
  return {
    monthlyRevenueTarget: Number(row.monthly_revenue_target) || 0,
    monthlyRevenueReached: Number(row.monthly_revenue_reached) || 0,
    newCustomersTarget: Number(row.new_customers_target) || 0,
    newCustomersReached: Number(row.new_customers_reached) || 0,
    leadQualityScore: Number(row.lead_quality_score) || 0,
  };
}

export function mapGoalsToDB(goals: CRMGoals): any {
  return {
    id: "singleton",
    monthly_revenue_target: goals.monthlyRevenueTarget,
    monthly_revenue_reached: goals.monthlyRevenueReached,
    new_customers_target: goals.newCustomersTarget,
    new_customers_reached: goals.newCustomersReached,
    lead_quality_score: goals.leadQualityScore,
  };
}
