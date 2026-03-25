'use client';

import React, { useState } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn, getStatusColor, getStatusLabel, getInitials } from '@/lib/utils';
import {
  MessageSquare, Users, Layout, Settings, Video, Phone,
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  Bell, BellOff, Map, ZoomIn, ZoomOut, Hand,
  ChevronDown, Circle, MinusCircle, Clock, XCircle, Moon,
  Search, Maximize2, LogOut
} from 'lucide-react';
import type { UserStatus } from '@/types';

// ─── Status Selector ─────────────────────────────────────────────────────

function StatusSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, updateCurrentUserStatus } = useOfficeStore();

  if (!currentUser) return null;

  const statuses: { status: UserStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { status: 'available', label: 'Available', icon: <Circle className="w-3 h-3" />, color: '#22c55e' },
    { status: 'busy', label: 'Busy', icon: <MinusCircle className="w-3 h-3" />, color: '#ef4444' },
    { status: 'away', label: 'Away', icon: <Clock className="w-3 h-3" />, color: '#f59e0b' },
    { status: 'dnd', label: 'Do Not Disturb', icon: <XCircle className="w-3 h-3" />, color: '#dc2626' },
  ];

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: currentUser.color }}
          >
            {getInitials(currentUser.name)}
          </div>
          <div
            className="status-dot absolute -bottom-0.5 -right-0.5"
            style={{ backgroundColor: getStatusColor(currentUser.status) }}
          />
        </div>
        <div className="text-left hidden xl:block">
          <p className="text-xs font-semibold text-white leading-none">{currentUser.name}</p>
          <p className="text-[10px] text-white/60">{getStatusLabel(currentUser.status)}</p>
        </div>
        <ChevronDown className="w-3 h-3 text-white/50 hidden xl:block" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.title}</p>
            </div>
            <div className="py-1">
              {statuses.map(({ status, label, icon, color }) => (
                <button
                  key={status}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                    currentUser.status === status && 'bg-gray-50'
                  )}
                  onClick={() => {
                    updateCurrentUserStatus(status);
                    const socket = getSocket();
                    socket.emit('user:status', { status });
                    setIsOpen(false);
                  }}
                >
                  <span style={{ color }}>{icon}</span>
                  <span className="text-gray-700">{label}</span>
                  {currentUser.status === status && (
                    <span className="ml-auto text-brand-600 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Toolbar ────────────────────────────────────────────────────────

export default function Toolbar() {
  const {
    currentUser,
    isSidebarOpen,
    toggleSidebar,
    sidebarTab,
    setSidebarTab,
    showMiniMap,
    toggleMiniMap,
    zoom,
    setZoom,
    notifications,
    isInCall,
  } = useOfficeStore();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat', shortcut: 'C' },
    { id: 'people' as const, icon: Users, label: 'People', shortcut: 'P' },
    { id: 'rooms' as const, icon: Layout, label: 'Rooms', shortcut: 'R' },
    { id: 'settings' as const, icon: Settings, label: 'Settings', shortcut: ',' },
  ];

  return (
    <div className="h-full w-16 bg-gray-900 flex flex-col items-center py-3 gap-1">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg">
        <span className="text-white font-bold text-lg">V</span>
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-1">
        {navItems.map(({ id, icon: Icon, label, shortcut }) => (
          <button
            key={id}
            className={cn(
              'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group',
              sidebarTab === id && isSidebarOpen
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            )}
            onClick={() => {
              if (sidebarTab === id && isSidebarOpen) {
                toggleSidebar();
              } else {
                setSidebarTab(id);
                if (!isSidebarOpen) toggleSidebar();
              }
            }}
            title={`${label} (${shortcut})`}
          >
            <Icon className="w-5 h-5" />
            {id === 'chat' && unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-gray-700 my-2" />

      {/* Utility */}
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
            showMiniMap ? 'text-brand-400 bg-brand-600/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
          )}
          onClick={toggleMiniMap}
          title="Toggle Minimap"
        >
          <Map className="w-5 h-5" />
        </button>

        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setZoom(Math.min(zoom + 0.15, 2))}
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setZoom(Math.max(zoom - 0.15, 0.3))}
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Call Controls (when in call) */}
      {isInCall && (
        <div className="flex flex-col items-center gap-1 mb-2 px-1 py-2 bg-green-900/30 rounded-xl">
          <button className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notifications */}
      <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
        <Bell className="w-5 h-5" />
        {unreadNotifications > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {/* Profile / Status */}
      <StatusSelector />
    </div>
  );
}
