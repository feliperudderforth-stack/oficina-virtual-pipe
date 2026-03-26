import { create } from 'zustand';
import type { User, Room, Channel, ChatMessage, Meeting, Notification, UserStatus, Position, TypingUser } from '@/types';

interface OfficeState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateCurrentUserPosition: (position: Position) => void;
  updateCurrentUserStatus: (status: UserStatus) => void;

  // All users
  users: Map<string, User>;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Rooms
  rooms: Map<string, Room>;
  setRooms: (rooms: Room[]) => void;
  updateRoom: (room: Room) => void;
  currentRoomId: string;
  setCurrentRoomId: (roomId: string) => void;

  // Channels & Chat
  channels: Map<string, Channel>;
  setChannels: (channels: Channel[]) => void;
  activeChannelId: string;
  setActiveChannelId: (channelId: string) => void;
  messages: Map<string, ChatMessage[]>;
  setMessages: (channelId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  typingUsers: TypingUser[];
  setTypingUser: (typing: TypingUser, isTyping: boolean) => void;

  // Meetings
  meetings: Map<string, Meeting>;
  addMeeting: (meeting: Meeting) => void;
  removeMeeting: (meetingId: string) => void;
  currentMeetingId: string | null;
  setCurrentMeetingId: (meetingId: string | null) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarTab: 'chat' | 'people' | 'rooms' | 'settings';
  setSidebarTab: (tab: 'chat' | 'people' | 'rooms' | 'settings') => void;
  isProfileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  showMiniMap: boolean;
  toggleMiniMap: () => void;

  // Camera/viewport
  cameraOffset: Position;
  setCameraOffset: (offset: Position) => void;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Call state
  isInCall: boolean;
  setInCall: (inCall: boolean) => void;
  callPeers: string[];
  addCallPeer: (peerId: string) => void;
  removeCallPeer: (peerId: string) => void;

  // Interaction state
  interactionPrompt: { furnitureId: string; label: string; roomId: string } | null;
  setInteractionPrompt: (prompt: { furnitureId: string; label: string; roomId: string } | null) => void;
  sitDown: (furnitureId: string) => void;
  standUp: () => void;

  // Focus mode
  isFocusMode: boolean;
  toggleFocusMode: () => void;

  // Desk customization
  deskItems: Array<{ id: string; type: string; x: number; z: number; color?: string }>;
  addDeskItem: (item: { id: string; type: string; x: number; z: number; color?: string }) => void;
  removeDeskItem: (id: string) => void;
  moveDeskItem: (id: string, x: number, z: number) => void;

  // Walk-up-to-talk
  proximityPeers: Set<string>;
  addProximityPeer: (id: string) => void;
  removeProximityPeer: (id: string) => void;
}

