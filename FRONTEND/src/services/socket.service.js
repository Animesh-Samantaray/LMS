import { io } from 'socket.io-client';
import { auth } from '../configs/firebase';
import { API_BASE_URL } from './api.service';

let socket = null;
let currentUid = null;
let connectionPromise = null;

const getSocketUrl = () => {
  const envSocketUrl = (import.meta.env.VITE_SOCKET_URL || '').trim().replace(/\/$/, '');
  if (envSocketUrl) return envSocketUrl;

  const apiBase = (API_BASE_URL || '').trim().replace(/\/$/, '');
  if (apiBase) return apiBase;

  return window.location.origin;
};

export const getSocket = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    disconnectSocket();
    return null;
  }

  // If user changed (e.g. switched accounts), tear down previous socket
  if (currentUid && currentUid !== currentUser.uid) {
    disconnectSocket();
  }

  // If socket is already connected or actively connecting with same user, return it
  if (socket && !socket.disconnected) {
    return socket;
  }

  // If a connection attempt is already in flight, await and return it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const token = await currentUser.getIdToken();
      currentUid = currentUser.uid;

      const socketUrl = getSocketUrl();

      socket = io(socketUrl, {
        path: '/socket.io/',
        auth: {
          token,
        },
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1500,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Refresh token on reconnection attempts
      socket.io.on('reconnect_attempt', async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            const freshToken = await user.getIdToken();
            socket.auth = { token: freshToken };
          }
        } catch (e) {
          console.warn('[Socket] Failed to refresh token before reconnect:', e.message);
        }
      });

      socket.on('connect', () => {
        const transport = socket.io?.engine?.transport?.name || 'unknown';
        console.log(`[Socket] Connected to ${socketUrl} (${socket.id}) via ${transport}`);
      });

      socket.io?.engine?.on('upgrade', (transport) => {
        console.log(`[Socket] Transport upgraded to ${transport.name}`);
      });

      socket.on('connect_error', async (err) => {
        console.warn('[Socket] Connection status:', err.message);

        // If rejected due to token expiry, refresh token and update socket.auth for next retry
        if (err.message && (err.message.includes('token') || err.message.includes('Authentication'))) {
          try {
            const user = auth.currentUser;
            if (user) {
              const freshToken = await user.getIdToken(true);
              socket.auth = { token: freshToken };
            }
          } catch (refreshErr) {
            console.warn('[Socket] Token refresh error:', refreshErr.message);
          }
        }
      });

      socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
      });

      return socket;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUid = null;
  connectionPromise = null;
};
