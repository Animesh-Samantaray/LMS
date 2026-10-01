import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import discussionService from '../../services/discussion.service';
import { getSocket } from '../../services/socket.service';
import { showBrowserMessageNotification } from '../../utils/browserNotification';

import DiscussionSidebar from '../../components/discussions/DiscussionSidebar';
import DiscussionHeader from '../../components/discussions/DiscussionHeader';
import MessageList from '../../components/discussions/MessageList';
import MessageComposer from '../../components/discussions/MessageComposer';
import ClearDiscussionDialog from '../../components/discussions/ClearDiscussionDialog';

const DiscussionPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [discussionsError, setDiscussionsError] = useState(null);

  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const socketRef = useRef(null);
  const selectedDiscussionRef = useRef(null);
  selectedDiscussionRef.current = selectedDiscussion;

  const currentUserId = user?._id || user?.id;

  const fetchDiscussions = useCallback(async (autoSelectCourseId = null) => {
    try {
      setLoadingDiscussions(true);
      setDiscussionsError(null);
      const res = await discussionService.getMyDiscussions();
      if (res?.success) {
        const list = res.data || [];
        setDiscussions(list);

        const targetCourseId = autoSelectCourseId || searchParams.get('courseId');
        if (targetCourseId) {
          const match = list.find((d) => d.courseId?._id === targetCourseId);
          if (match) {
            setSelectedDiscussion(match);
          } else if (list.length > 0 && !selectedDiscussionRef.current) {
            setSelectedDiscussion(list[0]);
          }
        } else if (list.length > 0 && !selectedDiscussionRef.current && window.innerWidth >= 768) {
          setSelectedDiscussion(list[0]);
        }
      } else {
        setDiscussionsError(res?.message || 'Failed to fetch discussions');
      }
    } catch (err) {
      setDiscussionsError(err.message || 'Failed to connect to discussion service');
    } finally {
      setLoadingDiscussions(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!isMounted || !socket) return;
      socketRef.current = socket;

      socket.off('message:new');
      socket.off('discussion:cleared');

      discussions.forEach((d) => {
        if (d?._id) {
          socket.emit('discussion:join', d._id);
        }
      });

      socket.on('message:new', (newMsg) => {
        if (!newMsg) return;

        const activeDisc = selectedDiscussionRef.current;
        const msgDiscId = newMsg.discussionId?.toString();
        const activeDiscId = activeDisc?._id?.toString();

        if (activeDisc && activeDiscId === msgDiscId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }

        setDiscussions((prevList) => {
          const updated = prevList.map((d) => {
            if (d._id.toString() === msgDiscId) {
              return {
                ...d,
                lastMessage: {
                  _id: newMsg._id,
                  type: newMsg.type,
                  content: newMsg.content,
                  fileName: newMsg.fileName,
                  createdAt: newMsg.createdAt,
                  sender: newMsg.senderId,
                },
                updatedAt: newMsg.createdAt,
              };
            }
            return d;
          });
          return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });

        const senderId = (newMsg.senderId?._id || newMsg.senderId)?.toString();
        const currentUser = userRef.current;
        const myId = (currentUser?._id || currentUser?.id)?.toString();

        if (senderId && myId && senderId !== myId) {
          const targetDisc =
            (activeDisc && activeDiscId === msgDiscId)
              ? activeDisc
              : discussions.find((d) => d._id?.toString() === msgDiscId);

          const courseTitle = targetDisc?.courseId?.title || 'Course Discussion';

          showBrowserMessageNotification({
            messageId: newMsg._id,
            courseTitle,
            senderName: newMsg.senderId?.name || 'Course Member',
            content: newMsg.content,
            type: newMsg.type,
            fileName: newMsg.fileName,
            onClick: () => {
              window.focus();
              if (targetDisc) {
                handleSelectDiscussion(targetDisc);
              }
            },
          });
        }
      });

      socket.on('discussion:cleared', ({ discussionId }) => {
        if (selectedDiscussionRef.current?._id?.toString() === discussionId?.toString()) {
          setMessages([]);
        }
        setDiscussions((prevList) =>
          prevList.map((d) => {
            if (d._id.toString() === discussionId?.toString()) {
              return {
                ...d,
                lastMessage: null,
              };
            }
            return d;
          })
        );
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.off('message:new');
        socketRef.current.off('discussion:cleared');
      }
    };
  }, [user, discussions.length]);

  useEffect(() => {
    if (!selectedDiscussion) return;

    const discId = selectedDiscussion._id;
    let isMounted = true;

    if (socketRef.current) {
      socketRef.current.emit('discussion:join', discId);
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await discussionService.getDiscussionMessages(discId);
        if (isMounted && res?.success) {
          setMessages(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit('discussion:leave', discId);
      }
    };
  }, [selectedDiscussion]);

  const handleSelectDiscussion = (disc) => {
    setSelectedDiscussion(disc);
    if (disc?.courseId?._id) {
      setSearchParams({ courseId: disc.courseId._id });
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedDiscussion || !text.trim() || sending) return;
    try {
      setSending(true);
      const res = await discussionService.sendMessage(selectedDiscussion._id, {
        content: text,
        type: 'text',
      });
      if (res?.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendSticker = async (sticker) => {
    if (!selectedDiscussion || sending) return;
    try {
      setSending(true);
      const res = await discussionService.sendMessage(selectedDiscussion._id, {
        type: 'sticker',
        stickerId: sticker.id,
        content: `${sticker.emoji} ${sticker.label}`,
      });
      if (res?.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error('Send sticker failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendFile = async (file, caption = '') => {
    if (!selectedDiscussion || !file || uploading) return;
    try {
      setUploading(true);
      const uploadRes = await discussionService.uploadFile(selectedDiscussion._id, file);
      if (uploadRes?.success && uploadRes.data) {
        const { fileUrl, fileName, fileSize, fileMimeType } = uploadRes.data;
        const msgRes = await discussionService.sendMessage(selectedDiscussion._id, {
          type: 'file',
          fileUrl,
          fileName,
          fileSize,
          fileMimeType,
          content: caption,
        });
        if (msgRes?.success && msgRes.data) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msgRes.data._id)) return prev;
            return [...prev, msgRes.data];
          });
        }
      }
    } catch (err) {
      console.error('File send failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClearDiscussion = async () => {
    if (!selectedDiscussion || clearing) return;
    try {
      setClearing(true);
      const res = await discussionService.clearDiscussionMessages(selectedDiscussion._id);
      if (res?.success) {
        setMessages([]);
        setClearDialogOpen(false);
        setDiscussions((prev) =>
          prev.map((d) =>
            d._id === selectedDiscussion._id ? { ...d, lastMessage: null } : d
          )
        );
      }
    } catch (err) {
      console.error('Clear messages failed:', err);
    } finally {
      setClearing(false);
    }
  };

  const canManageSelected = Boolean(
    user &&
      selectedDiscussion &&
      (user.role === 'Admin' ||
        selectedDiscussion.creatorId?.toString() === (user._id || user.id)?.toString() ||
        selectedDiscussion.courseId?.createdBy?.toString() === (user._id || user.id)?.toString() ||
        selectedDiscussion.courseId?.createdBy?._id?.toString() === (user._id || user.id)?.toString())
  );

  return (
    <DashboardLayout pageTitle="Course Discussions">
      <div className="h-[calc(100vh-8.5rem)] min-h-[500px] flex rounded-3xl border border-[var(--lms-border)] bg-[var(--lms-surface)] shadow-2xl overflow-hidden relative">
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            selectedDiscussion ? 'hidden md:flex flex-col' : 'flex flex-col'
          }`}
        >
          <DiscussionSidebar
            discussions={discussions}
            selectedDiscussion={selectedDiscussion}
            onSelectDiscussion={handleSelectDiscussion}
            loading={loadingDiscussions}
            error={discussionsError}
            onRefresh={() => fetchDiscussions()}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            user={user}
          />
        </div>

        <div
          className={`flex-1 h-full flex flex-col min-w-0 bg-[var(--lms-surface-elevated)] ${
            !selectedDiscussion ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedDiscussion ? (
            <>
              <DiscussionHeader
                discussion={selectedDiscussion}
                onBack={() => setSelectedDiscussion(null)}
                canManage={canManageSelected}
                onClearMessages={() => setClearDialogOpen(true)}
                showBackButton={Boolean(selectedDiscussion)}
                isClearing={clearing}
              />

              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                loading={loadingMessages}
                theme={theme}
              />

              <MessageComposer
                onSendMessage={handleSendMessage}
                onSendSticker={handleSendSticker}
                onSendFile={handleSendFile}
                sending={sending}
                uploading={uploading}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-repeat"
              style={{
                backgroundImage: `url(${
                  theme === 'dark'
                    ? '/chat-wallpaper-dark.png'
                    : '/chat-wallpaper-light.png'
                })`,
                backgroundSize: '400px',
              }}
            >
              <div className="p-8 rounded-3xl bg-[var(--lms-surface-elevated)]/90 border border-[var(--lms-border)] shadow-2xl backdrop-blur-md max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--lms-text-primary)] mb-2">
                  Course Discussions
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] leading-relaxed mb-4">
                  Select a course from the left panel to join the discussion room, ask questions, share notes, and interact with peers and instructors in real-time.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                  <Sparkles size={14} />
                  Real-time Socket.IO Active
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClearDiscussionDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearDiscussion}
        clearing={clearing}
        courseTitle={selectedDiscussion?.courseId?.title}
      />
    </DashboardLayout>
  );
};

export default DiscussionPage;
