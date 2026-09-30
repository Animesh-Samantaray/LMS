import React, { useState, useEffect } from 'react';
import { Award, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('course');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/api/certificates/my-certificates');
        setCertificates(res.data);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        
        {/* Dark Green Header Banner */}
        <div className="bg-[var(--lms-accent)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          {/* Decorative faint medal icon in background */}
          <Award size={160} className="absolute -right-10 -bottom-10 text-white/20 opacity-10 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[var(--lms-surface)]/10 border border-white/20 flex items-center justify-center shrink-0">
              <Award size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">My Certificates</h1>
              <p className="text-emerald-100/80 text-sm mt-1">Your earned achievements and credentials.</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="px-4 py-2 rounded-xl bg-[var(--lms-surface)]/10 border border-white/20 flex items-center gap-2">
              <span className="text-amber-400">🏆</span>
              <span className="text-white font-bold text-sm">{certificates.length} Earned</span>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-8 border-b border-[var(--lms-border)]">
          <button 
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'exam' ? 'border-[var(--lms-accent)] text-[var(--lms-accent)]' : 'border-transparent text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]'}`}
            onClick={() => setActiveTab('exam')}
          >
            Exam Certificates
          </button>
          <button 
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'course' ? 'border-[var(--lms-accent)] text-[var(--lms-accent)]' : 'border-transparent text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]'}`}
            onClick={() => setActiveTab('course')}
          >
            Course Certificates
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--lms-accent)]"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-[var(--lms-accent)]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={48} className="text-[var(--lms-accent)]/20" />
            </div>
            <p className="text-lg font-bold text-[var(--lms-text-primary)]">No certificates earned yet</p>
            <p className="text-sm text-[var(--lms-text-muted)] mt-1">Complete courses and assessments to earn your first certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="bg-[var(--lms-surface)] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--lms-border)] flex flex-col transition-transform hover:-translate-y-1 duration-300">
                
                {/* Top Half - Dark Green Background */}
                <div className="bg-[var(--lms-accent)] h-36 relative flex items-center justify-center p-4">
                  {/* Golden Medal */}
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Award size={32} className="text-amber-400 fill-amber-400/20" />
                  </div>
                  {/* Certificate ID Watermark */}
                  <div className="absolute bottom-3 right-4 text-[10px] font-mono text-white/200 tracking-widest">
                    {cert.certificateId.split('-').pop()}
                  </div>
                </div>

                {/* Bottom Half - White Background */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-[var(--lms-text-primary)] text-sm mb-3 line-clamp-2 leading-snug">
                    {cert.courseName}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--lms-accent)]/70 mt-auto mb-5">
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      {new Date(cert.completionDate).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <span>📊</span>
                      100%
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/student/certificates/view/${cert.certificateId}`)}
                    className="w-full bg-[var(--lms-accent)] hover:brightness-90 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Eye size={14} /> View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCertificates;
