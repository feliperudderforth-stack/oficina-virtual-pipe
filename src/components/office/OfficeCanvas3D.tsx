'use client';

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { officeFloor, getRoomAt } from '@/data/officeLayout';
import { calculateDistance, clamp } from '@/lib/utils';
import type { RoomLayout, FurnitureItem, User } from '@/types';
import * as THREE from 'three';

// ─── Constants ──────────────────────────────────────────────────────────────
const MOVE_SPEED = 4;
const PROXIMITY_RANGE = 120;
const SCALE = 0.04; // World units per pixel
const FLOOR_Y = 0;
const WALL_HEIGHT = 1.2;
const CHAIR_INTERACT_RANGE = 30;

// ─── Color helpers ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

// ─── Furniture 3D Component ─────────────────────────────────────────────────
function Furniture3D({ item, roomX, roomY }: { item: FurnitureItem; roomX: number; roomY: number }) {
  const x = (roomX + item.x + item.width / 2) * SCALE;
  const z = (roomY + item.y + item.height / 2) * SCALE;
  const w = item.width * SCALE;
  const h = item.height * SCALE;

  switch (item.type) {
    case 'desk':
      return (
        <group position={[x, FLOOR_Y, z]}>
          {/* Desktop surface */}
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.04, h]} />
            <meshStandardMaterial color={item.color || '#8b7355'} roughness={0.5} metalness={0.1} />
          </mesh>
          {/* Legs */}
          {[[-w/2+0.02, 0.18, -h/2+0.02], [w/2-0.02, 0.18, -h/2+0.02], [-w/2+0.02, 0.18, h/2-0.02], [w/2-0.02, 0.18, h/2-0.02]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} castShadow>
              <boxGeometry args={[0.02, 0.36, 0.02]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
            </mesh>
          ))}
          {/* Monitor */}
          <mesh position={[0, 0.52, -h/4]} castShadow>
            <boxGeometry args={[w * 0.4, 0.22, 0.02]} />
            <meshStandardMaterial color="#2d3436" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Screen glow */}
          <mesh position={[0, 0.52, -h/4 + 0.015]}>
            <planeGeometry args={[w * 0.35, 0.18]} />
            <meshStandardMaterial color="#74b9ff" emissive="#74b9ff" emissiveIntensity={0.3} roughness={0.1} />
          </mesh>
        </group>
      );

    case 'chair':
      return (
        <group position={[x, FLOOR_Y, z]}>
          {/* Seat */}
          <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[w/2 * 0.8, w/2 * 0.8, 0.05, 16]} />
            <meshStandardMaterial color="#4a5568" roughness={0.6} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.42, -w/2 * 0.6]} castShadow>
            <boxGeometry args={[w * 0.6, 0.3, 0.03]} />
            <meshStandardMaterial color="#2d3748" roughness={0.6} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.24, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Base star */}
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.cos(rad) * w/3, 0.02, Math.sin(rad) * w/3]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
              </mesh>
            );
          })}
        </group>
      );

    case 'table':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.05, h]} />
            <meshStandardMaterial color={item.color || '#8b7355'} roughness={0.4} metalness={0.05} />
          </mesh>
          {[[-w/2+0.03, 0.17, -h/2+0.03], [w/2-0.03, 0.17, -h/2+0.03], [-w/2+0.03, 0.17, h/2-0.03], [w/2-0.03, 0.17, h/2-0.03]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} castShadow>
              <boxGeometry args={[0.03, 0.34, 0.03]} />
              <meshStandardMaterial color={item.color || '#6b5543'} roughness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case 'sofa':
      return (
        <group position={[x, FLOOR_Y, z]}>
          {/* Seat */}
          <mesh position={[0, 0.18, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.12, h * 0.7]} />
            <meshStandardMaterial color={item.color || '#4a5568'} roughness={0.8} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.32, -h/2 + h * 0.15]} castShadow>
            <boxGeometry args={[w, 0.2, h * 0.25]} />
            <meshStandardMaterial color={item.color || '#4a5568'} roughness={0.8} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-w/2 + 0.04, 0.26, 0]} castShadow>
            <boxGeometry args={[0.06, 0.16, h * 0.7]} />
            <meshStandardMaterial color={item.color || '#3a4555'} roughness={0.8} />
          </mesh>
          <mesh position={[w/2 - 0.04, 0.26, 0]} castShadow>
            <boxGeometry args={[0.06, 0.16, h * 0.7]} />
            <meshStandardMaterial color={item.color || '#3a4555'} roughness={0.8} />
          </mesh>
        </group>
      );

    case 'plant':
      return (
        <group position={[x, FLOOR_Y, z]}>
          {/* Pot */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[w/2 * 0.5, w/2 * 0.35, 0.16, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Foliage - multiple spheres */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <sphereGeometry args={[w/2 * 0.7, 8, 8]} />
            <meshStandardMaterial color="#27ae60" roughness={0.9} />
          </mesh>
          <mesh position={[0.02, 0.32, 0.02]} castShadow>
            <sphereGeometry args={[w/2 * 0.5, 8, 8]} />
            <meshStandardMaterial color="#2ecc71" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'screen':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[w, h * 2, 0.03]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.6, 0.02]}>
            <planeGeometry args={[w * 0.9, h * 1.7]} />
            <meshStandardMaterial color="#a8d8ff" emissive="#a8d8ff" emissiveIntensity={0.4} />
          </mesh>
        </group>
      );

    case 'lamp':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[w/2 * 0.4, w/2 * 0.5, 0.04, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.36, 6]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[w/2 * 0.6, 16, 16]} />
            <meshStandardMaterial color="#ffd43b" emissive="#ffd43b" emissiveIntensity={0.8} roughness={0.2} />
          </mesh>
          <pointLight position={[0, 0.45, 0]} color="#ffd43b" intensity={0.5} distance={3} castShadow={false} />
        </group>
      );

    case 'coffee-machine':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[w, 0.4, h]} />
            <meshStandardMaterial color="#343a40" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.35, h/3]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#e03131" emissive="#e03131" emissiveIntensity={0.6} />
          </mesh>
        </group>
      );

    case 'bookshelf':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.8, h]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
          </mesh>
          {/* Books on shelves */}
          {[0.2, 0.4, 0.6].map((yOff, row) => (
            <group key={row}>
              {[-0.03, 0, 0.03].map((xOff, col) => (
                <mesh key={col} position={[xOff, yOff, h/3]}>
                  <boxGeometry args={[0.02, 0.12, h * 0.4]} />
                  <meshStandardMaterial color={['#e03131', '#1971c2', '#2f9e44', '#7048e8', '#f08c00'][(row + col) % 5]} roughness={0.7} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );

    case 'printer':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[w, 0.2, h]} />
            <meshStandardMaterial color="#495057" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[w/3, 0.22, 0]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#51cf66" emissive="#51cf66" emissiveIntensity={0.8} />
          </mesh>
        </group>
      );

    case 'water-cooler':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[w * 0.8, 0.3, h * 0.8]} />
            <meshStandardMaterial color="#adb5bd" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[w/2 * 0.5, w/2 * 0.5, 0.15, 8]} />
            <meshStandardMaterial color="#74c0fc" roughness={0.2} metalness={0.1} transparent opacity={0.8} />
          </mesh>
        </group>
      );

    case 'whiteboard':
      return (
        <group position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[w, 0.6, 0.02]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.6, -0.015]}>
            <boxGeometry args={[w + 0.03, 0.63, 0.02]} />
            <meshStandardMaterial color="#adb5bd" roughness={0.5} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

