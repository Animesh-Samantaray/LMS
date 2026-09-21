import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value = '', onChange, disabled = false, hasError = false }) => {
  const inputRefs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    if (inputRefs.current[targetIndex] && !disabled) {
      inputRefs.current[targetIndex].focus();
    }
  }, []);

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (!cleanDigits) {
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (cleanDigits.length > 1) {
      handlePasteValue(cleanDigits);
      return;
    }

    const singleDigit = cleanDigits.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    const nextVal = newDigits.join('');
    onChange(nextVal);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteValue = (pastedText) => {
    const cleanDigits = pastedText.replace(/\D/g, '').slice(0, length);
    if (!cleanDigits) return;

    const newDigits = Array.from({ length }, (_, i) => cleanDigits[i] || '');
    onChange(cleanDigits);

    const nextIndex = Math.min(cleanDigits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteValue(pastedData);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-12 sm:w-14 sm:h-16 text-center font-bold text-xl sm:text-2xl rounded-xl transition-all duration-200 outline-none select-none ${hasError ? 'bg-rose-50 border-2 border-rose-500 text-rose-600 shadow-sm' : digit ? 'bg-white border-2 border-blue-500 text-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.15)] scale-[1.02]' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:scale-[1.03]'} disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
