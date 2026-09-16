import React from 'react';
import { Award, ShieldCheck, Download, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

const CertificateCard = () => {
  return (
    <div className="glass-card certificate-preview-box" style={{ borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)', marginBottom: '1rem' }}>
          <Award size={40} color="#ffffff" />
        </div>
        <span className="badge badge-purple">
          <ShieldCheck size={14} /> Blockchain Verified
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '0.3rem' }}>
          Official Industry Certification
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Master of Full Stack Software Architecture
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Issued to <strong style={{ color: '#fff' }}>Sarah Jenkins</strong> upon successful completion of 120 credit hours, 8 capstone projects, and 10 comprehensive examinations.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}>
            <Download size={16} /> Download PDF
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}>
            <Share2 size={16} /> Add to LinkedIn
          </button>
          <span style={{ fontSize: '0.82rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} /> Credential ID: EDU-89240-VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
