import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_URL } from '../../utils/function';
import ChatWindow from '../../components/ChatWindow';
import { FiMessageCircle, FiSearch } from 'react-icons/fi';
import '../../styles/superadmin/Dashboard.css';

const baseUrl = API_URL.replace('/api', '');

const VendorMessages = () => {
    const [vendor, setVendor] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [contactUserId, setContactUserId] = useState(null);
    const [search, setSearch] = useState('');
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('vendor_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setVendor(user);
            fetchConversations(user.id || user._id);
        }
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const contactUser = queryParams.get('contactUser');
        if (contactUser) setContactUserId(contactUser);
    }, [location]);

    const fetchConversations = async (vendorId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversations/Vendor/${vendorId}`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };

    // Socket.io for real-time sidebar updates
    useEffect(() => {
        if (!vendor) return;
        const sock = io(baseUrl);
        sock.on('connect', () => {
            sock.emit('join', vendor.id || vendor._id);
        });

        sock.on('newMessage', (msg) => {
            // Update conversations list with new message
            setConversations(prev => {
                const updated = [...prev];
                const existingIdx = updated.findIndex(c => c.contactId === msg.sender);
                
                if (existingIdx !== -1) {
                    // Update existing
                    updated[existingIdx] = {
                        ...updated[existingIdx],
                        lastMessage: msg.content,
                        timestamp: msg.createdAt,
                        unreadCount: contactUserId === msg.sender ? 0 : (updated[existingIdx].unreadCount || 0) + 1
                    };
                    // Move to top
                    const [item] = updated.splice(existingIdx, 1);
                    return [item, ...updated];
                } else {
                    // New conversation - refresh full list to get names/images
                    fetchConversations(vendor.id || vendor._id);
                    return prev;
                }
            });
        });

        return () => sock.close();
    }, [vendor, contactUserId]);

    const handleSelectContact = (id) => {
        setContactUserId(id);
        // Reset unread count locally
        setConversations(prev => prev.map(c => c.contactId === id ? { ...c, unreadCount: 0 } : c));
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const filteredConversations = conversations.filter(c =>
        c.contactName?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedContact = conversations.find(c => c.contactId === contactUserId);

    if (!vendor) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div className="spinner-border text-primary" />
        </div>
    );

    return (
        <div className="container-fluid" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pt-3">
                <h1 className="sa-dashboard-title mb-0">Vendor Messages</h1>
            </div>
            <div className="d-flex w-100 flex-grow-1 overflow-hidden" style={{ background: '#f7f8fc', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                {/* LEFT SIDEBAR */}
                <div className={`bg-white border-end d-flex flex-column ${contactUserId ? 'd-none d-md-flex' : 'w-100'}`} style={{ width: '320px', minWidth: '280px' }}>
                    {/* Sidebar Header */}
                    <div style={styles.sidebarHeader}>
                        <h5 style={styles.sidebarTitle}>Messages</h5>
                        <div style={styles.sidebarBadge}>{conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) || ''}</div>
                    </div>

                    {/* Search */}
                    <div style={styles.searchWrapper}>
                        <FiSearch size={14} color="#a0aec0" style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    {/* Conversation List */}
                    <div style={styles.convList}>
                        {filteredConversations.length === 0 && !contactUserId ? (
                            <div style={styles.emptyConv}>
                                <FiMessageCircle size={36} color="#c3cfe2" />
                                <p style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>
                                    No conversations yet.<br />Customers will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                {contactUserId && !conversations.find(c => c.contactId === contactUserId) && (
                                    <div style={{ ...styles.convItem, ...styles.convItemActive }}>
                                        <div style={{ ...styles.convAvatar, background: 'linear-gradient(135deg, #ff385c, #e31c5f)' }}>N</div>
                                        <div style={styles.convInfo}>
                                            <div style={styles.convName}>New Customer</div>
                                            <div style={styles.convPreview}>Start a new conversation…</div>
                                        </div>
                                    </div>
                                )}
                                {filteredConversations.map(conv => {
                                    const isActive = contactUserId === conv.contactId;
                                    return (
                                        <div
                                            key={conv.contactId}
                                            style={isActive ? { ...styles.convItem, background: 'rgba(255,56,92,0.05)', borderLeft: '3px solid #ff385c' } : styles.convItem}
                                            onClick={() => handleSelectContact(conv.contactId)}
                                        >
                                            <div style={{ ...styles.convAvatar, background: isActive ? 'linear-gradient(135deg, #ff385c, #e31c5f)' : 'linear-gradient(135deg, #4a5568, #718096)', overflow: 'hidden' }}>
                                                {conv.contactImage ? (
                                                    <img src={`${baseUrl}/${conv.contactImage}`} alt={conv.contactName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    getInitial(conv.contactName)
                                                )}
                                            </div>
                                            <div style={styles.convInfo}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={styles.convName}>{conv.contactName}</div>
                                                    <div style={styles.convTime}>{new Date(conv.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={styles.convPreview}>{conv.lastMessage}</div>
                                                    {conv.unreadCount > 0 && (
                                                        <span style={{ background: 'linear-gradient(135deg, #ff385c, #e31c5f)', color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginLeft: '6px', padding: '0 4px' }}>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT CHAT AREA */}
                <div className={`flex-grow-1 flex-column overflow-hidden ${!contactUserId ? 'd-none d-md-flex' : 'd-flex'}`}>
                    {contactUserId ? (
                        <ChatWindow
                            currentUser={vendor}
                            currentRole="Vendor"
                            contactId={contactUserId}
                            contactName={selectedContact?.contactName || "Customer"}
                            contactImage={selectedContact?.contactImage || null}
                            onBack={() => setContactUserId(null)}
                        />
                    ) : (
                        <div style={styles.noChatSelected}>
                            <div style={styles.noChatIcon}>💬</div>
                            <h5 style={{ color: '#4a5568', fontWeight: 700 }}>Select a Conversation</h5>
                            <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Choose a customer from the list to view messages</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        height: '100%',
        background: '#f7f8fc',
    },
    sidebar: {
        width: '320px',
        minWidth: '280px',
        background: '#fff',
        borderRight: '1px solid #e8ecf5',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    sidebarHeader: {
        padding: '20px 20px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f3fa',
        background: 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)',
    },
    sidebarTitle: {
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.1rem',
        margin: 0,
        letterSpacing: '0.02em',
    },
    sidebarBadge: {
        background: 'rgba(255,255,255,0.25)',
        color: '#fff',
        borderRadius: '12px',
        padding: '2px 10px',
        fontSize: '0.75rem',
        fontWeight: 700,
        minWidth: '24px',
        textAlign: 'center',
    },
    searchWrapper: {
        padding: '12px 16px',
        position: 'relative',
        borderBottom: '1px solid #f0f3fa',
    },
    searchInput: {
        width: '100%',
        background: '#f7f8fc',
        border: '1.5px solid #e8ecf5',
        borderRadius: '20px',
        padding: '8px 16px 8px 34px',
        fontSize: '0.8rem',
        outline: 'none',
        color: '#2d3748',
        boxSizing: 'border-box',
    },
    convList: {
        flex: 1,
        overflowY: 'auto',
    },
    emptyConv: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
    },
    convItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f7f8fc',
        transition: 'background 0.15s',
        background: '#fff',
    },
    convItemActive: {
        background: 'rgba(220,38,38,0.05)',
        borderLeft: '3px solid #dc2626',
    },
    convAvatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        flexShrink: 0,
    },
    convInfo: {
        flex: 1,
        overflow: 'hidden',
    },
    convName: {
        fontWeight: 700,
        fontSize: '0.875rem',
        color: '#2d3748',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    convPreview: {
        fontSize: '0.75rem',
        color: '#a0aec0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginTop: '2px',
    },
    convTime: {
        fontSize: '0.65rem',
        color: '#a0aec0',
        flexShrink: 0,
        marginLeft: '6px',
    },
    unreadBadge: {
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        color: '#fff',
        borderRadius: '12px',
        padding: '2px 7px',
        fontSize: '0.65rem',
        fontWeight: 700,
        flexShrink: 0,
        marginLeft: '6px',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    noChatSelected: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: '#f9fafb',
        textAlign: 'center',
        padding: '40px',
    },
    noChatIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
};

export default VendorMessages;
