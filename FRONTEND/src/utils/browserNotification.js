const notifiedMessageIds = new Set();

export const requestBrowserNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return Notification.permission;
  }
};

export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const showBrowserMessageNotification = ({
  messageId,
  courseTitle = 'Course Discussion',
  senderName = 'Someone',
  content = '',
  type = 'text',
  fileName = '',
  courseId,
  onClick,
}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  if (messageId && notifiedMessageIds.has(messageId)) {
    return;
  }

  if (messageId) {
    notifiedMessageIds.add(messageId);
    if (notifiedMessageIds.size > 200) {
      const firstEntry = notifiedMessageIds.values().next().value;
      notifiedMessageIds.delete(firstEntry);
    }
  }

  let bodyText = content;
  if (type === 'sticker') {
    bodyText = 'Sent a sticker 🎨';
  } else if (type === 'file') {
    bodyText = `Shared file: ${fileName || 'Attachment'}`;
  }

  try {
    const notification = new Notification(`💬 ${courseTitle}`, {
      body: `${senderName}: ${bodyText}`,
      icon: '/shnoor-logo.png',
      badge: '/shnoor-logo.png',
      tag: messageId ? `lms-msg-${messageId}` : `lms-chat-${Date.now()}`,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      if (typeof onClick === 'function') {
        onClick();
      }
    };
  } catch (err) {
    console.warn('Browser notification error:', err);
  }
};
