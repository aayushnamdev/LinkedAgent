import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  agentId?: string;
}

interface NotificationPayload {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    name: string;
    avatar_url?: string;
  };
}

interface MessagePayload {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

interface TypingPayload {
  agentId: string;
  isTyping: boolean;
}

let io: SocketIOServer | null = null;

/**
 * Initialize WebSocket server with HTTP server
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
      ],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log('❌ WebSocket: No token provided');
      return next(new Error('Authentication token required'));
    }

    try {
      // For API key authentication
      // In production, validate against database
      // For now, we'll accept the API key as the agent ID
      socket.userId = token;
      socket.agentId = token;
      console.log(`✅ WebSocket: Agent ${socket.agentId} authenticated`);
      next();
    } catch (error) {
      console.log('❌ WebSocket: Authentication failed', error);
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    const agentId = socket.agentId;
    console.log(`🔌 WebSocket: Agent ${agentId} connected (${socket.id})`);

    // Join personal room for targeted notifications
    if (agentId) {
      socket.join(`user:${agentId}`);
      console.log(`📬 Agent ${agentId} joined personal room`);

      // Mark agent as active
      socket.broadcast.emit('agent:active', { agentId, isActive: true });
    }

    // Subscribe to specific rooms (e.g., channels, conversations)
    socket.on('subscribe', (room: string) => {
      socket.join(room);
      console.log(`📢 Agent ${agentId} subscribed to ${room}`);
    });

    socket.on('unsubscribe', (room: string) => {
      socket.leave(room);
      console.log(`🔇 Agent ${agentId} unsubscribed from ${room}`);
    });

    // Typing indicators for messages
    socket.on('message:typing', (data: { recipientId: string; isTyping: boolean }) => {
      io?.to(`user:${data.recipientId}`).emit('message:typing', {
        agentId,
        isTyping: data.isTyping,
      });
    });

    // Message read receipts
    socket.on('message:read', (data: { messageId: string; senderId: string }) => {
      io?.to(`user:${data.senderId}`).emit('message:read', {
        messageId: data.messageId,
        readBy: agentId,
      });
    });

    // Notification read acknowledgment
    socket.on('notification:read', (data: { notificationId: string }) => {
      // Broadcast read status (could be used for analytics)
      console.log(`📬 Notification ${data.notificationId} read by ${agentId}`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket: Agent ${agentId} disconnected (${socket.id})`);

      if (agentId) {
        // Mark agent as inactive
        socket.broadcast.emit('agent:inactive', { agentId, isActive: false });
      }
    });

    // Heartbeat/ping for keeping connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('🌐 WebSocket server initialized');
  return io;
}

/**
 * Get the WebSocket server instance
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return io;
}

/**
 * Send notification to a specific user
 */
export function sendNotification(recipientId: string, notification: NotificationPayload): void {
  if (!io) {
    console.warn('⚠️ WebSocket not initialized, cannot send notification');
    return;
  }

  io.to(`user:${recipientId}`).emit('notification:new', notification);
  console.log(`📬 Notification sent to user:${recipientId}`, {
    type: notification.type,
    from: notification.actor_id,
  });
}

/**
 * Send message to a specific user
 */
export function sendMessage(recipientId: string, message: MessagePayload): void {
  if (!io) {
    console.warn('⚠️ WebSocket not initialized, cannot send message');
    return;
  }

  io.to(`user:${recipientId}`).emit('message:new', message);
  console.log(`💬 Message sent to user:${recipientId}`, {
    from: message.sender_id,
  });
}

/**
 * Broadcast activity update to user's feed
 */
export function broadcastActivityUpdate(userId: string, activity: any): void {
  if (!io) {
    console.warn('⚠️ WebSocket not initialized, cannot broadcast activity');
    return;
  }

  io.to(`user:${userId}`).emit('activity:update', activity);
  console.log(`📊 Activity update sent to user:${userId}`);
}

/**
 * Broadcast to all connected clients
 */
export function broadcastToAll(event: string, data: any): void {
  if (!io) {
    console.warn('⚠️ WebSocket not initialized, cannot broadcast');
    return;
  }

  io.emit(event, data);
  console.log(`📡 Broadcast: ${event}`);
}

/**
 * Get count of connected clients
 */
export async function getConnectedCount(): Promise<number> {
  if (!io) {
    return 0;
  }

  const sockets = await io.fetchSockets();
  return sockets.length;
}

/**
 * Check if a user is online
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  if (!io) {
    return false;
  }

  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  return room !== undefined && room.size > 0;
}

export default {
  initializeWebSocket,
  getIO,
  sendNotification,
  sendMessage,
  broadcastActivityUpdate,
  broadcastToAll,
  getConnectedCount,
  isUserOnline,
};
