import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, RefreshCw } from 'lucide-react';

const QuizCameraPreview = ({ active }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [errorMessage, setErrorMessage] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setStatus('initializing');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unsupported');
      setErrorMessage('Camera access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus('active');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage('Camera access is required to take this quiz. Please allow camera access in your browser settings.');
      } else {
        setStatus('error');
        setErrorMessage('Unable to access the camera. Please check your webcam connection.');
      }
    }
  };

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-3 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {status === 'active' ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-[var(--lms-text-primary)]">Camera Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Camera size={14} className="text-[var(--lms-text-muted)]" />
              <span className="text-xs font-bold text-[var(--lms-text-muted)]">Camera Preview</span>
            </div>
          )}
        </div>

        {(status === 'denied' || status === 'error' || status === 'unsupported') && (
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-1 text-[11px] font-bold text-[var(--lms-accent)] hover:underline"
            aria-label="Retry camera access"
          >
            <RefreshCw size={12} /> Try Again
          </button>
        )}
      </div>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-[var(--lms-border)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${status === 'active' ? 'block' : 'hidden'}`}
        />

        {status === 'initializing' && (
          <div className="text-center p-3 text-slate-300 text-xs flex flex-col items-center gap-2">
            <Camera className="animate-pulse text-slate-400" size={24} />
            <span>Starting camera...</span>
          </div>
        )}

        {status === 'denied' && (
          <div className="text-center p-3 text-rose-400 text-xs flex flex-col items-center gap-1.5">
            <CameraOff size={24} />
            <span className="font-bold">Camera Access Denied</span>
            <span className="text-[10px] text-slate-300 leading-tight">{errorMessage}</span>
          </div>
        )}

        {(status === 'error' || status === 'unsupported') && (
          <div className="text-center p-3 text-amber-400 text-xs flex flex-col items-center gap-1.5">
            <AlertTriangle size={24} />
            <span className="font-bold">Camera Unavailable</span>
            <span className="text-[10px] text-slate-300 leading-tight">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCameraPreview;
