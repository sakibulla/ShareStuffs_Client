import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { connectSocket, getSocket } from '../utils/socket';

// ── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ user, size = 'w-10', textSize = 'text-sm' }) {
    const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
    return (
        <div className={`avatar ${user?.avatar ? '' : 'placeholder'} flex-shrink-0`}>
            {user?.avatar ? (
                <div className={`${size} rounded-full`}>
                    <img src={user.avatar} alt={user.name} />
                </div>
            ) : (
                <div className={`bg-primary text-primary-content rounded-full ${size}`}>
                    <span className={`${textSize} font-bold`}>{initial}</span>
                </div>
            )}
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

// ── Main Component ────────────────────────────────────────────────────────────

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
    // Track which conversation room the socket is currently in
    const socketRoomRef = useRef(null);

    // ── Socket setup ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const socket = connectSocket(token);

        const handleNewMessage = (msg) => {
            const convId = typeof msg.conversation === 'object'
                ? msg.conversation?._id
                : msg.conversation;

            // Append to active conversation thread
            setActiveConvId((currentId) => {
                if (currentId === convId) {
                    setMessages((prev) => {
                        if (prev.find((m) => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                }
                return currentId;
            });

            // Update conversation list preview
            setConversations((prev) =>
                prev
                    .map((c) =>
                        c._id === convId
                            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
                            : c
                    )
                    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        };

        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [token]);

    // ── Load conversations ────────────────────────────────────────────────────
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

    // ── Initial load + handle ?with= param ───────────────────────────────────
    useEffect(() => {
        const withUserId = searchParams.get('with');
        const requestId = searchParams.get('requestId');

        (async () => {
            const convs = await loadConversations();
            setConversations(convs);

            if (withUserId) {
                // Clear query params immediately
                setSearchParams({}, { replace: true });
                try {
                    const res = await api.post('/messages/conversations', {
                        recipientId: withUserId,
                        requestId: requestId || undefined,
                    });
                    const newConv = res.data;
                    setConversations((prev) => {
                        const exists = prev.find((c) => c._id === newConv._id);
                        if (exists) return prev;
                        return [newConv, ...prev];
                    });
                    setActiveConvId(newConv._id);
                } catch (err) {
                    addToast(err.response?.data?.message || 'Could not open conversation', 'error');
                }
            } else if (convs.length > 0 && !activeConvId) {
                // Auto-select first conversation on desktop
                // (only if no conversation is already active)
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Load messages when active conversation changes ────────────────────────
    useEffect(() => {
        if (!activeConvId) return;

        const socket = getSocket();

        // Leave previous room
        if (socketRoomRef.current && socket) {
            socket.emit('leave_conversation', socketRoomRef.current);
        }
        // Join new room
        if (socket) {
            socket.emit('join_conversation', activeConvId);
            socketRoomRef.current = activeConvId;
        }

        setLoadingMsgs(true);
        setMessages([]);

        api.get(`/messages/conversations/${activeConvId}`)
            .then((res) => setMessages(res.data))
            .catch(() => addToast('Failed to load messages', 'error'))
            .finally(() => setLoadingMsgs(false));
    }, [activeConvId, addToast]);

    // ── Auto-scroll to bottom ─────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!draft.trim() || !activeConvId || sending) return;

        const content = draft.trim();
        setDraft('');
        setSending(true);

        try {
            const res = await api.post(`/messages/conversations/${activeConvId}`, { content });
            setMessages((prev) => {
                if (prev.find((m) => m._id === res.data._id)) return prev;
                return [...prev, res.data];
            });
            setConversations((prev) =>
                prev
                    .map((c) =>
                        c._id === activeConvId
                            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
                            : c
                    )
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

    // ── Derived ───────────────────────────────────────────────────────────────
    const activeConv = conversations.find((c) => c._id === activeConvId);
    const otherParticipant = activeConv?.participants?.find((p) => p._id !== user?._id);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex fade-in">
            {/* ── Conversation list ── */}
            <aside
                className={`${
                    activeConvId ? 'hidden md:flex' : 'flex'
                } flex-col w-full md:w-80 bg-base-100 border-r border-base-300`}
            >
                <div className="p-4 border-b border-base-300">
                    <h1 className="text-xl font-bold">Messages</h1>
                </div>

                {loadingConvs ? (
                    <div className="flex justify-center items-center flex-1">
                        <span className="loading loading-spinner loading-md text-primary" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                        <div className="text-5xl mb-3">💬</div>
                        <p className="font-semibold mb-1">No conversations yet</p>
                        <p className="text-sm text-base-content/50">
                            Go to a request in your Dashboard and click "Message Lender" or "Message Borrower" to start chatting.
                        </p>
                    </div>
                ) : (
                    <ul className="overflow-y-auto flex-1">
                        {conversations.map((conv) => {
                            const other = conv.participants?.find((p) => p._id !== user?._id);
                            const isActive = conv._id === activeConvId;
                            return (
                                <li key={conv._id}>
                                    <button
                                        onClick={() => setActiveConvId(conv._id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-200 ${
                                            isActive ? 'bg-primary/10 border-l-4 border-primary' : ''
                                        }`}
                                    >
                                        <Avatar user={other} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-semibold text-sm truncate">
                                                    {other?.name || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-base-content/40 flex-shrink-0 ml-1">
                                                    {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-base-content/50 truncate">
                                                {conv.lastMessage || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            {/* ── Chat panel ── */}
            <div
                className={`${
                    activeConvId ? 'flex' : 'hidden md:flex'
                } flex-col flex-1 bg-base-200`}
            >
                {!activeConvId ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                        <div className="text-6xl mb-4">💬</div>
                        <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
                        <p className="text-base-content/50">
                            Choose a conversation from the list to start chatting.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300 shadow-sm">
                            {/* Back button — mobile only */}
                            <button
                                className="btn btn-ghost btn-sm btn-circle md:hidden"
                                onClick={() => setActiveConvId(null)}
                                aria-label="Back to conversations"
                            >
                                ←
                            </button>
                            <Avatar user={otherParticipant} />
                            <div>
                                <p className="font-semibold">{otherParticipant?.name || 'Unknown'}</p>
                                {activeConv?.request && (
                                    <p className="text-xs text-base-content/50">Re: rental request</p>
                                )}
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
                                    <p className="text-base-content/50 text-sm">
                                        Say hello to {otherParticipant?.name}!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.sender?._id === user?._id;
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {!isMine && <Avatar user={msg.sender} size="w-7" textSize="text-xs" />}
                                            <div
                                                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                                                    isMine
                                                        ? 'bg-primary text-primary-content rounded-br-sm'
                                                        : 'bg-base-100 text-base-content rounded-bl-sm'
                                                }`}
                                            >
                                                <p className="break-words">{msg.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        isMine ? 'text-primary-content/60' : 'text-base-content/40'
                                                    }`}
                                                >
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 px-4 py-3 bg-base-100 border-t border-base-300"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Type a message…"
                                maxLength={2000}
                                className="input input-bordered flex-1 rounded-full text-sm"
                                aria-label="Message input"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || sending}
                                className="btn btn-primary btn-circle"
                                aria-label="Send message"
                            >
                                {sending ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
