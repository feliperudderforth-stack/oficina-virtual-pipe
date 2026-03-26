import { io, Socket } from 'socket.io-client';

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
    return window.location.origin.replace('-3002.', '-3001.').replace('-3000.', '-3001.');
  }
  return 'http://localhost:3001';
}

const SOCKET_URL = getSocketUrl();
const CONNECT_TIMEOUT = 5000; // 5 seconds to connect before going offline

let socket: Socket | null = null;
let offlineMode = false;

export function isOfflineMode(): boolean {
  return offlineMode;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: CONNECT_TIMEOUT,
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

/** Try to connect; resolve true if connected, false if timed out (offline mode) */
export function connectWithTimeout(): Promise<boolean> {
  return new Promise((resolve) => {
    const s = connectSocket();

    if (s.connected) {
      offlineMode = false;
      resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      offlineMode = true;
      resolve(false);
    }, CONNECT_TIMEOUT);

    s.once('connect', () => {
      clearTimeout(timer);
      offlineMode = false;
      resolve(true);
    });

    s.once('connect_error', () => {
      clearTimeout(timer);
      offlineMode = true;
      resolve(false);
    });
  });
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