export const useOfficeStore = create<OfficeState>((set, get) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  updateCurrentUserPosition: (position) => {
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, position } });
    }
  },
  updateCurrentUserStatus: (status) => {
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, status } });
    }
  },

  // All users
  users: new Map(),
  setUsers: (users) => {
    const map = new Map<string, User>();
    users.forEach(u => map.set(u.id, u));
    set({ users: map });
  },
  addUser: (user) => {
    const users = new Map(get().users);
    users.set(user.id, user);
    set({ users });
  },
  removeUser: (userId) => {
    const users = new Map(get().users);
    users.delete(userId);
    set({ users });
  },
  updateUser: (userId, updates) => {
    const users = new Map(get().users);
    const user = users.get(userId);
    if (user) {
      users.set(userId, { ...user, ...updates });
      set({ users });
    }
  },

  // Rooms
  rooms: new Map(),
  setRooms: (rooms) => {
    const map = new Map<string, Room>();
    rooms.forEach(r => map.set(r.id, r));
    set({ rooms: map });
  },
  updateRoom: (room) => {
    const rooms = new Map(get().rooms);
    rooms.set(room.id, room);
    set({ rooms });
  },
  currentRoomId: 'lobby',
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

  // Channels & Chat
  channels: new Map(),
  setChannels: (channels) => {
    const map = new Map<string, Channel>();
    channels.forEach(c => map.set(c.id, c));
    set({ channels: map });
  },
  activeChannelId: 'general',
  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  messages: new Map(),
  setMessages: (channelId, messages) => {
    const allMessages = new Map(get().messages);
    allMessages.set(channelId, messages);
    set({ messages: allMessages });
  },
  addMessage: (message) => {
    const allMessages = new Map(get().messages);
    const channelMessages = [...(allMessages.get(message.channelId) || []), message];
    allMessages.set(message.channelId, channelMessages);
    set({ messages: allMessages });
  },
  typingUsers: [],
  setTypingUser: (typing, isTyping) => {
    set((state) => ({
      typingUsers: isTyping
        ? [...state.typingUsers.filter(t => t.userId !== typing.userId), typing]
        : state.typingUsers.filter(t => t.userId !== typing.userId),
    }));
  },

  // Meetings
  meetings: new Map(),
  addMeeting: (meeting) => {
    const meetings = new Map(get().meetings);
    meetings.set(meeting.id, meeting);
    set({ meetings });
  },
  removeMeeting: (meetingId) => {
    const meetings = new Map(get().meetings);
    meetings.delete(meetingId);
    set({ meetings });
  },
  currentMeetingId: null,
  setCurrentMeetingId: (meetingId) => set({ currentMeetingId: meetingId }),

  // Notifications
  notifications: [],
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }));
  },
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  clearNotifications: () => set({ notifications: [] }),

  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  sidebarTab: 'chat',
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  isProfileOpen: false,
  setProfileOpen: (open) => set({ isProfileOpen: open }),
  selectedUserId: null,
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  showMiniMap: true,
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),

  // Camera
  cameraOffset: { x: 0, y: 0 },
  setCameraOffset: (offset) => set({ cameraOffset: offset }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.3, Math.min(2, zoom)) }),

  // Connection
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // Call state
  isInCall: false,
  setInCall: (inCall) => set({ isInCall: inCall }),
  callPeers: [],
  addCallPeer: (peerId) => set((state) => ({ callPeers: [...state.callPeers, peerId] })),
  removeCallPeer: (peerId) => set((state) => ({ callPeers: state.callPeers.filter(id => id !== peerId) })),

  // Interaction
  interactionPrompt: null,
  setInteractionPrompt: (prompt) => set({ interactionPrompt: prompt }),
  sitDown: (furnitureId) => {
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, isSitting: true, sittingFurnitureId: furnitureId } });
    }
  },
  standUp: () => {
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, isSitting: false, sittingFurnitureId: null } });
    }
  },

  // Focus mode
  isFocusMode: false,
  toggleFocusMode: () => {
    const prev = get().isFocusMode;
    const user = get().currentUser;
    if (user) {
      set({
        isFocusMode: !prev,
        currentUser: { ...user, status: !prev ? 'dnd' : 'available' },
      });
    }
  },

  // Desk customization
  deskItems: [],
  addDeskItem: (item) => set((state) => ({ deskItems: [...state.deskItems, item] })),
  removeDeskItem: (id) => set((state) => ({ deskItems: state.deskItems.filter(i => i.id !== id) })),
  moveDeskItem: (id, x, z) => set((state) => ({
    deskItems: state.deskItems.map(i => i.id === id ? { ...i, x, z } : i),
  })),

  // Walk-up-to-talk
  proximityPeers: new Set(),
  addProximityPeer: (id) => set((state) => {
    const next = new Set(state.proximityPeers);
    next.add(id);
    return { proximityPeers: next };
  }),
  removeProximityPeer: (id) => set((state) => {
    const next = new Set(state.proximityPeers);
    next.delete(id);
    return { proximityPeers: next };
  }),
}));
