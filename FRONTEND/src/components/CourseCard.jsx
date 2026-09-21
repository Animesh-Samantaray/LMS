import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, LayoutGrid, Heart, Bookmark, Eye, Edit2, Trash2, Send, Loader, Globe, Archive, AlertCircle } from 'lucide-react';

const CourseCard = ({
  course,
  isManagement = false,
  onPublish = null,
  onDelete = null,
  onEdit = null,
  isPublishing = false,
  isDeleting = false,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!course) return null;

  const categoryName = typeof course.category === 'object' && course.category !== null
    ? course.category.name
    : course.category || 'General';

  const instructorName = course.createdBy?.name || course.instructor?.name || course.instructor || 'Instructor';
  const instructorAvatar = course.createdBy?.profileImage || course.instructor?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructorName}`;

  const rating = course.rating || '5.0';
  const duration = course.duration || '10h 00m';
  const lectures = course.lectures || (course.modules?.length ? course.modules.length * 4 : 12);
  const price = course.price ? (typeof course.price === 'number' ? `₹${course.price}` : course.price) : 'Free';
  const status = course.status || 'draft';

  const getStatusBadge = () => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 backdrop-blur-sm">
            <Globe size={11} /> Published
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/25 backdrop-blur-sm">
            <Archive size={11} /> Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 backdrop-blur-sm">
            <Clock size={11} /> Draft
          </span>
        );
    }
  };

  const handleCardClick = (e) => {
    if (isManagement) return;
    navigate(`/courses/${course._id || course.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`lms-glass-card rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[var(--lms-border)] flex flex-col transition-all duration-300 group ${
        !isManagement ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[var(--lms-border-hover)]' : ''
      }`}
    >
      <div className="relative h-48 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/50 overflow-hidden flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`w-full h-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/20 text-[var(--lms-accent)] ${
            course.thumbnail ? 'hidden' : 'flex'
          }`}
        >
          <LayoutGrid size={48} className="opacity-40 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {isManagement ? (
            getStatusBadge()
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 backdrop-blur-md">
              {categoryName}
            </span>
          )}
        </div>

        {!isManagement && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--lms-surface)]/80 backdrop-blur-md border border-[var(--lms-border)] flex items-center justify-center shadow-sm transition-colors hover:scale-110 z-10"
            aria-label="Save course"
          >
            <Heart
              size={15}
              className={liked ? 'text-rose-500 fill-rose-500' : 'text-[var(--lms-text-muted)] hover:text-rose-500'}
            />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {isManagement && (
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--lms-text-muted)] mb-2">
              <span className="truncate max-w-[150px]">{categoryName}</span>
              <span>{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}</span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold text-[var(--lms-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--lms-accent)] transition-colors">
            {course.title}
          </h3>

          <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] line-clamp-2 mt-2 leading-relaxed">
            {course.description || 'Comprehensive online curriculum designed for learners.'}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-xs font-bold text-[var(--lms-text-primary)] ml-1">{rating}</span>
            </div>
            {!isManagement && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{price}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--lms-border)] text-xs text-[var(--lms-text-muted)] font-medium">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-rose-500" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LayoutGrid size={13} className="text-amber-500" />
              <span>{lectures} lectures</span>
            </div>
          </div>
        </div>
      </div>

      {isManagement && (
        <div className="p-3 bg-[var(--lms-surface-subtle)] border-t border-[var(--lms-border)] flex items-center gap-2 flex-wrap">
          {deleteConfirm ? (
            <div className="flex items-center justify-between w-full gap-2 p-1 animate-fade-in">
              <span className="text-xs text-rose-500 font-bold flex items-center gap-1">
                <AlertCircle size={13} /> Confirm delete?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(course._id)}
                  disabled={isDeleting}
                  className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {isDeleting ? <Loader size={12} className="animate-spin" /> : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="px-2.5 py-1 bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(`/courses/${course._id}`)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] hover:border-[var(--lms-accent)] hover:text-[var(--lms-accent)] transition-colors shadow-sm"
                title="View Course Details"
              >
                <Eye size={13} /> View
              </button>

              <button
                type="button"
                onClick={() => (onEdit ? onEdit(course._id) : navigate(`/instructor/courses/${course._id}/edit`))}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] hover:border-[var(--lms-accent)] hover:text-[var(--lms-accent)] transition-colors shadow-sm"
                title="Edit Course"
              >
                <Edit2 size={13} /> Edit
              </button>

              {status === 'draft' && onPublish && (
                <button
                  type="button"
                  onClick={() => onPublish(course._id)}
                  disabled={isPublishing}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors shadow-sm"
                  title="Publish Course"
                >
                  {isPublishing ? <Loader size={12} className="animate-spin" /> : <Send size={13} />}
                  <span>Publish</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-rose-500 bg-[var(--lms-surface)] border border-[var(--lms-border)] hover:bg-rose-500/15 hover:border-rose-500/30 transition-colors shadow-sm"
                title="Delete Course"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
