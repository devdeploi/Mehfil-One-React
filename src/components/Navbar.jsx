import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiLayers, FiArrowRight, FiShield, FiActivity, FiTag, FiLogIn, FiBriefcase, FiMap } from 'react-icons/fi';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/function';
import GooeyNav from './GooeyNav';

const Navbar = ({ scrollToSection, refs }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversations/User/${userId}`);
            const total = res.data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadCount(total);
        } catch(e) {
            console.error(e);
        }
    };

    useEffect(() => {
        let sock = null;

        const checkUser = () => {
            const storedUser = localStorage.getItem('user') || localStorage.getItem('vendor_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                // Setup socket & fetch for regular user
                const isVendor = !!localStorage.getItem('vendor_user');
                if (!isVendor) {
                    fetchUnread(parsed.id || parsed._id);

                    const socketUrl = API_URL.replace('/api', '');
                    sock = io(socketUrl);
                    sock.on('connect', () => {
                        sock.emit('join', parsed.id || parsed._id);
                    });
                    sock.on('newMessage', (msg) => {
                        if (msg.receiver === (parsed.id || parsed._id)) {
                            fetchUnread(parsed.id || parsed._id);
                        }
                    });
                    sock.on('allMessagesRead', () => {
                        fetchUnread(parsed.id || parsed._id);
                    });
                    sock.on('messageStatusUpdate', () => {
                        fetchUnread(parsed.id || parsed._id);
                    });
                }
            } else {
                setUser(null);
                setUnreadCount(0);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('scroll', handleScroll);
            if (sock) sock.close();
        };
    }, []);

    const isHomePage = location.pathname === '/';

    const handleNavClick = (section) => {
        setMobileMenuOpen(false);
        if (isHomePage && scrollToSection && refs && refs[section]) {
            scrollToSection(refs[section]);
        } else {
            navigate('/');
            setTimeout(() => {
                if (refs && refs[section]) scrollToSection(refs[section]);
            }, 100);
        }
    };

    // Premium Styles Object
    const styles = {
        nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            padding: isScrolled ? '0.6rem 0' : '1.2rem 0',
            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
            background: isScrolled ? 'linear-gradient(90deg, #0f0f0f 0%, #440a0e 40%, #dc3545 100%)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(20px)' : 'none',
            borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
            boxShadow: isScrolled ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)' : 'none',
        },
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 2rem',
        },
        brand: {
            display: 'flex',
            alignItems: 'center',
            gap: window.innerWidth < 768 ? '8px' : '12px',
            textDecoration: 'none',
            cursor: 'pointer',
        },
        brandIcon: {
            width: window.innerWidth < 375 ? '28px' : (window.innerWidth < 768 ? '32px' : '40px'),
            height: window.innerWidth < 375 ? '28px' : (window.innerWidth < 768 ? '32px' : '40px'),
            background: isScrolled ? 'linear-gradient(135deg, #fff, #f8f9fa)' : 'linear-gradient(135deg, #dc3545, #111)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isScrolled ? '#111' : 'white',
            boxShadow: isScrolled ? '0 4px 15px rgba(220, 53, 69, 0.4)' : '0 6px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.4s ease',
        },
        brandText: {
            fontSize: window.innerWidth < 375 ? '0.95rem' : (window.innerWidth < 768 ? '1.1rem' : '1.25rem'),
            fontWeight: 800,
            color: isScrolled ? 'white' : (isHomePage ? '#111' : 'white'),
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'color 0.3s ease',
        },
        navLink: {
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
        },
        actionBtn: {
            padding: '10px 24px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '0.85rem',
            transition: 'all 0.3s',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }
    };

    const navItems = isHomePage ? [
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiHome size={15} /> Home</span>, onClick: () => handleNavClick('home') },
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiMap size={15} /> Mahal's</span>, onClick: () => handleNavClick('venues') },
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiLayers size={15} /> Features</span>, onClick: () => handleNavClick('about') },
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiActivity size={15} /> User Flow</span>, onClick: () => handleNavClick('flow') },
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiTag size={15} /> Pricing</span>, onClick: () => handleNavClick('plans') }
    ] : [
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiHome size={15} /> Home</span>, onClick: () => navigate('/') },
        { label: <span className="d-flex align-items-center gap-2" style={styles.navLink}><FiUser size={15} /> My Dashboard</span>, onClick: () => navigate('/user/profile') }
    ];

    return (
        <>
            <nav style={styles.nav}>
                {/* Scroll Progress Line */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2px',
                    background: isScrolled ? 'rgba(255,255,255,0.4)' : 'linear-gradient(to right, #dc3545, #ff4d4d)',
                    width: `${Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`,
                    transition: 'all 0.3s ease',
                    opacity: isScrolled ? 1 : 0
                }}></div>

                <div className="container" style={styles.container}>
                    {/* Brand Logo - Enhanced with Light Sweep */}
                    <div onClick={() => navigate('/')} style={styles.brand} className="group">
                        <div style={{ ...styles.brandIcon, background: 'transparent', boxShadow: 'none' }} className="brand-icon-sweep">
                            <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="d-flex flex-column">
                            <span style={styles.brandText}>Mehfil One</span>
                            <span style={{
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                color: isScrolled ? 'rgba(255,255,255,0.8)' : '#dc3545',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                marginTop: '-4px',
                                transition: 'color 0.3s ease'
                            }}>Elite Venue Hub</span>
                        </div>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className={`d-none d-lg-flex align-items-center gooey-nav-wrapper ${isScrolled ? 'scrolled' : (isHomePage ? 'light-mode' : 'dark-mode')}`} style={{ flex: 1, justifyContent: 'center' }}>
                        <GooeyNav
                            items={navItems}
                            particleCount={15}
                            particleDistances={[90, 10]}
                            particleR={100}
                            initialActiveIndex={0}
                            animationTime={600}
                            timeVariance={300}
                            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                        />
                    </div>

                    {/* Actions - Far Right */}
                    <div className="d-none d-lg-flex align-items-center gap-3" style={{ justifyContent: 'flex-end', marginLeft: 'auto' }}>
                        {user ? (
                            <button
                                onClick={() => navigate('/user/profile')}
                                style={{
                                    ...styles.actionBtn,
                                    background: isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: isScrolled ? 'white' : '#111',
                                    border: isScrolled ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '4px' }}></div>
                                { (user.name || user.fullName || 'User').split(' ')[0] }
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
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
                                        border: '1.5px solid #fff',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/user/login')}
                                style={{
                                    ...styles.actionBtn,
                                    background: 'transparent',
                                    color: isScrolled ? 'white' : '#111',
                                    fontWeight: 700
                                }}
                            >
                                <FiLogIn className="me-2" size={16} /> Sign In
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/vendor/register')}
                            className="btn-premium-action"
                            style={{
                                ...styles.actionBtn,
                                background: isScrolled ? 'white' : '#dc3545',
                                color: isScrolled ? '#dc3545' : 'white',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                padding: '10px 28px'
                            }}
                        >
                            <FiBriefcase style={{ position: 'relative', zIndex: 2 }} size={16} />
                            <span style={{ position: 'relative', zIndex: 2 }}>Vendor Registration</span>
                            <FiArrowRight size={14} style={{ position: 'relative', zIndex: 2 }} />
                            <div className="btn-sweep"></div>
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="d-lg-none border-0 bg-transparent p-1 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <FiMenu size={24} color={isScrolled ? "#111" : (isHomePage ? "#111" : "white")} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Drawer - Elite Version */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: mobileMenuOpen ? 0 : '-100%',
                    width: '100%',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #440a0e 60%, #dc3545 100%)',
                    backdropFilter: 'blur(30px)',
                    zIndex: 3000,
                    transition: 'right 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header Area */}
                <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-white-50">
                    <div style={styles.brand}>
                        <div style={{ ...styles.brandIcon, width: '32px', height: '32px', background: 'transparent', boxShadow: 'none' }}>
                            <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ ...styles.brandText, fontSize: '1rem', color: 'white' }}>Mehfil One</span>
                    </div>
                    <button
                        className="btn border-0 p-2 shadow-sm rounded-circle bg-white"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ width: '40px', height: '40px' }}
                    >
                        <FiX size={24} color="#111" />
                    </button>
                </div>

                {/* Navigation Links - Staggered */}
                <div className="d-flex flex-column gap-3 mb-auto pt-4">
                    <div className="small text-white-50 fw-bold text-uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>Navigation</div>
                    {[
                        { id: 'home', label: 'Home', icon: <FiHome /> },
                        { id: 'venues', label: "Mahal's", icon: <FiMap /> },
                        { id: 'about', label: 'Features', icon: <FiLayers /> },
                        { id: 'flow', label: 'User Flow', icon: <FiActivity /> },
                        { id: 'plans', label: 'Pricing', icon: <FiTag /> }
                    ].map((item, idx) => (
                        <div
                            key={item.id}
                            className="mobile-nav-item-elite d-flex align-items-center justify-content-between py-3 px-4 rounded-4"
                            style={{
                                animation: mobileMenuOpen ? `slideInRight 0.5s ease forwards ${idx * 0.1}s` : 'none',
                                opacity: 0,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-white opacity-75">{item.icon}</span>
                                <span className="fw-bold h5 mb-0" style={{ letterSpacing: '-0.02em', color: 'white' }}>{item.label}</span>
                            </div>
                            <FiArrowRight size={16} className="text-white opacity-25" />
                        </div>
                    ))}
                </div>

                {/* Action Footer - Glass Cards */}
                <div className="mt-5 d-flex flex-column gap-3">
                    <div className="small text-white-50 fw-bold text-uppercase tracking-widest mb-1" style={{ fontSize: '0.6rem' }}>Account & Business</div>
                    {user ? (
                        <div
                            className="glass-card p-4 rounded-5 d-flex align-items-center gap-4 border-0 shadow-lg"
                            style={{ background: 'rgba(255,255,255,1)', backdropFilter: 'blur(10px)' }}
                            onClick={() => { navigate('/user/profile'); setMobileMenuOpen(false); }}
                        >
                            <div className="p-3 bg-danger rounded-4 text-white"><FiUser size={24} /></div>
                            <div>
                                <div className="fw-bold h6 mb-0" style={{ color: '#111' }}>My Dashboard</div>
                                <div className="small text-muted">Manage your bookings</div>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="btn btn-white w-100 rounded-5 py-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-3 border-0"
                            style={{ background: '#fff', color: '#dc3545' }}
                            onClick={() => { navigate('/user/login'); setMobileMenuOpen(false); }}
                        >
                            <FiLogIn size={20} /> Sign In to Account
                        </button>
                    )}

                    <button
                        className="btn btn-dark w-100 rounded-5 py-4 fw-bold shadow-2xl d-flex align-items-center justify-content-center gap-3"
                        style={{ background: '#111', color: 'white', border: 'none' }}
                        onClick={() => { navigate('/vendor/register'); setMobileMenuOpen(false); }}
                    >
                        <FiBriefcase size={20} /> Vendor Registration
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .mobile-nav-item-elite { transition: all 0.3s; }
                .mobile-nav-item-elite:active { background: rgba(200, 16, 46, 0.08) !important; transform: scale(0.98); }
                
                .nav-premium-link:hover {
                    background: ${isScrolled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(220, 53, 69, 0.08)'};
                    transform: translateY(-1px);
                    color: ${isScrolled ? '#fff' : '#dc3545'} !important;
                }
                
                .nav-premium-link::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: ${isScrolled ? '#fff' : '#dc3545'};
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                    border-radius: 2px;
                }
                
                .nav-premium-link:hover::after {
                    width: 20px;
                }
                
                @keyframes iconSweep {
                    0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.2); }
                    70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }
                .brand-icon-sweep {
                    animation: iconSweep 3s infinite;
                }

                .btn-sweep {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: 0.5s;
                    z-index: 1;
                }
                .btn-premium-action:hover .btn-sweep {
                    left: 100%;
                }

                .mobile-nav-link {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #111;
                    padding: 10px 0;
                    letter-spacing: -0.02em;
                    border-bottom: 1px solid #eee;
                }
                
                .nav-hover-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: ${isScrolled ? 'white' : '#dc3545'};
                    transition: all 0.3s;
                    transform: translateX(-50%);
                }
                .nav-hover-link:hover::after {
                    width: 100%;
                }
                .nav-hover-link:hover {
                    color: ${isScrolled ? 'white' : '#dc3545'} !important;
                }
            `}</style>
        </>
    );
};

export default Navbar;
