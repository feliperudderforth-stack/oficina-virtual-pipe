'use client';

import React from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { getInitials, getStatusColor, getStatusLabel, cn, formatTime } from '@/lib/utils';
import {
  X, MessageSquare, Video, Phone, Hand, MapPin,
  Briefcase, Mail, Clock, Calendar, MoreHorizontal
} from 'lucide-react';
import type { User } from '@/types';

export default function UserProfileModal() {
  const {
    selectedUserId,
    setSelectedUserId,
    users,
    currentUser,
    rooms,
    setActiveChannelId,
    setSidebarTab,
  } = useOfficeStore();

  if (!selectedUserId) return null;

  const user = users.get(selectedUserId);
  if (!user) return null;

  const isMe = user.id === currentUser?.id;
  const currentRoom = rooms.get(user.currentRoom);

  const handleDM = () => {
    const socket = getSocket();
    socket.emit('dm:create', { targetId: user.id }, (response: { channelId: string }) => {
      setActiveChannelId(response.channelId);
      setSidebarTab('chat');
      setSelectedUserId(null);
    });
  };

  const handleCall = (type: 'audio' | 'video') => {
    const socket = getSocket();
    socket.emit('webrtc:call-request', { targetId: user.id, type });
    setSelectedUserId(null);
  };

  const handleWave = () => {
    const socket = getSocket();
    socket.emit('interaction:wave', { targetId: user.id });
    setSelectedUserId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div
          className="h-24 relative"
          style={{
            background: `linear-gradient(135deg, ${user.color}, ${user.color}dd)`,
          }}
        >
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition-colors"
            onClick={() => setSelectedUserId(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-6 -mt-12">
          <div className="relative inline-block">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white"
              style={{ backgroundColor: user.color }}
            >
              {getInitials(user.name)}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white"
              style={{ backgroundColor: getStatusColor(user.status) }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {user.name}
            {isMe && <span className="text-sm text-gray-400 font-normal ml-2">(You)</span>}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{user.title}</p>
        </div>

        {/* Details */}
        <div className="px-6 py-3 space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Department</p>
              <p className="font-medium text-gray-900">{user.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(user.status) }}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-medium text-gray-900">{getStatusLabel(user.status)}</p>
            </div>
          </div>

          {currentRoom && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="font-medium text-gray-900">{currentRoom.name}</p>
              </div>
            </div>
          )}

          {user.email && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Last Active</p>
              <p className="font-medium text-gray-900">{formatTime(user.lastActivity)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isMe && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
            <button onClick={handleDM} className="btn-primary flex-1 !py-2.5">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
            <button onClick={() => handleCall('video')} className="btn-secondary !py-2.5">
              <Video className="w-4 h-4" />
            </button>
            <button onClick={() => handleCall('audio')} className="btn-secondary !py-2.5">
              <Phone className="w-4 h-4" />
            </button>
            <button onClick={handleWave} className="btn-secondary !py-2.5" title="Wave">
              <Hand className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
