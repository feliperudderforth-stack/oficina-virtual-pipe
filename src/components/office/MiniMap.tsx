'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { officeFloor } from '@/data/officeLayout';
import { clamp } from '@/lib/utils';

const MINIMAP_SCALE = 0.1;
const MINIMAP_WIDTH = officeFloor.width * MINIMAP_SCALE;
const MINIMAP_HEIGHT = officeFloor.height * MINIMAP_SCALE;

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentUser, users, showMiniMap, cameraOffset, zoom, updateCurrentUserPosition } = useOfficeStore();

  // Teleport on click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const worldX = clamp(clickX / MINIMAP_SCALE, 32, officeFloor.width - 32);
    const worldY = clamp(clickY / MINIMAP_SCALE, 32, officeFloor.height - 32);

    updateCurrentUserPosition({ x: worldX, y: worldY });
  }, [currentUser, updateCurrentUserPosition]);

  useEffect(() => {
    if (!showMiniMap) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = MINIMAP_WIDTH;
    canvas.height = MINIMAP_HEIGHT;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT, 4);
    ctx.fill();

    // Office floor
    ctx.fillStyle = '#2a2a4a';
    ctx.beginPath();
    ctx.roundRect(1, 1, MINIMAP_WIDTH - 2, MINIMAP_HEIGHT - 2, 3);
    ctx.fill();

    // Rooms
    officeFloor.rooms.forEach(room => {
      ctx.fillStyle = `${room.borderColor}40`;
      ctx.strokeStyle = `${room.borderColor}80`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(
        room.x * MINIMAP_SCALE,
        room.y * MINIMAP_SCALE,
        room.width * MINIMAP_SCALE,
        room.height * MINIMAP_SCALE,
        1
      );
      ctx.fill();
      ctx.stroke();
    });

    // Other users
    users.forEach(user => {
      if (currentUser && user.id === currentUser.id) return;
      ctx.fillStyle = user.color + '80';
      ctx.beginPath();
      ctx.arc(
        user.position.x * MINIMAP_SCALE,
        user.position.y * MINIMAP_SCALE,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Current user
    if (currentUser) {
      ctx.fillStyle = '#4263eb';
      ctx.shadowColor = '#4263eb';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(
        currentUser.position.x * MINIMAP_SCALE,
        currentUser.position.y * MINIMAP_SCALE,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Viewport rectangle
    const viewWidth = (window.innerWidth / zoom) * MINIMAP_SCALE;
    const viewHeight = (window.innerHeight / zoom) * MINIMAP_SCALE;
    const viewX = (-cameraOffset.x / zoom) * MINIMAP_SCALE;
    const viewY = (-cameraOffset.y / zoom) * MINIMAP_SCALE;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(viewX, viewY, viewWidth, viewHeight);
    ctx.setLineDash([]);
  }, [currentUser, users, showMiniMap, cameraOffset, zoom]);

  if (!showMiniMap) return null;

  return (
    <div className="absolute bottom-4 left-4 z-30">
      <div className="glass-panel-dark rounded-xl p-2 shadow-lg">
        <canvas
          ref={canvasRef}
          style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
          className="rounded-lg cursor-crosshair"
          onClick={handleClick}
          title="Click to teleport"
        />
        <p className="text-[9px] text-gray-400 text-center mt-1 font-medium">
          Click to teleport · {officeFloor.name}
        </p>
      </div>
    </div>
  );
}
