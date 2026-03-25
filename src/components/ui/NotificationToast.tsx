'use client';

import React, { useEffect, useState } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { cn, getInitials, formatTime } from '@/lib/utils';
import {
  MessageSquare, Phone, Video, Calendar, Hand,
  AtSign, Bell, X, ChevronRight
} from 'lucide-react';
import type { Notification } from '@/types';

const notificationIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  mention: <AtSign className="w-4 h-4" />,
  knock: <Bell className="w-4 h-4" />,
  wave: <Hand className="w-4 h-4" />,
  system: <Bell className="w-4 h-4" />,
};

const notificationColors: Record<string, string> = {
  message: 'bg-blue-500',
  call: 'bg-green-500',
  meeting: 'bg-purple-500',
  mention: 'bg-amber-500',
  knock: 'bg-orange-500',
  wave: 'bg-pink-500',
  system: 'bg-gray-500',
};

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'max-w-sm w-full glass-panel rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all',
        isExiting ? 'notification-exit' : 'notification-enter'
      )}
      onClick={() => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0',
          notificationColors[notification.type] || 'bg-gray-500'
        )}>
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
        </div>
        <button
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsExiting(true);
            setTimeout(onDismiss, 300);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, markNotificationRead } = useOfficeStore();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      const latest = unread[0];
      if (!visibleToasts.find(t => t.id === latest.id)) {
        setVisibleToasts(prev => [latest, ...prev].slice(0, 3));
      }
    }
  }, [notifications, visibleToasts]);

  const dismiss = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id));
    markNotificationRead(id);
  };

  return (
    <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2">
      {visibleToasts.map(toast => (
        <Toast
          key={toast.id}
          notification={toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}
