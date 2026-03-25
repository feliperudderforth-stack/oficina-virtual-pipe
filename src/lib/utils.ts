import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: '#22c55e',
    busy: '#ef4444',
    away: '#f59e0b',
    'in-meeting': '#8b5cf6',
    dnd: '#dc2626',
    offline: '#6b7280',
  };
  return colors[status] || '#6b7280';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    away: 'Away',
    'in-meeting': 'In Meeting',
    dnd: 'Do Not Disturb',
    offline: 'Offline',
  };
  return labels[status] || 'Unknown';
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTimeShort(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function generateAvatarUrl(name: string, color: string): string {
  const initials = getInitials(name);
  const bg = color.replace('#', '');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=128&bold=true`;
}

export function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isInProximity(p1: { x: number; y: number }, p2: { x: number; y: number }, range: number): boolean {
  return calculateDistance(p1, p2) <= range;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 9);
}
