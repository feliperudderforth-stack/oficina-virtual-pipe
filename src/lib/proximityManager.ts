// ─── Proximity Manager ──────────────────────────────────────────────────────
// Handles walk-up-to-talk auto-activation and nudge interactions.
// When you walk close enough to someone, audio/video auto-enables.
// Nudge sends a subtle attention request to a focused user.

import { calculateDistance } from './utils';
import type { User } from '@/types';

const WALK_UP_RANGE = 80; // Distance to auto-start conversation
const NUDGE_COOLDOWN = 10000; // 10 second cooldown between nudges to same user

const lastNudgeTimes = new Map<string, number>();
const activeProximityPeers = new Set<string>();

export interface ProximityEvent {
  type: 'enter' | 'exit';
  userId: string;
  userName: string;
  distance: number;
}

/** Check proximity for all nearby users and return events */
export function checkProximityEvents(
  currentUser: User,
  allUsers: Map<string, User>
): ProximityEvent[] {
  const events: ProximityEvent[] = [];

  allUsers.forEach((user) => {
    if (user.id === currentUser.id) return;
    if (user.status === 'offline') return;

    const dist = calculateDistance(currentUser.position, user.position);
    const wasNearby = activeProximityPeers.has(user.id);
    const isNearby = dist <= WALK_UP_RANGE;

    if (isNearby && !wasNearby) {
      activeProximityPeers.add(user.id);
      events.push({ type: 'enter', userId: user.id, userName: user.name, distance: dist });
    } else if (!isNearby && wasNearby) {
      activeProximityPeers.delete(user.id);
      events.push({ type: 'exit', userId: user.id, userName: user.name, distance: dist });
    }
  });

  return events;
}

/** Check if we can send a nudge to a user (cooldown check) */
export function canNudge(targetId: string): boolean {
  const lastNudge = lastNudgeTimes.get(targetId);
  if (!lastNudge) return true;
  return Date.now() - lastNudge >= NUDGE_COOLDOWN;
}

/** Record a nudge being sent */
export function recordNudge(targetId: string): void {
  lastNudgeTimes.set(targetId, Date.now());
}

/** Get nudge cooldown remaining in ms */
export function getNudgeCooldown(targetId: string): number {
  const lastNudge = lastNudgeTimes.get(targetId);
  if (!lastNudge) return 0;
  return Math.max(0, NUDGE_COOLDOWN - (Date.now() - lastNudge));
}

/** Check if a user is in focus mode (DND or busy) */
export function isInFocusMode(user: User): boolean {
  return user.status === 'dnd' || user.status === 'busy';
}

/** Clear proximity state (on disconnect) */
export function clearProximityState(): void {
  activeProximityPeers.clear();
  lastNudgeTimes.clear();
}
