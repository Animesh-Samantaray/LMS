import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, CheckCircle, XCircle, Award, Calendar, User, Search, Loader } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certId, setCertId] = useState(certificateId || '');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      verify(certificateId);
    }
  }, [certificateId]);

  const verify = async (idToVerify) => {
    if (!idToVerify) return;
    setLoading(true);
    setError(null);
    setVerificationResult(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/certificates/${idToVerify}`);
      setVerificationResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate not found or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify(certId);
  };

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--lms-accent)] opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--lms-accent)] opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2 font-bold text-2xl text-[var(--lms-text-primary)]">
              <div className="w-10 h-10 bg-[var(--lms-accent)] rounded-xl flex items-center justify-center text-white">
                <ShieldCheck size={24} />
              </div>
              Shnoor LMS
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-[var(--lms-text-primary)] mb-3">Certificate Verification</h1>
          <p className="text-[var(--lms-text-secondary)] max-w-md mx-auto">
            Verify the authenticity of a Shnoor LMS course completion certificate by entering its unique ID.
          </p>
        </div>

        <div className="lms-glass-card rounded-3xl p-6 sm:p-10 border border-[var(--lms-border)] shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="mb-8 relative">
            <div className="relative">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g., SHNOOR-CERT-2026-XXXX)"
                className="w-full pl-5 pr-32 py-4 bg-[var(--lms-surface-subtle)] border-2 border-[var(--lms-border)] focus:border-[var(--lms-accent)] rounded-2xl outline-none text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] font-mono text-sm sm:text-base transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading || !certId.trim()}
                className="absolute right-2 top-2 bottom-2 lms-btn lms-btn-primary px-6 rounded-xl flex items-center justify-center gap-2 font-bold"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                Verify
              </button>
            </div>
          </form>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader size={40} className="animate-spin text-[var(--lms-accent)] mb-4" />
              <p className="text-[var(--lms-text-secondary)] font-medium">Verifying certificate in blockchain...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <XCircle size={60} className="text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">Verification Failed</h3>
              <p className="text-[var(--lms-text-secondary)]">{error}</p>
            </div>
          )}

          {verificationResult && !loading && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-emerald-500/20">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-1">Certificate Valid</h3>
                <p className="text-emerald-600 font-medium">This is an authentic Shnoor International LLC certificate.</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] flex items-center justify-center shrink-0 text-[var(--lms-text-secondary)]">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--lms-text-muted)] font-medium uppercase tracking-wider mb-0.5">Awarded To</p>
                    <p className="font-bold text-lg text-[var(--lms-text-primary)]">{verificationResult.studentName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] flex items-center justify-center shrink-0 text-[var(--lms-text-secondary)]">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--lms-text-muted)] font-medium uppercase tracking-wider mb-0.5">Course Completed</p>
                    <p className="font-bold text-[var(--lms-text-primary)]">{verificationResult.courseName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] flex items-center justify-center shrink-0 text-[var(--lms-text-secondary)]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--lms-text-muted)] font-medium uppercase tracking-wider mb-0.5">Issue Date</p>
                    <p className="font-bold text-[var(--lms-text-primary)]">
                      {new Date(verificationResult.completionDate).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] flex items-center justify-center shrink-0 text-[var(--lms-text-secondary)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--lms-text-muted)] font-medium uppercase tracking-wider mb-0.5">Certificate ID</p>
                    <p className="font-bold text-[var(--lms-text-primary)] font-mono text-sm break-all">{verificationResult.certificateId}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-emerald-500/20 text-center">
                <a 
                  href={`http://localhost:5000${verificationResult.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  <FileText size={18} /> View Original Document
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 text-sm text-[var(--lms-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Shnoor International LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
