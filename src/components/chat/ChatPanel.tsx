'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { formatTimeShort, cn, getInitials } from '@/lib/utils';
import {
  Send, Smile, Paperclip, Hash, AtSign, Reply,
  MoreHorizontal, Search, Plus, Lock, ChevronDown
} from 'lucide-react';
import type { ChatMessage, Channel } from '@/types';

// ─── Message Bubble ────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn, onReply }: {
  message: ChatMessage;
  isOwn: boolean;
  onReply: (msg: ChatMessage) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-1.5 hover:bg-gray-50/80 transition-colors relative',
        isOwn && 'flex-row-reverse'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: message.senderAvatar || '#4263eb' }}
      >
        {getInitials(message.senderName)}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 min-w-0', isOwn && 'text-right')}>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-semibold text-gray-900">{message.senderName}</span>
          <span className="text-[10px] text-gray-400">{formatTimeShort(message.timestamp)}</span>
          {message.edited && <span className="text-[10px] text-gray-400">(edited)</span>}
        </div>

        {message.type === 'system' ? (
          <p className="text-xs text-gray-500 italic">{message.content}</p>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Reactions */}
        {Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
                onClick={() => {
                  const socket = getSocket();
                  socket.emit('chat:reaction', {
                    messageId: message.id,
                    channelId: message.channelId,
                    emoji,
                  });
                }}
              >
                <span>{emoji}</span>
                <span className="text-gray-500">{userIds.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showActions && (
        <div className="absolute right-4 -top-3 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-sm px-1 py-0.5 z-10">
          {['😊', '👍', '❤️', '🎉'].map(emoji => (
            <button
              key={emoji}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm"
              onClick={() => {
                const socket = getSocket();
                socket.emit('chat:reaction', {
                  messageId: message.id,
                  channelId: message.channelId,
                  emoji,
                });
              }}
            >
              {emoji}
            </button>
          ))}
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
            onClick={() => onReply(message)}
          >
            <Reply className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Channel List ──────────────────────────────────────────────────────────

function ChannelList() {
  const { channels, activeChannelId, setActiveChannelId, currentUser } = useOfficeStore();
  const channelArray = Array.from(channels.values());

  const publicChannels = channelArray.filter(c => c.type === 'public');
  const dmChannels = channelArray.filter(c => c.type === 'dm');

  return (
    <div className="w-56 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</h3>
          <button className="btn-icon !w-6 !h-6">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field !text-xs !py-1.5 !pl-8"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {/* Public Channels */}
        <div className="px-2">
          <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Public Channels
          </p>
          {publicChannels.map(channel => (
            <button
              key={channel.id}
              className={cn(
                'sidebar-item w-full text-left !py-1.5 !text-xs',
                activeChannelId === channel.id && 'active'
              )}
              onClick={() => setActiveChannelId(channel.id)}
            >
              <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{channel.name}</span>
              {channel.unreadCount && channel.unreadCount > 0 && (
                <span className="badge-primary ml-auto text-[10px]">{channel.unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* DMs */}
        {dmChannels.length > 0 && (
          <div className="px-2 mt-3">
            <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Direct Messages
            </p>
            {dmChannels.map(channel => (
              <button
                key={channel.id}
                className={cn(
                  'sidebar-item w-full text-left !py-1.5 !text-xs',
                  activeChannelId === channel.id && 'active'
                )}
                onClick={() => setActiveChannelId(channel.id)}
              >
                <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white text-[8px] font-bold">
                  {channel.name[0]}
                </div>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────────

function TypingIndicator() {
  const { typingUsers, activeChannelId } = useOfficeStore();
  const channelTyping = typingUsers.filter(t => t.channelId === activeChannelId);

  if (channelTyping.length === 0) return null;

  const names = channelTyping.map(t => t.userName);
  const text = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="px-4 py-1.5 text-xs text-gray-500 flex items-center gap-2">
      <div className="flex gap-0.5">
        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
      </div>
      <span>{text}</span>
    </div>
  );
}

// ─── Main Chat Panel ────────────────────────────────────────────────────────

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentUser,
    messages,
    activeChannelId,
    channels,
  } = useOfficeStore();

  const channelMessages = messages.get(activeChannelId) || [];
  const activeChannel = channels.get(activeChannelId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    socket.emit('chat:typing', { channelId: activeChannelId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { channelId: activeChannelId, isTyping: false });
    }, 2000);
  }, [activeChannelId]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !currentUser) return;

    const socket = getSocket();
    socket.emit('chat:message', {
      channelId: activeChannelId,
      content: input.trim(),
      type: 'text',
      replyTo: replyTo?.id,
    });

    socket.emit('chat:typing', { channelId: activeChannelId, isTyping: false });
    setInput('');
    setReplyTo(null);
    inputRef.current?.focus();
  }, [input, activeChannelId, currentUser, replyTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Channel List */}
      <ChannelList />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              {activeChannel?.name || 'General'}
            </h3>
            <span className="text-xs text-gray-400">
              {activeChannel?.members.length || 0} members
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="btn-icon !w-7 !h-7">
              <Search className="w-3.5 h-3.5" />
            </button>
            <button className="btn-icon !w-7 !h-7">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {channelMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Hash className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            channelMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
                onReply={setReplyTo}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator />

        {/* Reply Preview */}
        {replyTo && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
            <Reply className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">
              Replying to <strong>{replyTo.senderName}</strong>: {replyTo.content.slice(0, 50)}
            </span>
            <button
              className="ml-auto text-gray-400 hover:text-gray-600"
              onClick={() => setReplyTo(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <button className="btn-icon !w-7 !h-7 !text-gray-400">
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannel?.name || 'general'}...`}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <button className="btn-icon !w-7 !h-7 !text-gray-400">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="btn-icon !w-7 !h-7 !text-gray-400">
              <Smile className="w-4 h-4" />
            </button>
            <button
              className={cn(
                'btn-icon !w-7 !h-7',
                input.trim() ? '!text-brand-600 hover:!bg-brand-50' : '!text-gray-300'
              )}
              onClick={sendMessage}
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
