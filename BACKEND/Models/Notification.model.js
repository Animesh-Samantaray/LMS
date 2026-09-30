import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  entityType: {
    type: String
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  actionUrl: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  dedupeKey: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
