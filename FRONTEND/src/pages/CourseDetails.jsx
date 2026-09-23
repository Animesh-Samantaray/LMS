import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Check, ChevronDown, ChevronUp, MonitorPlay, FileText, Award, Share2, Star, Clock, Globe, ArrowLeft, LayoutGrid, Loader, AlertCircle, User, Edit2, Lock } from 'lucide-react';
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
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonResources, setSelectedLessonResources] = useState([]);
  const [loadingLessonResources, setLoadingLessonResources] = useState(false);

  const handleSelectLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setSelectedLessonResources([]);
    if (lesson?._id || lesson?.id) {
      const lessonId = lesson._id || lesson.id;
      try {
        setLoadingLessonResources(true);
        const res = await api.get(`/api/resources/lesson/${lessonId}`);
        setSelectedLessonResources(res.data.resources || []);
      } catch (err) {
        console.error("Failed to load resources for lesson", err);
      } finally {
        setLoadingLessonResources(false);
      }
    }
  };

  const getResourceIcon = (resource) => {
    const mime = resource?.mimeType || '';
    const type = resource?.type || '';

    if (mime === 'application/pdf' || type === 'PDF') {
      return <FileText size={16} className="text-rose-500 shrink-0" />;
    }
    if (mime.startsWith('video/') || type === 'Video') {
      return <PlayCircle size={16} className="text-indigo-500 shrink-0" />;
    }
    if (mime.startsWith('image/') || type === 'Image') {
      return <FileText size={16} className="text-purple-500 shrink-0" />;
    }
    if (type === 'Link' || resource?.source === 'external') {
      return <Globe size={16} className="text-emerald-500 shrink-0" />;
    }
    return <FileText size={16} className="text-blue-500 shrink-0" />;
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const [courseRes, unitsRes] = await Promise.all([
          api.get(`/api/courses/${id}`),
          api.get(`/api/courses/${id}/units`).catch(() => ({ data: { success: false, units: [] } }))
        ]);

        const courseData = courseRes.data.course || courseRes.data;
        if (courseData) {
          setCourse(courseData);

          if (user && courseData?.enrolled) {
            const userId = user._id || user.id;
            const enrolled = courseData.enrolled.some(
              (e) => (e._id || e.id || e).toString() === userId?.toString()
            );
            setIsEnrolled(enrolled);
          }
        }

        const unitsData = unitsRes.data.units || (Array.isArray(unitsRes.data) ? unitsRes.data : []);
        if (unitsData && unitsData.length > 0) {
          setUnits(unitsData);
          setExpandedUnits({ [unitsData[0]._id || unitsData[0].id]: true });
        }
      } catch (err) {
        setError("Failed to load course details. The course may not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
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
                  <span className="text-[var(--lms-text-secondary)] text-xs font-medium">{units.length} Units</span>
                </div>
                
                {units.length > 0 ? (
                  <div className="space-y-4">
                    {units.map((unit, index) => {
                      const isExpanded = expandedUnits[unit._id || unit.id];
                      return (
                        <div key={unit._id || unit.id} className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl overflow-hidden shadow-sm">
                          <div 
                            className="p-4 bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              const uId = unit._id || unit.id;
                              setExpandedUnits(prev => ({ ...prev, [uId]: !prev[uId] }));
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] flex items-center justify-center text-xs font-bold text-[var(--lms-text-primary)]">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-[var(--lms-text-primary)] text-sm">{unit.title}</h3>
                              </div>
                            </div>
                            <div className="text-[var(--lms-text-secondary)]">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                          
                          {isExpanded && (
                              <div className="p-4 bg-[var(--lms-bg)]">
                                {unit.lessons && unit.lessons.length > 0 ? (
                                  <div className="space-y-2">
                                    {unit.lessons.map((lesson) => (
                                      <div key={lesson._id || lesson.id} className="flex items-center justify-between p-3 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl group hover:border-[var(--lms-accent-border)] transition-colors">
                                        <div className="flex items-center gap-3">
                                          {lesson.contentType === 'video' ? (
                                            <PlayCircle size={16} className="text-indigo-500" />
                                          ) : lesson.contentType === 'pdf' ? (
                                            <FileText size={16} className="text-rose-500" />
                                          ) : (
                                            <FileText size={16} className="text-emerald-500" />
                                          )}
                                          <div>
                                            <h4 className="text-xs font-semibold text-[var(--lms-text-primary)]">{lesson.title}</h4>
                                            <div className="text-[10px] text-[var(--lms-text-muted)] mt-0.5 capitalize">{lesson.contentType} • {lesson.duration || 0} min</div>
                                          </div>
                                        </div>
                                        {(isEnrolled || user?.role === 'Admin' || (user?.role === 'Instructor' && (course.createdBy?._id === user?._id || course.createdBy?._id === user?.id || course.createdBy === user?._id || course.createdBy === user?.id))) ? (
                                          <button 
                                            onClick={() => handleSelectLesson(lesson)}
                                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                          >
                                            {lesson.contentType === 'video' ? <PlayCircle size={12} /> : <FileText size={12} />}
                                            {lesson.contentType === 'video' ? 'Watch' : 'View'}
                                          </button>
                                        ) : (
                                          <div className="text-[10px] text-gray-400 font-medium px-2"><Lock size={12} /></div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-[var(--lms-text-muted)] italic text-center py-2">No lessons in this unit yet.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-[var(--lms-border)] rounded-2xl overflow-hidden bg-[var(--lms-surface)] shadow-sm p-8 text-center">
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <LayoutGrid size={28} />
                      </div>
                      <h3 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">Curriculum is being prepared</h3>
                      <p className="text-xs text-[var(--lms-text-secondary)]">The instructor is currently working on the content for this course.</p>
                    </div>
                  )}
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

          {/* Sidebar */}
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
                  ) : (user?.role === 'Instructor' && (
                      course.createdBy?._id === user?._id || 
                      course.createdBy?._id === user?.id || 
                      course.createdBy === user?._id || 
                      course.createdBy === user?.id
                    )) || user?.role === 'Admin' ? (
                  <button
                    onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                    className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit Course
                  </button>
                ) : user?.role === 'Instructor' ? (
                  <button
                    className="w-full lms-btn lms-btn-primary py-3.5 text-base mb-3 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Instructor View Only
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

        {/* Content Viewing Modal */}
        {selectedLesson && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-8" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-[var(--lms-surface)] w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    {selectedLesson.contentType === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--lms-text-primary)]">{selectedLesson.title}</h3>
                    <span className="text-xs text-[var(--lms-text-secondary)] capitalize font-medium">{selectedLesson.contentType} Lesson</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="p-2 bg-[var(--lms-bg)] hover:bg-gray-200 text-[var(--lms-text-secondary)] rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {selectedLesson.description && (
                  <div className="mb-8">
                    <h4 className="font-bold text-sm text-[var(--lms-text-primary)] mb-3">Lesson Overview</h4>
                    <div className="prose prose-sm max-w-none text-[var(--lms-text-secondary)] whitespace-pre-wrap">
                      {selectedLesson.description}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[var(--lms-text-primary)] mb-2">Available Resources</h4>
                  
                  {selectedLesson.videoUrl && (
                    <a 
                      href={selectedLesson.videoUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                          <PlayCircle size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-indigo-900 group-hover:text-indigo-700">Watch Video Tutorial</div>
                          <div className="text-xs text-indigo-600/70">Opens in a new tab</div>
                        </div>
                      </div>
                      <Share2 size={16} className="text-indigo-400 group-hover:text-indigo-600" />
                    </a>
                  )}

                  {selectedLesson.pdfUrl && (
                    <a 
                      href={selectedLesson.pdfUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-rose-900 group-hover:text-rose-700">View PDF Document</div>
                          <div className="text-xs text-rose-600/70">Opens in a new tab</div>
                        </div>
                      </div>
                      <Share2 size={16} className="text-rose-400 group-hover:text-rose-600" />
                    </a>
                  )}

                  {selectedLesson.externalUrl && (
                    <a 
                      href={selectedLesson.externalUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Globe size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-blue-900 group-hover:text-blue-700">External Resource</div>
                          <div className="text-xs text-blue-600/70">Opens in a new tab</div>
                        </div>
                      </div>
                      <Share2 size={16} className="text-blue-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {!selectedLesson.videoUrl && !selectedLesson.pdfUrl && !selectedLesson.externalUrl && (
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <p className="text-sm text-gray-500 font-medium">No external links attached to this lesson.</p>
                    </div>
                  )}
                </div>

                {/* Supplementary Resources Section */}
                <div className="space-y-3 pt-4 border-t border-[var(--lms-border)]">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--lms-text-muted)]">
                    Supplementary Resources ({selectedLessonResources.length})
                  </h4>

                  {loadingLessonResources ? (
                    <div className="py-4 text-center">
                      <Loader size={18} className="animate-spin text-blue-500 mx-auto" />
                    </div>
                  ) : selectedLessonResources.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedLessonResources.map((res) => (
                        <a
                          key={res._id}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3.5 bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {getResourceIcon(res)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[var(--lms-text-primary)] group-hover:text-blue-500 truncate">
                                  {res.title}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-muted)]">
                                  {res.type}
                                </span>
                              </div>
                              {res.description && (
                                <p className="text-[11px] text-[var(--lms-text-muted)] truncate mt-0.5">
                                  {res.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Share2 size={14} className="text-[var(--lms-text-muted)] group-hover:text-blue-500 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--lms-surface-subtle)] border border-dashed border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-xs text-[var(--lms-text-muted)]">No supplementary resources attached to this lesson.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
