import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminHeader = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('vendor_bookings_v2');
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
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=dc2626&color=fff" alt="User" />
                        <span className="d-none d-md-block">Admin User</span>
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
