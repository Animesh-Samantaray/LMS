import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Star, Plus, AlertCircle, Check, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/review.service';
import ReviewSummary from './ReviewSummary';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const CourseReviews = ({ courseId, isEnrolled = false, onSummaryChange = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    limit: 5,
  });
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [myReview, setMyReview] = useState(null);
  const [loadingMyReview, setLoadingMyReview] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const showSuccessFeedback = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => {
      setFeedbackSuccess('');
    }, 4000);
  };

  const onSummaryChangeRef = React.useRef(onSummaryChange);
  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
  }, [onSummaryChange]);

  const fetchSummary = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoadingSummary(true);
      const res = await reviewService.getCourseReviewSummary(courseId);
      setSummary(res);
      if (onSummaryChangeRef.current) {
        onSummaryChangeRef.current(res);
      }
    } catch (err) {
      console.error('Failed to load review summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, [courseId]);

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!courseId) return;
      try {
        setLoadingReviews(true);
        const res = await reviewService.getCourseReviews(courseId, page, 5);
        setReviews(res.reviews || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    },
    [courseId]
  );

  const userId = user?._id || user?.id;
  const userRole = user?.role;

  const fetchMyReview = useCallback(async () => {
    if (!courseId || !userId || userRole !== 'Student') {
      setMyReview(null);
      return;
    }
    try {
      setLoadingMyReview(true);
      const res = await reviewService.getMyCourseReview(courseId);
      setMyReview(res.review || null);
    } catch (err) {
      console.error('Failed to load my review:', err);
    } finally {
      setLoadingMyReview(false);
    }
  }, [courseId, userId, userRole]);

  useEffect(() => {
    fetchSummary();
    fetchReviews(1);
    fetchMyReview();
  }, [fetchSummary, fetchReviews, fetchMyReview]);

  const handleCreateOrUpdateReview = async (formData) => {
    try {
      setFormSubmitting(true);
      setFormError('');

      if (isEditing && myReview?._id) {
        await reviewService.updateCourseReview(myReview._id, formData);
        showSuccessFeedback('Your review was updated successfully!');
      } else {
        await reviewService.createCourseReview(courseId, formData);
        showSuccessFeedback('Thank you! Your review has been published.');
      }

      setIsFormOpen(false);
      setIsEditing(false);

      await Promise.all([
        fetchSummary(),
        fetchReviews(1),
        fetchMyReview(),
      ]);
    } catch (err) {
      if (err.status === 409) {
        setFormError('You have already submitted a review for this course.');
        fetchMyReview();
      } else if (err.status === 403) {
        setFormError('You must be enrolled in this course to review it.');
      } else {
        setFormError(err.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview?._id) return;
    try {
      setDeleting(true);
      setDeleteError('');
      await reviewService.deleteCourseReview(myReview._id);
      setDeleteModalOpen(false);
      setMyReview(null);
      showSuccessFeedback('Your review was deleted.');

      await Promise.all([
        fetchSummary(),
        fetchReviews(1),
      ]);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete review. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      fetchReviews(newPage);
    }
  };

  const isStudent = user?.role === 'Student';

  return (
    <div className="space-y-8">
      <ReviewSummary summary={summary} loading={loadingSummary} />

      {feedbackSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in shadow-sm">
          <Check size={16} className="shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Student Review Section */}
      {isStudent && (
        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">
                {myReview ? 'Your Review for This Course' : 'Write a Review'}
              </h3>
              <p className="text-xs text-[var(--lms-text-muted)] mt-0.5">
                {myReview
                  ? 'You can edit your feedback and rating anytime.'
                  : 'Share your perspective to help fellow learners.'}
              </p>
            </div>

            {!myReview && !isFormOpen && (
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setIsFormOpen(true);
                  setIsEditing(false);
                }}
                className="lms-btn lms-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus size={14} /> Write Review
              </button>
            )}
          </div>

          {loadingMyReview ? (
            <div className="py-6 flex items-center justify-center">
              <Loader size={24} className="animate-spin text-[var(--lms-accent)]" />
            </div>
          ) : myReview && !isEditing ? (
            <div>
              <ReviewCard
                review={myReview}
                isOwnReview={true}
                onEdit={() => {
                  setFormError('');
                  setIsEditing(true);
                  setIsFormOpen(true);
                }}
                onDelete={() => {
                  setDeleteError('');
                  setDeleteModalOpen(true);
                }}
                deleting={deleting}
              />
            </div>
          ) : isFormOpen ? (
            <div className="pt-4 border-t border-[var(--lms-border)]">
              <ReviewForm
                initialRating={myReview?.rating || 5}
                initialComment={myReview?.comment || ''}
                isEditing={isEditing}
                submitting={formSubmitting}
                error={formError}
                onSubmit={handleCreateOrUpdateReview}
                onCancel={() => {
                  setIsFormOpen(false);
                  setIsEditing(false);
                  setFormError('');
                }}
              />
            </div>
          ) : null}
        </div>
      )}

      {!user && (
        <div className="bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 bg-[var(--lms-accent-subtle)] text-[var(--lms-accent)] rounded-full flex items-center justify-center mx-auto">
            <Star size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">Enrolled in this course?</h4>
            <p className="text-xs text-[var(--lms-text-secondary)] mt-0.5">
              Sign in to share your learning feedback and rate this course.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="lms-btn lms-btn-primary text-xs px-5 py-2 inline-flex"
          >
            Sign In to Review
          </button>
        </div>
      )}

      {/* Public Reviews List */}
      <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--lms-border)]">
          <h3 className="text-lg font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--lms-accent)]" />
            <span>Learner Reviews</span>
          </h3>
          <span className="text-xs font-semibold text-[var(--lms-text-muted)]">
            Showing {reviews.length} of {pagination.totalReviews || 0}
          </span>
        </div>

        {loadingReviews ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader size={28} className="animate-spin text-[var(--lms-accent)]" />
            <p className="text-xs text-[var(--lms-text-muted)]">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-[var(--lms-text-muted)] flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={22} />
            </div>
            <h4 className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">No reviews yet</h4>
            <p className="text-xs text-[var(--lms-text-muted)] max-w-sm mx-auto">
              There are no reviews written for this course yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                isOwnReview={
                  Boolean(user && (rev.userId?._id === user._id || rev.userId?._id === user.id || rev.userId === user._id || rev.userId === user.id))
                }
                onEdit={
                  isStudent &&
                  (rev.userId?._id === user?._id || rev.userId?._id === user?.id || rev.userId === user?._id || rev.userId === user?.id)
                    ? () => {
                        setFormError('');
                        setIsEditing(true);
                        setIsFormOpen(true);
                      }
                    : null
                }
                onDelete={
                  isStudent &&
                  (rev.userId?._id === user?._id || rev.userId?._id === user?.id || rev.userId === user?._id || rev.userId === user?.id)
                    ? () => {
                        setDeleteError('');
                        setDeleteModalOpen(true);
                      }
                    : null
                }
                deleting={deleting}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--lms-border)] text-xs">
            <span className="text-[var(--lms-text-muted)] font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1 || loadingReviews}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={loadingReviews}
                    onClick={() => handlePageChange(p)}
                    className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors ${
                      p === pagination.currentPage
                        ? 'bg-[var(--lms-accent)] text-white'
                        : 'text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages || loadingReviews}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Next page"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          ></div>
          <div className="relative bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)]">Delete Review</h3>
                <p className="text-xs text-[var(--lms-text-muted)]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] leading-relaxed">
              Are you sure you want to delete your review? It will be permanently removed from public course reviews and the course rating summary will be updated.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteReview}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center gap-2 shadow-md"
              >
                {deleting && <Loader size={14} className="animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
