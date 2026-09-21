import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Star, Search, Loader, Clock, User, Heart, ChevronRight, LayoutGrid } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import api from '../services/api.service';

const CourseList = () => {
  const navigate = useNavigate();
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

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Expand Your Horizons with Expert-Led Courses
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl">
              Join thousands of learners discovering new skills and transforming their careers. Browse our catalog of meticulously crafted courses.
            </p>
            
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search for topics, skills, or specific courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 flex-1">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-[var(--lms-text-secondary)] font-medium text-lg">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-2">Oops! Something went wrong</h2>
            <p className="text-[var(--lms-text-secondary)]">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 max-w-lg mx-auto bg-[var(--lms-surface)] rounded-2xl border border-[var(--lms-border)]">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-4">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-2">No courses found</h2>
            <p className="text-[var(--lms-text-secondary)] mb-6">We couldn't find any courses matching your search criteria. Try adjusting your keywords.</p>
            <button onClick={() => setSearchTerm('')} className="lms-btn lms-btn-primary">Clear Search</button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[var(--lms-text-primary)]">All Courses ({filteredCourses.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, i) => (
                <div 
                  key={course._id} 
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="bg-[var(--lms-surface)] rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[var(--lms-border)] hover:-translate-y-1 transition-transform cursor-pointer group flex flex-col"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <LayoutGrid size={48} className="text-blue-200" />
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                        <Heart size={16} />
                      </div>
                    </div>
                    {course.category?.name && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-bold px-2.5 py-1 rounded-md text-blue-700 shadow-sm">
                        {course.category.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-[var(--lms-text-primary)] leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-sm text-[var(--lms-text-secondary)] line-clamp-2 mb-4 flex-1">
                      {course.description || "Learn the fundamentals and advanced concepts in this comprehensive course."}
                    </p>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                      <span className="text-sm text-[var(--lms-text-primary)] font-semibold ml-1">5.0</span>
                      <span className="text-xs text-[var(--lms-text-muted)] ml-1">(124)</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--lms-border)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                          {course.instructor?.name ? course.instructor.name.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <span className="text-xs font-medium text-[var(--lms-text-secondary)] truncate max-w-[100px]">
                          {course.instructor?.name || 'Instructor'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                        View <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
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
