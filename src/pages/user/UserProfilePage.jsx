import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiArrowLeft, 
    FiEdit3, FiAward, FiSettings, FiCalendar, FiCamera, FiX,
    FiCheckCircle, FiClock, FiActivity, FiStar, FiGrid, FiList, FiHome, FiHeart, FiXCircle, FiMessageCircle
} from 'react-icons/fi';
import { API_URL } from '../../utils/function';
import { io } from 'socket.io-client';
import ChatWindow from '../../components/ChatWindow';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './UserProfilePage.css';

const UserProfilePage = () => {
    const { toast, showToast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'bookings', 'wishlist', 'messages'
    
    const location = useLocation();
    const [contactVendorId, setContactVendorId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [autoMessage, setAutoMessage] = useState(null);
    
    const baseUrl = API_URL.replace('/api', '');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        const contactVendor = queryParams.get('contactVendor');
        const autoMsg = queryParams.get('autoMessage');
        
        if (tab) setActiveTab(tab);
        if (contactVendor) setContactVendorId(contactVendor);
        if (autoMsg) {
            setAutoMessage(autoMsg);
            const cleanParams = new URLSearchParams(location.search);
            cleanParams.delete('autoMessage');
            navigate({
                pathname: location.pathname,
                search: cleanParams.toString() ? `?${cleanParams.toString()}` : ''
            }, { replace: true });
        }
    }, [location, navigate]);

    const fetchConversations = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversations/User/${userId}`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };

    // Socket.io for real-time sidebar updates
    useEffect(() => {
        if (!user) return;
        const sock = io(baseUrl);
        sock.on('connect', () => {
            sock.emit('join', user.id || user._id);
        });

        sock.on('newMessage', (msg) => {
            setConversations(prev => {
                const updated = [...prev];
                const existingIdx = updated.findIndex(c => c.contactId === msg.sender);
                
                if (existingIdx !== -1) {
                    updated[existingIdx] = {
                        ...updated[existingIdx],
                        lastMessage: msg.content,
                        timestamp: msg.createdAt,
                        unreadCount: contactVendorId === msg.sender ? 0 : (updated[existingIdx].unreadCount || 0) + 1
                    };
                    const [item] = updated.splice(existingIdx, 1);
                    return [item, ...updated];
                } else {
                    fetchConversations(user.id || user._id);
                    return prev;
                }
            });
        });

        return () => sock.close();
    }, [user, contactVendorId]);

    const handleSelectVendor = (id) => {
        setContactVendorId(id);
        setConversations(prev => prev.map(c => c.contactId === id ? { ...c, unreadCount: 0 } : c));
    };

    const [editData, setEditData] = useState({ fullName: '', profileImage: null });
    const [updating, setUpdating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.id) {
                navigate('/user/login');
                return;
            }
            const res = await axios.get(`${API_URL}/users/${storedUser.id}`);
            setUser(res.data);
            setEditData({ fullName: res.data.fullName, profileImage: null });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchUserBookings = async (userId) => {
        try {
            setBookingsLoading(true);
            const res = await axios.get(`${API_URL}/bookings`, { params: { userId, all: 'true' } });
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.error(err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await axios.put(`${API_URL}/bookings/${bookingId}`, { bookingStatus: 'Cancelled' });
            setBookings(bookings.map(b => b._id === bookingId ? { ...b, bookingStatus: 'Cancelled' } : b));
        } catch (err) {
            console.error("Failed to cancel booking", err);
            showToast("Failed to cancel booking. Please try again.", "error");
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.id) {
            fetchUserProfile();
            fetchUserBookings(storedUser.id);
            fetchConversations(storedUser.id);
        } else {
            navigate('/user/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('fullName', editData.fullName);
            if (editData.profileImage) formData.append('profileImage', editData.profileImage);

            const res = await axios.put(`${API_URL}/users/${user._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            const storedUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: res.data.fullName }));
            setShowEditModal(false);
        } catch (err) {
            showToast('Failed to update', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
            <div className="text-center">
                <div className="spinner-border text-danger mb-3" style={{width: '3rem', height: '3rem'}}></div>
                <h4 className="fw-bold text-secondary">Loading your profile...</h4>
            </div>
        </div>
    );

    return (
        <div className="bg-light min-vh-100">
            <Toast toast={toast} />
            {/* Premium Navbar */}
            <nav className="premium-navbar">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="nav-left d-flex align-items-center gap-3">
                        <button onClick={() => navigate('/')} className="nav-icon-btn">
                            <FiHome />
                        </button>
                        <div className="nav-divider"></div>
                        <span className="nav-page-title">User Profile</span>
                    </div>

                    <a href="/" className="premium-brand d-flex align-items-center gap-2 text-decoration-none">
                        <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                        <span>MEHFIL <span className="text-red">ONE</span></span>
                    </a>

                    <div className="nav-right d-flex align-items-center gap-3">
                         <div className="user-nav-profile d-none d-sm-flex align-items-center gap-2">
                            <div className="user-mini-avatar">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <span className="user-nav-name">{user?.fullName?.split(' ')[0] || 'User'}</span>
                         </div>
                         <button className="logout-nav-btn" onClick={() => setShowLogoutModal(true)}>
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container profile-wrapper">
                <div className="row g-5">
                    
                    {/* Left Column: Fixed Profile Info */}
                    <div className="col-lg-4">
                        <div className="p-sidebar-fixed">
                            <div className="p-card text-center">
                                <div className="p-sidebar-header-bg"></div>
                                <div className="p-sidebar-body">
                                    <div className="p-avatar-container">
                                        <div className="p-avatar overflow-hidden">
                                            {user.profileImage ? (
                                                <img src={`${baseUrl}/${user.profileImage}`} alt="User" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                            ) : (
                                                user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <div className="p-status-dot"></div>
                                    </div>
                                    <h2 className="p-user-name mb-1">{user.fullName}</h2>
                                    <p className="text-muted small mb-3">{user.email}</p>
                                    
                                    <span className="p-user-badge mb-4">
                                        <FiAward className="me-1" /> 
                                        {bookings.length === 0 ? 'New Member' : 
                                         bookings.length <= 3 ? 'Active Member' : 
                                         bookings.length <= 10 ? 'Premium Member' : 'Elite VIP Member'}
                                    </span>

                                    <div className="p-stats-grid mt-2">
                                        <div className="p-stat-item w-100">
                                            <span className="p-stat-val text-center">{bookings.length}</span>
                                            <span className="p-stat-label text-center">Successful Bookings</span>
                                        </div>
                                    </div>

                                    <button className="btn p-btn-primary w-100 mt-4 d-flex align-items-center justify-content-center gap-2" onClick={() => { setPreviewUrl(null); setPreviewLoading(false); setShowEditModal(true); }}>
                                        <FiEdit3 /> Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabbed Content */}
                    <div className="col-lg-8">
                        {/* Custom Tabs */}
                        <div className="p-tabs-nav shadow-sm mb-4" style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                className={`p-tab-btn flex-grow-1 ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <FiUser /> Details
                            </button>
                            <button 
                                className={`p-tab-btn flex-grow-1 ${activeTab === 'bookings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                <FiActivity /> Bookings
                            </button>
                            <button 
                                className={`p-tab-btn flex-grow-1 ${activeTab === 'wishlist' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wishlist')}
                            >
                                <FiHeart /> Wishlist
                            </button>
                            <button 
                                className={`p-tab-btn flex-grow-1 ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                <FiMessageCircle /> Messages
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content-area">
                            {activeTab === 'profile' ? (
                                <div className="dashboard-section">
                                    <div className="p-premium-info-card shadow-sm border-0">
                                        <div className="card-header-premium">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="header-icon-box">
                                                    <FiUser />
                                                </div>
                                                <div>
                                                    <h3 className="premium-card-title">Personal Profile</h3>
                                                    <p className="premium-card-subtitle">Manage your personal identification and contact details</p>
                                                </div>
                                            </div>
                                            <button className="btn edit-profile-btn" onClick={() => { setPreviewUrl(null); setPreviewLoading(false); setShowEditModal(true); }}>
                                                <FiEdit3 /> <span>Edit</span>
                                            </button>
                                        </div>
                                        
                                        <div className="card-body-premium">
                                            <div className="info-grid-modern">
                                                <div className="info-item-modern">
                                                    <div className="item-icon"><FiUser /></div>
                                                    <div className="item-data">
                                                        <label>Full Name</label>
                                                        <span>{user.fullName}</span>
                                                    </div>
                                                </div>
                                                <div className="info-item-modern">
                                                    <div className="item-icon"><FiMail /></div>
                                                    <div className="item-data">
                                                        <label>Email Address</label>
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                                <div className="info-item-modern">
                                                    <div className="item-icon"><FiPhone /></div>
                                                    <div className="item-data">
                                                        <label>Phone Number</label>
                                                        <span>{user.phone || 'Not Provided'}</span>
                                                    </div>
                                                </div>
                                                <div className="info-item-modern">
                                                    <div className="item-icon"><FiMapPin /></div>
                                                    <div className="item-data">
                                                        <label>Primary City</label>
                                                        <span>{user.city || 'Not Provided'}</span>
                                                    </div>
                                                </div>
                                                <div className="info-item-modern full-width">
                                                    <div className="item-icon"><FiMapPin /></div>
                                                    <div className="item-data">
                                                        <label>Complete Address</label>
                                                        <span>{user.address || 'Your residential address has not been added yet.'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="profile-security-notice mt-4">
                                                <FiCheckCircle className="text-success" />
                                                <span>Your personal data is encrypted and kept secure as per our privacy policy.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'bookings' ? (
                                <div className="dashboard-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                                        <h3 className="p-section-title mb-0">Booking History</h3>
                                        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2 fw-bold" style={{fontSize: '0.8rem'}}>
                                            {bookings.length} Total Bookings
                                        </span>
                                    </div>

                                    {bookingsLoading ? (
                                        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                            <div className="spinner-border text-danger spinner-border-sm me-2"></div>
                                            <span className="text-muted fw-bold">Loading history...</span>
                                        </div>
                                    ) : bookings.length === 0 ? (
                                        <div className="text-center py-5 border-2 border-dashed rounded-4 bg-white shadow-sm">
                                            <FiCalendar size={48} className="text-muted mb-3 opacity-25" />
                                            <p className="text-muted mb-3 fw-bold">No reservations found.</p>
                                            <button onClick={() => navigate('/')} className="btn p-btn-primary btn-sm px-4">Start Booking</button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-4">
                                            {bookings.map((booking) => (
                                                <div key={booking._id} className="booking-premium-card shadow-sm animate-fade-in">
                                                    <div className="row g-0 align-items-stretch">
                                                        <div className="col-md-4 col-lg-3">
                                                            <div className="booking-card-image-wrapper">
                                                                {booking.mahalId?.coverImage ? (
                                                                    <img src={`${baseUrl}/${booking.mahalId.coverImage}`} alt={booking.mahalId.mahalName} className="booking-card-img" />
                                                                ) : (
                                                                    <div className="booking-card-img-placeholder">
                                                                        <FiCamera size={32} />
                                                                    </div>
                                                                )}
                                                                <div className="booking-type-badge">{booking.bookingType || 'Online'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8 col-lg-9">
                                                            <div className="booking-card-content">
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <div>
                                                                        <h4 className="booking-venue-name">{booking.mahalId?.mahalName || 'Deleted Venue'}</h4>
                                                                        <p className="booking-venue-type text-muted small mb-0">{booking.mahalId?.mahalType || 'Wedding Venue'}</p>
                                                                    </div>
                                                                    <div className="text-end d-flex flex-column align-items-end gap-2">
                                                                        <span className={`premium-status-pill ${booking.bookingStatus.toLowerCase()}`}>
                                                                            {booking.bookingStatus}
                                                                        </span>
                                                                        {booking.bookingStatus === 'Pending' && (
                                                                            <button 
                                                                                className="btn btn-outline-danger btn-sm rounded-pill fw-bold" 
                                                                                style={{ fontSize: '0.65rem', padding: '2px 10px' }}
                                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="booking-details-grid mt-3">
                                                                    <div className="detail-item">
                                                                        <div className="detail-icon"><FiCalendar /></div>
                                                                        <div className="detail-info">
                                                                            <span className="detail-label">Event Date</span>
                                                                            <span className="detail-value">{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="detail-item">
                                                                        <div className="detail-icon"><FiClock /></div>
                                                                        <div className="detail-info">
                                                                            <span className="detail-label">Time Slot</span>
                                                                            <span className="detail-value">{booking.shift}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="detail-item">
                                                                        <div className="detail-icon"><FiActivity /></div>
                                                                        <div className="detail-info">
                                                                            <span className="detail-label">Payment</span>
                                                                            <span className={`detail-value ${booking.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>{booking.paymentStatus}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="booking-card-footer mt-4 d-flex justify-content-between align-items-center pt-3 border-top">
                                                                    <div className="booking-id-tag">ID: #{booking._id.slice(-8).toUpperCase()}</div>
                                                                    <div className="booking-price-display">
                                                                        <span className="price-label">Total Amount</span>
                                                                        <span className="price-value">₹{booking.totalAmount?.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'wishlist' ? (
                                <div className="dashboard-section animate-fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                                        <h3 className="p-section-title mb-0">My Wishlist</h3>
                                        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2 fw-bold" style={{fontSize: '0.8rem'}}>
                                            {user.wishlist?.length || 0} Saved
                                        </span>
                                    </div>

                                    {!user.wishlist || user.wishlist.length === 0 ? (
                                        <div className="text-center py-5 border-2 border-dashed rounded-4 bg-white shadow-sm">
                                            <FiHeart size={48} className="text-muted mb-3 opacity-25" />
                                            <p className="text-muted mb-3 fw-bold">Your wishlist is empty.</p>
                                            <button onClick={() => navigate('/')} className="btn p-btn-primary btn-sm px-4">Explore Venues</button>
                                        </div>
                                    ) : (
                                        <div className="row g-4">
                                            {user.wishlist.map(venue => (
                                                <div key={venue._id} className="col-md-6">
                                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden venue-card-premium cursor-pointer" onClick={() => navigate(`/venue/${venue._id}`)}>
                                                        <div className="position-relative" style={{ height: '180px' }}>
                                                            <img src={`${baseUrl}/${venue.coverImage}`} className="w-100 h-100 object-fit-cover" alt={venue.mahalName} />
                                                            <div className="position-absolute top-0 end-0 p-2">
                                                                <button className="btn btn-light rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center">
                                                                    <FiHeart fill="#dc3545" color="#dc3545" size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="card-body p-3">
                                                            <h6 className="fw-bold mb-1 text-truncate">{venue.mahalName}</h6>
                                                            <div className="d-flex align-items-center text-muted small mb-2 gap-2">
                                                                <FiMapPin className="text-danger" />
                                                                <span className="text-truncate">{venue.city}, {venue.district}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-end mt-3">
                                                                <div>
                                                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>STARTING PRICE</div>
                                                                    <div className="fw-bold text-dark">₹{venue.fullDayPrice?.toLocaleString() || venue.morningPrice?.toLocaleString()}</div>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                                                                    <FiStar className="text-warning" size={12} fill="currentColor" />
                                                                    <span className="small fw-bold">{venue.averageRating || 'New'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'messages' ? (
                <div className="d-flex rounded-4 overflow-hidden border" style={{ height: '70vh', boxShadow: '0 4px 24px rgba(255,56,92,0.08)' }}>
                    {/* Sidebar */}
                    <div className={`bg-white border-end d-flex flex-column ${contactVendorId ? 'd-none d-md-flex' : 'w-100'}`} style={{ width: '300px', minWidth: '280px' }}>
                        <div style={{ padding: '18px 20px 14px', background: 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)', flexShrink: 0 }}>
                            <h5 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '1rem' }}>My Messages</h5>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: '3px' }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {conversations.length === 0 && !contactVendorId ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                                    <FiMessageCircle size={36} color="#c3cfe2" />
                                    <p style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '10px' }}>No conversations yet.<br />Contact a venue manager to start.</p>
                                </div>
                            ) : (
                                <>
                                    {contactVendorId && !conversations.find(c => c.contactId === contactVendorId) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(255,56,92,0.05), rgba(227,28,95,0.05))', borderLeft: '3px solid #ff385c', cursor: 'pointer' }}>
                                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff385c, #e31c5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>N</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2d3748' }}>New Conversation</div>
                                                <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginTop: '2px' }}>Contacting manager...</div>
                                            </div>
                                        </div>
                                    )}
                                    {conversations.map(conv => {
                                        const isActive = contactVendorId === conv.contactId;
                                        const initial = conv.contactName ? conv.contactName.charAt(0).toUpperCase() : '?';
                                        return (
                                            <div
                                                key={conv.contactId}
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f7f8fc', background: isActive ? 'linear-gradient(135deg, rgba(255,56,92,0.05), rgba(227,28,95,0.05))' : '#fff', borderLeft: isActive ? '3px solid #ff385c' : '3px solid transparent' }}
                                                onClick={() => handleSelectVendor(conv.contactId)}
                                            >
                                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: isActive ? 'linear-gradient(135deg, #ff385c, #e31c5f)' : 'linear-gradient(135deg, #4a5568, #718096)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, overflow: 'hidden' }}>
                                                    {conv.contactImage ? (
                                                        <img src={`${baseUrl}/${conv.contactImage}`} alt={conv.contactName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        initial
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.contactName}</div>
                                                        <div style={{ fontSize: '0.62rem', color: '#a0aec0', flexShrink: 0, marginLeft: '6px' }}>{new Date(conv.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                                                        <div style={{ fontSize: '0.73rem', color: '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</div>
                                                        {conv.unreadCount > 0 && <span style={{ background: 'linear-gradient(135deg, #ff385c, #e31c5f)', color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginLeft: '6px', padding: '0 4px' }}>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                    {/* Chat Area */}
                    <div className={`flex-grow-1 flex-column overflow-hidden ${!contactVendorId ? 'd-none d-md-flex' : 'd-flex'}`}>
                        {contactVendorId ? (
                            <ChatWindow
                                currentUser={user}
                                currentRole="User"
                                contactId={contactVendorId}
                                contactName={conversations.find(c => c.contactId === contactVendorId)?.contactName || "Venue Manager"}
                                contactImage={conversations.find(c => c.contactId === contactVendorId)?.contactImage || null}
                                autoMessage={autoMessage}
                                onClearAutoMessage={() => setAutoMessage(null)}
                                onBack={() => setContactVendorId(null)}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(180deg, #f7f8fc 0%, #eef2ff 100%)', textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
                                <h5 style={{ color: '#4a5568', fontWeight: 700 }}>No Chat Selected</h5>
                                <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Select a conversation or contact a venue manager from any venue page.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-modal-content shadow-lg border-0">
                            <div className="p-modal-header d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">Edit Profile Info</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setPreviewUrl(null); setPreviewLoading(false); }}></button>
                            </div>
                            <div className="p-modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="text-center mb-4">
                                        <div className="p-avatar-container" style={{ width: '110px', height: '110px', position: 'relative', top: 'auto', left: 'auto', transform: 'none', margin: '0 auto' }}>
                                            <div className="p-avatar overflow-hidden position-relative">
                                                {previewLoading ? (
                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: '#f1f5f9' }}>
                                                        <div className="spinner-border text-danger" style={{ width: '1.5rem', height: '1.5rem', borderWidth: '3px' }} role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : user.profileImage ? (
                                                    <img src={`${baseUrl}/${user.profileImage}`} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FiUser size={30} />
                                                )}
                                            </div>
                                            {!previewLoading && (
                                                <label htmlFor="profile-upload" className="btn btn-danger btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow-lg border-2 border-white" style={{ cursor: 'pointer' }}>
                                                    <FiCamera size={14} />
                                                    <input type="file" id="profile-upload" hidden onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setPreviewLoading(true);
                                                            setEditData({ ...editData, profileImage: file });
                                                            // 800ms simulated transition loading delay for files
                                                            setTimeout(() => {
                                                                setPreviewUrl(URL.createObjectURL(file));
                                                                setPreviewLoading(false);
                                                            }, 800);
                                                        }
                                                    }} accept="image/*" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="p-form-label">Display Name</label>
                                        <input type="text" className="form-control p-form-input" value={editData.fullName} onChange={(e) => setEditData({...editData, fullName: e.target.value})} required />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn p-btn-outline flex-grow-1" onClick={() => { setShowEditModal(false); setPreviewUrl(null); setPreviewLoading(false); }}>Discard</button>
                                        <button type="submit" className="btn p-btn-primary flex-grow-1" disabled={updating}>
                                            {updating ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content p-modal-content shadow-lg border-0">
                            <div className="p-modal-body text-center py-5">
                                <div className="mb-4 text-danger opacity-75">
                                    <FiLogOut size={56} />
                                </div>
                                <h4 className="fw-bold mb-2">End Session?</h4>
                                <p className="text-muted mb-4 px-3 small">Are you sure you want to log out from your account?</p>
                                <div className="d-flex flex-column gap-2 px-4">
                                    <button className="btn p-btn-primary w-100" onClick={handleLogout}>Log Me Out</button>
                                    <button className="btn p-btn-outline w-100 border-0" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
