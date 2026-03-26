import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Position {
  x: number;
  y: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  status: 'available' | 'busy' | 'away' | 'in-meeting' | 'dnd' | 'offline';
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
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'emoji';
  channelId: string;
  threadId?: string;
  reactions: Record<string, string[]>;
  timestamp: number;
  edited: boolean;
  replyTo?: string;
}

interface Room {
  id: string;
  name: string;
  type: 'open-space' | 'conference' | 'private-office' | 'lounge' | 'cafeteria' | 'lobby';
  capacity: number;
  occupants: string[];
  isLocked: boolean;
  lockedBy?: string;
}

interface MeetingData {
  id: string;
  roomId: string;
  title: string;
  hostId: string;
  participants: string[];
  isRecording: boolean;
  startedAt: number;
  scheduledEnd?: number;
}

interface SignalData {
  targetId: string;
  signal: unknown;
  type: 'offer' | 'answer' | 'ice-candidate';
}

interface WhiteboardStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  userId: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

const users = new Map<string, UserData>();
const rooms = new Map<string, Room>();
const messages = new Map<string, ChatMessage[]>();
const meetings = new Map<string, MeetingData>();
const channels = new Map<string, { id: string; name: string; type: 'public' | 'private' | 'dm'; members: string[]; }>();
const socketToUser = new Map<string, string>();

// ─── Initialize Default Rooms ────────────────────────────────────────────────

function initializeRooms() {
  const defaultRooms: Room[] = [
    { id: 'lobby', name: 'Main Lobby', type: 'lobby', capacity: 200, occupants: [], isLocked: false },
    { id: 'open-space-1', name: 'Open Workspace A', type: 'open-space', capacity: 50, occupants: [], isLocked: false },
    { id: 'open-space-2', name: 'Open Workspace B', type: 'open-space', capacity: 50, occupants: [], isLocked: false },
    { id: 'conf-room-1', name: 'Conference Room Alpha', type: 'conference', capacity: 12, occupants: [], isLocked: false },
    { id: 'conf-room-2', name: 'Conference Room Beta', type: 'conference', capacity: 12, occupants: [], isLocked: false },
    { id: 'conf-room-3', name: 'Conference Room Gamma', type: 'conference', capacity: 8, occupants: [], isLocked: false },
    { id: 'conf-room-4', name: 'Boardroom Executive', type: 'conference', capacity: 20, occupants: [], isLocked: false },
    { id: 'private-1', name: 'Private Office 1', type: 'private-office', capacity: 2, occupants: [], isLocked: false },
    { id: 'private-2', name: 'Private Office 2', type: 'private-office', capacity: 2, occupants: [], isLocked: false },
    { id: 'private-3', name: 'Private Office 3', type: 'private-office', capacity: 2, occupants: [], isLocked: false },
    { id: 'private-4', name: 'CEO Office', type: 'private-office', capacity: 4, occupants: [], isLocked: false },
    { id: 'lounge-1', name: 'Break Lounge', type: 'lounge', capacity: 30, occupants: [], isLocked: false },
    { id: 'cafeteria', name: 'Cafeteria & Kitchen', type: 'cafeteria', capacity: 60, occupants: [], isLocked: false },
  ];

  const defaultChannels = [
    { id: 'general', name: 'General', type: 'public' as const, members: [] as string[] },
    { id: 'announcements', name: 'Announcements', type: 'public' as const, members: [] as string[] },
    { id: 'random', name: 'Random', type: 'public' as const, members: [] as string[] },
    { id: 'engineering', name: 'Engineering', type: 'public' as const, members: [] as string[] },
    { id: 'design', name: 'Design', type: 'public' as const, members: [] as string[] },
    { id: 'marketing', name: 'Marketing', type: 'public' as const, members: [] as string[] },
    { id: 'hr', name: 'Human Resources', type: 'public' as const, members: [] as string[] },
    { id: 'watercooler', name: 'Water Cooler', type: 'public' as const, members: [] as string[] },
  ];

  defaultRooms.forEach(room => rooms.set(room.id, room));
  defaultChannels.forEach(ch => channels.set(ch.id, ch));
  defaultChannels.forEach(ch => messages.set(ch.id, []));
}

initializeRooms();

// ─── Server ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.SOCKET_PORT || '3001', 10);
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 5e6, // 5MB for file sharing
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

// ─── Connection Handling ─────────────────────────────────────────────────────

