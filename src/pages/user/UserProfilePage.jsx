import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiArrowLeft, 
    FiEdit3, FiAward, FiSettings, FiCalendar, FiCamera, FiX,
    FiCheckCircle, FiClock, FiActivity, FiStar, FiGrid, FiList, FiHome
} from 'react-icons/fi';
import { API_URL } from '../../utils/function';
import './UserProfilePage.css';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'bookings'
    
    const [editData, setEditData] = useState({ fullName: '', profileImage: null });
    const [updating, setUpdating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const baseUrl = API_URL.replace('/api', '');

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

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.id) {
            fetchUserProfile();
            fetchUserBookings(storedUser.id);
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
            alert('Failed to update');
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

                    <a href="/" className="premium-brand">MEHFIL <span className="text-red">ONE</span></a>

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

                                    <button className="btn p-btn-primary w-100 mt-4 d-flex align-items-center justify-content-center gap-2" onClick={() => setShowEditModal(true)}>
                                        <FiEdit3 /> Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabbed Content */}
                    <div className="col-lg-8">
                        {/* Custom Tabs */}
                        <div className="p-tabs-nav shadow-sm mb-4">
                            <button 
                                className={`p-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <FiUser /> Personal Details
                            </button>
                            <button 
                                className={`p-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                <FiActivity /> My Bookings
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
                                            <button className="btn edit-profile-btn" onClick={() => setShowEditModal(true)}>
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
                            ) : (
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
                                                                    <div className="text-end">
                                                                        <span className={`premium-status-pill ${booking.bookingStatus.toLowerCase()}`}>
                                                                            {booking.bookingStatus}
                                                                        </span>
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
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals remain same but with p-classes */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-modal-content shadow-lg border-0">
                            <div className="p-modal-header d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">Edit Profile Info</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="p-modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="text-center mb-4">
                                        <div className="p-avatar-container" style={{width:'110px', height:'110px'}}>
                                            <div className="p-avatar overflow-hidden">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                ) : user.profileImage ? (
                                                    <img src={`${baseUrl}/${user.profileImage}`} alt="Current" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                ) : (
                                                    <FiUser size={30} />
                                                )}
                                            </div>
                                            <label htmlFor="profile-upload" className="btn btn-danger btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow-lg border-2 border-white">
                                                <FiCamera size={14} />
                                                <input type="file" id="profile-upload" hidden onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if(file) {
                                                        setEditData({...editData, profileImage: file});
                                                        setPreviewUrl(URL.createObjectURL(file));
                                                    }
                                                }} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="p-form-label">Display Name</label>
                                        <input type="text" className="form-control p-form-input" value={editData.fullName} onChange={(e) => setEditData({...editData, fullName: e.target.value})} required />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn p-btn-outline flex-grow-1" onClick={() => setShowEditModal(false)}>Discard</button>
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
