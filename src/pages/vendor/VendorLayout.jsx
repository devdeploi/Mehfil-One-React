import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../../utils/function';
import SuperAdminHeader from '../superadmin/SuperAdminHeader'; // Reusing header for now
import '../../styles/superadmin/SuperAdminLayout.css'; // Reusing layout styles

const VendorLayout = () => {
    // Dock Position State: 'bottom' (default), 'left', 'right'
    const [dockPosition, setDockPosition] = useState(() => {
        return localStorage.getItem('vendor-dock-position') || 'bottom';
    });

    // Access Control
    const [userPlan, setUserPlan] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [vendor, setVendor] = useState(null);
    const [isPlanExpired, setIsPlanExpired] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);

    const fetchUnread = async (vendorId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversations/Vendor/${vendorId}`);
            const total = res.data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadCount(total);
        } catch(e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('vendor_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setVendor(user);
            setUserPlan(user.plan || {});
            fetchUnread(user.id || user._id);
            
            // Fetch fresh vendor data for expiry check
            axios.get(`${API_URL}/vendors/${user.id || user._id}`).then(res => {
                const vendorData = res.data;
                setVendor(vendorData);
                let expiryDateStr = vendorData.planExpiryDate;
                if (!expiryDateStr) {
                    const startDate = vendorData.planStartDate || vendorData.createdAt || (vendorData._id ? new Date(parseInt(vendorData._id.substring(0, 8), 16) * 1000) : new Date());
                    const calculatedExpiry = new Date(startDate);
                    calculatedExpiry.setFullYear(calculatedExpiry.getFullYear() + 1);
                    expiryDateStr = calculatedExpiry;
                }

                if (expiryDateStr) {
                    const expiry = new Date(expiryDateStr);
                    const now = new Date();
                    if (now > expiry) {
                        setIsPlanExpired(true);
                        const daysPastExpiry = Math.ceil((now - expiry) / (1000 * 60 * 60 * 24));
                        setIsSuspended(daysPastExpiry > 7);
                    }
                }
            }).catch(e => console.error(e));

            // Connect socket for layout badge
            const socketUrl = API_URL.replace('/api', '');
            const sock = io(socketUrl);
            sock.on('connect', () => {
                sock.emit('join', user.id || user._id);
            });
            sock.on('newMessage', (msg) => {
                // If receiver is me, increment/fetch unread
                if (msg.receiver === (user.id || user._id)) {
                    fetchUnread(user.id || user._id);
                }
            });
            sock.on('allMessagesRead', () => {
                fetchUnread(user.id || user._id);
            });
            sock.on('messageStatusUpdate', () => {
                fetchUnread(user.id || user._id);
            });

            return () => sock.close();
        }
    }, [window.location.pathname]);

    // Dragging State
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const dockRef = useRef(null);

    // Save position preference
    useEffect(() => {
        localStorage.setItem('vendor-dock-position', dockPosition);
    }, [dockPosition]);

    // Pointer Down: Start Dragging
    const handleDragStart = (e) => {
        setIsDragging(true);
        setDragPosition({ x: e.clientX, y: e.clientY });
        document.body.style.userSelect = 'none';
        window.addEventListener('pointermove', handleDragMove);
        window.addEventListener('pointerup', handleDragEnd);
    };

    // Pointer Move: Update "Ghost" Position
    const handleDragMove = (e) => {
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    // Pointer Up: Determine Drop Zone
    const handleDragEnd = (e) => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', handleDragMove);
        window.removeEventListener('pointerup', handleDragEnd);

        const { clientX } = e;
        const width = window.innerWidth;

        if (clientX < width * 0.2) {
            setDockPosition('left');
        } else if (clientX > width * 0.8) {
            setDockPosition('right');
        } else {
            setDockPosition('bottom');
        }
    };

    return (
        <div className={`sa-layout-wrapper ${dockPosition}`}>
            {/* TOP HEADER - Reused */}
            <SuperAdminHeader />

            {/* MAIN CONTENT */}
            <div className={`sa-main-content position-${dockPosition}`}>
                {isPlanExpired && (
                    <div className="alert alert-danger m-3 d-flex align-items-center rounded-3 shadow-sm" role="alert" style={{ borderLeft: '5px solid #dc3545' }}>
                        <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                        <div>
                            <h6 className="fw-bold mb-1">Your subscription plan has expired!</h6>
                            <p className="mb-0 small">
                                {isSuspended 
                                    ? "Your listings are currently suspended and not visible to users. Please make a payment to restore your listings." 
                                    : "Please make a payment within the 7-day grace period to prevent your listings from being suspended."}
                            </p>
                        </div>
                    </div>
                )}
                <div className="container-fluid p-0">
                    <Outlet />
                </div>
            </div>

            {/* DOCK CONTAINER */}
            <nav
                className={`sa-dock-container ${dockPosition} ${isDragging ? 'dragging' : ''}`}
                ref={dockRef}
                style={isDragging ? {
                    position: 'fixed',
                    left: dragPosition.x,
                    top: dragPosition.y,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                } : {}}
            >
                <div className="sa-dock">
                    {/* DRAG HANDLE */}
                    <div
                        className="sa-dock-handle"
                        onPointerDown={handleDragStart}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <i className="bi bi-grip-vertical"></i>
                    </div>

                    <NavLink to="/vendor/dashboard" className="sa-dock-item" end>
                        <i className="bi bi-speedometer2"></i>
                        <span className="sa-dock-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/vendor/profile" className="sa-dock-item">
                        <i className="bi bi-person-badge"></i>
                        <span className="sa-dock-label">Profile</span>
                    </NavLink>

                    <NavLink to="/vendor/mahal-profile" className="sa-dock-item">
                        <i className="bi bi-building"></i>
                        <span className="sa-dock-label">Mahal</span>
                    </NavLink>

                    <NavLink to="/vendor/availability" className="sa-dock-item">
                        <i className="bi bi-calendar-check"></i>
                        <span className="sa-dock-label">Dates</span>
                    </NavLink>

                    <NavLink to="/vendor/bookings" className="sa-dock-item">
                        <i className="bi bi-list-ul"></i>
                        <span className="sa-dock-label">Bookings</span>
                    </NavLink>

                    <NavLink to="/vendor/messages" className="sa-dock-item" style={{ position: 'relative' }}>
                        <i className="bi bi-chat-dots"></i>
                        <span className="sa-dock-label">Messages</span>
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '8px',
                                right: '15px',
                                background: '#dc3545',
                                color: '#fff',
                                borderRadius: '50%',
                                minWidth: '16px',
                                height: '16px',
                                fontSize: '0.58rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                padding: '0 4px',
                                border: '1.5px solid #111'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default VendorLayout;
