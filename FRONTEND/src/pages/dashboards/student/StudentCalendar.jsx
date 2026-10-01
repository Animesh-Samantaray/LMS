import React, { useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, Target, Award } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const StudentCalendar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  // Mock events for UI purposes (could be fetched from backend later)
  const getEventsForDay = (day) => {
    const events = [];
    // Just some random predictable demo events based on day number
    if (day === 5) events.push({ title: 'Course Deadline', type: 'deadline', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' });
    if (day === 12) events.push({ title: 'Live Session', type: 'live', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' });
    if (day === 18) events.push({ title: 'Quiz Due', type: 'quiz', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' });
    if (day === 25) events.push({ title: 'Assignment', type: 'assignment', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' });
    
    // Add today event if it's today
    if (isToday(day)) {
      events.push({ title: 'Today', type: 'today', color: 'bg-[var(--lms-accent)]/10 text-[var(--lms-accent)] border-[var(--lms-accent)]/30' });
    }
    
    return events;
  };

  return (
    <DashboardLayout roleTitle="STUDENT PORTAL" pageTitle="Calendar">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Header section */}
        <div className="bg-[var(--lms-accent)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <CalendarIcon size={160} className="absolute -right-10 -bottom-10 text-white/20 opacity-10 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <CalendarIcon size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">My Schedule</h1>
              <p className="text-white/80 text-sm mt-1">Keep track of your classes, deadlines, and quizzes.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-sm relative z-10 w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="font-bold text-white min-w-[140px] text-center text-lg">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button 
              onClick={handleToday}
              className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[var(--lms-surface)] rounded-3xl border border-[var(--lms-border)] shadow-sm overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-[var(--lms-border)] bg-[var(--lms-bg)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center font-bold text-[var(--lms-text-secondary)] text-sm uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {/* Empty cells for start of month */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r border-[var(--lms-border)] bg-[var(--lms-bg)]/50"></div>
            ))}
            
            {/* Days of month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const today = isToday(day);
              const events = getEventsForDay(day);
              
              return (
                <div 
                  key={day} 
                  className={`min-h-[120px] p-2 sm:p-3 border-b border-r border-[var(--lms-border)] hover:bg-[var(--lms-bg)] transition-colors group relative ${
                    today ? 'bg-[var(--lms-accent)]/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                      today 
                        ? 'bg-[var(--lms-accent)] text-white shadow-md shadow-[var(--lms-accent)]/20' 
                        : 'text-[var(--lms-text-primary)] group-hover:bg-[var(--lms-surface-hover)]'
                    }`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1.5">
                    {events.map((event, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:py-1.5 rounded-md border truncate ${event.color}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Empty cells for end of month */}
            {[...Array((7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7)].map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[120px] p-2 border-b border-r border-[var(--lms-border)] bg-[var(--lms-bg)]/50"></div>
            ))}
          </div>
          
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentCalendar;
