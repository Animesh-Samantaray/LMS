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
    auth: {
      token,
    },
    withCredentials: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });

  socket.on('connect_error', async (err) => {
    console.warn('[Socket] Connection error:', err.message);
    if (err.message.includes('token') || err.message.includes('expired') || err.message.includes('Authentication')) {
      const refreshedUser = auth.currentUser;
      if (refreshedUser) {
        const freshToken = await refreshedUser.getIdToken(true);
        currentToken = freshToken;
        socket.auth = { token: freshToken };
        socket.connect();
      }
    }
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
