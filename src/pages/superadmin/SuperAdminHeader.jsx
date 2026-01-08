import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const SuperAdminHeader = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userProfile, setUserProfile] = useState({ name: 'Admin User', image: null });

    useEffect(() => {
        const updateProfile = () => {
            const storedUser = localStorage.getItem('vendor_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUserProfile({
                    name: parsed.fullName || parsed.name || 'Admin User',
                    image: parsed.profileImage || null
                });
            }
        };

        updateProfile();
        // Listen for storage events to update header dynamically
        window.addEventListener('storage', updateProfile);
        return () => window.removeEventListener('storage', updateProfile);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('vendor_user');
        setShowLogoutModal(false);
        navigate('/superadmin/login');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            <header className="sa-header">
                <div className="sa-header-brand">
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>MEHFIL ONE</span>
                </div>
                <div className="sa-header-actions">
                    <div className="sa-user-profile">
                        {userProfile.image ? (
                            <img src={userProfile.image} alt="User" />
                        ) : (
                            // The old avatar was hardcoded, now we use a dynamic one or default icon
                            <div className="text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}>
                                <FaUserCircle size={24} />
                            </div>
                        )}
                        <span className="d-none d-md-block">{userProfile.name}</span>
                    </div>
                    <button onClick={handleLogoutClick} className="sa-logout-btn-header" title="Logout">
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="sa-modal-overlay">
                    <div className="sa-modal-content">
                        <div className="sa-modal-header">
                            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                            <h3>Confirm Logout</h3>
                        </div>
                        <p>Are you sure you want to end your session?</p>
                        <div className="sa-modal-actions">
                            <button onClick={cancelLogout} className="btn sa-btn-secondary">Cancel</button>
                            <button onClick={confirmLogout} className="btn sa-btn-danger">Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SuperAdminHeader;
