import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Linkedin, Download, Loader } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const ViewCertificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get(`/api/certificates/${id}`);
        setCertificate(res.data);
      } catch (err) {
        setError('Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size={40} className="animate-spin text-[var(--lms-accent)]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !certificate) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-rose-500 font-bold text-lg mb-4">{error || 'Certificate not found'}</p>
          <button 
            onClick={() => navigate('/student/certificates')}
            className="px-6 py-2 bg-[var(--lms-accent)] text-white rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const pdfUrl = `http://localhost:5000${certificate.pdfUrl}`;
  const imageUrl = `http://localhost:5000${certificate.pdfUrl.replace(".pdf", ".jpg")}`;

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`http://localhost:5000/verify-certificate/${certificate.certificateId}`)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-[80vh] flex flex-col bg-transparent p-4 sm:p-8 rounded-3xl">
        
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/student/certificates')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] rounded-xl text-sm font-bold shadow-sm hover:bg-[var(--lms-surface-hover)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to My Certificates
          </button>
          
          <button 
            onClick={shareOnLinkedIn}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Linkedin size={16} /> Share on LinkedIn
          </button>
          
          <a 
            href={pdfUrl}
            download
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--lms-accent)] text-white rounded-xl text-sm font-bold shadow-sm hover:brightness-90 transition-colors"
          >
            <Download size={16} /> Download PDF
          </a>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 w-full flex items-center justify-center mx-auto max-w-[1000px] p-2 sm:p-4">
          <img 
            src={imageUrl} 
            alt="Certificate" 
            className="w-full h-auto object-contain rounded-xl shadow-xl"
            style={{ maxHeight: '75vh' }}
          />
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default ViewCertificate;
