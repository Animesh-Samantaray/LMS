import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import discussionService from '../../services/discussion.service';
import { getSocket } from '../../services/socket.service';
import { showBrowserMessageNotification, requestBrowserNotificationPermission } from '../../utils/browserNotification';

import DiscussionSidebar from '../../components/discussions/DiscussionSidebar';
import DiscussionHeader from '../../components/discussions/DiscussionHeader';
import SharedMediaPanel from '../../components/discussions/SharedMediaPanel';
import GroupMembersPanel from '../../components/discussions/GroupMembersPanel';
import DirectChatRoom from '../../components/discussions/DirectChatRoom';
import MessageList from '../../components/discussions/MessageList';
import MessageComposer from '../../components/discussions/MessageComposer';
import ClearDiscussionDialog from '../../components/discussions/ClearDiscussionDialog';
import DeleteMessageDialog from '../../components/discussions/DeleteMessageDialog';
import ForwardMessageModal from '../../components/discussions/ForwardMessageModal';
import directChatService from '../../services/directChat.service';
import { toast } from 'react-hot-toast';

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  // Message Delete & Forward states
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    messageId: null,
    deleteType: null,
    canDeleteForEveryone: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [forwardModal, setForwardModal] = useState({
    isOpen: false,
    message: null,
    sourceType: 'discussion',
  });
  const [isForwarding, setIsForwarding] = useState(false);

  // Direct 1-on-1 Chat states
  const [sidebarTab, setSidebarTab] = useState('groups'); // 'groups' | 'direct'
  const [directConversations, setDirectConversations] = useState([]);
  const [archivedDirectConversations, setArchivedDirectConversations] = useState([]);
  const [directSubView, setDirectSubView] = useState('active'); // 'active' | 'archived'
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [activeDirectChat, setActiveDirectChat] = useState(null); // { conversation, otherUser, returnDiscussion }

  const socketRef = useRef(null);
  const selectedDiscussionRef = useRef(null);
  selectedDiscussionRef.current = selectedDiscussion;

  const currentUserId = user?._id || user?.id;

  const fetchDirectConversations = useCallback(async () => {
    try {
      setLoadingDirect(true);
      const res = await directChatService.getMyDirectConversations();
      if (res?.success) {
        setDirectConversations(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load direct conversations:', err);
    } finally {
      setLoadingDirect(false);
    }
  }, []);

  const fetchArchivedDirectConversations = useCallback(async () => {
    try {
      setLoadingArchived(true);
      const res = await directChatService.getArchivedDirectConversations();
      if (res?.success) {
        setArchivedDirectConversations(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load archived direct conversations:', err);
    } finally {
      setLoadingArchived(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectConversations();
    fetchArchivedDirectConversations();
  }, [fetchDirectConversations, fetchArchivedDirectConversations]);

  const handleArchiveConversation = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await directChatService.archiveDirectConversation(conversationId);
      if (res?.success) {
        toast.success('Conversation archived');
        setDirectConversations((prev) => {
          const target = prev.find((c) => c._id === conversationId);
          if (target) {
            setArchivedDirectConversations((prevArchived) => [
              { ...target, isArchived: true, archivedAt: new Date().toISOString() },
              ...prevArchived.filter((c) => c._id !== conversationId),
            ]);
          }
          return prev.filter((c) => c._id !== conversationId);
        });

        setActiveDirectChat((prev) => {
          if (prev?.conversation?._id === conversationId) {
            return {
              ...prev,
              conversation: {
                ...prev.conversation,
                isArchived: true,
              },
            };
          }
          return prev;
        });
      } else {
        toast.error(res?.message || 'Failed to archive conversation');
      }
    } catch (err) {
      console.error('Error archiving conversation:', err);
      toast.error(err.response?.data?.message || 'Failed to archive conversation');
    }
  };

  const handleUnarchiveConversation = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await directChatService.unarchiveDirectConversation(conversationId);
      if (res?.success) {
        toast.success('Conversation unarchived');
        setArchivedDirectConversations((prev) => {
          const target = prev.find((c) => c._id === conversationId);
          if (target) {
            setDirectConversations((prevActive) => [
              { ...target, isArchived: false },
              ...prevActive.filter((c) => c._id !== conversationId),
            ]);
          }
          return prev.filter((c) => c._id !== conversationId);
        });

        setActiveDirectChat((prev) => {
          if (prev?.conversation?._id === conversationId) {
            return {
              ...prev,
              conversation: {
                ...prev.conversation,
                isArchived: false,
              },
            };
          }
          return prev;
        });
      } else {
        toast.error(res?.message || 'Failed to unarchive conversation');
      }
    } catch (err) {
      console.error('Error unarchiving conversation:', err);
      toast.error(err.response?.data?.message || 'Failed to unarchive conversation');
    }
  };

  const handleArchiveDiscussion = async (discussionId) => {
    if (!discussionId) return;
    try {
      const res = await discussionService.archiveDiscussion(discussionId);
      if (res?.success) {
        toast.success('Group discussion archived');
        setDiscussions((prev) =>
          prev.map((d) => (d._id === discussionId ? { ...d, isArchived: true } : d))
        );
        setSelectedDiscussion((prev) =>
          prev?._id === discussionId ? { ...prev, isArchived: true } : prev
        );
      } else {
        toast.error(res?.message || 'Failed to archive discussion');
      }
    } catch (err) {
      console.error('Error archiving group discussion:', err);
      toast.error(err.response?.data?.message || 'Failed to archive discussion');
    }
  };

  const handleUnarchiveDiscussion = async (discussionId) => {
    if (!discussionId) return;
    try {
      const res = await discussionService.unarchiveDiscussion(discussionId);
      if (res?.success) {
        toast.success('Group discussion unarchived');
        setDiscussions((prev) =>
          prev.map((d) => (d._id === discussionId ? { ...d, isArchived: false } : d))
        );
        setSelectedDiscussion((prev) =>
          prev?._id === discussionId ? { ...prev, isArchived: false } : prev
        );
      } else {
        toast.error(res?.message || 'Failed to unarchive discussion');
      }
    } catch (err) {
      console.error('Error unarchiving group discussion:', err);
      toast.error(err.response?.data?.message || 'Failed to unarchive discussion');
    }
  };

  const handleStartDirectChat = async (targetMember) => {
    if (!targetMember?._id) return;
    try {
      const res = await directChatService.getOrCreateDirectConversation(targetMember._id);
      if (res?.success && res.conversation) {
        setActiveDirectChat({
          conversation: res.conversation,
          otherUser: targetMember,
          returnDiscussion: selectedDiscussion,
        });
        setShowMembersPanel(false);
        setShowMediaPanel(false);
        fetchDirectConversations();
      } else {
        toast.error(res?.message || 'Failed to start direct conversation');
      }
    } catch (err) {
      console.error('Error starting direct chat:', err);
      toast.error(err.response?.data?.message || 'Failed to start direct chat');
    }
  };

  const handleSelectDirectChat = (conv) => {
    setActiveDirectChat({
      conversation: conv,
      otherUser: conv.otherParticipant,
      returnDiscussion: selectedDiscussion,
    });
    setShowMembersPanel(false);
    setShowMediaPanel(false);
  };

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


    requestBrowserNotificationPermission();

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!isMounted || !socket) return;
      socketRef.current = socket;

      socket.off('message:new');
      socket.off('discussion:cleared');
      socket.off('direct:notification');
      socket.off('message:deletedForEveryone');
      socket.off('message:deleted');
      socket.off('message:reaction');

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

      socket.on('message:deletedForEveryone', ({ discussionId, messageId }) => {
        const activeDisc = selectedDiscussionRef.current;
        if (activeDisc?._id?.toString() === discussionId?.toString()) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? {
                    ...m,
                    isDeletedForEveryone: true,
                    content: 'This message was deleted',
                    fileUrl: '',
                    fileName: '',
                    fileSize: 0,
                    fileMimeType: '',
                    stickerId: '',
                    reactions: [],
                  }
                : m
            )
          );
        }

        setDiscussions((prevList) =>
          prevList.map((d) => {
            if (
              d._id.toString() === discussionId?.toString() &&
              d.lastMessage?._id?.toString() === messageId?.toString()
            ) {
              return {
                ...d,
                lastMessage: {
                  ...d.lastMessage,
                  content: 'This message was deleted',
                },
              };
            }
            return d;
          })
        );
      });

      socket.on('message:deleted', ({ discussionId, messageId, isDeletedForEveryone }) => {
        if (isDeletedForEveryone) {
          const activeDisc = selectedDiscussionRef.current;
          if (activeDisc?._id?.toString() === discussionId?.toString()) {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === messageId
                  ? {
                      ...m,
                      isDeletedForEveryone: true,
                      content: 'This message was deleted',
                      fileUrl: '',
                      fileName: '',
                      fileSize: 0,
                      fileMimeType: '',
                      stickerId: '',
                      reactions: [],
                    }
                  : m
              )
            );
          }
        }
      });

      socket.on('message:reaction', (updatedMsg) => {
        if (!updatedMsg) return;
        const activeDisc = selectedDiscussionRef.current;
        if (activeDisc?._id?.toString() === updatedMsg.discussionId?.toString()) {
          setMessages((prev) =>
            prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
          );
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

      socket.off('direct:conversation:archived');
      socket.off('direct:conversation:unarchived');
      socket.off('discussion:archived');
      socket.off('discussion:unarchived');

      socket.on('direct:conversation:archived', () => {
        fetchDirectConversations();
        fetchArchivedDirectConversations();
      });

      socket.on('direct:conversation:unarchived', () => {
        fetchDirectConversations();
        fetchArchivedDirectConversations();
      });

      socket.on('discussion:archived', () => {
        fetchDiscussions();
      });

      socket.on('discussion:unarchived', () => {
        fetchDiscussions();
      });

      socket.on('direct:notification', ({ conversationId, message }) => {
        fetchDirectConversations();
        fetchArchivedDirectConversations();
        const otherName = message?.senderId?.name || 'A group member';
        showBrowserMessageNotification({
          messageId: message?._id,
          courseTitle: 'Direct Message',
          senderName: otherName,
          content: message?.content,
          type: message?.type,
          fileName: message?.fileName,
          onClick: () => {
            window.focus();
            fetchDirectConversations();
            fetchArchivedDirectConversations();
          },
        });
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.off('message:new');
        socketRef.current.off('discussion:cleared');
        socketRef.current.off('direct:notification');
        socketRef.current.off('message:deletedForEveryone');
        socketRef.current.off('message:deleted');
        socketRef.current.off('message:reaction');
        socketRef.current.off('direct:conversation:archived');
        socketRef.current.off('direct:conversation:unarchived');
        socketRef.current.off('discussion:archived');
        socketRef.current.off('discussion:unarchived');
      }
    };
  }, [user, discussions.length, fetchDirectConversations, fetchArchivedDirectConversations]);

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
    setActiveDirectChat(null);
    setSelectedDiscussion(disc);
    setShowMembersPanel(false);
    setShowMediaPanel(false);
    if (disc?.courseId?._id) {
      setSearchParams({ courseId: disc.courseId._id });
    }
  };

  const handleInitiateDelete = (messageId, deleteType = null) => {
    const msg = messages.find((m) => m._id === messageId);
    const msgSenderId = msg?.senderId?._id || msg?.senderId;
    const isOwn = msgSenderId && currentUserId && msgSenderId.toString() === currentUserId.toString();
    const canDeleteEveryone = Boolean(isOwn || canManageSelected);

    setDeleteDialog({
      isOpen: true,
      messageId,
      deleteType,
      canDeleteForEveryone: canDeleteEveryone,
    });
  };

  const handleConfirmDelete = async (deleteType) => {
    if (!selectedDiscussion || !deleteDialog.messageId) return;
    try {
      setIsDeleting(true);
      const res = await discussionService.deleteMessage(
        selectedDiscussion._id,
        deleteDialog.messageId,
        deleteType
      );

      if (res?.success) {
        if (deleteType === 'me') {
          setMessages((prev) => prev.filter((m) => m._id !== deleteDialog.messageId));
          toast.success('Message deleted for you');
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === deleteDialog.messageId
                ? {
                    ...m,
                    isDeletedForEveryone: true,
                    content: 'This message was deleted',
                    fileUrl: '',
                    fileName: '',
                    fileSize: 0,
                    fileMimeType: '',
                    stickerId: '',
                    reactions: [],
                  }
                : m
            )
          );
          toast.success('Message deleted for everyone');
        }
        setDeleteDialog({
          isOpen: false,
          messageId: null,
          deleteType: null,
          canDeleteForEveryone: false,
        });
        return true;
      } else {
        toast.error(res?.message || 'Failed to delete message');
        return false;
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error(err.response?.data?.message || 'Failed to delete message');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenForward = (message, sourceType = 'discussion') => {
    setForwardModal({
      isOpen: true,
      message,
      sourceType,
    });
  };

  const handleConfirmForward = async ({ targetDiscussionIds, targetConversationIds }) => {
    if (!forwardModal.message) return;
    try {
      setIsForwarding(true);
      const res = await discussionService.forwardMessage({
        sourceType: forwardModal.sourceType,
        sourceMessageId: forwardModal.message._id,
        targetDiscussionIds,
        targetConversationIds,
      });

      if (res?.success) {
        toast.success(res.message || 'Message forwarded successfully');
        setForwardModal({ isOpen: false, message: null, sourceType: 'discussion' });
        fetchDiscussions();
        fetchDirectConversations();
      } else {
        toast.error(res?.message || 'Failed to forward message');
      }
    } catch (err) {
      console.error('Forward message error:', err);
      toast.error(err.response?.data?.message || 'Failed to forward message');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleReact = async (messageId, emoji) => {
    if (!selectedDiscussion) return;
    try {
      const res = await discussionService.toggleReaction(selectedDiscussion._id, messageId, emoji);
      if (res?.success && res.data) {
        setMessages((prev) => prev.map((message) => message._id === messageId ? res.data : message));
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedDiscussion || !text.trim() || sending) return;
    try {
      setSending(true);
      const res = await discussionService.sendMessage(selectedDiscussion._id, {
        content: text,
        type: 'text',
        parentMessageId: replyingTo?._id || null,
      });
      setReplyingTo(null);
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
        parentMessageId: replyingTo?._id || null,
      });
      setReplyingTo(null);
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
            selectedDiscussion || activeDirectChat ? 'hidden md:flex flex-col' : 'flex flex-col'
          }`}
        >
          <DiscussionSidebar
            discussions={discussions}
            selectedDiscussion={selectedDiscussion}
            onSelectDiscussion={handleSelectDiscussion}
            loading={loadingDiscussions}
            error={discussionsError}
            onRefresh={() => {
              fetchDiscussions();
              fetchDirectConversations();
              fetchArchivedDirectConversations();
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            user={user}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            directConversations={directConversations}
            archivedDirectConversations={archivedDirectConversations}
            directSubView={directSubView}
            setDirectSubView={setDirectSubView}
            onArchiveConversation={handleArchiveConversation}
            onUnarchiveConversation={handleUnarchiveConversation}
            onArchiveDiscussion={handleArchiveDiscussion}
            onUnarchiveDiscussion={handleUnarchiveDiscussion}
            activeDirectChat={activeDirectChat}
            onSelectDirectChat={handleSelectDirectChat}
          />
        </div>

        <div
          className={`flex-1 h-full flex flex-col min-w-0 bg-[var(--lms-surface-elevated)] ${
            !selectedDiscussion && !activeDirectChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeDirectChat ? (
            <DirectChatRoom
              conversation={activeDirectChat.conversation}
              otherUser={activeDirectChat.otherUser}
              currentUserId={currentUserId}
              onBackToGroup={() => {
                setActiveDirectChat(null);
              }}
              returnDiscussion={activeDirectChat.returnDiscussion || selectedDiscussion}
              theme={theme}
              onOpenForward={(msg) => handleOpenForward(msg, 'direct')}
              onArchive={() => handleArchiveConversation(activeDirectChat.conversation?._id)}
              onUnarchive={() => handleUnarchiveConversation(activeDirectChat.conversation?._id)}
            />
          ) : selectedDiscussion ? (
            <>
              <DiscussionHeader
                discussion={selectedDiscussion}
                onBack={() => {
                  setSelectedDiscussion(null);
                  setShowMembersPanel(false);
                  setShowMediaPanel(false);
                }}
                canManage={canManageSelected}
                onToggleMedia={() => {
                  setShowMediaPanel(!showMediaPanel);
                  setShowMembersPanel(false);
                }}
                onOpenMembers={() => {
                  setShowMembersPanel(!showMembersPanel);
                  setShowMediaPanel(false);
                }}
                showMembersPanel={showMembersPanel}
                onClearMessages={() => setClearDialogOpen(true)}
                onArchive={() => handleArchiveDiscussion(selectedDiscussion?._id)}
                onUnarchive={() => handleUnarchiveDiscussion(selectedDiscussion?._id)}
                showBackButton={Boolean(selectedDiscussion)}
                isClearing={clearing}
              />

              <div className="flex-1 flex min-h-0 relative">
                <div className="flex-1 flex flex-col min-w-0">
                  <MessageList
                    onReply={(msg) => setReplyingTo(msg)}
                    onReact={handleReact}
                    onDelete={handleInitiateDelete}
                    onForward={(msg) => handleOpenForward(msg, 'discussion')}
                    canDeleteForEveryone={canManageSelected}
                    messages={messages}
                    currentUserId={currentUserId}
                    loading={loadingMessages}
                    theme={theme}
                  />

                  <MessageComposer
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    onSendMessage={handleSendMessage}
                    onSendSticker={handleSendSticker}
                    onSendFile={handleSendFile}
                    sending={sending}
                    uploading={uploading}
                  />
                </div>
                <SharedMediaPanel
                  isOpen={showMediaPanel}
                  onClose={() => setShowMediaPanel(false)}
                  messages={messages}
                />
                <GroupMembersPanel
                  isOpen={showMembersPanel}
                  onClose={() => setShowMembersPanel(false)}
                  discussion={selectedDiscussion}
                  currentUserId={currentUserId}
                  onStartDirectChat={handleStartDirectChat}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-repeat"
              style={{
                backgroundImage: `url(${
                  theme === 'dark' || theme === 'eco'
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

      <DeleteMessageDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({
            isOpen: false,
            messageId: null,
            deleteType: null,
            canDeleteForEveryone: false,
          })
        }
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        canDeleteForEveryone={deleteDialog.canDeleteForEveryone}
        initialDeleteType={deleteDialog.deleteType}
      />

      <ForwardMessageModal
        isOpen={forwardModal.isOpen}
        onClose={() =>
          setForwardModal({
            isOpen: false,
            message: null,
            sourceType: 'discussion',
          })
        }
        message={forwardModal.message}
        sourceType={forwardModal.sourceType}
        discussions={discussions}
        directConversations={directConversations}
        onConfirmForward={handleConfirmForward}
        isForwarding={isForwarding}
      />
    </DashboardLayout>
  );
};

export default DiscussionPage;
