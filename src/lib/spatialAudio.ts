// ─── Spatial Audio Engine ────────────────────────────────────────────────────
// Manages proximity-based audio volume for nearby users.
// Volume scales inversely with distance using a smooth curve.
// Room isolation: users in locked rooms are silent to outsiders.

import { calculateDistance } from './utils';

const PROXIMITY_RANGE = 120; // Max hearing range in px
const FULL_VOLUME_RANGE = 30; // Distance for 100% volume
const SILENCE_ZONE_TYPES = new Set(['conference', 'private-office']);

interface AudioPeer {
  peerId: string;
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
}

let audioContext: AudioContext | null = null;
const peers = new Map<string, AudioPeer>();

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/** Calculate volume (0-1) based on distance with smooth falloff curve */
export function calculateProximityVolume(distance: number): number {
  if (distance <= FULL_VOLUME_RANGE) return 1;
  if (distance >= PROXIMITY_RANGE) return 0;
  // Smooth cubic falloff
  const t = (distance - FULL_VOLUME_RANGE) / (PROXIMITY_RANGE - FULL_VOLUME_RANGE);
  return Math.max(0, 1 - t * t * (3 - 2 * t)); // smoothstep
}

/** Calculate stereo pan (-1 left, +1 right) based on relative position */
export function calculateStereoPan(
  listenerX: number,
  listenerY: number,
  sourceX: number,
  sourceY: number
): number {
  const dx = sourceX - listenerX;
  const distance = calculateDistance(
    { x: listenerX, y: listenerY },
    { x: sourceX, y: sourceY }
  );
  if (distance === 0) return 0;
  return Math.max(-1, Math.min(1, dx / PROXIMITY_RANGE));
}

/** Check if two users can hear each other (room isolation) */
export function canHearUser(
  myRoom: string,
  myRoomLocked: boolean,
  myRoomType: string,
  theirRoom: string,
  theirRoomLocked: boolean,
  theirRoomType: string
): boolean {
  // Same room = always hear
  if (myRoom === theirRoom) return true;

  // If either user is in a locked silence zone, can't hear across rooms
  if (myRoomLocked && SILENCE_ZONE_TYPES.has(myRoomType)) return false;
  if (theirRoomLocked && SILENCE_ZONE_TYPES.has(theirRoomType)) return false;

  // Open rooms can bleed audio
  return true;
}

/** Connect a remote audio stream with spatial processing */
export function connectPeerAudio(
  peerId: string,
  stream: MediaStream
): { gainNode: GainNode; pannerNode: StereoPannerNode } {
  const ctx = getAudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const gainNode = ctx.createGain();
  const pannerNode = ctx.createStereoPanner();

  source.connect(gainNode);
  gainNode.connect(pannerNode);
  pannerNode.connect(ctx.destination);

  gainNode.gain.value = 0; // Start silent, will update with proximity

  peers.set(peerId, { peerId, gainNode, pannerNode });
  return { gainNode, pannerNode };
}

/** Update audio for a specific peer based on distance and position */
export function updatePeerAudio(
  peerId: string,
  distance: number,
  panValue: number,
  canHear: boolean
): void {
  const peer = peers.get(peerId);
  if (!peer) return;

  const targetVolume = canHear ? calculateProximityVolume(distance) : 0;
  const ctx = getAudioContext();

  // Smooth transition to avoid clicks
  peer.gainNode.gain.linearRampToValueAtTime(
    targetVolume,
    ctx.currentTime + 0.1
  );
  peer.pannerNode.pan.linearRampToValueAtTime(
    panValue,
    ctx.currentTime + 0.1
  );
}

/** Disconnect a peer's audio */
export function disconnectPeerAudio(peerId: string): void {
  const peer = peers.get(peerId);
  if (peer) {
    peer.gainNode.disconnect();
    peer.pannerNode.disconnect();
    peers.delete(peerId);
  }
}

/** Cleanup all audio resources */
export function cleanupAudio(): void {
  peers.forEach((_, id) => disconnectPeerAudio(id));
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
