import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../../services/chatbot.service';
import './FloatingChatbot.css';

const STORAGE_KEY = 'lms-chatbot-position';
const BUTTON_SIZE = 56;
const PADDING = 16;
const DRAG_THRESHOLD = 6;

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your LMS Assistant. How can I help you today?",
    },
  ]);

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

  const buttonRef = useRef(null);
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) return;

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
      const errorMsg = error?.response?.data?.message || 'Unable to get a response right now. Please try again.';
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
          <div className="lms-chatbot-header">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Bot size={20} />
              <span>LMS Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Close Chatbot"
            >
              <X size={18} />
            </button>
          </div>

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

            {isLoading && (
              <div className="lms-chatbot-bubble lms-chatbot-bubble-assistant flex items-center gap-1.5 py-3">
                <div className="lms-chatbot-typing-dot" />
                <div className="lms-chatbot-typing-dot" />
                <div className="lms-chatbot-typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="lms-chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="lms-chatbot-input"
              placeholder="Ask about courses, quizzes..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Chatbot input message"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="lms-chatbot-send-btn"
              aria-label="Send Message"
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
