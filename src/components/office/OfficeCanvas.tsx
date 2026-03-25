'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { officeFloor, getRoomAt } from '@/data/officeLayout';
import type { RoomLayout, FurnitureItem, User, Position } from '@/types';
import { calculateDistance, clamp } from '@/lib/utils';

const AVATAR_SIZE = 32;
const MOVE_SPEED = 4;
const PROXIMITY_RANGE = 120;
const GRID_SIZE = 4;

// ─── Furniture Renderer ────────────────────────────────────────────────────

function drawFurniture(ctx: CanvasRenderingContext2D, item: FurnitureItem, roomX: number, roomY: number) {
  const x = roomX + item.x;
  const y = roomY + item.y;

  ctx.save();

  switch (item.type) {
    case 'desk':
      // Desk surface
      ctx.fillStyle = item.color || '#8b7355';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Monitor
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(x + item.width / 2 - 12, y + 5, 24, 16);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(x + item.width / 2 - 10, y + 7, 20, 12);
      // Keyboard
      ctx.fillStyle = '#636e72';
      ctx.fillRect(x + item.width / 2 - 10, y + item.height - 10, 20, 6);
      break;

    case 'chair':
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + item.height / 2, item.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + item.height / 2, item.width / 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'table':
      ctx.fillStyle = item.color || '#8b7355';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Table highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, item.width - 8, item.height / 3, 2);
      ctx.fill();
      break;

    case 'sofa':
      // Sofa body
      ctx.fillStyle = item.color || '#4a5568';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 8);
      ctx.fill();
      // Cushions
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, item.width / 2 - 7, item.height - 10, 5);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + item.width / 2 + 2, y + 5, item.width / 2 - 7, item.height - 10, 5);
      ctx.fill();
      // Armrests
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.roundRect(x, y, 6, item.height, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + item.width - 6, y, 6, item.height, 3);
      ctx.fill();
      break;

    case 'plant':
      // Pot
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + item.height - 10, item.width - 8, 10, 2);
      ctx.fill();
      // Leaves
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + item.height / 2 - 3, item.width / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(x + item.width / 2 - 3, y + item.height / 2 - 5, item.width / 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + item.width / 2 + 3, y + item.height / 2 - 6, item.width / 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'screen':
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 2);
      ctx.fill();
      ctx.fillStyle = '#a8d8ff';
      ctx.fillRect(x + 2, y + 1, item.width - 4, item.height - 3);
      break;

    case 'whiteboard':
      ctx.fillStyle = '#f8f9fa';
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 2);
      ctx.fill();
      ctx.stroke();
      // Some marks
      ctx.strokeStyle = '#e03131';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 10);
      ctx.lineTo(x + 5, y + 30);
      ctx.stroke();
      ctx.strokeStyle = '#1971c2';
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 40);
      ctx.lineTo(x + 5, y + 55);
      ctx.stroke();
      break;

    case 'coffee-machine':
      ctx.fillStyle = '#343a40';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 4);
      ctx.fill();
      ctx.fillStyle = '#e03131';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#868e96';
      ctx.fillRect(x + 5, y + 15, item.width - 10, item.height - 20);
      break;

    case 'bookshelf':
      ctx.fillStyle = '#5a4a3a';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 2);
      ctx.fill();
      // Books
      const bookColors = ['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#7048e8'];
      for (let i = 0; i < 4; i++) {
        const by = y + 4 + (i * (item.height - 8) / 4);
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = bookColors[(i + j) % bookColors.length];
          ctx.fillRect(x + 3 + j * 5, by, 4, (item.height - 12) / 4);
        }
      }
      break;

    case 'lamp':
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + item.height / 2, item.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 212, 59, 0.2)';
      ctx.beginPath();
      ctx.arc(x + item.width / 2, y + item.height / 2, item.width, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'printer':
      ctx.fillStyle = '#495057';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 3);
      ctx.fill();
      ctx.fillStyle = '#dee2e6';
      ctx.fillRect(x + 3, y + 3, item.width - 6, 8);
      ctx.fillStyle = '#51cf66';
      ctx.beginPath();
      ctx.arc(x + item.width - 6, y + 5, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'water-cooler':
      ctx.fillStyle = '#adb5bd';
      ctx.beginPath();
      ctx.roundRect(x, y + 8, item.width, item.height - 8, 3);
      ctx.fill();
      ctx.fillStyle = '#74c0fc';
      ctx.beginPath();
      ctx.roundRect(x + 3, y, item.width - 6, 12, 4);
      ctx.fill();
      break;
  }

  ctx.restore();
}

// ─── Room Renderer ─────────────────────────────────────────────────────────

