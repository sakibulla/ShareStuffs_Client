import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { connectSocket, getSocket } from '../utils/socket';
import { pageTransition } from '../utils/animations';

// ── Helpers ────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'w-10 h-10', textSize = 'text-sm' }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  return user?.avatar ? (
    <img src={user.avatar} alt={user.name} className={`${size} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold ${textSize} flex-shrink-0`}>
      {initial}
    </div>
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function Messages() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRoomRef = useRef(null);

  // Socket setup
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const handleNewMessage = (msg) => {
      const convId = typeof msg.conversation === 'object' ? msg.conversation?._id : msg.conversation;
      setActiveConvId((currentId) => {
        if (currentId === convId) {
          setMessages((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);
        }
        return currentId;
      });
      setConversations((prev) =>
        prev.map((c) => c._id === convId ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt } : c)
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    };
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [token]);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await api.get('/messages/conversations');
      return res.data;
    } catch {
      addToast('Failed to load conversations', 'error');
      return [];
    } finally {
      setLoadingConvs(false);
    }
  }, [addToast]);

  useEffect(() => {
    const withUserId = searchParams.get('with');
    const requestId = searchParams.get('requestId');
    (async () => {
      const convs = await loadConversations();
      setConversations(convs);
      if (withUserId) {
        setSearchParams({}, { replace: true });
        try {
          const res = await api.post('/messages/conversations', { recipientId: withUserId, requestId: requestId || undefined });
          const newConv = res.data;
          setConversations((prev) => prev.find((c) => c._id === newConv._id) ? prev : [newConv, ...prev]);
          setActiveConvId(newConv._id);
        } catch (err) {
          addToast(err.response?.data?.message || 'Could not open conversation', 'error');
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    const socket = getSocket();
    if (socketRoomRef.current && socket) socket.emit('leave_conversation', socketRoomRef.current);
    if (socket) { socket.emit('join_conversation', activeConvId); socketRoomRef.current = activeConvId; }
    setLoadingMsgs(true);
    setMessages([]);
    api.get(`/messages/conversations/${activeConvId}`)
      .then((res) => setMessages(res.data))
      .catch(() => addToast('Failed to load messages', 'error'))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId, addToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConvId || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const res = await api.post(`/messages/conversations/${activeConvId}`, { content });
      setMessages((prev) => prev.find((m) => m._id === res.data._id) ? prev : [...prev, res.data]);
      setConversations((prev) =>
        prev.map((c) => c._id === activeConvId ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() } : c)
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    } catch {
      addToast('Failed to send message', 'error');
      setDraft(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const activeConv = conversations.find((c) => c._id === activeConvId);
  const otherParticipant = activeConv?.participants?.find((p) => p._id !== user?._id);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex"
    >
      {/* ── Conversation list ──────────────────────────────────────────── */}
      <aside className={`${activeConvId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-base-100 border-r border-base-300/60`}>
        <div className="p-4 border-b border-base-300/60">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        {loadingConvs ? (
          <div className="flex justify-center items-center flex-1">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-5xl mb-3">💬</motion.div>
            <p className="font-semibold mb-1 text-sm">No conversations yet</p>
            <p className="text-xs text-base-content/50 leading-relaxed">
              Go to a request in your Dashboard and click "Message" to start chatting.
            </p>
          </div>
        ) : (
          <ul className="overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== user?._id);
              const isActive = conv._id === activeConvId;
              return (
                <li key={conv._id}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-200 ${
                      isActive ? 'bg-primary/8 border-l-[3px] border-primary' : ''
                    }`}
                  >
                    <Avatar user={other} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-sm truncate ${isActive ? 'font-bold text-primary' : 'font-semibold'}`}>
                          {other?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-base-content/40 flex-shrink-0 ml-1">
                          {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-base-content/50 truncate mt-0.5">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* ── Chat panel ────────────────────────────────────────────────── */}
      <div className={`${activeConvId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-base-200`}>
        {!activeConvId ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl mb-4">💬</motion.div>
            <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
            <p className="text-base-content/50 text-sm">Choose a conversation from the list to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300/60 shadow-sm">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="btn btn-ghost btn-sm btn-circle md:hidden"
                onClick={() => setActiveConvId(null)}
                aria-label="Back"
              >
                ←
              </motion.button>
              <Avatar user={otherParticipant} />
              <div>
                <p className="font-semibold text-sm">{otherParticipant?.name || 'Unknown'}</p>
                {activeConv?.request && <p className="text-xs text-base-content/45">Re: rental request</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-4xl mb-2">👋</div>
                  <p className="text-base-content/50 text-sm">Say hello to {otherParticipant?.name}!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, delay: i < 5 ? 0 : 0 }}
                      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isMine && <Avatar user={msg.sender} size="w-7 h-7" textSize="text-xs" />}
                      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMine
                          ? 'bg-primary text-primary-content rounded-br-sm'
                          : 'bg-base-100 text-base-content rounded-bl-sm'
                      }`}>
                        <p className="break-words leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-content/55' : 'text-base-content/40'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-base-100 border-t border-base-300/60">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                maxLength={2000}
                className="input input-bordered flex-1 rounded-full text-sm bg-base-200 border-base-300/60 focus:bg-base-100"
                aria-label="Message input"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!draft.trim() || sending}
                className="btn btn-primary btn-circle shadow-md shadow-primary/20"
                aria-label="Send"
              >
                {sending ? <span className="loading loading-spinner loading-xs" /> : <SendIcon />}
              </motion.button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
