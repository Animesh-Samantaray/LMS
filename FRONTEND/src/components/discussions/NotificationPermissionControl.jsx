import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Check, ShieldAlert } from 'lucide-react';
import {
  getNotificationPermissionStatus,
  requestBrowserNotificationPermission,
} from '../../utils/browserNotification';

const NotificationPermissionControl = () => {
  const [status, setStatus] = useState(() => getNotificationPermissionStatus());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setStatus(getNotificationPermissionStatus());
  }, []);

  const handleToggle = async () => {
    if (status === 'granted') return;
    setRequesting(true);
    const newStatus = await requestBrowserNotificationPermission();
    setStatus(newStatus);
    setRequesting(false);
  };

  if (status === 'unsupported') {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={status === 'granted' || requesting}
      title={
        status === 'granted'
          ? 'Browser notifications enabled'
          : status === 'denied'
          ? 'Notifications blocked in browser settings'
          : 'Enable browser notifications for new messages'
      }
      className={`p-2 rounded-full border transition-all ${
        status === 'granted'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
          : status === 'denied'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 cursor-not-allowed'
          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20'
      }`}
    >
      {status === 'granted' ? (
        <BellRing size={16} />
      ) : status === 'denied' ? (
        <BellOff size={16} />
      ) : (
        <Bell size={16} className={requesting ? 'animate-bounce' : ''} />
      )}
    </button>
  );
};

export default NotificationPermissionControl;
