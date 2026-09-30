import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle, Download, FileText, Loader } from 'lucide-react';
import axios from 'axios';

const CourseCertificateTab = ({ courseId }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:5000/api/certificates/eligibility/${courseId}`, {
        withCredentials: true,
      });
      setEligibility(res.data);
    } catch (err) {
      setError('Failed to load certificate information.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, [courseId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMsg(null);
      const res = await axios.post(`http://localhost:5000/api/certificates/generate`, { courseId }, {
        withCredentials: true,
      });
      setSuccessMsg('Certificate generated successfully!');
      fetchEligibility(); // reload status
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate certificate.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <Loader size={32} className="animate-spin text-[var(--lms-accent)] mb-3" />
        <p className="text-sm text-[var(--lms-text-muted)]">Checking certificate eligibility...</p>
      </div>
    );
  }

  if (error && !eligibility) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl">
        {error}
      </div>
    );
  }

  if (!eligibility) return null;

  const {
    eligible,
    learningCompletion,
    assignmentAverage,
    quizAverage,
    overallAssessmentAverage,
    certificateGenerated,
    certificate
  } = eligibility;

  return (
    <div className="space-y-6">
      <div className="lms-glass-card rounded-2xl p-6 border border-[var(--lms-border)] shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--lms-border)]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Course Certificate</h2>
            <p className="text-sm text-[var(--lms-text-muted)]">Track your progress toward earning your certificate</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl mb-6 text-sm font-medium">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[var(--lms-surface-subtle)] p-5 rounded-2xl border border-[var(--lms-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--lms-text-primary)]">Learning Completion</span>
              <span className={`text-sm font-bold ${learningCompletion >= 100 ? 'text-emerald-500' : 'text-[var(--lms-text-muted)]'}`}>
                {learningCompletion}%
              </span>
            </div>
            <div className="w-full bg-[var(--lms-border)] rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${learningCompletion >= 100 ? 'bg-emerald-500' : 'bg-[var(--lms-accent)]'}`} 
                style={{ width: `${Math.min(100, learningCompletion)}%` }}
              ></div>
            </div>
            <p className="text-xs text-[var(--lms-text-secondary)] mt-2">Required: 100% completion of course lessons</p>
          </div>

          <div className="bg-[var(--lms-surface-subtle)] p-5 rounded-2xl border border-[var(--lms-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--lms-text-primary)]">Assessment Average</span>
              <span className={`text-sm font-bold ${overallAssessmentAverage >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {overallAssessmentAverage}%
              </span>
            </div>
            <div className="w-full bg-[var(--lms-border)] rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${overallAssessmentAverage >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, overallAssessmentAverage)}%` }}
              ></div>
            </div>
            <p className="text-xs text-[var(--lms-text-secondary)] mt-2">Required: Minimum 50% combined assignment & quiz average</p>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] text-[var(--lms-text-muted)]">Assignments: {assignmentAverage}%</span>
              <span className="text-[10px] text-[var(--lms-text-muted)]">Quizzes: {quizAverage}%</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--lms-border)] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left bg-[var(--lms-surface)]">
          {certificateGenerated && certificate ? (
            <>
              <div>
                <h3 className="font-bold text-emerald-500 flex items-center justify-center md:justify-start gap-2 text-lg mb-1">
                  <CheckCircle size={20} /> Certificate Generated
                </h3>
                <p className="text-sm text-[var(--lms-text-secondary)]">Your certificate has been generated and emailed to you.</p>
                <div className="text-xs text-[var(--lms-text-muted)] mt-1 font-mono">ID: {certificate.certificateId}</div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <a
                  href={`http://localhost:5000${certificate.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none lms-btn lms-btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> View Certificate
                </a>
                <a
                  href={`http://localhost:5000${certificate.pdfUrl}`}
                  download
                  className="flex-1 md:flex-none p-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] transition-colors"
                  title="Download PDF"
                >
                  <Download size={18} />
                </a>
              </div>
            </>
          ) : eligible ? (
            <>
              <div>
                <h3 className="font-bold text-emerald-500 flex items-center justify-center md:justify-start gap-2 text-lg mb-1">
                  <CheckCircle size={20} /> Certificate Available
                </h3>
                <p className="text-sm text-[var(--lms-text-secondary)]">Congratulations! You have met all requirements.</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full md:w-auto lms-btn lms-btn-primary py-2.5 flex items-center justify-center gap-2"
              >
                {generating ? <Loader size={16} className="animate-spin" /> : <Award size={16} />}
                {generating ? 'Generating...' : 'Generate Certificate'}
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-bold text-[var(--lms-text-muted)] flex items-center justify-center md:justify-start gap-2 text-lg mb-1">
                  <Lock size={20} /> Certificate Locked
                </h3>
                <p className="text-sm text-[var(--lms-text-secondary)]">Complete all course requirements to unlock.</p>
              </div>
              <button
                disabled
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] border border-[var(--lms-border)] font-bold text-sm cursor-not-allowed"
              >
                Certificate Locked
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCertificateTab;
