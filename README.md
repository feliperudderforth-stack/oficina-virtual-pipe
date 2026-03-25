# Virtual Office Platform

Enterprise-grade virtual office for remote teams. Real-time collaborative workspace supporting 2,000+ concurrent users.

## Features

- **Interactive 2D Office Map** - Navigate a beautifully designed office with conference rooms, open workspaces, lounges, cafeteria, and private offices
- **Real-time Multiplayer** - See all colleagues moving in the office in real-time via WebSocket
- **Video & Audio Calls** - WebRTC-powered video calls with screen sharing
- **Proximity Audio** - Hear colleagues as you walk near them
- **Internal Messaging** - Channels, DMs, threads, reactions, typing indicators
- **Conference Rooms** - Book and join meetings with capacity management
- **Room Management** - Lock/unlock rooms, knock on locked doors
- **User Presence** - See who's online, busy, in meetings, or away
- **Collaborative Whiteboard** - Draw together in real-time
- **Notifications** - Real-time toast notifications for messages, calls, and interactions
- **Minimap** - Birds-eye view of the entire office
- **Keyboard Controls** - WASD/Arrow keys for movement, shortcuts for panels

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Real-time**: Socket.IO (supports 2,000+ concurrent connections)
- **Video/Audio**: WebRTC with signaling server
- **State Management**: Zustand
- **Animations**: Framer Motion, CSS Animations
- **Canvas**: HTML5 Canvas for office rendering

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Socket.IO server (separate terminal)
npm run server

# Or start both together
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) to access the virtual office.

## Architecture

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   └── office/page.tsx   # Main office experience
├── components/
│   ├── office/           # Canvas renderer, minimap
│   ├── chat/             # Messaging system
│   ├── video/            # Video call overlay
│   ├── sidebar/          # People, rooms, settings panels
│   ├── collaboration/    # Whiteboard
│   └── ui/               # Toolbar, notifications, modals
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
├── lib/                  # Utilities, socket client
└── data/                 # Office layout configuration

server/
└── index.ts              # Socket.IO server with all real-time events
```

## Scaling

The Socket.IO server supports horizontal scaling with Redis adapter. For 2,000+ users:

1. Deploy multiple Socket.IO server instances
2. Use Redis pub/sub for cross-instance communication
3. Use a load balancer with sticky sessions
4. Consider deploying with Kubernetes for auto-scaling

## License

Proprietary - Enterprise Software
