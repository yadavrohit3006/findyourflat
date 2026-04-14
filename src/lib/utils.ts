import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ListingType, FlatType, AvailabilityStatus, GenderPreference } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRent(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L/mo`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k/mo`;
  }
  return `₹${amount}/mo`;
}

export function formatRentFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount) + '/mo';
}

export function listingTypeLabel(type: ListingType): string {
  return type === 'NEW_LISTING' ? 'New Listing' : 'Replacement';
}

export function flatTypeLabel(type: FlatType): string {
  return type;
}

export function listingTypeColor(type: ListingType): string {
  return type === 'NEW_LISTING'
    ? 'bg-indigo-100 text-indigo-800'
    : 'bg-amber-100 text-amber-800';
}

export function flatTypeColor(_type: FlatType): string {
  return 'bg-sky-100 text-sky-800';
}

export function statusLabel(status: AvailabilityStatus): string {
  const labels: Record<AvailabilityStatus, string> = {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    TAKEN: 'Taken',
  };
  return labels[status];
}

export function genderLabel(pref: GenderPreference): string {
  const labels: Record<GenderPreference, string> = {
    ANY: 'Any Gender',
    MALE_ONLY: 'Male Only',
    FEMALE_ONLY: 'Female Only',
    NON_BINARY_FRIENDLY: 'Non-Binary Friendly',
  };
  return labels[pref];
}

export function statusColor(status: AvailabilityStatus): string {
  const colors: Record<AvailabilityStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    TAKEN: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'Immediately';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
