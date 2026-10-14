import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Mail,
  UserCheck,
  Crown,
  MessageSquare,
} from 'lucide-react';
import discussionService from '../../services/discussion.service';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarBg = (name = '') => {
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const GroupMembersPanel = ({
  isOpen,
  onClose,
  discussion,
  currentUserId,
  onStartDirectChat,
}) => {
  const [members, setMembers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [imgErrors, setImgErrors] = useState({});

  const discussionId = discussion?._id;
  const courseTitle = discussion?.courseId?.title || groupInfo?.courseTitle || 'Course Group';

  useEffect(() => {
    if (!isOpen || !discussionId) return;

    let isMounted = true;

    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await discussionService.getDiscussionMembers(discussionId);
        if (isMounted) {
          if (res?.success && res.data) {
            setMembers(res.data.members || []);
            setGroupInfo(res.data);
          } else {
            setError(res?.message || 'Failed to load group members');
          }
        }
      } catch (err) {
        if (isMounted) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Could not load members. Please verify access.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, discussionId]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      member.name?.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q) ||
      member.role?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'all' ||
      member.role?.toLowerCase() === roleFilter.toLowerCase() ||
      (roleFilter === 'creator' && member.isCreator);

    return matchesSearch && matchesRole;
  });

  const memberCounts = {
    all: members.length,
    instructor: members.filter((m) => m.role === 'Instructor' || m.isCreator).length,
    student: members.filter((m) => m.role === 'Student').length,
    admin: members.filter((m) => m.role === 'Admin').length,
  };

  const renderRoleBadge = (member) => {
    if (member.isCreator) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Crown size={11} className="text-amber-500" />
          Lead Instructor
        </span>
      );
    }
    if (member.role === 'Instructor') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
          <GraduationCap size={11} className="text-indigo-500" />
          Instructor
        </span>
      );
    }
    if (member.role === 'Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
          <ShieldCheck size={11} className="text-purple-500" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
        Student
      </span>
    );
  };

  return (
    <div
      className="w-full sm:w-88 md:w-96 h-full bg-[var(--lms-surface)] border-l border-[var(--lms-border)] flex flex-col z-30 shrink-0 shadow-2xl absolute sm:relative right-0 top-0 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Group Members List"
    >
      {/* Header */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-[var(--lms-border)] shrink-0 bg-[var(--lms-surface-elevated)]">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--lms-text-primary)] truncate">
              Group Members
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {loading ? '...' : members.length}
            </span>
          </div>
          <p className="text-[11px] text-[var(--lms-text-muted)] truncate mt-0.5" title={courseTitle}>
            {courseTitle}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)] transition-colors shrink-0"
          title="Close member list"
          aria-label="Close member list"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 border-b border-[var(--lms-border)] bg-[var(--lms-surface)] space-y-2 shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]"
          />
          <input
            type="text"
            placeholder="Search members by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lms-scrollbar">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-elevated)]'
            }`}
          >
            All ({memberCounts.all})
          </button>
          {memberCounts.instructor > 0 && (
            <button
              onClick={() => setRoleFilter('instructor')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                roleFilter === 'instructor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-elevated)]'
              }`}
            >
              Instructors ({memberCounts.instructor})
            </button>
          )}
          {memberCounts.student > 0 && (
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                roleFilter === 'student'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-elevated)]'
              }`}
            >
              Students ({memberCounts.student})
            </button>
          )}
          {memberCounts.admin > 0 && (
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                roleFilter === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-elevated)]'
              }`}
            >
              Admins ({memberCounts.admin})
            </button>
          )}
        </div>
      </div>

      {/* Member List Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 lms-scrollbar">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]/50 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--lms-border)]/60 shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-3 w-3/5 bg-[var(--lms-border)]/60 rounded" />
                  <div className="h-2 w-4/5 bg-[var(--lms-border)]/40 rounded" />
                </div>
                <div className="w-14 h-5 bg-[var(--lms-border)]/50 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">
              Could not load members
            </h4>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-4 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                discussionService
                  .getDiscussionMembers(discussionId)
                  .then((res) => {
                    if (res?.success) {
                      setMembers(res.data?.members || []);
                      setGroupInfo(res.data);
                    } else {
                      setError(res?.message || 'Failed to load');
                    }
                  })
                  .catch((err) => setError(err.message || 'Retry failed'))
                  .finally(() => setLoading(false));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold shadow hover:bg-cyan-600 transition-colors"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMembers.length === 0 && (
          <div className="p-8 text-center text-[var(--lms-text-muted)]">
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <h4 className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
              {searchQuery || roleFilter !== 'all' ? 'No matching members' : 'No members found'}
            </h4>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search query or role filter.'
                : 'Members will appear here once users join this course discussion.'}
            </p>
          </div>
        )}

        {/* Members List */}
        {!loading &&
          !error &&
          filteredMembers.map((member) => {
            const isMe =
              member.isCurrentUser ||
              (currentUserId && member._id?.toString() === currentUserId.toString());
            const hasCustomImage = member.profileImage && !imgErrors[member._id];

            return (
              <div
                key={member._id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 group ${
                  isMe
                    ? 'bg-cyan-500/5 border-cyan-500/30 shadow-sm'
                    : 'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] hover:border-cyan-500/30 hover:bg-[var(--lms-surface)]'
                }`}
              >
                {/* Avatar with fallback */}
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-sm border border-white/10 ${
                      hasCustomImage ? 'bg-slate-700' : getAvatarBg(member.name)
                    }`}
                  >
                    {hasCustomImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(member._id)}
                      />
                    ) : (
                      <span>{getInitials(member.name)}</span>
                    )}
                  </div>

                  {member.isCreator && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow"
                      title="Course Creator / Lead Instructor"
                    >
                      <Crown size={10} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate max-w-[150px]">
                      {member.name}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[10px] font-extrabold uppercase tracking-wide border border-cyan-500/30">
                        You
                      </span>
                    )}
                  </div>

                  {member.email && (
                    <div className="flex items-center gap-1 text-[11px] text-[var(--lms-text-muted)] truncate mt-0.5">
                      <Mail size={10} className="shrink-0 opacity-70" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                {/* Role badge & Direct Chat action */}
                <div className="flex items-center gap-2 shrink-0">
                  {renderRoleBadge(member)}

                  {!isMe && onStartDirectChat && (
                    <button
                      type="button"
                      onClick={() => onStartDirectChat(member)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-600 hover:text-white dark:text-cyan-400 dark:hover:text-white border border-cyan-500/25 hover:border-cyan-500 text-xs font-bold transition-all shadow-sm hover:shadow-cyan-500/20 cursor-pointer shrink-0 group/chat"
                      title={`Chat directly with ${member.name}`}
                      aria-label={`Chat directly with ${member.name}`}
                    >
                      <MessageSquare size={13} className="text-cyan-500 group-hover/chat:text-white transition-colors" />
                      <span>Chat</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer Info */}
      {!loading && !error && members.length > 0 && (
        <div className="p-3 border-t border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-center justify-between text-[11px] text-[var(--lms-text-muted)] shrink-0">
          <span>
            Showing {filteredMembers.length} of {members.length} members
          </span>
          <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
            <Sparkles size={12} />
            <span>Active Group</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembersPanel;
