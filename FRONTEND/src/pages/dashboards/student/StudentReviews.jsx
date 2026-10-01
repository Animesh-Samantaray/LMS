import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Star, MessageSquare, BookOpen, Clock, Award, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api.service';

const StudentReviews = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesAndReviews = async () => {
      try {
        setLoading(true);
        // Fetch enrolled courses
        const res = await api.get('/api/courses/enrolled/my');
        if (res.data.success) {
          // In a real app we might also fetch existing reviews to cross-reference
          setCourses(res.data.courses || res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses for review", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesAndReviews();
  }, []);

  return (
    <DashboardLayout roleTitle="STUDENT PORTAL" pageTitle="My Reviews">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header section */}
        <div className="bg-[var(--lms-accent)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <Star size={160} className="absolute -right-10 -bottom-10 text-white/20 opacity-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Star size={28} className="text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Course Reviews</h1>
                <p className="text-white/80 text-sm mt-1 max-w-xl">
                  Your feedback helps instructors improve their content and helps other students make informed decisions.
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-col items-center justify-center text-white min-w-[150px]">
              <div className="text-2xl font-black text-amber-400">{courses.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">Eligible Courses</div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)] flex items-center gap-2 px-1">
            <BookOpen size={20} className="text-indigo-500" />
            Courses Available for Review
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[250px] rounded-3xl bg-[var(--lms-surface)] animate-pulse border border-[var(--lms-border)]"></div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl p-12 flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[var(--lms-bg)] flex items-center justify-center text-[var(--lms-text-muted)] mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--lms-text-primary)]">No Enrolled Courses</h3>
              <p className="text-[var(--lms-text-secondary)] mt-2 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Once you enroll and make progress, you can leave professional reviews here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course._id} className="group bg-[var(--lms-surface)] rounded-3xl border border-[var(--lms-border)] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
                  
                  {/* Course Thumbnail */}
                  <div className="relative h-40 w-full overflow-hidden bg-[var(--lms-bg)]">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Course' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-white text-xs font-bold px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
                        {course.category?.name || 'Course'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-[var(--lms-text-primary)] text-lg line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4 text-xs text-[var(--lms-text-secondary)] font-medium">
                      <span className="flex items-center gap-1"><Clock size={14} /> Enrolled</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[var(--lms-border)]">
                      {/* In a real scenario, we would check if a review already exists. For now, we just link to the course learn page where reviews can be posted */}
                      <a 
                        href={`/student/courses/${course._id}/learn?tab=reviews`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        <MessageSquare size={16} /> Write Professional Review
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentReviews;