// ─── Room 3D Component ──────────────────────────────────────────────────────
const Room3D = React.memo(function Room3D({ room }: { room: RoomLayout }) {
  const x = (room.x + room.width / 2) * SCALE;
  const z = (room.y + room.height / 2) * SCALE;
  const w = room.width * SCALE;
  const h = room.height * SCALE;

  return (
    <group>
      {/* Floor */}
      <mesh position={[x, FLOOR_Y + 0.001, z]} receiveShadow>
        <boxGeometry args={[w, 0.02, h]} />
        <meshStandardMaterial color={room.color} roughness={0.7} />
      </mesh>

      {/* Walls - subtle raised border */}
      {/* North wall */}
      <mesh position={[x, WALL_HEIGHT / 2, z - h / 2]} castShadow>
        <boxGeometry args={[w, WALL_HEIGHT, 0.03]} />
        <meshStandardMaterial color={room.borderColor} roughness={0.6} transparent opacity={0.35} />
      </mesh>
      {/* South wall */}
      <mesh position={[x, WALL_HEIGHT / 2, z + h / 2]} castShadow>
        <boxGeometry args={[w, WALL_HEIGHT, 0.03]} />
        <meshStandardMaterial color={room.borderColor} roughness={0.6} transparent opacity={0.35} />
      </mesh>
      {/* East wall */}
      <mesh position={[x + w / 2, WALL_HEIGHT / 2, z]} castShadow>
        <boxGeometry args={[0.03, WALL_HEIGHT, h]} />
        <meshStandardMaterial color={room.borderColor} roughness={0.6} transparent opacity={0.35} />
      </mesh>
      {/* West wall */}
      <mesh position={[x - w / 2, WALL_HEIGHT / 2, z]} castShadow>
        <boxGeometry args={[0.03, WALL_HEIGHT, h]} />
        <meshStandardMaterial color={room.borderColor} roughness={0.6} transparent opacity={0.35} />
      </mesh>

      {/* Room name label - floating above room */}
      {/* Furniture */}
      {room.furniture.map(item => (
        <Furniture3D key={item.id} item={item} roomX={room.x} roomY={room.y} />
      ))}
    </group>
  );
});

