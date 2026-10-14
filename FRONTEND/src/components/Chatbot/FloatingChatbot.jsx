import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  TrendingUp,
  FolderCheck,
  KeyRound,
  Mail,
  Award,
  UserCheck,
  HelpCircle,
  RotateCcw,
  Square,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendChatMessage } from '../../services/chatbot.service';
import './FloatingChatbot.css';

const STORAGE_KEY = 'lms-chatbot-position';
const BUTTON_SIZE = 56;
const PADDING = 16;
const DRAG_THRESHOLD = 6;

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your LMS Assistant. How can I help you today?",
};

const SUGGESTED_QUESTIONS = [
  { text: 'How do I enroll in a course?', icon: BookOpen },
  { text: 'How can I track my learning progress?', icon: TrendingUp },
  { text: 'Where can I find my enrolled courses?', icon: FolderCheck },
  { text: 'How do I reset my password?', icon: KeyRound },
  { text: 'How can I contact my instructor?', icon: Mail },
  { text: 'How do I download course certificates?', icon: Award },
  { text: 'How can I update my profile?', icon: UserCheck },
  { text: 'How do I ask a question about a course?', icon: HelpCircle },
];

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const buttonRef = useRef(null);
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [position, setPosition] = useState(() => {
    const defaultX = typeof window !== 'undefined' ? window.innerWidth - BUTTON_SIZE - PADDING : 100;
    const defaultY = typeof window !== 'undefined' ? window.innerHeight - BUTTON_SIZE - PADDING : 100;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.min(Math.max(PADDING, parsed.x), window.innerWidth - BUTTON_SIZE - PADDING),
            y: Math.min(Math.max(PADDING, parsed.y), window.innerHeight - BUTTON_SIZE - PADDING),
          };
        }
      }
    } catch {
      return { x: defaultX, y: defaultY };
    }

    return { x: defaultX, y: defaultY };
  });

  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  const clampPosition = useCallback((x, y) => {
    const maxX = window.innerWidth - BUTTON_SIZE - PADDING;
    const maxY = window.innerHeight - BUTTON_SIZE - PADDING;
    return {
      x: Math.min(Math.max(PADDING, x), Math.max(PADDING, maxX)),
      y: Math.min(Math.max(PADDING, y), Math.max(PADDING, maxY)),
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const clamped = clampPosition(prev.x, prev.y);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {}
        return clamped;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      stopListening();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event) => {
      if (
        windowRef.current &&
        !windowRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isOpen]);

  // Clean up Web Speech API on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      baseTextRef.current = inputMessage;
      let sessionFinalTranscript = '';

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let chunkFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            chunkFinal += text;
          } else {
            interim += text;
          }
        }

        if (chunkFinal) {
          sessionFinalTranscript += (sessionFinalTranscript ? ' ' : '') + chunkFinal.trim();
        }

        const currentSpoken = (
          sessionFinalTranscript + (interim ? (sessionFinalTranscript ? ' ' : '') + interim.trim() : '')
        ).trim();

        const base = baseTextRef.current ? baseTextRef.current.trim() : '';
        const combined = base
          ? currentSpoken
            ? `${base} ${currentSpoken}`
            : base
          : currentSpoken;

        setInputMessage(combined);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          toast.error('No microphone found. Please connect a microphone and try again.');
        } else if (event.error === 'network') {
          toast.error('Network error during voice recognition.');
        } else if (event.error !== 'aborted') {
          toast.error(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
      recognitionRef.current = null;
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, [inputMessage]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragInfo.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };

    if (buttonRef.current) {
      buttonRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragInfo.current.isDragging) return;

    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaY = e.clientY - dragInfo.current.startY;

    if (!dragInfo.current.hasMoved) {
      if (Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
        dragInfo.current.hasMoved = true;
      }
    }

    if (dragInfo.current.hasMoved) {
      const nextX = dragInfo.current.initialX + deltaX;
      const nextY = dragInfo.current.initialY + deltaY;
      const clamped = clampPosition(nextX, nextY);
      setPosition(clamped);
    }
  };

  const handlePointerUp = (e) => {
    if (!dragInfo.current.isDragging) return;

    if (buttonRef.current && buttonRef.current.hasPointerCapture(e.pointerId)) {
      buttonRef.current.releasePointerCapture(e.pointerId);
    }

    const wasDragging = dragInfo.current.hasMoved;
    dragInfo.current.isDragging = false;

    if (wasDragging) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {}
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const executeSendMessage = async (rawText) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed, nextMessages);
      if (response && response.success && response.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            isError: true,
            content: response?.message || 'Unable to get a response right now. Please try again.',
          },
        ]);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        'Unable to get a response right now. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          isError: true,
          content: errorMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    executeSendMessage(inputMessage);
  };

  const handleSelectQuestion = (questionText) => {
    executeSendMessage(questionText);
  };

  const handleResetChat = () => {
    stopListening();
    setMessages([INITIAL_MESSAGE]);
    setInputMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatWindowStyle = () => {
    const windowWidth = 360;
    const windowHeight = 500;
    const isRightHalf = position.x > window.innerWidth / 2;
    const isBottomHalf = position.y > window.innerHeight / 2;

    const style = {};

    if (isRightHalf) {
      style.right = `${Math.max(PADDING, window.innerWidth - position.x - BUTTON_SIZE)}px`;
    } else {
      style.left = `${Math.max(PADDING, position.x)}px`;
    }

    if (isBottomHalf) {
      style.bottom = `${Math.max(PADDING, window.innerHeight - position.y + 10)}px`;
    } else {
      style.top = `${Math.max(PADDING, position.y + BUTTON_SIZE + 10)}px`;
    }

    return style;
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="lms-chatbot-btn"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Open LMS Chatbot Assistant"
        title="LMS Assistant"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div
          ref={windowRef}
          className="lms-chatbot-window"
          style={getChatWindowStyle()}
          role="dialog"
          aria-label="LMS Chatbot Assistant Window"
        >
          {/* Header */}
          <div className="lms-chatbot-header">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Bot size={20} />
              <span>LMS Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-white/20 transition-colors"
                aria-label="Close Chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="lms-chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`lms-chatbot-bubble ${
                  msg.role === 'user'
                    ? 'lms-chatbot-bubble-user'
                    : msg.isError
                    ? 'lms-chatbot-bubble-error'
                    : 'lms-chatbot-bubble-assistant'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* Suggested Question Chips (only shown before conversation has user messages) */}
            {!hasUserMessages && !isLoading && (
              <div className="lms-chatbot-suggestions">
                <div className="lms-chatbot-suggestions-header">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Frequently Asked Questions</span>
                </div>
                <div className="lms-chatbot-suggestions-grid">
                  {SUGGESTED_QUESTIONS.map((q, idx) => {
                    const IconComponent = q.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuestion(q.text)}
                        className="lms-chatbot-chip"
                        title={q.text}
                      >
                        <span className="lms-chatbot-chip-icon">
                          <IconComponent size={13} />
                        </span>
                        <span className="truncate">{q.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="lms-chatbot-bubble lms-chatbot-bubble-assistant flex items-center gap-1.5 py-3">
                <div className="lms-chatbot-typing-dot" />
                <div className="lms-chatbot-typing-dot" />
                <div className="lms-chatbot-typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening State Indicator Banner */}
          {isListening && (
            <div className="lms-chatbot-listening-indicator">
              <div className="flex items-center gap-2">
                <div className="lms-chatbot-rec-dot" />
                <span className="font-semibold text-xs">Listening... Speak now</span>
                <div className="lms-chatbot-wave-container ml-1">
                  <div className="lms-chatbot-wave-bar" />
                  <div className="lms-chatbot-wave-bar" />
                  <div className="lms-chatbot-wave-bar" />
                  <div className="lms-chatbot-wave-bar" />
                  <div className="lms-chatbot-wave-bar" />
                </div>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="lms-chatbot-stop-btn flex items-center gap-1"
                title="Stop recording"
              >
                <Square size={9} className="fill-current" />
                Done
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="lms-chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="lms-chatbot-input"
              placeholder={isListening ? 'Listening to your voice...' : 'Ask about courses, quizzes...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Chatbot input message"
            />

            {/* Voice Recognition Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`lms-chatbot-mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop recording (click to review text)' : 'Speak message using microphone'}
              aria-label={isListening ? 'Stop recording' : 'Speak message using microphone'}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="lms-chatbot-send-btn"
              aria-label="Send Message"
              title="Send message"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
