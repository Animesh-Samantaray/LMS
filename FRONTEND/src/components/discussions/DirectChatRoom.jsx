import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Lock,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Crown,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import directChatService from '../../services/directChat.service';
import { getSocket } from '../../services/socket.service';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import DeleteMessageDialog from './DeleteMessageDialog';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarBg = (name = '') => {
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const DirectChatRoom = ({
  conversation,
  otherUser,
  currentUserId,
  onBackToGroup,
  returnDiscussion,
  theme = 'dark',
  onOpenForward,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    messageId: null,
    deleteType: null,
    canDeleteForEveryone: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const socketRef = useRef(null);
  const conversationId = conversation?._id;
  const targetName = otherUser?.name || 'User';

  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await directChatService.getDirectMessages(conversationId);
        if (isMounted) {
          if (res?.success) {
            setMessages(res.data || []);
          } else {
            setError(res?.message || 'Failed to load conversation');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || 'Error loading messages'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!isMounted || !socket) return;
      socketRef.current = socket;

      socket.emit('direct:join', conversationId);

      socket.off('direct:message:new');
      socket.off('direct:message:reaction');
      socket.off('direct:message:deletedForEveryone');
      socket.off('direct:message:deleted');

      socket.on('direct:message:new', (newMsg) => {
        if (!newMsg) return;
        if (newMsg.conversationId?.toString() === conversationId.toString()) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            const optIndex = prev.findIndex(
              (m) =>
                m.isOptimistic &&
                (m.senderId?._id?.toString() === newMsg.senderId?._id?.toString() ||
                  m.senderId?.toString() === newMsg.senderId?._id?.toString() ||
                  m.senderId?._id?.toString() === newMsg.senderId?.toString()) &&
                m.type === newMsg.type &&
                m.content === newMsg.content
            );
            if (optIndex !== -1) {
              const updated = [...prev];
              updated[optIndex] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });
        }
      });

      socket.on('direct:message:reaction', (updatedMsg) => {
        if (!updatedMsg) return;
        if (updatedMsg.conversationId?.toString() === conversationId.toString()) {
          setMessages((prev) =>
            prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
          );
        }
      });

      socket.on('direct:message:deletedForEveryone', ({ conversationId: cId, messageId }) => {
        if (cId?.toString() === conversationId?.toString()) {
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
      });

      socket.on('direct:message:deleted', ({ conversationId: cId, messageId, isDeletedForEveryone }) => {
        if (cId?.toString() === conversationId?.toString() && isDeletedForEveryone) {
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
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit('direct:leave', conversationId);
        socketRef.current.off('direct:message:new');
        socketRef.current.off('direct:message:reaction');
        socketRef.current.off('direct:message:deletedForEveryone');
        socketRef.current.off('direct:message:deleted');
      }
    };
  }, [conversationId]);

  const handleSendMessage = async (text) => {
    if (!conversationId || !text.trim()) return;

    const trimmed = text.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const replySnapshot = replyingTo;
    setReplyingTo(null);

    const optimisticMsg = {
      _id: tempId,
      conversationId,
      senderId: {
        _id: currentUserId,
        name: user?.name || 'You',
        profileImage: user?.profileImage || '',
        role: user?.role || 'Student',
      },
      type: 'text',
      content: trimmed,
      parentMessageId: replySnapshot
        ? {
            _id: replySnapshot._id,
            content: replySnapshot.content,
            type: replySnapshot.type,
            fileName: replySnapshot.fileName,
            stickerId: replySnapshot.stickerId,
            senderId: replySnapshot.senderId,
          }
        : null,
      reactions: [],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await directChatService.sendDirectMessage(conversationId, {
        content: trimmed,
        type: 'text',
        parentMessageId: replySnapshot?._id || null,
      });

      if (res?.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) {
            return prev.filter((m) => m._id !== tempId);
          }
          return prev.map((m) => (m._id === tempId ? res.data : m));
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      console.error('Failed to send direct message:', err);
      toast.error(err.response?.data?.message || 'Could not send message');
    }
  };

  const handleSendSticker = async (sticker) => {
    if (!conversationId || !sticker) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const replySnapshot = replyingTo;
    setReplyingTo(null);

    const contentText = `${sticker.emoji} ${sticker.label}`;
    const optimisticMsg = {
      _id: tempId,
      conversationId,
      senderId: {
        _id: currentUserId,
        name: user?.name || 'You',
        profileImage: user?.profileImage || '',
        role: user?.role || 'Student',
      },
      type: 'sticker',
      stickerId: sticker.id,
      content: contentText,
      parentMessageId: replySnapshot
        ? {
            _id: replySnapshot._id,
            content: replySnapshot.content,
            type: replySnapshot.type,
            fileName: replySnapshot.fileName,
            stickerId: replySnapshot.stickerId,
            senderId: replySnapshot.senderId,
          }
        : null,
      reactions: [],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await directChatService.sendDirectMessage(conversationId, {
        type: 'sticker',
        stickerId: sticker.id,
        content: contentText,
        parentMessageId: replySnapshot?._id || null,
      });

      if (res?.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) {
            return prev.filter((m) => m._id !== tempId);
          }
          return prev.map((m) => (m._id === tempId ? res.data : m));
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      console.error('Failed to send sticker:', err);
      toast.error('Failed to send sticker');
    }
  };

  const handleSendFile = async (file, caption = '') => {
    if (!conversationId || !file || uploading) return;
    try {
      setUploading(true);
      const uploadRes = await directChatService.uploadDirectFile(conversationId, file);
      if (uploadRes?.success && uploadRes.data) {
        const { fileUrl, fileName, fileSize, fileMimeType } = uploadRes.data;
        const msgRes = await directChatService.sendDirectMessage(conversationId, {
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
      console.error('Failed to send file:', err);
      toast.error(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleReact = async (messageId, emoji) => {
    if (!conversationId) return;
    try {
      const res = await directChatService.toggleDirectReaction(conversationId, messageId, emoji);
      if (res?.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.data : m))
        );
      }
    } catch (err) {
      console.error('Direct reaction failed:', err);
    }
  };

  const handleInitiateDelete = (messageId, deleteType = null) => {
    const msg = messages.find((m) => m._id === messageId);
    const msgSenderId = msg?.senderId?._id || msg?.senderId;
    const isOwn = msgSenderId && currentUserId && msgSenderId.toString() === currentUserId.toString();

    setDeleteDialog({
      isOpen: true,
      messageId,
      deleteType,
      canDeleteForEveryone: Boolean(isOwn),
    });
  };

  const handleConfirmDelete = async (deleteType) => {
    if (!conversationId || !deleteDialog.messageId) return;
    try {
      setIsDeleting(true);
      const res = await directChatService.deleteDirectMessage(
        conversationId,
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
      console.error('Delete direct message error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete message');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const renderRoleBadge = () => {
    if (otherUser?.isCreator) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Crown size={10} className="text-amber-500" />
          Lead Instructor
        </span>
      );
    }
    if (otherUser?.role === 'Instructor') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
          <GraduationCap size={10} className="text-indigo-500" />
          Instructor
        </span>
      );
    }
    if (otherUser?.role === 'Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
          <ShieldCheck size={10} className="text-purple-500" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
        Student
      </span>
    );
  };

  const hasCustomImage = otherUser?.profileImage && !imgError;
  const groupReturnTitle =
    returnDiscussion?.courseId?.title || 'Group Discussion';

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[var(--lms-surface-elevated)] relative">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--lms-border)] bg-[var(--lms-surface)] shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToGroup}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:text-cyan-600 dark:hover:text-cyan-400 transition-all font-semibold text-xs shrink-0 cursor-pointer shadow-sm group"
            title={`Return to ${groupReturnTitle}`}
            aria-label={`Return to ${groupReturnTitle}`}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Group</span>
          </button>

          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-sm border border-cyan-500/20 ${
                hasCustomImage ? 'bg-slate-700' : getAvatarBg(targetName)
              }`}
            >
              {hasCustomImage ? (
                <img
                  src={otherUser.profileImage}
                  alt={targetName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitials(targetName)}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--lms-surface)]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--lms-text-primary)] leading-tight truncate">
                {targetName}
              </h3>
              {renderRoleBadge()}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--lms-text-muted)] mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Lock size={10} />
                Private 1-on-1 Chat
              </span>
              <span className="text-[var(--lms-border)]">•</span>
              <span className="truncate text-[11px] text-[var(--lms-text-secondary)]">
                from {groupReturnTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <Sparkles size={13} />
            <span>Direct Messaging</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-cyan-500" />
              <p className="text-xs text-[var(--lms-text-secondary)] font-medium">
                Loading private conversation...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md p-6 rounded-3xl bg-[var(--lms-surface)] border border-[var(--lms-border)] shadow-xl">
              <AlertCircle size={32} className="text-rose-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">
                Unable to load chat
              </h4>
              <p className="text-xs text-[var(--lms-text-secondary)] mb-4">{error}</p>
              <button
                onClick={onBackToGroup}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-semibold shadow hover:bg-cyan-600 transition-colors"
              >
                Return to Group Chat
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="p-8 rounded-3xl bg-[var(--lms-surface)]/90 border border-[var(--lms-border)] shadow-2xl backdrop-blur-md max-w-sm flex flex-col items-center animate-fade-in">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg ${
                  hasCustomImage ? 'bg-slate-700' : getAvatarBg(targetName)
                }`}
              >
                {hasCustomImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={targetName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{getInitials(targetName)}</span>
                )}
              </div>

              <h4 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">
                Say hello to {targetName}!
              </h4>
              <p className="text-xs text-[var(--lms-text-secondary)] mb-5 leading-relaxed">
                This is a private one-to-one conversation between you and {targetName}.
                Messages here are completely separate and will never appear in the group chat.
              </p>

              <button
                onClick={() => handleSendMessage(`Hi ${targetName}! 👋`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Send size={13} />
                Send Wave: "Hi {targetName}! 👋"
              </button>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            loading={loading}
            theme={theme}
            onReply={(msg) => setReplyingTo(msg)}
            onReact={handleReact}
            onDelete={handleInitiateDelete}
            onForward={(msg) => onOpenForward && onOpenForward(msg)}
            canDeleteForEveryone={false}
          />
        )}

        <MessageComposer
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSendMessage={handleSendMessage}
          onSendSticker={handleSendSticker}
          onSendFile={handleSendFile}
          sending={false}
          uploading={uploading}
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
      </div>
    </div>
  );
};

export default DirectChatRoom;
