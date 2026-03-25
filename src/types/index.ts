// ─── Core Types ──────────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type UserStatus = 'available' | 'busy' | 'away' | 'in-meeting' | 'dnd' | 'offline';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type RoomType = 'open-space' | 'conference' | 'private-office' | 'lounge' | 'cafeteria' | 'lobby';
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'emoji';
export type ChannelType = 'public' | 'private' | 'dm';
export type CallType = 'audio' | 'video';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  position: Position;
  direction: Direction;
  status: UserStatus;
  currentRoom: string;
  role: string;
  department: string;
  title: string;
  isTyping: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  lastActivity: number;
  isSitting: boolean;
  sittingFurnitureId: string | null;
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  occupants: string[];
  isLocked: boolean;
  lockedBy?: string;
}

export interface RoomLayout {
  id: string;
  name: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  icon: string;
  furniture: FurnitureItem[];
}

export type FurnitureType = 'desk' | 'chair' | 'table' | 'sofa' | 'plant' | 'screen' | 'whiteboard' | 'coffee-machine' | 'bookshelf' | 'lamp' | 'printer' | 'water-cooler';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  interactive?: boolean;
  sittable?: boolean;
  occupiedBy?: string | null;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: MessageType;
  channelId: string;
  threadId?: string;
  reactions: Record<string, string[]>;
  timestamp: number;
  edited: boolean;
  replyTo?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  members: string[];
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

export interface TypingUser {
  userId: string;
  userName: string;
  channelId: string;
}

// ─── Meetings ────────────────────────────────────────────────────────────────

export interface Meeting {
  id: string;
  roomId: string;
  title: string;
  hostId: string;
  participants: string[];
  isRecording: boolean;
  startedAt: number;
  scheduledEnd?: number;
}

// ─── WebRTC ──────────────────────────────────────────────────────────────────

export interface PeerConnection {
  peerId: string;
  stream?: MediaStream;
  peer?: unknown;
  isAudio: boolean;
  isVideo: boolean;
}

export interface CallState {
  isInCall: boolean;
  callType: CallType | null;
  callerId: string | null;
  callerName: string | null;
  peers: Map<string, PeerConnection>;
  localStream: MediaStream | null;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'message' | 'call' | 'meeting' | 'mention' | 'knock' | 'wave' | 'system';
  targetId?: string;
  timestamp: number;
  read: boolean;
}

// ─── Whiteboard ──────────────────────────────────────────────────────────────

export interface WhiteboardStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  userId: string;
}

// ─── Office Map ──────────────────────────────────────────────────────────────

export interface OfficeFloor {
  id: string;
  name: string;
  width: number;
  height: number;
  rooms: RoomLayout[];
  decorations: DecorationItem[];
}

export interface DecorationItem {
  type: 'wall' | 'door' | 'window' | 'elevator' | 'stairs' | 'restroom-sign' | 'exit-sign' | 'fire-extinguisher' | 'corridor';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}
