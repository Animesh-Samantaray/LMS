import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  MoreVertical,
  Users,
  Trash2,
  Sparkles,
  Info,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';

const DiscussionHeader = ({
  discussion,
  onBack,
  canManage,
  onToggleMedia,
  onClearMessages,
  showBackButton,
  isClearing,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const menuRef = useRef(null);
  const course = discussion?.courseId || {};

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--lms-border)] bg-[var(--lms-surface)] shrink-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)] transition-colors shrink-0"
            title="Back to conversations"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-cyan-600 to-teal-800 flex items-center justify-center text-white font-bold border border-cyan-500/20 shadow-sm">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title || 'Course'}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen size={20} className="text-cyan-200" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[var(--lms-text-primary)] leading-tight truncate">
              {course.title || 'Course Discussion'}
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
              Course Discussion
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--lms-text-muted)] mt-0.5">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-cyan-500" />
              {discussion?.memberCount || 1} {discussion?.memberCount === 1 ? 'member' : 'members'}
            </span>
            {course.category && (
              <>
                <span className="text-[var(--lms-border)]">•</span>
                <span className="truncate">{course.category}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 relative" ref={menuRef}>
        
        <button
          onClick={onToggleMedia}
          className="p-2 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
          title="Shared Media & Files"
        >
          <ImageIcon size={17} />
        </button>

        {canManage && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
              title="Discussion options"
            >
              <MoreVertical size={17} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-1.5 shadow-2xl z-50 animate-scale-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                  Management Actions
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onClearMessages();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                  Clear discussion messages
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionHeader;
