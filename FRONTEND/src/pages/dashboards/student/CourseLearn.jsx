import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, FileText, Download, CheckCircle2, Circle, ArrowLeft, Star, Clock, Globe, HelpCircle, User, MessageSquare, ChevronDown, ChevronRight, ArrowRight, Award, Calendar } from 'lucide-react';
import api from '../../../services/api.service';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/DashboardLayout';

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedUnits, setExpandedUnits] = useState({});
  const [lessonResources, setLessonResources] = useState({});
  
  // Progress calculations
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Derived dynamic data
  const [upNextLessons, setUpNextLessons] = useState([]);
  const [allResources, setAllResources] = useState([]);

  // Q&A States
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    // Calculate stats whenever units or progress change
    let total = 0;
    units.forEach(u => { total += u.lessons?.length || 0; });
    setTotalLessons(total);
    
    const completed = progress.completedLessons?.length || 0;
    setCompletedCount(completed);
    
    setCompletionPercentage(total === 0 ? 0 : Math.round((completed / total) * 100));

    // Determine "Up Next" lessons
    const upcoming = [];
    for (const unit of units) {
      for (const lesson of unit.lessons || []) {
        if (!progress.completedLessons?.includes(lesson._id)) {
          upcoming.push({ lesson, unit });
        }
      }
    }
    
    // If all completed, just use the last lesson
    if (upcoming.length === 0 && units.length > 0) {
      const lastUnit = units[units.length - 1];
      if (lastUnit.lessons && lastUnit.lessons.length > 0) {
        const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
        upcoming.push({ lesson: lastLesson, unit: lastUnit });
      }
    }
    
    setUpNextLessons(upcoming);

  }, [units, progress]);

  useEffect(() => {
    // Flatten resources
    const flattened = [];
    Object.values(lessonResources).forEach(resourcesArr => {
      if (Array.isArray(resourcesArr)) {
        flattened.push(...resourcesArr);
      }
    });
    setAllResources(flattened);
  }, [lessonResources]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch Course
      const courseRes = await api.get(`/api/courses/${id}`);
      setCourse(courseRes.data.course || courseRes.data);
      
      // Fetch Units
      const unitsRes = await api.get(`/api/courses/${id}/units`);
      let unitsData = unitsRes.data.units || (Array.isArray(unitsRes.data) ? unitsRes.data : []);
      
      // Ensure lessons array exists and sort
      unitsData = unitsData.map(u => ({
        ...u,
        lessons: (u.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setUnits(unitsData);

      // Initialize all units as expanded
      const expandMap = {};
      unitsData.forEach(u => { expandMap[u._id] = true; });
      setExpandedUnits(expandMap);
      
      // Fetch Resources for all lessons
      const resourcesMap = {};
      for (const unit of unitsData) {
        for (const lesson of unit.lessons) {
          try {
            const res = await api.get(`/api/resources/lesson/${lesson._id}`);
            resourcesMap[lesson._id] = res.data.resources || (Array.isArray(res.data) ? res.data : []);
          } catch(e) {}
        }
      }
      setLessonResources(resourcesMap);

      // Fetch Progress
      try {
        const progRes = await api.get(`/api/courses/${id}/progress`);
        if (progRes.data && progRes.data.progress) {
          setProgress({
            ...progRes.data.progress,
            completedLessons: progRes.data.progress.completedLessonIds || []
          });
          
          if (progRes.data.units) {
            setUnits(prevUnits => {
              return prevUnits.map(u => {
                const pUnit = progRes.data.units.find(pu => pu._id === u._id);
                return pUnit ? { ...u, unlocked: pUnit.unlocked, completed: pUnit.completed } : u;
              });
            });
          }
        }
      } catch (err) {
        console.error("Progress fetch error", err);
      }
      
    } catch (error) {
      console.error("Error fetching learning data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId, e) => {
    if (e) e.stopPropagation();
    
    // Prevent double completion on UI side
    if (progress.completedLessons?.includes(lessonId)) return;
    
    try {
      const res = await api.post(`/api/courses/${id}/lessons/${lessonId}/complete`);
      
      if (res.data.success) {
        // Sync full state with backend
        const progRes = await api.get(`/api/courses/${id}/progress`);
        if (progRes.data && progRes.data.progress) {
          setProgress({
            ...progRes.data.progress,
            completedLessons: progRes.data.progress.completedLessonIds || []
          });
          
          if (progRes.data.units) {
            setUnits(prevUnits => {
              return prevUnits.map(u => {
                const pUnit = progRes.data.units.find(pu => pu._id === u._id);
                return pUnit ? { ...u, unlocked: pUnit.unlocked, completed: pUnit.completed } : u;
              });
            });
          }
        }
      }
    } catch (err) {
      console.error("Error completing lesson:", err);
      // Optional: Add toast error here if available in the app.
    }
  };

  const handleResourceClick = (url, e) => {
    if (e) e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLessonAction = (lesson, unit, e) => {
    if (e) e.stopPropagation();
    if (unit && unit.unlocked === false) return; // Prevent action on locked unit
    
    if (lesson.contentType === 'Video' && lesson.videoUrl) {
      window.open(lesson.videoUrl, '_blank', 'noopener,noreferrer');
    } else if (lesson.contentType === 'PDF' && lesson.pdfUrl) {
      window.open(lesson.pdfUrl, '_blank', 'noopener,noreferrer');
    } else if (lesson.contentType === 'External Link' && lesson.externalUrl) {
      window.open(lesson.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleCompleteLesson(lesson._id, e);
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="p-8 text-center text-rose-500">Course not found.</div>;
  }

  let totalMinutes = 0;
  units.forEach(u => {
    u.lessons.forEach(l => {
      totalMinutes += Number(l.duration || 0);
    });
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalDurationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'curriculum', label: 'Curriculum', icon: PlayCircle },
    { id: 'resources', label: 'Resources', icon: Download },
    { id: 'qa', label: 'Q&A', icon: HelpCircle },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'instructor', label: 'Instructor', icon: User },
  ];

  return (
    <DashboardLayout pageTitle="Learning Mode">
      <div className="bg-transparent px-2 sm:px-6 pb-4 flex items-center -mt-2">
        <button 
          onClick={() => navigate('/student/courses/my')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Learning
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row gap-8 shadow-sm border border-slate-200">
            <div className="w-full md:w-[320px] shrink-0 rounded-2xl overflow-hidden bg-slate-900 aspect-video relative">
              <img 
                src={course.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"} 
                alt={course.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 text-[10px] font-bold text-white tracking-wider">
                <span>LEARN</span> • <span>PRACTICE</span> • <span>BUILD</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider w-max mb-3">
                {course.category?.name || course.category || "PROGRAMMING"}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                {course.title}
              </h1>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed line-clamp-2">
                {course.description || "Unlock your potential and become a confident developer with step-by-step guidance, hands-on projects, coding exercises and real-world applications."}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star size={14} className="fill-current" />
                  <span className="text-slate-800 font-bold">5.0</span>
                  <span className="font-normal">(1,234 ratings)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden">
                    {course.createdBy?.profileImage ? (
                      <img src={course.createdBy.profileImage} className="w-full h-full object-cover" />
                    ) : (
                      <User size={12} />
                    )}
                  </div>
                  <span className="text-blue-600">{course.createdBy?.name || "Instructor"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Last updated 21 Sep 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} />
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Course Curriculum</h2>
                  <p className="text-sm font-semibold text-slate-500">
                    {units.length} Units • {totalLessons} Lessons • {totalDurationStr} total duration
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const allExpanded = Object.values(expandedUnits).every(v => v);
                    const newMap = {};
                    units.forEach(u => newMap[u._id] = !allExpanded);
                    setExpandedUnits(newMap);
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  Expand All <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {units.map((unit, unitIdx) => {
                  const isExpanded = expandedUnits[unit._id];
                  const unitLessons = unit.lessons || [];
                  const unitTotalLessons = unitLessons.length;
                  const unitCompletedLessons = unitLessons.filter(l => progress.completedLessons?.includes(l._id)).length;
                  const unitProgressPct = unitTotalLessons === 0 ? 0 : Math.round((unitCompletedLessons / unitTotalLessons) * 100);
                  
                  let unitMinutes = 0;
                  unitLessons.forEach(l => unitMinutes += Number(l.duration || 0));
                  const uH = Math.floor(unitMinutes / 60);
                  const uM = unitMinutes % 60;
                  const unitDurStr = uH > 0 ? `${uH}h ${uM}m` : `${uM}m`;

                  return (
                    <div key={unit._id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                      <div 
                        onClick={() => toggleUnit(unit._id)}
                        className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-extrabold text-base flex items-center justify-center shrink-0">
                            {unitIdx + 1}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">{unit.title}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{unit.description || "Course unit section"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-600">{unitTotalLessons} Lessons • {unitDurStr}</p>
                            <div className="flex items-center gap-2 mt-1.5 justify-end">
                              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${unitProgressPct}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-700 w-6 text-right">{unitProgressPct}%</span>
                            </div>
                          </div>
                          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-slate-50/50 border-t border-slate-100 p-2 sm:p-4 space-y-1">
                          {unitLessons.map((lesson, lessonIdx) => {
                            const isCompleted = progress.completedLessons?.includes(lesson._id);
                            const resCount = (lessonResources[lesson._id] || []).length;
                            const isLocked = unit.unlocked === false;
                            
                            return (
                              <div 
                                key={lesson._id}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all group border border-transparent ${isLocked ? 'opacity-60' : 'hover:bg-white hover:shadow-sm hover:border-slate-200'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`${isLocked ? 'text-slate-400' : 'text-rose-500'}`}>
                                    {lesson.contentType === 'Video' ? <PlayCircle size={18} /> : <FileText size={18} />}
                                  </div>
                                  <span className="text-xs font-bold text-slate-400 w-6">{unitIdx + 1}.{lessonIdx + 1}</span>
                                  <span className={`text-sm font-semibold transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-700 group-hover:text-blue-600'}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <Clock size={14} />
                                    <span>{lesson.duration || 0}:00</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 w-24">
                                    <FileText size={14} />
                                    <span>{resCount} resource{resCount !== 1 ? 's' : ''}</span>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => handleLessonAction(lesson, unit, e)}
                                    disabled={isLocked}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-28 text-center ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                                  >
                                    {isLocked ? "Locked" : isCompleted ? "Watch Again" : lesson.contentType === 'Video' ? "Watch" : "Read"}
                                  </button>

                                  {isLocked ? (
                                    <div className="p-1"><Circle size={20} className="text-slate-200" /></div>
                                  ) : (
                                    <button 
                                      onClick={(e) => handleCompleteLesson(lesson._id, e)}
                                      disabled={isCompleted}
                                      className={`p-1 rounded-full transition-colors ${isCompleted ? 'cursor-default' : 'hover:bg-slate-200'}`}
                                      title={isCompleted ? "Completed" : "Mark as completed"}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50" />
                                      ) : (
                                        <Circle size={20} className="text-slate-300" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Course Overview</h2>
              <div className="prose max-w-none text-slate-600 leading-relaxed space-y-6">
                <p>{course.description || "Unlock your potential and become a confident developer with step-by-step guidance, hands-on projects, coding exercises and real-world applications."}</p>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Build real-world projects', 'Master advanced concepts', 'Follow industry best practices', 'Prepare for technical interviews'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">All Course Resources</h2>
              {allResources.length === 0 ? (
                <div className="text-center py-12">
                  <Download size={48} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No resources yet</h3>
                  <p className="text-slate-500 text-sm">The instructor hasn't uploaded any downloadable files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allResources.map((res, i) => (
                    <div 
                      key={res._id || i}
                      onClick={(e) => handleResourceClick(res.fileUrl || res.externalUrl, e)}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{res.title}</h4>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">{res.resourceType}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Questions & Answers</h2>
                <button 
                  onClick={() => setShowQuestionModal(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-slate-900/20"
                >
                  Ask a Question
                </button>
              </div>
              
              <div className="text-center py-12">
                <MessageSquare size={48} className="text-slate-200 mx-auto mb-4" />
                {questionSubmitted ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Question Submitted!</h3>
                    <p className="text-slate-500 text-sm">Your question has been sent to the instructor. They will respond shortly.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No questions yet</h3>
                    <p className="text-slate-500 text-sm">Be the first to ask a question in this course!</p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Student Reviews</h2>
              
              <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100">
                <div className="text-center shrink-0">
                  <div className="text-5xl font-black text-slate-900 mb-2">5.0</div>
                  <div className="flex text-amber-400 justify-center mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-current" />)}
                  </div>
                  <div className="text-xs font-bold text-slate-500">Course Rating</div>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(stars => (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="w-12 flex items-center gap-1 text-sm font-bold text-slate-600">
                        {stars} <Star size={12} className="text-slate-400" />
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: stars === 5 ? '95%' : stars === 4 ? '5%' : '0%' }}></div>
                      </div>
                      <div className="w-10 text-xs font-bold text-slate-400 text-right">
                        {stars === 5 ? '95%' : stars === 4 ? '5%' : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { name: "Alex Johnson", time: "2 weeks ago", text: "This course completely changed my perspective. The hands-on projects were incredible and the instructor explained complex topics perfectly." },
                  { name: "Samantha Lee", time: "1 month ago", text: "Very clear and concise. I've taken other bootcamps before but this one actually made the concepts click for me." }
                ].map((review, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 uppercase">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">{review.name}</h4>
                        <span className="text-xs font-semibold text-slate-400">{review.time}</span>
                      </div>
                      <div className="flex text-amber-400 mb-2">
                        {[1,2,3,4,5].map(j => <Star key={j} size={12} className="fill-current" />)}
                      </div>
                      <p className="text-sm font-medium text-slate-600">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8">About the Instructor</h2>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-slate-50 bg-slate-100">
                  {course.createdBy?.profileImage ? (
                    <img src={course.createdBy.profileImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300 uppercase">
                      {(course.createdBy?.name || "I").charAt(0)}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{course.createdBy?.name || "Instructor"}</h3>
                  <p className="text-sm font-bold text-blue-600 mb-4">{course.category?.name || course.category || "Senior Developer & Educator"}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                      <Star size={16} className="text-amber-500 fill-current" />
                      4.8 Instructor Rating
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                      <User size={16} className="text-slate-400" />
                      10,000+ Students
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                      <PlayCircle size={16} className="text-slate-400" />
                      5 Courses
                    </div>
                  </div>
                  
                  <div className="prose text-slate-600 text-sm leading-relaxed">
                    <p>An experienced software engineer and passionate educator dedicated to helping students bridge the gap between theory and practical application. With years of industry experience building enterprise applications, the focus is always on real-world skills that employers are actually looking for.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Your Progress</h3>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="50" cy="50" r="42" fill="transparent" 
                    stroke="#10b981" strokeWidth="12" 
                    strokeLinecap="round"
                    strokeDasharray="263.89" 
                    strokeDashoffset={263.89 - (263.89 * completionPercentage) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{completionPercentage}%</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Completed</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700">{completedCount} of {totalLessons} lessons completed</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock size={14} />
                  <span>{totalDurationStr} remaining</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (upNextLessons.length > 0) handleLessonAction(upNextLessons[0].lesson, upNextLessons[0].unit);
              }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <PlayCircle size={18} /> Continue Learning
            </button>
          </div>

          {upNextLessons.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-500 mb-4">Up next</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 flex-1">
                {upNextLessons.map((item, idx) => {
                  const isLocked = item.unit.unlocked === false;
                  return (
                    <div 
                      key={item.lesson._id || idx}
                      onClick={(e) => handleLessonAction(item.lesson, item.unit, e)}
                      className={`flex gap-4 items-center group transition-colors p-2 rounded-xl border border-transparent ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-200 hover:bg-blue-50/50'}`}
                    >
                      <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden relative shrink-0">
                        <img src={course.thumbnail} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isLocked ? (
                            <Circle size={20} className="text-white opacity-60" />
                          ) : (
                            <PlayCircle size={20} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 mb-0.5 truncate">{item.unit.title || "Unit"}</p>
                        <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{item.lesson.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                          <Clock size={10} /> {item.lesson.duration || 0}:00
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Course Resources</h3>
              <span className="text-xs font-bold text-slate-500">{allResources.length} files</span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 flex-1">
              {allResources.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No additional resources available.</p>
              ) : (
                allResources.map((res, i) => (
                  <div 
                    key={res._id || i}
                    onClick={(e) => handleResourceClick(res.fileUrl || res.externalUrl, e)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{res.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{res.resourceType}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Certification</h3>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Award size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 mb-3">
                  Complete all lessons and quizzes to unlock your certificate.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowQuestionModal(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ask a Question</h2>
            <p className="text-sm font-semibold text-slate-500 mb-6">Your question will be sent directly to the instructor.</p>
            
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="E.g., Can you explain more about how this specific concept applies to real-world scenarios?"
              className="w-full h-32 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all mb-6"
            ></textarea>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowQuestionModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setQuestionSubmitted(true);
                  setShowQuestionModal(false);
                  setQuestionText('');
                }}
                disabled={!questionText.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
              >
                Submit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CourseLearn;
