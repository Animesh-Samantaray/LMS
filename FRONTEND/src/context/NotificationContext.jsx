import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api.service';
import { getSocket } from '../services/socket.service';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [pushStatus, setPushStatus] = useState('default');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/api/notifications?page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...res.data.notifications]);
      }
      setHasMore(res.data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let activeSocket = null;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Native Browser Notification
      if (Notification.permission === 'granted') {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.dedupeKey || notification._id,
          });
        } catch (e) {
          console.error('Failed to show native notification', e);
        }
      }
    };

    if (user) {
      fetchNotifications(1);
      fetchUnreadCount();

      getSocket()
        .then((s) => {
          if (!isSubscribed || !s) return;
          activeSocket = s;
          setSocket(s);
          s.on('notification:new', handleNewNotification);
        })
        .catch((err) => {
          console.warn('[NotificationContext] Failed to get socket:', err?.message);
        });
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setSocket(null);
    }

    return () => {
      isSubscribed = false;
      if (activeSocket) {
        activeSocket.off('notification:new', handleNewNotification);
      }
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPushStatus(permission);
    
    // Register Service Worker and subscribe if granted
    if (permission === 'granted' && 'serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const res = await api.get('/api/notifications/vapid-public-key');
        const publicVapidKey = res.data.publicKey;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        
        await api.post('/api/notifications/subscribe', subscription);
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    }
  };

  // Helper for VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
      fetchNotifications(page + 1);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        hasMore,
        markAsRead,
        markAllAsRead,
        loadMore,
        requestPushPermission,
        pushStatus
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
