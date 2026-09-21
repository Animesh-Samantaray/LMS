import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FlipNumber = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center bg-red-50 rounded p-1 w-[38px] border border-red-100">
      <div className="relative h-5 w-full overflow-hidden flex items-center justify-center font-bold text-sm text-red-600">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 15, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[7px] text-red-400 font-medium uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
};

const CountdownBanner = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 43,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
          if (minutes < 0) {
            minutes = 59;
            hours -= 1;
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mb-4 mx-auto lg:mx-0 w-full">
      <div className="flex items-center text-gray-900">
        <span className="font-bold text-[13px] tracking-wide">50% off for all trending course</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs font-medium hidden sm:block">Ends in</span>
        <div className="flex items-center gap-1">
          <FlipNumber value={timeLeft.hours} label="HRS" />
          <FlipNumber value={timeLeft.minutes} label="MINS" />
          <FlipNumber value={timeLeft.seconds} label="SECS" />
        </div>
        <button onClick={() => navigate('/premium-courses')} className="ml-1 bg-[#22c55e] hover:bg-[#1ea951] text-white font-bold py-1.5 px-4 rounded transition-colors text-xs shadow-sm">
          Claim
        </button>
      </div>
    </div>
  );
};

export default CountdownBanner;
