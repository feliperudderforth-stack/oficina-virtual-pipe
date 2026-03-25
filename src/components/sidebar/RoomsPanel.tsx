'use client';

import React, { useState } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn, getInitials, getStatusColor } from '@/lib/utils';
import {
  DoorOpen, Lock, LockOpen, Users, Video, Maximize2,
  MapPin, Search, ChevronRight
} from 'lucide-react';
import type { Room, RoomType } from '@/types';

const roomTypeConfig: Record<RoomType, { icon: string; label: string; color: string }> = {
  lobby: { icon: '🏢', label: 'Lobby', color: '#c4b5a0' },
  'open-space': { icon: '💻', label: 'Open Space', color: '#d4cfc5' },
  conference: { icon: '📋', label: 'Conference', color: '#8da4c8' },
  'private-office': { icon: '🔒', label: 'Private', color: '#8ab060' },
  lounge: { icon: '☕', label: 'Lounge', color: '#d4a574' },
  cafeteria: { icon: '🍽️', label: 'Cafeteria', color: '#e8a87c' },
};

function RoomCard({ room }: { room: Room }) {
  const { currentRoomId, users, currentUser } = useOfficeStore();
  const isCurrentRoom = currentRoomId === room.id;
  const config = roomTypeConfig[room.type];
  const occupants = room.occupants
    .map(id => users.get(id))
    .filter(Boolean);
  const occupancyPercent = (room.occupants.length / room.capacity) * 100;

  const handleJoinRoom = () => {
    const socket = getSocket();
    socket.emit('room:join', { roomId: room.id }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error('Failed to join room:', response.error);
      }
    });
  };

  const handleToggleLock = () => {
    const socket = getSocket();
    socket.emit('room:lock', { roomId: room.id });
  };

  return (
    <div
      className={cn(
        'corporate-card p-3 transition-all',
        isCurrentRoom && 'ring-2 ring-brand-500 border-brand-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${config.color}30` }}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{room.name}</h4>
            {room.isLocked && <Lock className="w-3 h-3 text-amber-500" />}
            {isCurrentRoom && (
              <span className="badge bg-brand-100 text-brand-700 !text-[9px]">Here</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{config.label}</p>

          {/* Occupancy bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>{room.occupants.length} / {room.capacity}</span>
              <span>{Math.round(occupancyPercent)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  occupancyPercent > 80 ? 'bg-red-400' :
                  occupancyPercent > 50 ? 'bg-amber-400' : 'bg-green-400'
                )}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Occupants avatars */}
          {occupants.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-1.5">
                {occupants.slice(0, 5).map(user => user && (
                  <div
                    key={user.id}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold border border-white"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {getInitials(user.name)}
                  </div>
                ))}
              </div>
              {occupants.length > 5 && (
                <span className="text-[10px] text-gray-400">+{occupants.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
        {!isCurrentRoom ? (
          <button
            onClick={handleJoinRoom}
            className="btn-primary !py-1.5 !px-3 !text-xs flex-1"
            disabled={room.isLocked && room.lockedBy !== currentUser?.id}
          >
            <DoorOpen className="w-3 h-3" /> Enter Room
          </button>
        ) : (
          <span className="text-xs text-brand-600 font-medium flex items-center gap-1 flex-1">
            <MapPin className="w-3 h-3" /> You are here
          </span>
        )}

        {isCurrentRoom && room.type !== 'lobby' && (
          <button
            onClick={handleToggleLock}
            className="btn-icon !w-8 !h-8"
            title={room.isLocked ? 'Unlock Room' : 'Lock Room'}
          >
            {room.isLocked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        )}

        {room.type === 'conference' && (
          <button className="btn-icon !w-8 !h-8" title="Start Meeting">
            <Video className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function RoomsPanel() {
  const { rooms } = useOfficeStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<RoomType | 'all'>('all');

  const roomArray = Array.from(rooms.values()).filter(room => {
    if (search) {
      const q = search.toLowerCase();
      if (!room.name.toLowerCase().includes(q)) return false;
    }
    if (filterType !== 'all' && room.type !== filterType) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900 mb-3">Rooms</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="input-field !pl-9 !text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          <button
            className={cn(
              'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
              filterType === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          {Object.entries(roomTypeConfig).map(([type, config]) => (
            <button
              key={type}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
                filterType === type ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              onClick={() => setFilterType(type as RoomType)}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {roomArray.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
