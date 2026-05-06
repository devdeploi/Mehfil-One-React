import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiInfo, FiLayers, FiCreditCard } from 'react-icons/fi';
import './Navbar.css';

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
        // Listen for storage changes (for logout/login sync)
        window.addEventListener('storage', checkUser);
        
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
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
            // Small delay to allow navigation before scrolling
            setTimeout(() => {
                if (refs && refs[section]) scrollToSection(refs[section]);
            }, 100);
        }
    };

    return (
        <nav className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="lp-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <div className="brand-icon-wrapper">
                    <i className="bi bi-calendar-check-fill"></i>
                </div>
                <span>MEHFIL ONE</span>
            </div>

            {/* Desktop Links */}
            <div className="lp-nav-links desktop-only">
                {isHomePage ? (
                    <>
                        <span onClick={() => handleNavClick('home')} className="lp-nav-link">Home</span>
                        <span onClick={() => handleNavClick('about')} className="lp-nav-link">About</span>
                        <span onClick={() => handleNavClick('flow')} className="lp-nav-link">User Flow</span>
                        <span onClick={() => handleNavClick('plans')} className="lp-nav-link">Plans</span>
                    </>
                ) : (
                    <>
                        <span onClick={() => navigate('/')} className="lp-nav-link">Home</span>
                        <span onClick={() => navigate('/user/profile')} className="lp-nav-link">Profile</span>
                    </>
                )}
            </div>

            <div className="lp-nav-actions desktop-only">
                {user ? (
                    <button onClick={() => navigate('/user/profile')} className="lp-btn-login premium-nav-btn">
                        <FiUser /> Profile
                    </button>
                ) : (
                    <button onClick={() => navigate('/user/login')} className="lp-btn-login">
                        User Login
                    </button>
                )}
                <button onClick={() => navigate('/vendor/register')} className="lp-btn-register-premium">
                    Vendor Portal
                </button>
            </div>

            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    {isHomePage ? (
                        <>
                            <div className="mobile-nav-item" onClick={() => handleNavClick('home')}><FiHome /> Home</div>
                            <div className="mobile-nav-item" onClick={() => handleNavClick('about')}><FiInfo /> About</div>
                            <div className="mobile-nav-item" onClick={() => handleNavClick('flow')}><FiLayers /> User Flow</div>
                            <div className="mobile-nav-item" onClick={() => handleNavClick('plans')}><FiCreditCard /> Plans</div>
                        </>
                    ) : (
                        <div className="mobile-nav-item" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}><FiHome /> Home</div>
                    )}
                    
                    <div className="mobile-divider"></div>
                    
                    {user ? (
                        <div className="mobile-nav-item highlight" onClick={() => { navigate('/user/profile'); setMobileMenuOpen(false); }}>
                            <FiUser /> My Profile
                        </div>
                    ) : (
                        <div className="mobile-nav-item highlight" onClick={() => { navigate('/user/login'); setMobileMenuOpen(false); }}>
                            User Login
                        </div>
                    )}
                    <div className="mobile-nav-item portal" onClick={() => { navigate('/vendor/register'); setMobileMenuOpen(false); }}>
                        Vendor Portal
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
