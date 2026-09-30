import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Shield, Smartphone } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationPreferencesModal = ({ isOpen, onClose }) => {
  const { pushStatus, requestPushPermission } = useNotification();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--lms-border)] bg-[var(--lms-bg)]">
            <h2 className="text-xl font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
              <Bell size={20} className="text-[var(--lms-accent)]" />
              Notification Preferences
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* System Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={16} /> Browser & System
              </h3>
              
              <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-bg)]">
                <div>
                  <h4 className="font-semibold text-[var(--lms-text-primary)]">Push Notifications</h4>
                  <p className="text-sm text-[var(--lms-text-secondary)] mt-1">Receive notifications even when the website is closed.</p>
                </div>
                
                {pushStatus === 'granted' ? (
                  <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 font-bold text-xs border border-green-500/20">
                    Enabled
                  </span>
                ) : pushStatus === 'denied' ? (
                   <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs border border-rose-500/20">
                    Blocked
                  </span>
                ) : (
                  <button 
                    onClick={requestPushPermission}
                    className="px-4 py-2 bg-[var(--lms-accent)] text-white rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-md"
                  >
                    Enable
                  </button>
                )}
              </div>
              
              {pushStatus === 'denied' && (
                <p className="text-xs text-rose-500 font-medium">
                  You have blocked notifications in your browser settings. You must unblock them in your browser's site settings to enable push notifications.
                </p>
              )}
            </div>

            <hr className="border-[var(--lms-border)]" />

            {/* In-App Types */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} /> In-App Events
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-[var(--lms-text-primary)]">Course Enrollments & Progress</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[var(--lms-accent)] focus:ring-[var(--lms-accent)]" />
                </label>
                
                <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-[var(--lms-text-primary)]">Quiz Assignments & Results</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[var(--lms-accent)] focus:ring-[var(--lms-accent)]" />
                </label>
                
                <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-[var(--lms-text-primary)]">System Announcements</span>
                  <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded text-[var(--lms-accent)] opacity-50 cursor-not-allowed" />
                </label>
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationPreferencesModal;
