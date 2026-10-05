import Notification from '../Models/Notification.model.js';
import PushSubscription from '../Models/PushSubscription.model.js';

export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };
    if (req.query.unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + notifications.length < total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { returnDocument: "after" }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, recipient: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Web Push subscriptions
export const getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5L6jL7QxZ_T5G8U2T8ZZ4s' });
};

export const subscribePush = async (req, res) => {
  try {
    const subscription = req.body;
    
    // Check if exists
    let existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });
    if (!existing) {
      existing = new PushSubscription({
        user: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys
      });
      await existing.save();
    } else {
      // update user if endpoint recycled
      existing.user = req.user._id;
      existing.keys = subscription.keys;
      await existing.save();
    }
    
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ endpoint, user: req.user._id });
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
