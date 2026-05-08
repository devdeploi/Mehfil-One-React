import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiLayers, FiArrowRight, FiShield, FiActivity, FiTag, FiLogIn, FiBriefcase, FiMap } from 'react-icons/fi';

const Navbar = ({ scrollToSection, refs }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
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
            background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(15px)' : 'none',
            borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        },
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
            background: 'linear-gradient(135deg, #C8102E, #1a1a1a)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 6px 12px rgba(200, 16, 46, 0.2)',
        },
        brandText: {
            fontSize: window.innerWidth < 375 ? '0.95rem' : (window.innerWidth < 768 ? '1.1rem' : '1.25rem'),
            fontWeight: 800,
            color: isScrolled ? '#111' : (isHomePage ? '#111' : 'white'),
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        },
        navLink: {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isScrolled ? '#333' : (isHomePage ? '#333' : 'rgba(255,255,255,0.9)'),
            textDecoration: 'none',
            padding: '8px 0',
            position: 'relative',
            cursor: 'pointer',
            transition: 'color 0.3s',
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

    return (
        <>
            <nav style={styles.nav}>
                {/* Scroll Progress Line */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2px',
                    background: 'linear-gradient(to right, #C8102E, #ff4d4d)',
                    width: `${Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`,
                    transition: 'width 0.1s ease-out',
                    opacity: isScrolled ? 1 : 0
                }}></div>

                <div className="container" style={styles.container}>
                    {/* Brand Logo - Enhanced with Light Sweep */}
                    <div onClick={() => navigate('/')} style={styles.brand} className="group">
                        <div style={styles.brandIcon} className="brand-icon-sweep">
                            <FiShield size={20} />
                        </div>
                        <div className="d-flex flex-column">
                            <span style={styles.brandText}>Mehfil One</span>
                            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#C8102E', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '-4px' }}>Elite Venue Hub</span>
                        </div>
                    </div>

                    {/* Desktop Navigation - Enhanced with Spotlight */}
                    <div className="d-none d-lg-flex align-items-center" style={{ gap: '10px' }}>
                        {isHomePage ? (
                            <>
                                <span onClick={() => handleNavClick('home')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiHome size={16} /> Home
                                </span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eee' }}></div>
                                <span onClick={() => handleNavClick('venues')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiMap size={16} /> Venues
                                </span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eee' }}></div>
                                <span onClick={() => handleNavClick('about')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiLayers size={16} /> Features
                                </span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eee' }}></div>
                                <span onClick={() => handleNavClick('flow')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiActivity size={16} /> User Flow
                                </span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eee' }}></div>
                                <span onClick={() => handleNavClick('plans')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiTag size={16} /> Pricing
                                </span>
                            </>
                        ) : (
                            <>
                                <span onClick={() => navigate('/')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiHome size={16} /> Home
                                </span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eee' }}></div>
                                <span onClick={() => navigate('/user/profile')} className="nav-spotlight-link d-flex align-items-center gap-2" style={styles.navLink}>
                                    <FiUser size={16} /> My Dashboard
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="d-none d-lg-flex align-items-center gap-3">
                        {user ? (
                            <button 
                                onClick={() => navigate('/user/profile')} 
                                style={{ ...styles.actionBtn, background: 'rgba(255,255,255,0.8)', color: '#333', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)' }}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '4px' }}></div>
                                {user.name.split(' ')[0]}
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/user/login')} 
                                style={{ ...styles.actionBtn, background: 'transparent', color: '#111', fontWeight: 600 }}
                            >
                                <FiLogIn className="me-2" size={16} /> Sign In
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/vendor/register')} 
                            className="btn-premium-action"
                            style={{ ...styles.actionBtn, background: '#111', color: 'white', overflow: 'hidden', position: 'relative' }}
                        >
                            <FiBriefcase style={{ position: 'relative', zIndex: 2 }} size={16} />
                            <span style={{ position: 'relative', zIndex: 2 }}>Vendor Portal</span>
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
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                    backdropFilter: 'blur(30px)',
                    zIndex: 3000,
                    transition: 'right 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header Area */}
                <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-light">
                    <div style={styles.brand}>
                        <div style={{ ...styles.brandIcon, width: '32px', height: '32px' }}><FiShield size={18} /></div>
                        <span style={{ ...styles.brandText, fontSize: '1rem' }}>Mehfil One</span>
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
                    <div className="small text-muted fw-bold text-uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>Navigation</div>
                    {[
                        { id: 'home', label: 'Home', icon: <FiHome /> },
                        { id: 'venues', label: 'Venues', icon: <FiMap /> },
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
                                background: 'rgba(255,255,255,0.4)',
                                border: '1px solid rgba(0,0,0,0.03)',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-danger opacity-75">{item.icon}</span>
                                <span className="fw-bold h5 mb-0" style={{ letterSpacing: '-0.02em', color: '#111' }}>{item.label}</span>
                            </div>
                            <FiArrowRight size={16} className="opacity-25" />
                        </div>
                    ))}
                </div>

                {/* Action Footer - Glass Cards */}
                <div className="mt-5 d-flex flex-column gap-3">
                    <div className="small text-muted fw-bold text-uppercase tracking-widest mb-1" style={{ fontSize: '0.6rem' }}>Account & Business</div>
                    {user ? (
                        <div 
                            className="glass-card p-4 rounded-5 d-flex align-items-center gap-4 border-0 shadow-lg"
                            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                            onClick={() => { navigate('/user/profile'); setMobileMenuOpen(false); }}
                        >
                            <div className="p-3 bg-danger rounded-4 text-white"><FiUser size={24} /></div>
                            <div>
                                <div className="fw-bold h6 mb-0">My Dashboard</div>
                                <div className="small text-muted">Manage your bookings</div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            className="btn btn-white w-100 rounded-5 py-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-3 border"
                            style={{ background: '#fff' }}
                            onClick={() => { navigate('/user/login'); setMobileMenuOpen(false); }}
                        >
                            <FiLogIn size={20} /> Sign In to Account
                        </button>
                    )}
                    
                    <button 
                        className="btn btn-dark w-100 rounded-5 py-4 fw-bold shadow-2xl d-flex align-items-center justify-content-center gap-3"
                        style={{ background: '#111' }}
                        onClick={() => { navigate('/vendor/register'); setMobileMenuOpen(false); }}
                    >
                        <FiBriefcase size={20} /> Access Vendor Portal
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
                
                .nav-spotlight-link {
                    padding: 8px 16px !important;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }
                .nav-spotlight-link {
                    padding: 8px 16px !important;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }
                .nav-spotlight-link:hover {
                    background: rgba(200, 16, 46, 0.05);
                    color: #C8102E !important;
                }
                
                @keyframes iconSweep {
                    0% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(200, 16, 46, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0); }
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
                    background: #C8102E;
                    transition: all 0.3s;
                    transform: translateX(-50%);
                }
                .nav-hover-link:hover::after {
                    width: 100%;
                }
                .nav-hover-link:hover {
                    color: #C8102E !important;
                }
            `}</style>
        </>
    );
};

export default Navbar;