io.on('connection', (socket: Socket) => {
  console.log(`[Connect] Socket ${socket.id} connected`);

  // ── User Join ──────────────────────────────────────────────────────────
  socket.on('user:join', (data: Partial<UserData>, callback: (response: {
    user: UserData;
    users: UserData[];
    rooms: Room[];
    channels: { id: string; name: string; type: string; members: string[] }[];
    messages: Record<string, ChatMessage[]>;
  }) => void) => {
    const userId = data.id || uuidv4();

    const user: UserData = {
      id: userId,
      name: data.name || 'Anonymous',
      email: data.email || '',
      avatar: data.avatar || '',
      color: data.color || generateColor(),
      position: data.position || { x: 600, y: 400 },
      direction: 'down',
      status: 'available',
      currentRoom: 'lobby',
      role: data.role || 'member',
      department: data.department || 'General',
      title: data.title || 'Team Member',
      isTyping: false,
      isSpeaking: false,
      isMuted: true,
      isCameraOn: false,
      isScreenSharing: false,
      lastActivity: Date.now(),
    };

    users.set(userId, user);
    socketToUser.set(socket.id, userId);

    // Join lobby room
    socket.join('room:lobby');
    const lobbyRoom = rooms.get('lobby');
    if (lobbyRoom) {
      lobbyRoom.occupants.push(userId);
    }

    // Join default channels
    channels.forEach((ch) => {
      if (ch.type === 'public') {
        ch.members.push(userId);
        socket.join(`channel:${ch.id}`);
      }
    });

    // Broadcast new user to everyone
    socket.broadcast.emit('user:joined', user);

    // Send initial state to the new user
    if (callback) {
      callback({
        user,
        users: Array.from(users.values()),
        rooms: Array.from(rooms.values()),
        channels: Array.from(channels.values()),
        messages: Object.fromEntries(messages),
      });
    }

    console.log(`[Join] ${user.name} (${userId}) joined. Total users: ${users.size}`);
  });

  // ── Movement ──────────────────────────────────────────────────────────
  socket.on('user:move', (data: { position: Position; direction: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    user.position = data.position;
    user.direction = data.direction as UserData['direction'];
    user.lastActivity = Date.now();

    // Broadcast to all except sender
    socket.broadcast.emit('user:moved', {
      id: userId,
      position: data.position,
      direction: data.direction,
    });
  });

  // ── Status Update ─────────────────────────────────────────────────────
  socket.on('user:status', (data: { status: UserData['status'] }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    user.status = data.status;
    user.lastActivity = Date.now();

    io.emit('user:status-changed', { id: userId, status: data.status });
  });

  // ── Room Management ───────────────────────────────────────────────────
  socket.on('room:join', (data: { roomId: string }, callback?: (response: { success: boolean; error?: string }) => void) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    const room = rooms.get(data.roomId);
    if (!user || !room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    if (room.isLocked && room.lockedBy !== userId) {
      callback?.({ success: false, error: 'Room is locked' });
      return;
    }

    if (room.occupants.length >= room.capacity) {
      callback?.({ success: false, error: 'Room is full' });
      return;
    }

    // Leave current room
    const currentRoom = rooms.get(user.currentRoom);
    if (currentRoom) {
      currentRoom.occupants = currentRoom.occupants.filter(id => id !== userId);
      socket.leave(`room:${user.currentRoom}`);
      io.to(`room:${user.currentRoom}`).emit('room:user-left', { roomId: user.currentRoom, userId });
    }

    // Join new room
    room.occupants.push(userId);
    user.currentRoom = data.roomId;
    socket.join(`room:${data.roomId}`);

    io.to(`room:${data.roomId}`).emit('room:user-joined', { roomId: data.roomId, userId, user });
    io.emit('room:updated', room);

    callback?.({ success: true });
  });

  socket.on('room:lock', (data: { roomId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const room = rooms.get(data.roomId);
    if (!room) return;

    room.isLocked = !room.isLocked;
    room.lockedBy = room.isLocked ? userId : undefined;
    io.emit('room:updated', room);
  });

  // ── Chat Messages ─────────────────────────────────────────────────────
  socket.on('chat:message', (data: {
    channelId: string;
    content: string;
    type?: ChatMessage['type'];
    threadId?: string;
    replyTo?: string;
  }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    const message: ChatMessage = {
      id: uuidv4(),
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: data.content,
      type: data.type || 'text',
      channelId: data.channelId,
      threadId: data.threadId,
      reactions: {},
      timestamp: Date.now(),
      edited: false,
      replyTo: data.replyTo,
    };

    // Store message
    if (!messages.has(data.channelId)) {
      messages.set(data.channelId, []);
    }
    const channelMessages = messages.get(data.channelId)!;
    channelMessages.push(message);

    // Keep last 500 messages per channel
    if (channelMessages.length > 500) {
      channelMessages.splice(0, channelMessages.length - 500);
    }

    io.to(`channel:${data.channelId}`).emit('chat:message', message);
  });

  socket.on('chat:typing', (data: { channelId: string; isTyping: boolean }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    socket.to(`channel:${data.channelId}`).emit('chat:typing', {
      userId,
      userName: user.name,
      channelId: data.channelId,
      isTyping: data.isTyping,
    });
  });

  socket.on('chat:reaction', (data: { messageId: string; channelId: string; emoji: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const channelMessages = messages.get(data.channelId);
    if (!channelMessages) return;

    const message = channelMessages.find(m => m.id === data.messageId);
    if (!message) return;

    if (!message.reactions[data.emoji]) {
      message.reactions[data.emoji] = [];
    }

    const userIndex = message.reactions[data.emoji].indexOf(userId);
    if (userIndex > -1) {
      message.reactions[data.emoji].splice(userIndex, 1);
      if (message.reactions[data.emoji].length === 0) {
        delete message.reactions[data.emoji];
      }
    } else {
      message.reactions[data.emoji].push(userId);
    }

    io.to(`channel:${data.channelId}`).emit('chat:reaction-updated', {
      messageId: data.messageId,
      channelId: data.channelId,
      reactions: message.reactions,
    });
  });

  // ── Direct Messages ───────────────────────────────────────────────────
  socket.on('dm:create', (data: { targetId: string }, callback?: (response: { channelId: string }) => void) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const dmId = [userId, data.targetId].sort().join('-dm-');

    if (!channels.has(dmId)) {
      channels.set(dmId, {
        id: dmId,
        name: `DM`,
        type: 'dm',
        members: [userId, data.targetId],
      });
      messages.set(dmId, []);
    }

    // Both users join the DM channel
    socket.join(`channel:${dmId}`);

    // Find target socket and make them join too
    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];
    if (targetSocketId) {
      io.sockets.sockets.get(targetSocketId)?.join(`channel:${dmId}`);
    }

    callback?.({ channelId: dmId });
  });

  // ── WebRTC Signaling ──────────────────────────────────────────────────
  socket.on('webrtc:signal', (data: SignalData) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc:signal', {
        senderId: userId,
        signal: data.signal,
        type: data.type,
      });
    }
  });

  socket.on('webrtc:call-request', (data: { targetId: string; type: 'audio' | 'video' }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc:call-incoming', {
        callerId: userId,
        callerName: user.name,
        callerAvatar: user.avatar,
        type: data.type,
      });
    }
  });

  socket.on('webrtc:call-response', (data: { targetId: string; accepted: boolean }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc:call-response', {
        responderId: userId,
        accepted: data.accepted,
      });
    }
  });

  // ── Meetings ──────────────────────────────────────────────────────────
  socket.on('meeting:start', (data: { roomId: string; title: string }, callback?: (meeting: MeetingData) => void) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const meeting: MeetingData = {
      id: uuidv4(),
      roomId: data.roomId,
      title: data.title,
      hostId: userId,
      participants: [userId],
      isRecording: false,
      startedAt: Date.now(),
    };

    meetings.set(meeting.id, meeting);

    const user = users.get(userId);
    if (user) {
      user.status = 'in-meeting';
      io.emit('user:status-changed', { id: userId, status: 'in-meeting' });
    }

    io.to(`room:${data.roomId}`).emit('meeting:started', meeting);
    callback?.(meeting);
  });

  socket.on('meeting:join', (data: { meetingId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const meeting = meetings.get(data.meetingId);
    if (!meeting) return;

    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId);
    }

    const user = users.get(userId);
    if (user) {
      user.status = 'in-meeting';
      io.emit('user:status-changed', { id: userId, status: 'in-meeting' });
    }

    socket.join(`meeting:${data.meetingId}`);
    io.to(`meeting:${data.meetingId}`).emit('meeting:participant-joined', { meetingId: data.meetingId, userId });
  });

  socket.on('meeting:leave', (data: { meetingId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const meeting = meetings.get(data.meetingId);
    if (!meeting) return;

    meeting.participants = meeting.participants.filter(id => id !== userId);
    socket.leave(`meeting:${data.meetingId}`);

    const user = users.get(userId);
    if (user) {
      user.status = 'available';
      io.emit('user:status-changed', { id: userId, status: 'available' });
    }

    io.to(`meeting:${data.meetingId}`).emit('meeting:participant-left', { meetingId: data.meetingId, userId });

    // End meeting if host leaves and no participants
    if (meeting.participants.length === 0) {
      meetings.delete(data.meetingId);
      io.emit('meeting:ended', { meetingId: data.meetingId });
    }
  });

  // ── Media State ───────────────────────────────────────────────────────
  socket.on('media:toggle', (data: { type: 'mute' | 'camera' | 'screen'; value: boolean }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    switch (data.type) {
      case 'mute':
        user.isMuted = data.value;
        break;
      case 'camera':
        user.isCameraOn = data.value;
        break;
      case 'screen':
        user.isScreenSharing = data.value;
        break;
    }

    socket.broadcast.emit('media:toggled', { userId, type: data.type, value: data.value });
  });

  // ── Whiteboard ────────────────────────────────────────────────────────
  socket.on('whiteboard:stroke', (data: WhiteboardStroke & { roomId: string }) => {
    socket.to(`room:${data.roomId}`).emit('whiteboard:stroke', data);
  });

  socket.on('whiteboard:clear', (data: { roomId: string }) => {
    io.to(`room:${data.roomId}`).emit('whiteboard:cleared');
  });

  // ── Notifications ─────────────────────────────────────────────────────
  socket.on('notification:send', (data: { targetId: string; title: string; body: string; type: string }) => {
    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('notification:received', {
        id: uuidv4(),
        ...data,
        timestamp: Date.now(),
      });
    }
  });

  // ── User Interaction (knock, wave, etc.) ──────────────────────────────
  socket.on('interaction:knock', (data: { roomId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    io.to(`room:${data.roomId}`).emit('interaction:knock', {
      userId,
      userName: user.name,
      roomId: data.roomId,
    });
  });

  socket.on('interaction:wave', (data: { targetId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('interaction:wave', {
        userId,
        userName: user.name,
      });
    }
  });

  // ── Nudge (subtle attention grab) ──────────────────────────────────
  socket.on('interaction:nudge', (data: { targetId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (!user) return;

    const targetSocketId = Array.from(socketToUser.entries())
      .find(([, uid]) => uid === data.targetId)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit('interaction:nudge', {
        userId,
        userName: user.name,
      });
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = users.get(userId);
    if (user) {
      // Remove from current room
      const room = rooms.get(user.currentRoom);
      if (room) {
        room.occupants = room.occupants.filter(id => id !== userId);
        io.to(`room:${user.currentRoom}`).emit('room:user-left', { roomId: user.currentRoom, userId });
        io.emit('room:updated', room);
      }

      // Remove from channels
      channels.forEach((ch) => {
        ch.members = ch.members.filter(id => id !== userId);
      });

      // Remove from meetings
      meetings.forEach((meeting, meetingId) => {
        meeting.participants = meeting.participants.filter(id => id !== userId);
        if (meeting.participants.length === 0) {
          meetings.delete(meetingId);
          io.emit('meeting:ended', { meetingId });
        }
      });
    }

    users.delete(userId);
    socketToUser.delete(socket.id);

    io.emit('user:left', { id: userId });
    console.log(`[Disconnect] User ${userId} disconnected. Total users: ${users.size}`);
  });
});

// ─── Utility ─────────────────────────────────────────────────────────────────

function generateColor(): string {
  const colors = [
    '#4c6ef5', '#7950f2', '#be4bdb', '#e64980', '#fa5252',
    '#fd7e14', '#fab005', '#40c057', '#12b886', '#15aabf',
    '#339af0', '#5c7cfa', '#845ef7', '#cc5de8', '#f06595',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ─── Periodic cleanup ────────────────────────────────────────────────────────

setInterval(() => {
  const now = Date.now();
  const AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  users.forEach((user) => {
    if (user.status !== 'away' && user.status !== 'offline' && user.status !== 'dnd' && user.status !== 'in-meeting') {
      if (now - user.lastActivity > AWAY_TIMEOUT) {
        user.status = 'away';
        io.emit('user:status-changed', { id: user.id, status: 'away' });
      }
    }
  });
}, 30000);

// ─── Start ───────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n🏢 Virtual Office Server running on port ${PORT}`);
  console.log(`   Ready for up to 2000+ concurrent connections\n`);
});