// ─── Avatar 3D (Dark Hoodie) ────────────────────────────────────────────────
function Avatar3D({ user, isCurrentUser, isSitting }: { user: User; isCurrentUser: boolean; isSitting: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const x = user.position.x * SCALE;
  const z = user.position.y * SCALE;
  const baseY = isSitting ? 0.24 : FLOOR_Y;

  const statusColors: Record<string, string> = {
    available: '#22c55e',
    busy: '#ef4444',
    away: '#f59e0b',
    'in-meeting': '#8b5cf6',
    dnd: '#dc2626',
    offline: '#6b7280',
  };

  // Gentle bob animation for current user
  useFrame((state) => {
    if (meshRef.current && isCurrentUser && !isSitting) {
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2) * 0.008;
    }
  });

  return (
    <group ref={meshRef} position={[x, baseY, z]}>
      {/* Current user selection ring */}
      {isCurrentUser && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.075, 32]} />
          <meshStandardMaterial color="#4263eb" emissive="#4263eb" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Speaking indicator ring */}
      {user.isSpeaking && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.09, 32]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Body - dark hoodie */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <capsuleGeometry args={[0.035, 0.08, 4, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.85} />
      </mesh>

      {/* Hoodie hood */}
      <mesh position={[0, 0.32, -0.01]} castShadow>
        <sphereGeometry args={[0.04, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.85} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={user.color || '#4263eb'} roughness={0.5} />
      </mesh>

      {/* Arms (dark sleeves) */}
      <mesh position={[-0.045, 0.18, 0]} castShadow>
        <capsuleGeometry args={[0.012, 0.06, 3, 8]} />
        <meshStandardMaterial color="#252540" roughness={0.85} />
      </mesh>
      <mesh position={[0.045, 0.18, 0]} castShadow>
        <capsuleGeometry args={[0.012, 0.06, 3, 8]} />
        <meshStandardMaterial color="#252540" roughness={0.85} />
      </mesh>

      {/* Legs (only when standing) */}
      {!isSitting && (
        <>
          <mesh position={[-0.015, 0.05, 0]} castShadow>
            <capsuleGeometry args={[0.013, 0.06, 3, 8]} />
            <meshStandardMaterial color="#2d2d48" roughness={0.7} />
          </mesh>
          <mesh position={[0.015, 0.05, 0]} castShadow>
            <capsuleGeometry args={[0.013, 0.06, 3, 8]} />
            <meshStandardMaterial color="#2d2d48" roughness={0.7} />
          </mesh>
        </>
      )}

      {/* Status dot */}
      <mesh position={[0.03, 0.37, 0.02]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial
          color={statusColors[user.status] || '#6b7280'}
          emissive={statusColors[user.status] || '#6b7280'}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// ─── Camera Controller ──────────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree();
  const { currentUser, zoom } = useOfficeStore();

  useFrame(() => {
    if (!currentUser) return;
    const targetX = currentUser.position.x * SCALE;
    const targetZ = currentUser.position.y * SCALE;

    // Isometric camera offset
    const dist = 12 / zoom;
    const angle = Math.PI / 4;
    const camX = targetX + dist * Math.sin(angle);
    const camY = dist * 0.7;
    const camZ = targetZ + dist * Math.cos(angle);

    camera.position.x += (camX - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    camera.lookAt(
      camera.position.x + (targetX - camera.position.x) * 0.5,
      0,
      camera.position.z + (targetZ - camera.position.z) * 0.5
    );
  });

  return null;
}

// ─── Interaction Prompt Overlay ─────────────────────────────────────────────
function InteractionPrompt() {
  const { interactionPrompt } = useOfficeStore();
  if (!interactionPrompt) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="glass-panel rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
        <kbd className="px-2.5 py-1 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-md">E</kbd>
        <span className="text-sm font-medium text-gray-800">{interactionPrompt.label}</span>
      </div>
    </div>
  );
}

// ─── Keyboard + Interaction Input Handler ───────────────────────────────────
function InputHandler() {
  const keysRef = useRef<Set<string>>(new Set());
  const {
    currentUser,
    updateCurrentUserPosition,
    interactionPrompt,
    setInteractionPrompt,
    sitDown,
    standUp,
  } = useOfficeStore();

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
      // E key interaction
      if (key === 'e') {
        e.preventDefault();
        const state = useOfficeStore.getState();
        if (state.currentUser?.isSitting) {
          standUp();
        } else if (state.interactionPrompt) {
          sitDown(state.interactionPrompt.furnitureId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sitDown, standUp]);

  // Movement + proximity check loop
  useFrame(() => {
    if (!currentUser || currentUser.isSitting) return;

    const keys = keysRef.current;
    let dx = 0;
    let dy = 0;

    if (keys.has('w') || keys.has('arrowup')) dy -= MOVE_SPEED;
    if (keys.has('s') || keys.has('arrowdown')) dy += MOVE_SPEED;
    if (keys.has('a') || keys.has('arrowleft')) dx -= MOVE_SPEED;
    if (keys.has('d') || keys.has('arrowright')) dx += MOVE_SPEED;

    if (dx !== 0 || dy !== 0) {
      const newX = clamp(currentUser.position.x + dx, 32, officeFloor.width - 32);
      const newY = clamp(currentUser.position.y + dy, 32, officeFloor.height - 32);
      updateCurrentUserPosition({ x: newX, y: newY });
    }

    // Check for nearby sittable furniture (chairs/sofas)
    let closestChair: { id: string; label: string; roomId: string; dist: number } | null = null;

    for (const room of officeFloor.rooms) {
      for (const item of room.furniture) {
        if (item.type !== 'chair' && item.type !== 'sofa') continue;
        const fx = room.x + item.x + item.width / 2;
        const fy = room.y + item.y + item.height / 2;
        const dist = calculateDistance(currentUser.position, { x: fx, y: fy });
        if (dist < CHAIR_INTERACT_RANGE && (!closestChair || dist < closestChair.dist)) {
          closestChair = {
            id: item.id,
            label: item.type === 'sofa' ? 'Sit on sofa' : 'Sit on chair',
            roomId: room.id,
            dist,
          };
        }
      }
    }

    if (closestChair && !currentUser.isSitting) {
      if (!interactionPrompt || interactionPrompt.furnitureId !== closestChair.id) {
        setInteractionPrompt({ furnitureId: closestChair.id, label: closestChair.label, roomId: closestChair.roomId });
      }
    } else if (interactionPrompt && !currentUser.isSitting) {
      setInteractionPrompt(null);
    }
  });

  return null;
}

// ─── Office Floor Ground ────────────────────────────────────────────────────
function OfficeGround() {
  const w = officeFloor.width * SCALE;
  const h = officeFloor.height * SCALE;

  return (
    <mesh position={[w / 2, FLOOR_Y - 0.01, h / 2]} receiveShadow>
      <boxGeometry args={[w + 2, 0.02, h + 2]} />
      <meshStandardMaterial color="#e9e5dd" roughness={0.9} />
    </mesh>
  );
}

// ─── Lighting System ────────────────────────────────────────────────────────
function LightingSystem() {
  return (
    <>
      {/* Ambient - soft fill */}
      <ambientLight intensity={0.35} color="#f0eadc" />

      {/* Main directional - sun through windows */}
      <directionalLight
        position={[20, 25, 15]}
        intensity={0.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.001}
        shadow-radius={4}
      />

      {/* Secondary fill light */}
      <directionalLight
        position={[-15, 12, -10]}
        intensity={0.2}
        color="#cce5ff"
      />

      {/* Hemisphere for sky/ground color bleed */}
      <hemisphereLight
        args={['#b1e1ff', '#e8dcc8', 0.3]}
      />

      {/* Overhead office fluorescent lights - strategic placement */}
      {[
        [15, 6, 18], [30, 6, 18], [45, 6, 18],
        [15, 6, 35], [30, 6, 35], [45, 6, 35],
      ].map((pos, i) => (
        <pointLight
          key={i}
          position={pos as [number, number, number]}
          intensity={0.3}
          color="#fff8f0"
          distance={20}
          decay={2}
        />
      ))}
    </>
  );
}

// ─── Scene Content ──────────────────────────────────────────────────────────
function SceneContent() {
  const { currentUser, users } = useOfficeStore();

  return (
    <>
      <LightingSystem />
      <CameraController />
      <InputHandler />

      {/* Ground */}
      <OfficeGround />

      {/* Rooms */}
      {officeFloor.rooms.map(room => (
        <Room3D key={room.id} room={room} />
      ))}

      {/* Other users */}
      {Array.from(users.values()).map(user => {
        if (currentUser && user.id === currentUser.id) return null;
        return (
          <Avatar3D
            key={user.id}
            user={user}
            isCurrentUser={false}
            isSitting={user.isSitting || false}
          />
        );
      })}

      {/* Current user on top */}
      {currentUser && (
        <Avatar3D
          user={currentUser}
          isCurrentUser={true}
          isSitting={currentUser.isSitting || false}
        />
      )}
    </>
  );
}

// ─── Main Exported Component ────────────────────────────────────────────────
export default function OfficeCanvas3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [30, 20, 30],
        }}
      >
        <fog attach="fog" args={['#e8e4dc', 40, 100]} />
        <SceneContent />
      </Canvas>
      <InteractionPrompt />
    </div>
  );
}
