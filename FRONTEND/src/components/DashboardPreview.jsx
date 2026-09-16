import React from 'react';
import { BookOpen, CheckCircle, TrendingUp, Clock, Award, Users, ArrowUpRight, Play, FileText } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <div className="glass-card dashboard-preview-card">
      <div className="dashboard-stats-grid">
        <div className="stat-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a5b4fc', marginBottom: '0.4rem' }}>
            <span className="stat-label">Enrolled Courses</span>
            <BookOpen size={18} />
          </div>
          <div className="stat-value">8 Active</div>
          <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>↑ 2 completed this month</span>
        </div>

        <div className="stat-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c084fc', marginBottom: '0.4rem' }}>
            <span className="stat-label">Avg Quiz Score</span>
            <CheckCircle size={18} />
          </div>
          <div className="stat-value">94.8%</div>
          <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>Top 5% class percentile</span>
        </div>

        <div className="stat-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8', marginBottom: '0.4rem' }}>
            <span className="stat-label">Hours Learned</span>
            <Clock size={18} />
          </div>
          <div className="stat-value">142 hrs</div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>14 hrs logged this week</span>
        </div>

        <div className="stat-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f472b6', marginBottom: '0.4rem' }}>
            <span className="stat-label">Certificates</span>
            <Award size={18} />
          </div>
          <div className="stat-value">4 Verified</div>
          <span style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>Shareable on LinkedIn</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>In-Progress Courses</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-indigo)', cursor: 'pointer' }}>View All</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Full Stack Web Development (React & Node)</h5>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Instructor: Dr. Alex Rivera • 24 Modules</span>
                  </div>
                </div>
                <span className="badge badge-indigo">78% Done</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'var(--gradient-brand)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168,85,247,0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Applied Data Science & Machine Learning</h5>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Instructor: Prof. Elena Rostova • 18 Modules</span>
                  </div>
                </div>
                <span className="badge badge-purple">92% Done</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Quiz Performance</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>React Hooks & Context API</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yesterday at 4:30 PM</span>
              </div>
              <span style={{ fontWeight: 800, color: '#6ee7b7', fontSize: '1rem' }}>98/100</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>SQL Optimization Quiz</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Oct 12, 2026</span>
              </div>
              <span style={{ fontWeight: 800, color: '#6ee7b7', fontSize: '1rem' }}>92/100</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Neural Networks Assessment</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Oct 08, 2026</span>
              </div>
              <span style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '1rem' }}>95/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
