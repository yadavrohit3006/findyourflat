import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RoomType, AvailabilityStatus, GenderPreference } from '@/types';

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

export function roomTypeLabel(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    PRIVATE_ROOM: 'Private Room',
    SHARED_ROOM: 'Shared Room',
    ENTIRE_FLAT: 'Entire Flat',
    STUDIO: 'Studio',
  };
  return labels[type];
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

export function roomTypeColor(type: RoomType): string {
  const colors: Record<RoomType, string> = {
    PRIVATE_ROOM: 'bg-blue-100 text-blue-800',
    SHARED_ROOM: 'bg-purple-100 text-purple-800',
    ENTIRE_FLAT: 'bg-indigo-100 text-indigo-800',
    STUDIO: 'bg-teal-100 text-teal-800',
  };
  return colors[type];
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'Immediately';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
