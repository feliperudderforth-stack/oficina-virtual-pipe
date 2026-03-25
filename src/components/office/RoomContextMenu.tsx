'use client';

import React from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import {
  DoorOpen, Lock, LockOpen, Video, Users, Bell,
  Pencil, Copy, MapPin
} from 'lucide-react';
import type { Room, RoomLayout } from '@/types';

interface RoomContextMenuProps {
  room: RoomLayout;
  serverRoom: Room | undefined;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenWhiteboard: () => void;
}

export default function RoomContextMenu({
  room,
  serverRoom,
  position,
  onClose,
  onOpenWhiteboard,
}: RoomContextMenuProps) {
  const { currentUser, currentRoomId } = useOfficeStore();
  const isInRoom = currentRoomId === room.id;

  const handleJoinRoom = () => {
    const socket = getSocket();
    socket.emit('room:join', { roomId: room.id });
    onClose();
  };

  const handleToggleLock = () => {
    const socket = getSocket();
    socket.emit('room:lock', { roomId: room.id });
    onClose();
  };

  const handleKnock = () => {
    const socket = getSocket();
    socket.emit('interaction:knock', { roomId: room.id });
    onClose();
  };

  const handleStartMeeting = () => {
    const socket = getSocket();
    socket.emit('meeting:start', {
      roomId: room.id,
      title: `Meeting in ${room.name}`,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 animate-scale-in"
        style={{ left: position.x, top: position.y }}
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{room.name}</p>
          <p className="text-[10px] text-gray-400">
            {serverRoom ? `${serverRoom.occupants.length}/${serverRoom.capacity} occupants` : 'Loading...'}
          </p>
        </div>

        <div className="py-1">
          {!isInRoom && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleJoinRoom}
            >
              <DoorOpen className="w-4 h-4 text-gray-400" />
              Enter Room
            </button>
          )}

          {isInRoom && (
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled>
              <MapPin className="w-4 h-4 text-brand-500" />
              <span className="text-brand-600">You are here</span>
            </button>
          )}

          {serverRoom?.isLocked && !isInRoom && (
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleKnock}
            >
              <Bell className="w-4 h-4 text-gray-400" />
              Knock
            </button>
          )}

          {isInRoom && (
            <>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleToggleLock}
              >
                {serverRoom?.isLocked ? (
                  <>
                    <LockOpen className="w-4 h-4 text-gray-400" />
                    Unlock Room
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    Lock Room
                  </>
                )}
              </button>

              {room.type === 'conference' && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleStartMeeting}
                >
                  <Video className="w-4 h-4 text-gray-400" />
                  Start Meeting
                </button>
              )}

              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onOpenWhiteboard}
              >
                <Pencil className="w-4 h-4 text-gray-400" />
                Open Whiteboard
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
