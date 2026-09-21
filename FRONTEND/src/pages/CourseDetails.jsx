import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Check, ChevronDown, MonitorPlay, FileText, Award, Share2, Star, Clock, Globe, ArrowLeft, LayoutGrid, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api.service';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/courses/${id}`);
        setCourse(res.data.course || res.data);
      } catch (err) {
        setError("Failed to load course details. The course may not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-[var(--lms-text-secondary)] font-medium">Loading course details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md w-full bg-[var(--lms-surface)] p-8 rounded-2xl border border-[var(--lms-border)] shadow-sm">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-2">Course Not Found</h2>
            <p className="text-[var(--lms-text-secondary)] mb-6">{error || "The requested course could not be found."}</p>
            <button onClick={() => navigate('/courses')} className="lms-btn lms-btn-primary w-full">
              Browse All Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            <div className="flex-1">
              <Link to="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Courses
              </Link>
              
              <div className="flex items-center gap-3 mb-6">
                {course.category?.name && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {course.category.name}
                  </span>
                )}
                {course.status === 'draft' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    DRAFT
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-extrabold mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-300 mb-8 max-w-3xl leading-relaxed">
                {course.description || "No description provided."}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">5.0</span>
                  <div className="flex text-amber-400">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-amber-400" />)}
                  </div>
                  <span className="text-gray-400 underline decoration-gray-500">(1,234 ratings)</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={16} />
                  <span>By <span className="font-semibold text-blue-400 underline decoration-blue-400/30 underline-offset-2">{course.instructor?.name || 'Instructor'}</span></span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={16} />
                  <span>Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Globe size={16} />
                  <span>English</span>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Container (Desktop) */}
            <div className="hidden lg:block w-[380px] shrink-0"></div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
        
        {/* Left Column - Details */}
        <div className="flex-1 lg:max-w-[calc(100%-444px)]">
          
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-6">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start text-sm text-[var(--lms-text-secondary)]">
                <Check size={20} className="text-emerald-500 shrink-0" />
                <span>Master the core concepts of this subject matter completely from scratch.</span>
              </div>
              <div className="flex gap-3 items-start text-sm text-[var(--lms-text-secondary)]">
                <Check size={20} className="text-emerald-500 shrink-0" />
                <span>Build real-world projects to add to your portfolio.</span>
              </div>
              <div className="flex gap-3 items-start text-sm text-[var(--lms-text-secondary)]">
                <Check size={20} className="text-emerald-500 shrink-0" />
                <span>Understand advanced techniques used by industry professionals.</span>
              </div>
              <div className="flex gap-3 items-start text-sm text-[var(--lms-text-secondary)]">
                <Check size={20} className="text-emerald-500 shrink-0" />
                <span>Learn best practices and avoid common pitfalls.</span>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--lms-text-primary)]">Course Content</h2>
              <span className="text-[var(--lms-text-secondary)] text-sm font-medium">5 Modules • 24 Lessons • 12h 30m total length</span>
            </div>
            
            {/* STATIC PLACEHOLDER FOR MODULES */}
            <div className="border border-[var(--lms-border)] rounded-xl overflow-hidden bg-[var(--lms-surface)] shadow-sm">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid size={32} />
                </div>
                <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-2">Curriculum is being prepared</h3>
                <p className="text-[var(--lms-text-secondary)] max-w-md mx-auto mb-6">
                  Modules, units, lessons, assignments, and resources for this course will be added here soon.
                </p>
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                  <PlayCircle size={16} /> Start building your course content
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-6">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-[var(--lms-text-secondary)]">
              <li>A computer with internet access.</li>
              <li>Willingness to learn and practice consistently.</li>
              <li>No prior experience required - this course covers everything from scratch.</li>
            </ul>
          </section>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:w-[380px] shrink-0">
          <div className="lg:absolute lg:-top-[340px] lg:right-4 xl:right-auto lg:w-[380px]">
            <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl overflow-hidden shadow-2xl sticky top-24">
              
              {/* Sidebar Image */}
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center group">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <LayoutGrid size={48} className="text-gray-600" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
                    <PlayCircle size={32} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-[var(--lms-text-primary)]">Free</span>
                </div>
                
                <button className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 cursor-not-allowed opacity-80" disabled title="Enrollment coming soon">
                  Enroll Now
                </button>
                <p className="text-center text-xs text-[var(--lms-text-muted)] mb-6">Enrollment integration coming soon.</p>
                
                <div className="space-y-4 text-sm text-[var(--lms-text-secondary)]">
                  <h4 className="font-bold text-[var(--lms-text-primary)] mb-2">This course includes:</h4>
                  <div className="flex items-center gap-3"><MonitorPlay size={18} className="text-gray-400" /> 12.5 hours on-demand video</div>
                  <div className="flex items-center gap-3"><FileText size={18} className="text-gray-400" /> 5 downloadable resources</div>
                  <div className="flex items-center gap-3"><LayoutGrid size={18} className="text-gray-400" /> Modules & Quizzes</div>
                  <div className="flex items-center gap-3"><Award size={18} className="text-gray-400" /> Certificate of completion</div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[var(--lms-border)] flex items-center justify-center gap-6">
                  <button className="flex items-center gap-2 text-sm font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
