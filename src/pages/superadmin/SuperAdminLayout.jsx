import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import SuperAdminHeader from './SuperAdminHeader';
import '../../styles/superadmin/SuperAdminLayout.css';

const SuperAdminLayout = () => {
    // Dock Position State: 'bottom' (default), 'left', 'right'
    const [dockPosition, setDockPosition] = useState(() => {
        return localStorage.getItem('sa-dock-position') || 'bottom';
    });

    // Dragging State
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const dockRef = useRef(null);

    // Save position preference
    useEffect(() => {
        localStorage.setItem('sa-dock-position', dockPosition);
    }, [dockPosition]);

    // Pointer Down: Start Dragging
    const handleDragStart = (e) => {
        // Only allow dragging from the grip handle
        setIsDragging(true);
        setDragPosition({ x: e.clientX, y: e.clientY });

        // Disable text selection during drag
        document.body.style.userSelect = 'none';

        // Add global listeners
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

        // Determine Drop Zone based on release percentage
        const { clientX, clientY } = e;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Left Zone (Left 20%)
        if (clientX < width * 0.2) {
            setDockPosition('left');
        }
        // Right Zone (Right 20%)
        else if (clientX > width * 0.8) {
            setDockPosition('right');
        }
        // Bottom Zone (Anywhere else, typically bottom)
        else {
            setDockPosition('bottom');
        }
    };

    return (
        <div className={`sa-layout-wrapper ${dockPosition}`}>
            {/* TOP HEADER */}
            <SuperAdminHeader />

            {/* MAIN CONTENT */}
            <div className={`sa-main-content position-${dockPosition}`}>
                <div className="container-fluid p-0">
                    <Outlet />
                </div>
            </div>

            {/* DROP ZONES (Visible only when dragging) */}
            {isDragging && (
                <>
                    <div className={`sa-drop-zone zone-left ${dockPosition === 'left' ? 'active' : ''}`}>
                        <i className="bi bi-layout-sidebar-inset"></i>
                    </div>
                    <div className={`sa-drop-zone zone-right ${dockPosition === 'right' ? 'active' : ''}`}>
                        <i className="bi bi-layout-sidebar-inset-reverse"></i>
                    </div>
                    <div className={`sa-drop-zone zone-bottom ${dockPosition === 'bottom' ? 'active' : ''}`}>
                        <i className="bi bi-layout-sidebar-inset-bottom"></i>
                    </div>
                </>
            )}

            {/* DOCK CONTAINER */}
            <nav
                className={`sa-dock-container ${dockPosition} ${isDragging ? 'dragging' : ''}`}
                ref={dockRef}
                style={isDragging ? {
                    position: 'fixed',
                    left: dragPosition.x,
                    top: dragPosition.y,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none' // Let events pass through to document for drop detection
                } : {}}
            >
                <div className="sa-dock">
                    {/* DRAG HANDLE */}
                    <div
                        className="sa-dock-handle"
                        onPointerDown={handleDragStart}
                        style={{ pointerEvents: 'auto' }} // Re-enable pointer events for the handle
                    >
                        <i className="bi bi-grip-vertical"></i>
                    </div>

                    <NavLink to="/superadmin/dashboard" className="sa-dock-item" end>
                        <i className="bi bi-grid-fill"></i>
                        <span className="sa-dock-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/superadmin/vendors" className="sa-dock-item">
                        <i className="bi bi-shop"></i>
                        <span className="sa-dock-label">Vendors</span>
                    </NavLink>
                    <NavLink to="/superadmin/users" className="sa-dock-item">
                        <i className="bi bi-people-fill"></i>
                        <span className="sa-dock-label">Users</span>
                    </NavLink>
                    <NavLink to="/superadmin/payments" className="sa-dock-item">
                        <i className="bi bi-cash-stack"></i>
                        <span className="sa-dock-label">Payments</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default SuperAdminLayout;
