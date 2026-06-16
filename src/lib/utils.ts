import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Subscription } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function monthlyEquivalent(sub: Subscription): number {
  return sub.billingCycle === 'annually' ? sub.price / 12 : sub.price
}

function clampedDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

export function nextPaymentDate(sub: Subscription): Date {
  const today = new Date()
  const day = sub.billingDay

  if (sub.billingCycle === 'monthly') {
    const candidate = clampedDate(today.getFullYear(), today.getMonth(), day)
    if (candidate >= today) return candidate
    return clampedDate(today.getFullYear(), today.getMonth() + 1, day)
  }

  // billingMonth is 1-indexed; fall back to createdAt month for legacy data
  const month = sub.billingMonth != null
    ? sub.billingMonth - 1
    : new Date(sub.createdAt).getMonth()
  const thisYear = clampedDate(today.getFullYear(), month, day)
  if (thisYear >= today) return thisYear
  return clampedDate(today.getFullYear() + 1, month, day)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
