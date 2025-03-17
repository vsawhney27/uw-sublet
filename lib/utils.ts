import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to long form (e.g. January 1, 2024)
export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
