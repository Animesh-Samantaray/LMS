import { io } from 'socket.io-client';
import { auth } from '../configs/firebase';
import { API_BASE_URL } from './api.service';

let socket = null;
let currentToken = null;

export const getSocket = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  const token = await currentUser.getIdToken();

  if (socket && socket.connected && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  const socketUrl = API_BASE_URL || window.location.origin;

  socket = io(socketUrl, {
    auth: async (cb) => {
      try {
        const u = auth.currentUser;
        if (!u) return cb({});
        const freshToken = await u.getIdToken();
        cb({ token: freshToken });
      } catch (e) {
        cb({});
      }
    },
    withCredentials: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 2000,
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection status:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};
