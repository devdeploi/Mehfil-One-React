import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import SuperAdminHeader from '../superadmin/SuperAdminHeader'; // Reusing header for now
import '../../styles/superadmin/SuperAdminLayout.css'; // Reusing layout styles

const VendorLayout = () => {
    // Dock Position State: 'bottom' (default), 'left', 'right'
    const [dockPosition, setDockPosition] = useState(() => {
        return localStorage.getItem('vendor-dock-position') || 'bottom';
    });

    // Access Control
    const [userPlan, setUserPlan] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('vendor_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserPlan(user.plan || {});
        }
    }, []);

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
                </div>
            </nav>
        </div>
    );
};

export default VendorLayout;
