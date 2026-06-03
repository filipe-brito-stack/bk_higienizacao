import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateFormatted(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateToBR(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  
  // Already in DD/MM/YYYY format
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      return trimmed;
    }
  }
  
  // Format YYYY-MM-DD
  const clean = trimmed.split("T")[0];
  const parts = clean.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day}/${month}/${year}`;
    }
  }
  
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (error) {
    // fallback to original
  }
  
  return trimmed;
}
