import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/DashboardLayout';
import studentService from '../../../services/student.service';
import api from '../../../services/api.service';
import CourseCard from '../../../components/CourseCard';

const StudentMyCourses = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sidebarItems = [
    { label: 'Overview', path: '/student/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'All Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/student/courses/my', icon: GraduationCap },
    { label: 'Mock Test', path: '#', icon: '📄' },
    { label: 'Practice Arena', path: '#', icon: '🎯' },
    { label: 'Exams', path: '#', icon: '📝' },
    { label: 'Weekly Contests', path: '#', icon: '🏆' },
    { label: 'Certificates', path: '#', icon: '🎖️' },
    { category: 'Engagement' },
    { label: 'My Groups', path: '#', icon: '👥' },
    { label: 'My Reviews', path: '#', icon: '⭐' },
    { label: 'Messages', path: '#', icon: '💬' },
    { label: 'Calendar', path: '#', icon: '📅' },
    { category: 'Account' },
    { label: 'Settings', path: '/student/profile', icon: User }
  ];

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/courses/enrolled/my');
        const courses = res.data.courses || res.data || [];
        setEnrolledCourses(courses);
        setError('');
      } catch (err) {
        try {
          const data = await studentService.getStudentProfile();
          const profile = data?.profile || data?.data || data;
          const courses = profile?.courses || profile?.enrolledCourses || profile?.enrolled || [];
          setEnrolledCourses(courses);
        } catch (innerErr) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch enrolled courses');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, []);

  return (
    <DashboardLayout roleTitle="STUDENT">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">My Enrolled Courses</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Access and resume all your enrolled learning tracks.</p>
          </div>
          <Link
            to="/courses"
            className="lms-btn lms-btn-primary flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <BookOpen size={18} /> Browse All Courses
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
              <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading your enrolled courses...</p>
            </div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-20 lms-glass-card rounded-2xl border border-[var(--lms-border)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-1">No Enrolled Courses Yet</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse our catalog of interactive courses to start learning.
            </p>
            <Link to="/courses" className="lms-btn lms-btn-primary inline-flex items-center gap-2 text-xs">
              <BookOpen size={16} /> Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, idx) => (
              <CourseCard key={course._id || course.id || idx} course={course} isManagement={false} isEnrolled={true} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMyCourses;
