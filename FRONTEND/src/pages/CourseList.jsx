import React, { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle, BookOpen, Filter, X } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import api from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        const list = res.data.categories || res.data || [];
        setCategories(list);
      } catch (err) {
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      try {
        setLoading(true);
        const [courseRes, enrolledRes] = await Promise.all([
          api.get('/api/courses'),
          user?.role === 'Student' ? api.get('/api/courses/enrolled/my').catch(() => null) : null
        ]);
        
        const courseList = courseRes.data.courses || courseRes.data || [];
        setCourses(courseList);

        const ids = new Set();
        if (user) {
          const userId = (user._id || user.id)?.toString();
          courseList.forEach((c) => {
            if (c.enrolled && Array.isArray(c.enrolled)) {
              if (c.enrolled.some((e) => (e._id || e.id || e)?.toString() === userId)) {
                ids.add(c._id || c.id);
              }
            }
          });
        }

        if (enrolledRes?.data?.courses) {
          enrolledRes.data.courses.forEach((c) => ids.add(c._id || c.id));
        }

        setEnrolledIds(ids);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesAndEnrollments();
  }, [user]);

  const filteredCourses = courses.filter(c => {
    const categoryName = typeof c.category === 'object' && c.category !== null
      ? (c.category.name || '')
      : (c.category || '');

    const matchesCategory = selectedCategory === 'All' || categoryName.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || (
      (c.title && c.title.toLowerCase().includes(query)) ||
      categoryName.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'title-desc') {
      return (b.title || '').localeCompare(a.title || '');
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'All' || sortBy !== 'newest';

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight">
            Explore Top-Rated Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-xl mx-auto">
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
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl text-xs sm:text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--lms-text-secondary)]">
            <Filter size={15} />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--lms-text-secondary)] ml-2">
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      <div>
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
            <p className="text-xs text-[var(--lms-text-secondary)] mb-4">No courses currently match your search and filter criteria. Try adjusting your query.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="lms-btn lms-btn-secondary text-xs">Clear Filters</button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">Available Courses</h2>
                <p className="text-xs text-[var(--lms-text-secondary)]">Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id || course.id}
                  course={course}
                  isManagement={false}
                  isEnrolled={enrolledIds.has(course._id || course.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (user) {
    return (
      <DashboardLayout pageTitle="All Courses">
        {renderContent()}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] text-[var(--lms-text-primary)] flex flex-col pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
};

export default CourseList;