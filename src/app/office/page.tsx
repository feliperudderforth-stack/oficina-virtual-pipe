'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import OfficeCanvas from '@/components/office/OfficeCanvas';
import MiniMap from '@/components/office/MiniMap';
import Toolbar from '@/components/ui/Toolbar';
import ChatPanel from '@/components/chat/ChatPanel';
import PeoplePanel from '@/components/sidebar/PeoplePanel';
import RoomsPanel from '@/components/sidebar/RoomsPanel';
import SettingsPanel from '@/components/sidebar/SettingsPanel';
import VideoCallOverlay, { IncomingCallModal } from '@/components/video/VideoCallOverlay';
import NotificationToast from '@/components/ui/NotificationToast';
import UserProfileModal from '@/components/ui/UserProfileModal';
import { cn } from '@/lib/utils';
import { getRoomAt } from '@/data/officeLayout';
import {
  Wifi, WifiOff, Loader2, Users, MapPin
} from 'lucide-react';
import type { User, Room, Channel, ChatMessage, Notification } from '@/types';

// ─── Connection Status Bar ──────────────────────────────────────────────

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  if (isConnected) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[90] bg-amber-500 text-amber-900 text-xs font-medium text-center py-1.5 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      Reconnecting to server...
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
    </div>
  );
}

// ─── Room Info Bar ──────────────────────────────────────────────────────

function RoomInfoBar() {
  const { currentUser, rooms, currentRoomId, users } = useOfficeStore();
  const room = rooms.get(currentRoomId);

  if (!room) return null;

  const occupantCount = room.occupants.length;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <div className="glass-panel rounded-full px-5 py-2 flex items-center gap-3 shadow-lg">
        <MapPin className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-semibold text-gray-900">{room.name}</span>
        <div className="w-px h-4 bg-gray-300" />
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {occupantCount} / {room.capacity}
        </span>
        {room.isLocked && (
          <span className="text-xs text-amber-600 font-medium">🔒 Locked</span>
        )}
      </div>
    </div>
  );
}

// ─── Incoming Call State ────────────────────────────────────────────────

interface IncomingCall {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  type: 'audio' | 'video';
}

// ─── Main Office Page ───────────────────────────────────────────────────

