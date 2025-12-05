import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null;
  private isClient: boolean;

  constructor() {
    this.socket = null;
    this.isClient = typeof window !== 'undefined';
  }

  connect() {
    // Only connect on client side (not during SSR)
    if (!this.isClient) {
      console.warn('Socket.IO can only be used in the browser');
      return null;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinEvent(eventId, userId, userName) {
    if (this.socket) {
      this.socket.emit('join-event', { eventId, userId, userName });
    }
  }

  sendQuestion(data) {
    if (this.socket) {
      this.socket.emit('send-question', data);
    }
  }

  // NEW: AI Chat methods
  sendAIChat(data) {
    if (this.socket) {
      this.socket.emit('ai-chat', data);
    }
  }

  sendAIChatSimple(data) {
    if (this.socket) {
      this.socket.emit('ai-chat-simple', data);
    }
  }

  requestAISuggestions(message) {
    if (this.socket) {
      this.socket.emit('ai-suggestions', { message });
    }
  }

  checkAIHealth() {
    if (this.socket) {
      this.socket.emit('ai-health-check');
    }
  }

  sendOrganizerAnswer(data) {
    if (this.socket) {
      this.socket.emit('organizer-answer', data);
    }
  }

  sendTyping(data) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
let socketService = null;

export const getSocketService = () => {
  if (typeof window !== 'undefined' && !socketService) {
    socketService = new SocketService();
  }
  return socketService;
};

export default getSocketService;
