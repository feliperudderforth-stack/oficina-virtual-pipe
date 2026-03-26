import { io, Socket } from 'socket.io-client';

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
    // Codespaces: derive socket URL from current hostname
    return window.location.origin.replace('-3002.', '-3001.').replace('-3000.', '-3001.');
  }
  return 'http://localhost:3001';
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
