import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiArrowLeft, FiEdit3, FiAward, FiSettings, FiCalendar, FiCamera, FiX } from 'react-icons/fi';
import { API_URL } from '../../utils/function';
import './UserProfilePage.css';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Edit Form State
    const [editData, setEditData] = useState({
        fullName: '',
        profileImage: null
    });
    const [updating, setUpdating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Get Base URL for images
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
            console.error('Error fetching profile:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData({ ...editData, profileImage: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('fullName', editData.fullName);
            if (editData.profileImage) {
                formData.append('profileImage', editData.profileImage);
            }

            const res = await axios.put(`${API_URL}/users/${user._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(res.data);
            // Update local storage name if changed
            const storedUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: res.data.fullName }));
            
            setShowEditModal(false);
            setPreviewUrl(null);
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="profile-page-container d-flex align-items-center justify-content-center"><h3>Loading Profile...</h3></div>;
    if (!user) return null;

    return (
        <div className="profile-page-container">
            {/* Premium Navbar */}
            <nav className="profile-nav">
                <div className="container d-flex justify-content-between align-items-center">
                    <button onClick={() => navigate('/')} className="nav-action-btn">
                        <FiArrowLeft /> <span>Return Home</span>
                    </button>
                    <div className="profile-brand">MEHFIL ONE</div>
                    <button className="nav-action-btn" title="Settings">
                        <FiSettings />
                    </button>
                </div>
            </nav>

            <main className="profile-content container">
                <div className="premium-profile-wrapper animate-pop">
                    
                    {/* Left Side: Avatar & Tier */}
                    <aside className="sidebar-profile-card">
                        <div className="avatar-container">
                            <div className="main-avatar overflow-hidden">
                                {user.profileImage ? (
                                    <img src={`${baseUrl}/${user.profileImage}`} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                ) : (
                                    user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="status-indicator"></div>
                        </div>
                        
                        <div className="sidebar-user-info">
                            <h2>{user.fullName}</h2>
                            <div className="membership-tier">
                                <FiAward /> Elite Member
                            </div>
                        </div>

                        <div className="sidebar-stats">
                            <div className="stat-item">
                                <span className="stat-val">12</span>
                                <span className="stat-label">Bookings</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">4.9</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                        
                        <button className="nav-action-btn w-100 mt-5" style={{justifyContent: 'center', background: '#f8fafc'}} onClick={() => setShowEditModal(true)}>
                            <FiEdit3 /> Edit Profile
                        </button>
                    </aside>

                    {/* Right Side: Detailed Info */}
                    <section className="main-details-card">
                        <div className="section-header">
                            <h3>Account Information</h3>
                            <div className="membership-tier" style={{background: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9'}}>
                                <FiCalendar /> Joined {new Date(user.createdAt).getFullYear()}
                            </div>
                        </div>

                        <div className="premium-grid">
                            <div className="premium-info-box">
                                <FiUser className="box-icon" />
                                <span className="box-label">Full Name</span>
                                <div className="box-value">{user.fullName}</div>
                            </div>

                            <div className="premium-info-box">
                                <FiMail className="box-icon" />
                                <span className="box-label">Email Address</span>
                                <div className="box-value">{user.email}</div>
                            </div>

                            <div className="premium-info-box">
                                <FiPhone className="box-icon" />
                                <span className="box-label">Mobile Number</span>
                                <div className="box-value">{user.phone || 'Not Provided'}</div>
                            </div>

                            <div className="premium-info-box">
                                <FiMapPin className="box-icon" />
                                <span className="box-label">Current City</span>
                                <div className="box-value">{user.city || 'Not Provided'}</div>
                            </div>

                            <div className="premium-info-box full-width">
                                <FiMapPin className="box-icon" />
                                <span className="box-label">Full Address</span>
                                <div className="box-value">{user.address || 'Address information not available'}</div>
                            </div>
                        </div>

                        <div className="logout-container">
                            <button className="btn-premium-logout" onClick={() => setShowLogoutModal(true)}>
                                <FiLogOut /> Logout Securely
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="premium-modal animate-pop" style={{maxWidth: '550px'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="m-0">Edit Profile</h3>
                            <button className="btn border-0 p-0" onClick={() => setShowEditModal(false)}><FiX size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleUpdate}>
                            <div className="text-center mb-4">
                                <div className="avatar-container mx-auto mb-3" style={{width: '120px', height: '120px'}}>
                                    <div className="main-avatar overflow-hidden">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                        ) : user.profileImage ? (
                                            <img src={`${baseUrl}/${user.profileImage}`} alt="Current" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                        ) : (
                                            <FiUser size={40} />
                                        )}
                                    </div>
                                    <label htmlFor="profile-upload" className="status-indicator d-flex align-items-center justify-content-center bg-danger border-0 text-white cursor-pointer" style={{width: '32px', height: '32px', bottom: '0', right: '0', cursor:'pointer'}}>
                                        <FiCamera size={16} />
                                        <input type="file" id="profile-upload" hidden onChange={handleFileChange} accept="image/*" />
                                    </label>
                                </div>
                                <p className="small text-muted">Upload a professional profile picture</p>
                            </div>

                            <div className="text-start mb-4">
                                <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
                                <div className="position-relative">
                                    <FiUser className="position-absolute translate-middle-y top-50 start-0 ms-3 text-muted" />
                                    <input 
                                        type="text" 
                                        className="form-control ps-5 py-3 rounded-4" 
                                        value={editData.fullName}
                                        onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                        placeholder="Your Full Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-btn-group">
                                <button type="button" className="btn-m-cancel" onClick={() => setShowEditModal(false)}>Discard</button>
                                <button type="submit" className="btn-m-confirm" disabled={updating}>
                                    {updating ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="premium-modal animate-pop">
                        <div className="modal-icon-glow"><FiLogOut /></div>
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to log out of your session? You will need to sign in again to access your bookings.</p>
                        <div className="modal-btn-group">
                            <button className="btn-m-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn-m-confirm" onClick={handleLogout}>Confirm Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
