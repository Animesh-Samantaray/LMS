import React, { useRef, useEffect, useState } from 'react';
import { Bell, Check, BookOpen, Star, AlertCircle, FileText, Settings, X, GraduationCap } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPreferencesModal from './NotificationPreferencesModal';

const getIcon = (type) => {
  switch (type) {
    case 'course_completed': return <GraduationCap size={16} className="text-green-500" />;
    case 'course_enrolled':
    case 'student_enrolled': return <BookOpen size={16} className="text-blue-500" />;
    case 'course_review_received': return <Star size={16} className="text-yellow-500" />;
    case 'quiz_published':
    case 'quiz_submitted':
    case 'quiz_result_published': return <FileText size={16} className="text-purple-500" />;
    case 'new_module':
    case 'new_lesson': return <BookOpen size={16} className="text-indigo-500" />;
    default: return <Bell size={16} className="text-gray-500" />;
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotification();
  const navigate = useNavigate();
  const [prefOpen, setPrefOpen] = useState(false);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the preferences modal
      if (document.getElementById('pref-modal') && document.getElementById('pref-modal').contains(event.target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#1a1f2e] border border-[var(--lms-border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--lms-border)] bg-[var(--lms-bg)]">
              <h3 className="font-bold text-[var(--lms-text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-[var(--lms-accent)] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-[var(--lms-text-secondary)] text-sm">
                  <div className="animate-spin w-5 h-5 border-2 border-[var(--lms-accent)] border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center text-[var(--lms-text-secondary)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--lms-bg)] flex items-center justify-center mb-3 text-gray-400">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">When you get notifications, they'll show up here.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`
                        relative flex gap-3 p-4 border-b border-[var(--lms-border)] cursor-pointer transition-colors
                        ${!notif.isRead ? 'bg-[#f0f7ff] dark:bg-[#1e293b]' : 'hover:bg-gray-50 dark:hover:bg-[#0f172a]'}
                      `}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}
                      
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--lms-bg)] border border-[var(--lms-border)] flex items-center justify-center mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-[var(--lms-text-primary)]' : 'font-semibold text-[var(--lms-text-primary)]'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[var(--lms-text-secondary)] mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1.5">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-[var(--lms-border)] bg-[var(--lms-bg)] flex justify-between items-center">
              <button 
                onClick={() => setPrefOpen(true)}
                className="text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] flex items-center gap-1.5"
              >
                 <Settings size={14} /> Preferences
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="pref-modal">
        <NotificationPreferencesModal isOpen={prefOpen} onClose={() => setPrefOpen(false)} />
      </div>
    </>
  );
};

export default NotificationDropdown;
