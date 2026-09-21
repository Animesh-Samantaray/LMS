import React, { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle, BookOpen } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import api from '../services/api.service';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/courses');
        setCourses(res.data.courses || res.data || []);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => {
    const categoryName = typeof c.category === 'object' && c.category !== null
      ? c.category.name
      : c.category || '';
    return (
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] text-[var(--lms-text-primary)] flex flex-col pt-16">
      <Navbar />
      
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white py-16 lg:py-20 relative overflow-hidden border-b border-white/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              Explore Top-Rated Courses
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-xl mx-auto">
              Learn in-demand skills from industry experts. Advance your career with our project-based curriculum.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search by course title, category, or topic..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--lms-text-secondary)] font-medium text-sm">Loading catalog courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 max-w-md mx-auto lms-glass-card rounded-2xl p-8 border border-rose-500/20">
            <div className="w-14 h-14 bg-rose-500/15 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-3">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-lg font-bold text-[var(--lms-text-primary)] mb-1">Unable to load courses</h2>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="lms-btn lms-btn-primary text-xs">Try Again</button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto lms-glass-card rounded-2xl border border-[var(--lms-border)] p-8">
            <div className="w-16 h-16 bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <BookOpen size={28} />
            </div>
            <h2 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">No courses found</h2>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-4">No courses currently match your search criteria. Try adjusting your query.</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="lms-btn lms-btn-secondary text-xs">Clear Search</button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">Available Courses</h2>
                <p className="text-xs text-[var(--lms-text-secondary)]">Showing {filteredCourses.length} published learning paths</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id || course.id}
                  course={course}
                  isManagement={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CourseList;