function drawRoom(ctx: CanvasRenderingContext2D, room: RoomLayout, hoveredRoom: string | null) {
  const isHovered = hoveredRoom === room.id;

  ctx.save();

  // Room shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = isHovered ? 16 : 8;
  ctx.shadowOffsetY = isHovered ? 4 : 2;

  // Room floor
  ctx.fillStyle = room.color;
  ctx.beginPath();
  ctx.roundRect(room.x, room.y, room.width, room.height, 8);
  ctx.fill();

  // Room border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = isHovered ? room.borderColor : `${room.borderColor}88`;
  ctx.lineWidth = isHovered ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.roundRect(room.x, room.y, room.width, room.height, 8);
  ctx.stroke();

  // Hover glow
  if (isHovered) {
    ctx.fillStyle = 'rgba(66, 99, 235, 0.04)';
    ctx.beginPath();
    ctx.roundRect(room.x, room.y, room.width, room.height, 8);
    ctx.fill();
  }

  // Room name label
  ctx.fillStyle = isHovered ? '#1a1a2e' : '#495057';
  ctx.font = `${isHovered ? '600' : '500'} 11px Inter, system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText(room.name, room.x + room.width / 2, room.y + room.height + 16);

  // Room icon
  ctx.font = '14px serif';
  ctx.fillText(room.icon, room.x + room.width / 2, room.y - 6);

  // Draw furniture
  room.furniture.forEach(item => drawFurniture(ctx, item, room.x, room.y));

  ctx.restore();
}

// ─── Avatar Renderer ────────────────────────────────────────────────────────

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  user: User,
  isCurrentUser: boolean,
  isSpeaking: boolean,
  isProximity: boolean
) {
  const { x, y } = user.position;
  const size = AVATAR_SIZE;
  const halfSize = size / 2;

  ctx.save();

  // Proximity ring
  if (isProximity && !isCurrentUser) {
    ctx.strokeStyle = 'rgba(66, 99, 235, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, PROXIMITY_RANGE, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Speaking indicator (animated ring)
  if (isSpeaking || user.isSpeaking) {
    const speakingRadius = halfSize + 6 + Math.sin(Date.now() / 200) * 2;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, speakingRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Avatar circle background
  ctx.fillStyle = user.color || '#4263eb';
  ctx.beginPath();
  ctx.arc(x, y, halfSize, 0, Math.PI * 2);
  ctx.fill();

  // Current user highlight ring
  if (isCurrentUser) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#4263eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, halfSize + 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Initials
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  ctx.fillText(initials, x, y + 1);

  // Status dot
  const statusColors: Record<string, string> = {
    available: '#22c55e',
    busy: '#ef4444',
    away: '#f59e0b',
    'in-meeting': '#8b5cf6',
    dnd: '#dc2626',
    offline: '#6b7280',
  };
  const statusColor = statusColors[user.status] || '#6b7280';

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + halfSize - 2, y + halfSize - 2, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = statusColor;
  ctx.beginPath();
  ctx.arc(x + halfSize - 2, y + halfSize - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Name tag
  const nameTagY = y - halfSize - 12;
  ctx.font = '500 10px Inter, system-ui';
  const nameWidth = ctx.measureText(user.name).width;

  ctx.fillStyle = isCurrentUser ? 'rgba(66, 99, 235, 0.9)' : 'rgba(26, 26, 46, 0.8)';
  ctx.beginPath();
  ctx.roundRect(x - nameWidth / 2 - 6, nameTagY - 7, nameWidth + 12, 16, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(user.name, x, nameTagY);

  // Camera icon
  if (user.isCameraOn) {
    ctx.fillStyle = '#22c55e';
    ctx.font = '8px serif';
    ctx.fillText('📹', x - halfSize - 8, y - 4);
  }

  // Muted icon
  if (user.isMuted) {
    ctx.font = '8px serif';
    ctx.fillText('🔇', x + halfSize + 4, y - 4);
  }

  ctx.restore();
}

// ─── Decorations ────────────────────────────────────────────────────────────

function drawDecorations(ctx: CanvasRenderingContext2D) {
  officeFloor.decorations.forEach(deco => {
    ctx.save();

    switch (deco.type) {
      case 'corridor':
        ctx.fillStyle = '#e9e5dd';
        ctx.beginPath();
        ctx.roundRect(deco.x, deco.y, deco.width, deco.height, 2);
        ctx.fill();
        break;

      case 'door':
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(deco.x, deco.y, deco.width, deco.height);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(deco.x + deco.width - 4, deco.y + deco.height / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'window':
        ctx.fillStyle = 'rgba(135, 206, 250, 0.4)';
        ctx.strokeStyle = '#b0c4de';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(deco.x, deco.y, deco.width, deco.height, 1);
        ctx.fill();
        ctx.stroke();
        break;

      case 'elevator':
        ctx.fillStyle = '#c0c0c0';
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(deco.x, deco.y, deco.width, deco.height, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('▲▼', deco.x + deco.width / 2, deco.y + deco.height / 2 + 3);
        break;

      case 'restroom-sign':
        ctx.fillStyle = '#1971c2';
        ctx.beginPath();
        ctx.roundRect(deco.x, deco.y, deco.width, deco.height, 3);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('WC', deco.x + deco.width / 2, deco.y + deco.height / 2 + 3);
        break;
    }

    ctx.restore();
  });
}

// ─── Grid Pattern ───────────────────────────────────────────────────────────

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
  ctx.lineWidth = 0.5;

  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const {
    currentUser,
    users,
    updateCurrentUserPosition,
    cameraOffset,
    setCameraOffset,
    zoom,
  } = useOfficeStore();

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse handlers for room hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - cameraOffset.x) / zoom;
    const mouseY = (e.clientY - rect.top - cameraOffset.y) / zoom;

    const room = getRoomAt(mouseX, mouseY);
    setHoveredRoom(room?.id || null);
  }, [cameraOffset, zoom]);

  // Click to move
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentUser) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - cameraOffset.x) / zoom;
    const clickY = (e.clientY - rect.top - cameraOffset.y) / zoom;

    const newPos = {
      x: clamp(clickX, AVATAR_SIZE, officeFloor.width - AVATAR_SIZE),
      y: clamp(clickY, AVATAR_SIZE, officeFloor.height - AVATAR_SIZE),
    };

    updateCurrentUserPosition(newPos);
  }, [cameraOffset, zoom, currentUser, updateCurrentUserPosition]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvasSize;
      canvas.width = width;
      canvas.height = height;

      // Handle keyboard movement
      if (currentUser) {
        const keys = keysRef.current;
        let dx = 0;
        let dy = 0;

        if (keys.has('w') || keys.has('ArrowUp')) dy -= MOVE_SPEED;
        if (keys.has('s') || keys.has('ArrowDown')) dy += MOVE_SPEED;
        if (keys.has('a') || keys.has('ArrowLeft')) dx -= MOVE_SPEED;
        if (keys.has('d') || keys.has('ArrowRight')) dx += MOVE_SPEED;

        if (dx !== 0 || dy !== 0) {
          const newX = clamp(currentUser.position.x + dx, AVATAR_SIZE, officeFloor.width - AVATAR_SIZE);
          const newY = clamp(currentUser.position.y + dy, AVATAR_SIZE, officeFloor.height - AVATAR_SIZE);
          updateCurrentUserPosition({ x: newX, y: newY });
        }

        // Center camera on current user
        const targetOffsetX = width / 2 - currentUser.position.x * zoom;
        const targetOffsetY = height / 2 - currentUser.position.y * zoom;

        setCameraOffset({
          x: cameraOffset.x + (targetOffsetX - cameraOffset.x) * 0.08,
          y: cameraOffset.y + (targetOffsetY - cameraOffset.y) * 0.08,
        });
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f1f3f5');
      gradient.addColorStop(1, '#e9ecef');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Apply camera transform
      ctx.save();
      ctx.translate(cameraOffset.x, cameraOffset.y);
      ctx.scale(zoom, zoom);

      // Office floor background
      ctx.fillStyle = '#ede9e0';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(0, 0, officeFloor.width, officeFloor.height, 16);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Grid
      drawGrid(ctx, officeFloor.width, officeFloor.height);

      // Decorations
      drawDecorations(ctx);

      // Rooms
      officeFloor.rooms.forEach(room => drawRoom(ctx, room, hoveredRoom));

      // Other users
      users.forEach((user) => {
        if (currentUser && user.id !== currentUser.id) {
          const isNearby = currentUser
            ? calculateDistance(currentUser.position, user.position) <= PROXIMITY_RANGE
            : false;
          drawAvatar(ctx, user, false, user.isSpeaking, isNearby);
        }
      });

      // Current user (drawn on top)
      if (currentUser) {
        drawAvatar(ctx, currentUser, true, false, false);

        // Proximity circle for current user
        ctx.save();
        ctx.strokeStyle = 'rgba(66, 99, 235, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(currentUser.position.x, currentUser.position.y, PROXIMITY_RANGE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasSize, currentUser, users, cameraOffset, setCameraOffset, zoom, hoveredRoom, updateCurrentUserPosition]);

  return (
    <canvas
      ref={canvasRef}
      className="office-canvas absolute inset-0"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
