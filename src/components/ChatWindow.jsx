import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/function';
import { FiSend, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';

// App's color palette — matches the red/dark theme
const PRIMARY = '#ff385c';       // App's main red
const PRIMARY_DARK = '#e31c5f';  // Darker red
const BUBBLE_BG = 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)';
const MSG_BG = '#f4f4f5';        // Light grey for received msgs

const ChatWindow = ({ currentUser, currentRole, contactId, contactName, contactImage, autoMessage, onClearAutoMessage, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const textareaRef = useRef(null);

    // Initialize Socket.io
    useEffect(() => {
        if (!contactId) return;
        const socketUrl = API_URL.replace('/api', '');
        const sock = io(socketUrl);
        socketRef.current = sock;

        sock.on('connect', () => {
            sock.emit('join', currentUser.id || currentUser._id);
            
            // Check initial online status
            sock.emit('checkUserStatus', contactId, (response) => {
                setIsOnline(response?.status === 'online');
            });
        });

        // Listen for status changes
        sock.on('userStatus', ({ userId, status }) => {
            if (userId === contactId) {
                setIsOnline(status === 'online');
            }
        });

        // Listen for new messages
        sock.on('newMessage', (msg) => {
            const myId = currentUser.id || currentUser._id;
            // Only add if this message is from the contact to me
            if (msg.sender === contactId && msg.receiver === myId) {
                setMessages((prev) => [...prev, { ...msg, read: true, delivered: true }]);
                // Mark message as read back to the sender
                sock.emit('readMessage', { messageId: msg._id, senderId: msg.sender });
            }
        });

        // Listen for message status updates (e.g. read/delivered)
        sock.on('messageStatusUpdate', ({ messageId, read, delivered }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, read, delivered } : m));
        });

        // Listen for all messages read
        sock.on('allMessagesRead', ({ readerId }) => {
            if (readerId === contactId) {
                setMessages(prev => prev.map(m => m.sender !== contactId ? { ...m, read: true, delivered: true } : m));
            }
        });

        return () => sock.close();
    }, [currentUser, contactId]);

    // Send markAllRead when entering chat or when messages length changes
    useEffect(() => {
        if (contactId && socketRef.current && messages.length > 0) {
            socketRef.current.emit('markAllRead', { senderId: contactId, receiverId: currentUser.id || currentUser._id });
        }
    }, [contactId, currentUser, messages.length]);

    const sendDirectMessage = async (content) => {
        if (!content.trim() || !contactId) return;
        const myId = currentUser.id || currentUser._id;

        // Optimistic message — show immediately
        const optimistic = {
            _id: `opt_${Date.now()}`,
            sender: myId,
            receiver: contactId,
            content,
            createdAt: new Date().toISOString(),
            optimistic: true
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const res = await axios.post(`${API_URL}/messages/send`, {
                sender: myId,
                senderModel: currentRole,
                receiver: contactId,
                receiverModel: currentRole === 'User' ? 'Vendor' : 'User',
                content
            });
            // Replace optimistic with real message from server
            setMessages(prev => prev.map(m => m._id === optimistic._id ? res.data : m));
        } catch (error) {
            console.error("Failed to send message", error);
            // Remove optimistic on failure
            setMessages(prev => prev.filter(m => m._id !== optimistic._id));
        }
    };

    // Fetch message history
    useEffect(() => {
        if (!contactId) return;
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/messages/history/${currentUser.id || currentUser._id}/${contactId}`);
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };
        fetchHistory();
    }, [contactId, currentUser]);

    // Pre-populate autoMessage in chat input instead of auto-sending
    useEffect(() => {
        if (autoMessage) {
            setNewMessage(autoMessage);
            if (onClearAutoMessage) onClearAutoMessage();
        }
    }, [autoMessage, onClearAutoMessage]);

    // Auto adjust height of textarea as text wrapping increases height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(100, scrollHeight)}px`;
        }
    }, [newMessage]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !contactId || sending) return;
        setSending(true);

        const content = newMessage.trim();
        setNewMessage('');
        await sendDirectMessage(content);
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const isSameDay = (d1, d2) =>
        new Date(d1).toDateString() === new Date(d2).toDateString();

    if (!contactId) {
        return (
            <div style={styles.emptyState}>
                <div style={styles.emptyIcon}><FiMessageCircle size={40} color={PRIMARY} /></div>
                <h5 style={{ color: '#1a1a1a', fontWeight: 700, marginBottom: '8px' }}>No Conversation Selected</h5>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Choose a contact to start messaging.</p>
            </div>
        );
    }

    return (
        <div style={styles.chatContainer}>
            {/* Header */}
            <div style={styles.header}>
                {onBack && (
                    <div className="d-md-none me-2" onClick={onBack} style={{ cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <FiArrowLeft size={20} />
                    </div>
                )}
                <div style={{ ...styles.avatar, overflow: 'hidden' }}>
                    {contactImage ? (
                        <img src={`${API_URL.replace('/api', '')}/${contactImage}`} alt={contactName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        getInitial(contactName)
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={styles.contactName}>{contactName || 'Loading...'}</div>
                    <div style={styles.onlineStatus}>
                        <span style={{ ...styles.onlineDot, background: isOnline ? '#86efac' : '#cbd5e1' }}></span> {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                    <div style={styles.emptyMessages}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
                        <p>No messages yet — say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === (currentUser.id || currentUser._id);
                        const showDate = idx === 0 || !isSameDay(msg.createdAt, messages[idx - 1].createdAt);

                        return (
                            <div key={msg._id || idx}>
                                {showDate && (
                                    <div style={styles.dateDivider}>
                                        <span style={styles.dateDividerText}>
                                            {new Date(msg.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '6px', alignItems: 'flex-end', gap: '8px' }}>
                                    {!isMe && (
                                        <div style={styles.smallAvatar}>{getInitial(contactName)}</div>
                                    )}
                                    <div style={isMe ? styles.myBubble : styles.theirBubble}>
                                        <div style={styles.messageText}>{msg.content}</div>
                                        <div style={{ ...styles.messageTime, color: isMe ? 'rgba(255,255,255,0.65)' : '#9ca3af' }}>
                                            {formatTime(msg.createdAt)}
                                            {isMe && (
                                                <span style={{ marginLeft: '4px', color: msg.read ? '#34b7f1' : (isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8'), opacity: msg.optimistic ? 0.5 : 1, fontSize: '0.75rem' }}>
                                                    {msg.optimistic ? '✓' : (msg.read || msg.delivered ? '✓✓' : '✓')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
                <form onSubmit={handleSendMessage} style={styles.inputForm}>
                    <textarea
                        ref={textareaRef}
                        style={{
                            ...styles.messageInput,
                            resize: 'none',
                            height: '24px',
                            maxHeight: '100px',
                            lineHeight: '1.4',
                            overflowY: 'auto'
                        }}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        style={{
                            ...styles.sendButton,
                            opacity: newMessage.trim() && !sending ? 1 : 0.45,
                            cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                        }}
                        disabled={!newMessage.trim() || sending}
                    >
                        <FiSend size={17} color="#fff" />
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        overflow: 'hidden',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: '#fafafa',
        padding: '40px',
        textAlign: 'center',
    },
    emptyIcon: {
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        background: '#fff1f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '18px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: BUBBLE_BG,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(255,56,92,0.25)',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.35)',
    },
    smallAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontWeight: 700,
        fontSize: '0.7rem',
        flexShrink: 0,
    },
    contactName: {
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.95rem',
    },
    onlineStatus: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '2px',
    },
    onlineDot: {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#86efac',
        display: 'inline-block',
    },
    messagesArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px',
        background: '#f9fafb',
    },
    emptyMessages: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: '80px',
        fontSize: '0.875rem',
    },
    dateDivider: {
        display: 'flex',
        justifyContent: 'center',
        margin: '14px 0',
    },
    dateDividerText: {
        background: '#e5e7eb',
        color: '#6b7280',
        fontSize: '0.68rem',
        fontWeight: 600,
        padding: '3px 12px',
        borderRadius: '20px',
        letterSpacing: '0.04em',
    },
    myBubble: {
        background: BUBBLE_BG,
        color: '#fff',
        borderRadius: '18px 18px 4px 18px',
        padding: '9px 13px',
        maxWidth: '70%',
        boxShadow: '0 2px 6px rgba(255,56,92,0.25)',
    },
    theirBubble: {
        background: '#fff',
        color: '#1f2937',
        borderRadius: '18px 18px 18px 4px',
        padding: '9px 13px',
        maxWidth: '70%',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1px solid #e5e7eb',
    },
    messageText: {
        fontSize: '0.875rem',
        lineHeight: '1.5',
        wordBreak: 'break-word',
    },
    messageTime: {
        fontSize: '0.62rem',
        marginTop: '4px',
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '2px',
    },
    inputArea: {
        padding: '10px 14px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        flexShrink: 0,
    },
    inputForm: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        background: '#f3f4f6',
        borderRadius: '20px',
        padding: '6px 6px 6px 16px',
        border: '1.5px solid #e5e7eb',
    },
    messageInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '0.875rem',
        color: '#1f2937',
        padding: '8px 0',
    },
    sendButton: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: BUBBLE_BG,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'opacity 0.2s',
        boxShadow: '0 2px 8px rgba(255,56,92,0.35)',
    },
};

export default ChatWindow;
