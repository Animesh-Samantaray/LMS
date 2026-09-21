import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Check, ChevronDown, MonitorPlay, FileText, Award, Share2, Star, Clock, Globe, ArrowLeft, LayoutGrid, Loader, AlertCircle, User, Edit2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api.service';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/courses/${id}`);
        const courseData = res.data.course || res.data;
        setCourse(courseData);

        if (user && courseData?.enrolled) {
          const userId = user._id || user.id;
          const enrolled = courseData.enrolled.some(
            (e) => (e._id || e.id || e).toString() === userId?.toString()
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        setError("Failed to load course details. The course may not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndEnrollment();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setEnrolling(true);
      await api.post(`/api/courses/${id}/enroll`);
      setIsEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-[var(--lms-text-secondary)] font-medium">Loading course details...</p>
        </div>
      );
    }

    if (error || !course) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md w-full bg-[var(--lms-surface)] p-8 rounded-2xl border border-[var(--lms-border)] shadow-sm">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-2">Course Not Found</h2>
            <p className="text-[var(--lms-text-secondary)] mb-6">{error || "The requested course could not be found."}</p>
            <button onClick={() => navigate('/courses')} className="lms-btn lms-btn-primary w-full">
              Browse All Courses
            </button>
          </div>
        </div>
      );
    }

    const categoryName = typeof course.category === 'object' ? course.category?.name : course.category;
    const instructorName = course.instructor?.name || course.createdBy?.name || 'Instructor';

    return (
      <div className="space-y-8">
        <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
          <Link to="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Courses
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            {categoryName && (
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {categoryName}
              </span>
            )}
            {course.status === 'draft' && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                DRAFT
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
            {course.title}
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-3xl leading-relaxed">
            {course.description || "No description provided."}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">5.0</span>
              <div className="flex text-amber-400">
                {[1,2,3,4,5].map(s => <Star key={s} size={15} className="fill-amber-400" />)}
              </div>
              <span className="text-gray-400 underline decoration-gray-500">(1,234 ratings)</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <User size={15} />
              <span>By <span className="font-semibold text-blue-400 underline decoration-blue-400/30 underline-offset-2">{instructorName}</span></span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={15} />
              <span>Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Globe size={15} />
              <span>English</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--lms-text-primary)] mb-6">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start text-xs sm:text-sm text-[var(--lms-text-secondary)]">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Master the core concepts of this subject matter completely from scratch.</span>
                </div>
                <div className="flex gap-3 items-start text-xs sm:text-sm text-[var(--lms-text-secondary)]">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Build real-world projects to add to your portfolio.</span>
                </div>
                <div className="flex gap-3 items-start text-xs sm:text-sm text-[var(--lms-text-secondary)]">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Understand advanced techniques used by industry professionals.</span>
                </div>
                <div className="flex gap-3 items-start text-xs sm:text-sm text-[var(--lms-text-secondary)]">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Learn best practices and avoid common pitfalls.</span>
                </div>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">Course Content</h2>
                <span className="text-[var(--lms-text-secondary)] text-xs font-medium">5 Modules • 24 Lessons • 12h 30m total length</span>
              </div>
              
              <div className="border border-[var(--lms-border)] rounded-2xl overflow-hidden bg-[var(--lms-surface)] shadow-sm p-8 text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <LayoutGrid size={28} />
                </div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">Curriculum is being prepared</h3>
                <p className="text-xs text-[var(--lms-text-secondary)] max-w-md mx-auto mb-4">
                  Modules, units, lessons, assignments, and resources for this course will be added here soon.
                </p>
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] rounded-xl text-xs font-semibold cursor-not-allowed">
                  <PlayCircle size={15} /> Start building your course content
                </div>
              </div>
            </section>

            <section className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--lms-text-primary)] mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[var(--lms-text-secondary)]">
                <li>A computer with internet access.</li>
                <li>Willingness to learn and practice consistently.</li>
                <li>No prior experience required - this course covers everything from scratch.</li>
              </ul>
            </section>
          </div>

          <div className="lg:w-[360px] shrink-0">
            <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl overflow-hidden shadow-xl sticky top-6">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center group overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <LayoutGrid size={48} className="text-gray-600" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
                    <PlayCircle size={28} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-[var(--lms-text-primary)]">Free</span>
                </div>
                
                {user?.role === 'Student' && isEnrolled ? (
                  <button className="w-full lms-btn py-3.5 text-base mb-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold cursor-default flex items-center justify-center gap-2" disabled>
                    <Check size={18} /> Enrolled
                  </button>
                ) : user?.role === 'Student' ? (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 flex items-center justify-center gap-2"
                  >
                    {enrolling ? <Loader size={18} className="animate-spin" /> : null}
                    <span>{enrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                  </button>
                ) : (user?.role === 'Instructor' && (course.createdBy?._id === user._id || course.createdBy === user._id)) || user?.role === 'Admin' ? (
                  <button
                    onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                    className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit Course
                  </button>
                ) : (
                  <button
                    onClick={() => !user ? navigate('/login') : handleEnroll()}
                    disabled={enrolling}
                    className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 flex items-center justify-center gap-2"
                  >
                    {enrolling ? <Loader size={18} className="animate-spin" /> : null}
                    <span>{enrolling ? 'Enrolling...' : user ? 'Enroll Now' : 'Sign in to Enroll'}</span>
                  </button>
                )}
                
                <div className="space-y-3.5 text-xs sm:text-sm text-[var(--lms-text-secondary)] mt-4">
                  <h4 className="font-bold text-[var(--lms-text-primary)] mb-2">This course includes:</h4>
                  <div className="flex items-center gap-3"><MonitorPlay size={16} className="text-gray-400" /> 12.5 hours on-demand video</div>
                  <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400" /> 5 downloadable resources</div>
                  <div className="flex items-center gap-3"><LayoutGrid size={16} className="text-gray-400" /> Modules & Quizzes</div>
                  <div className="flex items-center gap-3"><Award size={16} className="text-gray-400" /> Certificate of completion</div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[var(--lms-border)] flex items-center justify-center gap-6">
                  <button className="flex items-center gap-2 text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (user) {
    return (
      <DashboardLayout pageTitle={course?.title || "Course Details"}>
        {renderContent()}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetails;
