'use client';

import React, { useState, useMemo } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn, getInitials, getStatusColor, getStatusLabel, formatTime } from '@/lib/utils';
import {
  Search, Video, Phone, MessageSquare, MoreHorizontal,
  MapPin, Briefcase, Hand, ChevronDown, ChevronRight, Filter, Users
} from 'lucide-react';
import type { User, UserStatus } from '@/types';

// ─── User Card ──────────────────────────────────────────────────────────

function UserCard({ user, isCompact = false }: { user: User; isCompact?: boolean }) {
  const { currentUser, setSelectedUserId, setActiveChannelId, setSidebarTab } = useOfficeStore();
  const [showActions, setShowActions] = useState(false);
  const isMe = user.id === currentUser?.id;

  const handleDM = () => {
    const socket = getSocket();
    socket.emit('dm:create', { targetId: user.id }, (response: { channelId: string }) => {
      setActiveChannelId(response.channelId);
      setSidebarTab('chat');
    });
  };

  const handleWave = () => {
    const socket = getSocket();
    socket.emit('interaction:wave', { targetId: user.id });
  };

  const handleCall = (type: 'audio' | 'video') => {
    const socket = getSocket();
    socket.emit('webrtc:call-request', { targetId: user.id, type });
  };

  if (isCompact) {
    return (
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: user.color }}
          >
            {getInitials(user.name)}
          </div>
          <div
            className="status-dot absolute -bottom-0.5 -right-0.5 !w-2.5 !h-2.5"
            style={{ backgroundColor: getStatusColor(user.status) }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name} {isMe && <span className="text-xs text-gray-400">(you)</span>}
          </p>
          <p className="text-[10px] text-gray-500 truncate">{user.title}</p>
        </div>
        {showActions && !isMe && (
          <div className="flex items-center gap-0.5">
            <button onClick={handleDM} className="btn-icon !w-6 !h-6" title="Message">
              <MessageSquare className="w-3 h-3" />
            </button>
            <button onClick={() => handleCall('video')} className="btn-icon !w-6 !h-6" title="Video Call">
              <Video className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="corporate-card p-4 cursor-pointer"
      onClick={() => setSelectedUserId(user.id)}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: user.color }}
          >
            {getInitials(user.name)}
          </div>
          <div
            className="status-dot absolute -bottom-0.5 -right-0.5"
            style={{ backgroundColor: getStatusColor(user.status) }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
            {isMe && <span className="badge bg-brand-100 text-brand-700 !text-[9px]">You</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{user.title}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {user.department}
            </span>
            <span className="flex items-center gap-1" style={{ color: getStatusColor(user.status) }}>
              ● {getStatusLabel(user.status)}
            </span>
          </div>
        </div>
      </div>

      {!isMe && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={handleDM} className="btn-secondary !py-1.5 !px-3 !text-xs flex-1">
            <MessageSquare className="w-3 h-3" /> Message
          </button>
          <button onClick={() => handleCall('video')} className="btn-secondary !py-1.5 !px-3 !text-xs flex-1">
            <Video className="w-3 h-3" /> Video
          </button>
          <button onClick={() => handleCall('audio')} className="btn-icon !w-8 !h-8">
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleWave} className="btn-icon !w-8 !h-8" title="Wave">
            <Hand className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────

export default function PeoplePanel() {
  const { users, currentUser } = useOfficeStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(['General']));

  const allUsers = useMemo(() => {
    let result = Array.from(users.values());

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(u => u.status === filterStatus);
    }

    return result;
  }, [users, search, filterStatus]);

  const onlineCount = allUsers.filter(u => u.status !== 'offline').length;

  const byDepartment = useMemo(() => {
    const groups = new Map<string, User[]>();
    allUsers.forEach(user => {
      const dept = user.department || 'General';
      if (!groups.has(dept)) groups.set(dept, []);
      groups.get(dept)!.push(user);
    });
    return groups;
  }, [allUsers]);

  const toggleDept = (dept: string) => {
    const next = new Set(expandedDepts);
    if (next.has(dept)) next.delete(dept);
    else next.add(dept);
    setExpandedDepts(next);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">People</h2>
            <p className="text-xs text-gray-500">{onlineCount} online · {allUsers.length} total</p>
          </div>
          <button className="btn-icon">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people..."
            className="input-field !pl-9 !text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto">
          {(['all', 'available', 'busy', 'away', 'in-meeting'] as const).map(status => (
            <button
              key={status}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors',
                filterStatus === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto py-2">
        {Array.from(byDepartment.entries()).map(([dept, deptUsers]) => (
          <div key={dept} className="mb-1">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
              onClick={() => toggleDept(dept)}
            >
              {expandedDepts.has(dept) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {dept}
              <span className="text-gray-400 normal-case font-normal">({deptUsers.length})</span>
            </button>

            {expandedDepts.has(dept) && (
              <div className="px-2">
                {deptUsers.map(user => (
                  <UserCard key={user.id} user={user} isCompact={viewMode === 'list'} />
                ))}
              </div>
            )}
          </div>
        ))}

        {allUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users className="w-10 h-10 mb-2" />
            <p className="text-sm">No people found</p>
          </div>
        )}
      </div>
    </div>
  );
}
