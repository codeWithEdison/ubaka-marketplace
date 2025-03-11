
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

/**
 * Returns a fallback image URL in case the original image fails to load
 */
export function getFallbackImageUrl(): string {
  return "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";
}
