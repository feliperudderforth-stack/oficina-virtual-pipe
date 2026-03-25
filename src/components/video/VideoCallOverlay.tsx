'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn, getInitials } from '@/lib/utils';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  Phone, PhoneOff, Maximize2, Minimize2, Users, MessageSquare,
  Hand, Settings, MoreHorizontal, Grid, LayoutGrid, X
} from 'lucide-react';

interface VideoParticipant {
  id: string;
  name: string;
  color: string;
  stream?: MediaStream;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
}

// ─── Participant Video Tile ─────────────────────────────────────────────

function VideoTile({ participant, isLarge = false }: { participant: VideoParticipant; isLarge?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden bg-gray-900 group',
        isLarge ? 'col-span-2 row-span-2' : '',
        participant.isSpeaking && 'ring-2 ring-green-400'
      )}
    >
      {participant.isCameraOn && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.id === 'local'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div
            className={cn(
              'rounded-full flex items-center justify-center text-white font-bold',
              isLarge ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'
            )}
            style={{ backgroundColor: participant.color }}
          >
            {getInitials(participant.name)}
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">{participant.name}</span>
            {participant.isSpeaking && (
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-0.5 bg-green-400 rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {participant.isMuted && (
              <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
            {participant.isScreenSharing && (
              <div className="w-6 h-6 rounded-full bg-blue-500/80 flex items-center justify-center">
                <Monitor className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Incoming Call Modal ────────────────────────────────────────────────

export function IncomingCallModal({ callerName, callerAvatar, callType, onAccept, onDecline }: {
  callerName: string;
  callerAvatar: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 text-center animate-scale-in">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold animate-pulse-slow"
          style={{ backgroundColor: callerAvatar || '#4263eb' }}
        >
          {getInitials(callerName)}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{callerName}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Incoming {callType} call...
        </p>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={onDecline}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={onAccept}
            className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 animate-pulse-slow"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Video Call Overlay ────────────────────────────────────────────

export default function VideoCallOverlay() {
  const { isInCall, setInCall, currentUser, callPeers, users } = useOfficeStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    if (!isInCall) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isInCall]);

  // Initialize local stream
  useEffect(() => {
    if (!isInCall || !currentUser) return;

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        setParticipants(prev => {
          const filtered = prev.filter(p => p.id !== 'local');
          return [{
            id: 'local',
            name: currentUser.name + ' (You)',
            color: currentUser.color,
            stream,
            isMuted: false,
            isCameraOn: true,
            isSpeaking: false,
            isScreenSharing: false,
          }, ...filtered];
        });
      } catch (err) {
        console.warn('Camera/mic access denied:', err);
        setParticipants([{
          id: 'local',
          name: currentUser.name + ' (You)',
          color: currentUser.color,
          isMuted: true,
          isCameraOn: false,
          isSpeaking: false,
          isScreenSharing: false,
        }]);
      }
    };

    initStream();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [isInCall, currentUser]);

  // Add remote participants
  useEffect(() => {
    const remote = callPeers.map(peerId => {
      const user = users.get(peerId);
      return {
        id: peerId,
        name: user?.name || 'Unknown',
        color: user?.color || '#666',
        isMuted: user?.isMuted || false,
        isCameraOn: user?.isCameraOn || false,
        isSpeaking: user?.isSpeaking || false,
        isScreenSharing: user?.isScreenSharing || false,
      };
    });

    setParticipants(prev => {
      const local = prev.find(p => p.id === 'local');
      return local ? [local, ...remote] : remote;
    });
  }, [callPeers, users]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localStreamRef.current?.getAudioTracks().forEach(t => {
      t.enabled = isMuted; // Toggle to opposite
    });
    const socket = getSocket();
    socket.emit('media:toggle', { type: 'mute', value: !isMuted });
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    localStreamRef.current?.getVideoTracks().forEach(t => {
      t.enabled = !isCameraOn;
    });
    const socket = getSocket();
    socket.emit('media:toggle', { type: 'camera', value: !isCameraOn });
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        const socket = getSocket();
        socket.emit('media:toggle', { type: 'screen', value: true });

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          socket.emit('media:toggle', { type: 'screen', value: false });
        };
      } catch (err) {
        console.warn('Screen share cancelled');
      }
    } else {
      setIsScreenSharing(false);
      const socket = getSocket();
      socket.emit('media:toggle', { type: 'screen', value: false });
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setInCall(false);
    setParticipants([]);
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInCall) return null;

  return (
    <div className={cn(
      'fixed z-50 bg-gray-950 flex flex-col',
      isFullscreen ? 'inset-0' : 'bottom-4 right-4 w-[640px] h-[480px] rounded-2xl shadow-2xl overflow-hidden'
    )}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
          <span className="text-gray-400 text-xs">·</span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {participants.length} participants
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-icon !text-gray-300 hover:!text-white"
            onClick={() => setLayout(layout === 'grid' ? 'spotlight' : 'grid')}
          >
            {layout === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            className="btn-icon !text-gray-300 hover:!text-white"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className={cn(
        'flex-1 p-2 gap-2',
        layout === 'grid' ? 'video-grid' : 'flex flex-col'
      )}>
        {participants.map((p, idx) => (
          <VideoTile
            key={p.id}
            participant={p}
            isLarge={layout === 'spotlight' && idx === 0}
          />
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900/80 backdrop-blur-sm">
        <button
          onClick={toggleMute}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            isMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            !isCameraOn
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          )}
        >
          {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            isScreenSharing
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          )}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        <button
          className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-all"
        >
          <Hand className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-gray-700 mx-1" />

        <button
          onClick={endCall}
          className="w-14 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
