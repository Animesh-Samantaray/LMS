import Notification from '../Models/Notification.model.js';
import PushSubscription from '../Models/PushSubscription.model.js';
import webpush from 'web-push';

// Configuration for web-push should normally be in .env
// We'll use dummy VAPID keys if none are provided to avoid crashing
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5L6jL7QxZ_T5G8U2T8ZZ4s',
  privateKey: process.env.VAPID_PRIVATE_KEY || '8pM7dZ_XzR8F4kC4gB9R-p4hD1N2M1qP9R_p4hD1N2M'
};

try {
  webpush.setVapidDetails(
    'mailto:test@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (e) {
  console.log('Web push VAPID keys invalid, skipping setup');
}

let ioRef;
export const setSocketIo = (io) => {
  ioRef = io;
};

export const createNotification = async ({ recipient, actor, type, title, message, entityType, entityId, actionUrl, dedupeKey }) => {
  try {
    if (dedupeKey) {
      const existing = await Notification.findOne({ recipient, dedupeKey });
      if (existing) return existing; // Skip duplicate
    }

    const notification = new Notification({
      recipient, actor, type, title, message, entityType, entityId, actionUrl, dedupeKey
    });
    await notification.save();

    // 1. Emit to Socket.IO
    if (ioRef) {
      ioRef.to(`user:${recipient.toString()}`).emit('notification:new', notification);
    }

    // 2. Send Web Push
    try {
      const subscriptions = await PushSubscription.find({ user: recipient });
      const payload = JSON.stringify({
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        dedupeKey: notification.dedupeKey,
        _id: notification._id
      });
      
      const pushPromises = subscriptions.map(sub => 
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        ).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription has expired or is no longer valid: ', err);
            return PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error('Error sending push: ', err);
          }
        })
      );
      await Promise.all(pushPromises);
    } catch(e) {
      console.error('Failed to send web push', e);
    }

    return notification;
  } catch (error) {
    console.error('Notification Service Error:', error);
    // Don't throw to prevent breaking business logic
  }
};