export default function OfficePage() {
  const router = useRouter();
  const socketInitialized = useRef(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const {
    currentUser,
    setCurrentUser,
    setUsers,
    addUser,
    removeUser,
    updateUser,
    setRooms,
    updateRoom,
    setChannels,
    setMessages,
    addMessage,
    setTypingUser,
    addMeeting,
    removeMeeting,
    addNotification,
    isConnected,
    setConnected,
    isSidebarOpen,
    sidebarTab,
    setInCall,
    addCallPeer,
    removeCallPeer,
  } = useOfficeStore();

  // Check auth and initialize socket
  useEffect(() => {
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    const stored = sessionStorage.getItem('virtualOfficeUser');
    if (!stored) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(stored);
    const socket = connectSocket();

    // Connection events
    socket.on('connect', () => {
      setConnected(true);

      socket.emit('user:join', {
        name: userData.name,
        email: userData.email,
        department: userData.department,
        title: userData.title,
      }, (response: {
        user: User;
        users: User[];
        rooms: Room[];
        channels: Channel[];
        messages: Record<string, ChatMessage[]>;
      }) => {
        setCurrentUser(response.user);
        setUsers(response.users);
        setRooms(response.rooms);
        setChannels(response.channels);

        Object.entries(response.messages).forEach(([channelId, msgs]) => {
          setMessages(channelId, msgs);
        });
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // User events
    socket.on('user:joined', (user: User) => {
      addUser(user);
      addNotification({
        id: `join-${user.id}-${Date.now()}`,
        title: 'New Colleague',
        body: `${user.name} entered the office`,
        type: 'system',
        timestamp: Date.now(),
        read: false,
      });
    });

    socket.on('user:left', (data: { id: string }) => {
      removeUser(data.id);
    });

    socket.on('user:moved', (data: { id: string; position: { x: number; y: number }; direction: string }) => {
      updateUser(data.id, {
        position: data.position,
        direction: data.direction as User['direction'],
      });
    });

    socket.on('user:status-changed', (data: { id: string; status: User['status'] }) => {
      updateUser(data.id, { status: data.status });
    });

    // Room events
    socket.on('room:updated', (room: Room) => {
      updateRoom(room);
    });

    socket.on('room:user-joined', (data: { roomId: string; userId: string; user: User }) => {
      // Room update is handled by room:updated
    });

    // Chat events
    socket.on('chat:message', (message: ChatMessage) => {
      addMessage(message);

      if (message.senderId !== currentUser?.id) {
        addNotification({
          id: `msg-${message.id}`,
          title: message.senderName,
          body: message.content.slice(0, 100),
          type: 'message',
          timestamp: Date.now(),
          read: false,
        });
      }
    });

    socket.on('chat:typing', (data: { userId: string; userName: string; channelId: string; isTyping: boolean }) => {
      setTypingUser({ userId: data.userId, userName: data.userName, channelId: data.channelId }, data.isTyping);
    });

    socket.on('chat:reaction-updated', (data: { messageId: string; channelId: string; reactions: Record<string, string[]> }) => {
      // Reactions are updated in real-time on the server, refresh from next message sync
    });

    // Meeting events
    socket.on('meeting:started', (meeting: any) => {
      addMeeting(meeting);
    });

    socket.on('meeting:ended', (data: { meetingId: string }) => {
      removeMeeting(data.meetingId);
    });

    // WebRTC events
    socket.on('webrtc:call-incoming', (data: IncomingCall) => {
      setIncomingCall(data);
    });

    socket.on('webrtc:call-response', (data: { responderId: string; accepted: boolean }) => {
      if (data.accepted) {
        addCallPeer(data.responderId);
      }
    });

    // Media events
    socket.on('media:toggled', (data: { userId: string; type: string; value: boolean }) => {
      switch (data.type) {
        case 'mute':
          updateUser(data.userId, { isMuted: data.value });
          break;
        case 'camera':
          updateUser(data.userId, { isCameraOn: data.value });
          break;
        case 'screen':
          updateUser(data.userId, { isScreenSharing: data.value });
          break;
      }
    });

    // Interaction events
    socket.on('interaction:wave', (data: { userId: string; userName: string }) => {
      addNotification({
        id: `wave-${data.userId}-${Date.now()}`,
        title: 'Wave!',
        body: `${data.userName} waved at you 👋`,
        type: 'wave',
        timestamp: Date.now(),
        read: false,
      });
    });

    socket.on('interaction:knock', (data: { userId: string; userName: string; roomId: string }) => {
      addNotification({
        id: `knock-${data.userId}-${Date.now()}`,
        title: 'Knock Knock!',
        body: `${data.userName} is knocking`,
        type: 'knock',
        timestamp: Date.now(),
        read: false,
      });
    });

    socket.on('notification:received', (data: Notification) => {
      addNotification(data);
    });

    return () => {
      disconnectSocket();
      socket.removeAllListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Send movement updates to server
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    const interval = setInterval(() => {
      socket.emit('user:move', {
        position: currentUser.position,
        direction: currentUser.direction,
      });

      // Check room transitions
      const room = getRoomAt(currentUser.position.x, currentUser.position.y);
      if (room && room.id !== currentUser.currentRoom) {
        socket.emit('room:join', { roomId: room.id });
      }
    }, 50); // 20 updates per second

    return () => clearInterval(interval);
  }, [currentUser]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const { toggleSidebar, setSidebarTab, toggleMiniMap } = useOfficeStore.getState();

      switch (e.key.toLowerCase()) {
        case 'c':
          setSidebarTab('chat');
          break;
        case 'p':
          setSidebarTab('people');
          break;
        case 'r':
          setSidebarTab('rooms');
          break;
        case 'm':
          toggleMiniMap();
          break;
        case 'escape':
          if (isSidebarOpen) toggleSidebar();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Handle incoming call
  const handleAcceptCall = () => {
    if (incomingCall) {
      const socket = getSocket();
      socket.emit('webrtc:call-response', { targetId: incomingCall.callerId, accepted: true });
      addCallPeer(incomingCall.callerId);
      setInCall(true);
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    if (incomingCall) {
      const socket = getSocket();
      socket.emit('webrtc:call-response', { targetId: incomingCall.callerId, accepted: false });
      setIncomingCall(null);
    }
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Entering the office...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} />

      {/* Left Toolbar */}
      <Toolbar />

      {/* Sidebar Panel */}
      <div
        className={cn(
          'h-full border-r border-gray-200 bg-white transition-all duration-300 overflow-hidden flex flex-col',
          isSidebarOpen ? 'w-[380px]' : 'w-0'
        )}
      >
        {isSidebarOpen && (
          <>
            {sidebarTab === 'chat' && <ChatPanel />}
            {sidebarTab === 'people' && <PeoplePanel />}
            {sidebarTab === 'rooms' && <RoomsPanel />}
            {sidebarTab === 'settings' && <SettingsPanel />}
          </>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <OfficeCanvas />
        <RoomInfoBar />
        <MiniMap />

        {/* Online count */}
        <div className="absolute top-4 right-4 z-30">
          <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-700">
              {Array.from(useOfficeStore.getState().users.values()).filter(u => u.status !== 'offline').length} online
            </span>
          </div>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 right-4 z-30">
          <div className="glass-panel rounded-xl px-4 py-3 shadow-sm max-w-xs">
            <p className="text-[10px] text-gray-500 font-medium">
              Use <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono mx-0.5">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono">S</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono ml-0.5">D</kbd>
              {' '}or arrow keys to move · Click to teleport
            </p>
          </div>
        </div>
      </div>

      {/* Video Call Overlay */}
      <VideoCallOverlay />

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.type}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* User Profile Modal */}
      <UserProfileModal />

      {/* Notification Toasts */}
      <NotificationToast />
    </div>
  );
}
