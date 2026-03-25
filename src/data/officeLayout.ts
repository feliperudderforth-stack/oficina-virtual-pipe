import type { RoomLayout, OfficeFloor, DecorationItem } from '@/types';

// ─── Office Floor Plan ───────────────────────────────────────────────────────
// This creates a realistic corporate office layout with:
// - Main lobby/reception
// - Open workspaces
// - Conference rooms
// - Private offices
// - Lounge/break area
// - Cafeteria

const rooms: RoomLayout[] = [
  // ── Main Lobby ──────────────────────────────────────────────────────
  {
    id: 'lobby',
    name: 'Main Lobby',
    type: 'lobby',
    x: 400,
    y: 50,
    width: 500,
    height: 250,
    color: '#f0ebe3',
    borderColor: '#c4b5a0',
    icon: '🏢',
    furniture: [
      { id: 'lobby-desk-1', type: 'desk', x: 200, y: 60, width: 100, height: 40, color: '#5a4a3a' },
      { id: 'lobby-sofa-1', type: 'sofa', x: 50, y: 150, width: 90, height: 40, color: '#4a5568' },
      { id: 'lobby-sofa-2', type: 'sofa', x: 360, y: 150, width: 90, height: 40, color: '#4a5568' },
      { id: 'lobby-plant-1', type: 'plant', x: 20, y: 20, width: 30, height: 30 },
      { id: 'lobby-plant-2', type: 'plant', x: 450, y: 20, width: 30, height: 30 },
      { id: 'lobby-plant-3', type: 'plant', x: 20, y: 200, width: 30, height: 30 },
      { id: 'lobby-plant-4', type: 'plant', x: 450, y: 200, width: 30, height: 30 },
    ],
  },

  // ── Open Workspace A ────────────────────────────────────────────────
  {
    id: 'open-space-1',
    name: 'Open Workspace A',
    type: 'open-space',
    x: 50,
    y: 350,
    width: 450,
    height: 350,
    color: '#f5f5f0',
    borderColor: '#d4cfc5',
    icon: '💻',
    furniture: [
      // Row 1 of desks
      { id: 'os1-desk-1', type: 'desk', x: 30, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-2', type: 'desk', x: 120, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-3', type: 'desk', x: 210, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-4', type: 'desk', x: 300, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      // Row 2
      { id: 'os1-desk-5', type: 'desk', x: 30, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-6', type: 'desk', x: 120, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-7', type: 'desk', x: 210, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-8', type: 'desk', x: 300, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      // Row 3
      { id: 'os1-desk-9', type: 'desk', x: 30, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-10', type: 'desk', x: 120, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-11', type: 'desk', x: 210, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-12', type: 'desk', x: 300, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      // Row 4
      { id: 'os1-desk-13', type: 'desk', x: 30, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-14', type: 'desk', x: 120, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-15', type: 'desk', x: 210, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os1-desk-16', type: 'desk', x: 300, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      // Plants & decor
      { id: 'os1-plant-1', type: 'plant', x: 400, y: 20, width: 25, height: 25 },
      { id: 'os1-plant-2', type: 'plant', x: 400, y: 170, width: 25, height: 25 },
      { id: 'os1-printer-1', type: 'printer', x: 400, y: 300, width: 35, height: 25 },
    ],
  },

  // ── Open Workspace B ────────────────────────────────────────────────
  {
    id: 'open-space-2',
    name: 'Open Workspace B',
    type: 'open-space',
    x: 550,
    y: 350,
    width: 450,
    height: 350,
    color: '#f5f5f0',
    borderColor: '#d4cfc5',
    icon: '💻',
    furniture: [
      { id: 'os2-desk-1', type: 'desk', x: 30, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-2', type: 'desk', x: 120, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-3', type: 'desk', x: 210, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-4', type: 'desk', x: 300, y: 30, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-5', type: 'desk', x: 30, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-6', type: 'desk', x: 120, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-7', type: 'desk', x: 210, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-8', type: 'desk', x: 300, y: 100, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-9', type: 'desk', x: 30, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-10', type: 'desk', x: 120, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-11', type: 'desk', x: 210, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-12', type: 'desk', x: 300, y: 190, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-13', type: 'desk', x: 30, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-14', type: 'desk', x: 120, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-15', type: 'desk', x: 210, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-desk-16', type: 'desk', x: 300, y: 270, width: 70, height: 35, color: '#8b7355', interactive: true },
      { id: 'os2-plant-1', type: 'plant', x: 400, y: 20, width: 25, height: 25 },
      { id: 'os2-plant-2', type: 'plant', x: 400, y: 170, width: 25, height: 25 },
      { id: 'os2-water', type: 'water-cooler', x: 400, y: 300, width: 25, height: 30 },
    ],
  },

  // ── Conference Room Alpha ───────────────────────────────────────────
  {
    id: 'conf-room-1',
    name: 'Conference Room Alpha',
    type: 'conference',
    x: 1050,
    y: 50,
    width: 250,
    height: 180,
    color: '#e8edf5',
    borderColor: '#8da4c8',
    icon: '📋',
    furniture: [
      { id: 'cr1-table', type: 'table', x: 50, y: 40, width: 150, height: 70, color: '#5a4a3a' },
      { id: 'cr1-chair-1', type: 'chair', x: 60, y: 25, width: 20, height: 20 },
      { id: 'cr1-chair-2', type: 'chair', x: 100, y: 25, width: 20, height: 20 },
      { id: 'cr1-chair-3', type: 'chair', x: 140, y: 25, width: 20, height: 20 },
      { id: 'cr1-chair-4', type: 'chair', x: 60, y: 115, width: 20, height: 20 },
      { id: 'cr1-chair-5', type: 'chair', x: 100, y: 115, width: 20, height: 20 },
      { id: 'cr1-chair-6', type: 'chair', x: 140, y: 115, width: 20, height: 20 },
      { id: 'cr1-screen', type: 'screen', x: 100, y: 145, width: 50, height: 8 },
      { id: 'cr1-whiteboard', type: 'whiteboard', x: 210, y: 30, width: 8, height: 80 },
    ],
  },

  // ── Conference Room Beta ────────────────────────────────────────────
  {
    id: 'conf-room-2',
    name: 'Conference Room Beta',
    type: 'conference',
    x: 1050,
    y: 280,
    width: 250,
    height: 180,
    color: '#e8edf5',
    borderColor: '#8da4c8',
    icon: '📋',
    furniture: [
      { id: 'cr2-table', type: 'table', x: 50, y: 40, width: 150, height: 70, color: '#5a4a3a' },
      { id: 'cr2-chair-1', type: 'chair', x: 60, y: 25, width: 20, height: 20 },
      { id: 'cr2-chair-2', type: 'chair', x: 100, y: 25, width: 20, height: 20 },
      { id: 'cr2-chair-3', type: 'chair', x: 140, y: 25, width: 20, height: 20 },
      { id: 'cr2-chair-4', type: 'chair', x: 60, y: 115, width: 20, height: 20 },
      { id: 'cr2-chair-5', type: 'chair', x: 100, y: 115, width: 20, height: 20 },
      { id: 'cr2-chair-6', type: 'chair', x: 140, y: 115, width: 20, height: 20 },
      { id: 'cr2-screen', type: 'screen', x: 100, y: 145, width: 50, height: 8 },
    ],
  },

  // ── Conference Room Gamma ───────────────────────────────────────────
  {
    id: 'conf-room-3',
    name: 'Conference Room Gamma',
    type: 'conference',
    x: 1050,
    y: 510,
    width: 200,
    height: 150,
    color: '#e8edf5',
    borderColor: '#8da4c8',
    icon: '📋',
    furniture: [
      { id: 'cr3-table', type: 'table', x: 40, y: 35, width: 120, height: 60, color: '#5a4a3a' },
      { id: 'cr3-chair-1', type: 'chair', x: 50, y: 20, width: 20, height: 20 },
      { id: 'cr3-chair-2', type: 'chair', x: 100, y: 20, width: 20, height: 20 },
      { id: 'cr3-chair-3', type: 'chair', x: 50, y: 100, width: 20, height: 20 },
      { id: 'cr3-chair-4', type: 'chair', x: 100, y: 100, width: 20, height: 20 },
      { id: 'cr3-screen', type: 'screen', x: 70, y: 125, width: 50, height: 8 },
    ],
  },

  // ── Boardroom Executive ─────────────────────────────────────────────
  {
    id: 'conf-room-4',
    name: 'Boardroom Executive',
    type: 'conference',
    x: 50,
    y: 50,
    width: 300,
    height: 250,
    color: '#f0e6d8',
    borderColor: '#a0845c',
    icon: '👔',
    furniture: [
      { id: 'br-table', type: 'table', x: 50, y: 50, width: 200, height: 100, color: '#4a3728' },
      { id: 'br-chair-1', type: 'chair', x: 60, y: 30, width: 22, height: 22 },
      { id: 'br-chair-2', type: 'chair', x: 105, y: 30, width: 22, height: 22 },
      { id: 'br-chair-3', type: 'chair', x: 150, y: 30, width: 22, height: 22 },
      { id: 'br-chair-4', type: 'chair', x: 195, y: 30, width: 22, height: 22 },
      { id: 'br-chair-5', type: 'chair', x: 60, y: 155, width: 22, height: 22 },
      { id: 'br-chair-6', type: 'chair', x: 105, y: 155, width: 22, height: 22 },
      { id: 'br-chair-7', type: 'chair', x: 150, y: 155, width: 22, height: 22 },
      { id: 'br-chair-8', type: 'chair', x: 195, y: 155, width: 22, height: 22 },
      { id: 'br-screen-1', type: 'screen', x: 100, y: 200, width: 80, height: 10 },
      { id: 'br-plant-1', type: 'plant', x: 10, y: 10, width: 25, height: 25 },
      { id: 'br-plant-2', type: 'plant', x: 265, y: 10, width: 25, height: 25 },
    ],
  },

  // ── Private Offices ─────────────────────────────────────────────────
  {
    id: 'private-1',
    name: 'Private Office 1',
    type: 'private-office',
    x: 1050,
    y: 710,
    width: 150,
    height: 130,
    color: '#f0f5e8',
    borderColor: '#8ab060',
    icon: '🔒',
    furniture: [
      { id: 'po1-desk', type: 'desk', x: 30, y: 30, width: 80, height: 40, color: '#8b7355' },
      { id: 'po1-chair', type: 'chair', x: 55, y: 75, width: 22, height: 22 },
      { id: 'po1-bookshelf', type: 'bookshelf', x: 120, y: 10, width: 20, height: 60 },
      { id: 'po1-plant', type: 'plant', x: 10, y: 100, width: 20, height: 20 },
    ],
  },
  {
    id: 'private-2',
    name: 'Private Office 2',
    type: 'private-office',
    x: 1250,
    y: 710,
    width: 150,
    height: 130,
    color: '#f0f5e8',
    borderColor: '#8ab060',
    icon: '🔒',
    furniture: [
      { id: 'po2-desk', type: 'desk', x: 30, y: 30, width: 80, height: 40, color: '#8b7355' },
      { id: 'po2-chair', type: 'chair', x: 55, y: 75, width: 22, height: 22 },
      { id: 'po2-lamp', type: 'lamp', x: 120, y: 10, width: 15, height: 15 },
    ],
  },
  {
    id: 'private-3',
    name: 'Private Office 3',
    type: 'private-office',
    x: 1300,
    y: 50,
    width: 150,
    height: 130,
    color: '#f0f5e8',
    borderColor: '#8ab060',
    icon: '🔒',
    furniture: [
      { id: 'po3-desk', type: 'desk', x: 30, y: 30, width: 80, height: 40, color: '#8b7355' },
      { id: 'po3-chair', type: 'chair', x: 55, y: 75, width: 22, height: 22 },
    ],
  },

  // ── CEO Office ──────────────────────────────────────────────────────
  {
    id: 'private-4',
    name: 'CEO Office',
    type: 'private-office',
    x: 1300,
    y: 230,
    width: 200,
    height: 200,
    color: '#faf0e6',
    borderColor: '#b8860b',
    icon: '👑',
    furniture: [
      { id: 'ceo-desk', type: 'desk', x: 40, y: 40, width: 120, height: 50, color: '#3a2a1a' },
      { id: 'ceo-chair', type: 'chair', x: 80, y: 100, width: 25, height: 25 },
      { id: 'ceo-sofa', type: 'sofa', x: 30, y: 150, width: 80, height: 35, color: '#2d2d2d' },
      { id: 'ceo-bookshelf', type: 'bookshelf', x: 165, y: 10, width: 25, height: 80 },
      { id: 'ceo-plant-1', type: 'plant', x: 10, y: 10, width: 25, height: 25 },
      { id: 'ceo-plant-2', type: 'plant', x: 165, y: 160, width: 25, height: 25 },
    ],
  },

  // ── Break Lounge ────────────────────────────────────────────────────
  {
    id: 'lounge-1',
    name: 'Break Lounge',
    type: 'lounge',
    x: 50,
    y: 750,
    width: 350,
    height: 250,
    color: '#faf3e8',
    borderColor: '#d4a574',
    icon: '☕',
    furniture: [
      { id: 'lg-sofa-1', type: 'sofa', x: 30, y: 30, width: 100, height: 45, color: '#4a5568' },
      { id: 'lg-sofa-2', type: 'sofa', x: 30, y: 120, width: 100, height: 45, color: '#4a5568' },
      { id: 'lg-table-1', type: 'table', x: 50, y: 85, width: 60, height: 30, color: '#8b7355' },
      { id: 'lg-sofa-3', type: 'sofa', x: 200, y: 30, width: 100, height: 45, color: '#6b4c3b' },
      { id: 'lg-sofa-4', type: 'sofa', x: 200, y: 120, width: 100, height: 45, color: '#6b4c3b' },
      { id: 'lg-table-2', type: 'table', x: 220, y: 85, width: 60, height: 30, color: '#8b7355' },
      { id: 'lg-coffee', type: 'coffee-machine', x: 150, y: 200, width: 30, height: 30 },
      { id: 'lg-plant-1', type: 'plant', x: 310, y: 20, width: 25, height: 25 },
      { id: 'lg-plant-2', type: 'plant', x: 310, y: 200, width: 25, height: 25 },
      { id: 'lg-lamp-1', type: 'lamp', x: 140, y: 20, width: 15, height: 15 },
    ],
  },

  // ── Cafeteria ───────────────────────────────────────────────────────
  {
    id: 'cafeteria',
    name: 'Cafeteria & Kitchen',
    type: 'cafeteria',
    x: 450,
    y: 750,
    width: 500,
    height: 250,
    color: '#fff8f0',
    borderColor: '#e8a87c',
    icon: '🍽️',
    furniture: [
      // Tables
      { id: 'caf-table-1', type: 'table', x: 30, y: 30, width: 60, height: 60, color: '#f0f0f0' },
      { id: 'caf-table-2', type: 'table', x: 120, y: 30, width: 60, height: 60, color: '#f0f0f0' },
      { id: 'caf-table-3', type: 'table', x: 210, y: 30, width: 60, height: 60, color: '#f0f0f0' },
      { id: 'caf-table-4', type: 'table', x: 30, y: 130, width: 60, height: 60, color: '#f0f0f0' },
      { id: 'caf-table-5', type: 'table', x: 120, y: 130, width: 60, height: 60, color: '#f0f0f0' },
      { id: 'caf-table-6', type: 'table', x: 210, y: 130, width: 60, height: 60, color: '#f0f0f0' },
      // Kitchen area
      { id: 'caf-counter', type: 'desk', x: 340, y: 20, width: 140, height: 40, color: '#808080' },
      { id: 'caf-coffee', type: 'coffee-machine', x: 350, y: 80, width: 30, height: 30 },
      { id: 'caf-water', type: 'water-cooler', x: 400, y: 80, width: 25, height: 30 },
      { id: 'caf-plant-1', type: 'plant', x: 460, y: 20, width: 25, height: 25 },
      { id: 'caf-plant-2', type: 'plant', x: 460, y: 200, width: 25, height: 25 },
    ],
  },
];

const decorations: DecorationItem[] = [
  // Corridors
  { type: 'corridor', x: 350, y: 300, width: 100, height: 50 },
  { type: 'corridor', x: 500, y: 300, width: 100, height: 50 },
  { type: 'corridor', x: 950, y: 300, width: 100, height: 160 },
  { type: 'corridor', x: 400, y: 700, width: 50, height: 50 },

  // Doors
  { type: 'door', x: 580, y: 295, width: 40, height: 10 },
  { type: 'door', x: 680, y: 295, width: 40, height: 10 },
  { type: 'door', x: 1045, y: 120, width: 10, height: 30 },
  { type: 'door', x: 1045, y: 350, width: 10, height: 30 },
  { type: 'door', x: 1045, y: 570, width: 10, height: 30 },

  // Windows (on exterior walls)
  { type: 'window', x: 50, y: 45, width: 40, height: 5 },
  { type: 'window', x: 150, y: 45, width: 40, height: 5 },
  { type: 'window', x: 250, y: 45, width: 40, height: 5 },
  { type: 'window', x: 1350, y: 45, width: 40, height: 5 },

  // Elevator
  { type: 'elevator', x: 960, y: 50, width: 50, height: 50 },

  // Restroom signs
  { type: 'restroom-sign', x: 960, y: 130, width: 40, height: 20 },
];

export const officeFloor: OfficeFloor = {
  id: 'floor-1',
  name: 'Main Floor',
  width: 1550,
  height: 1050,
  rooms,
  decorations,
};

export function getRoomAt(x: number, y: number): RoomLayout | undefined {
  return rooms.find(room =>
    x >= room.x && x <= room.x + room.width &&
    y >= room.y && y <= room.y + room.height
  );
}

export function getRoomById(id: string): RoomLayout | undefined {
  return rooms.find(room => room.id === id);
}
