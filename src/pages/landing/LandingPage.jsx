import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FaCheckCircle, FaCalendarAlt, FaUserTie, FaChartLine, FaGavel, FaShieldAlt, FaHeadset, FaBell, FaPaintBrush, FaStar, FaGem, FaArrowRight } from 'react-icons/fa';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

const LandingPage = () => {
    const navigate = useNavigate();

    // Vanta Effect State
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Section Refs for Scrolling
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const flowRef = useRef(null);
    const plansRef = useRef(null);

    useEffect(() => {
        if (!vantaEffect && homeRef.current) {
            setVantaEffect(FOG({
                el: homeRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                highlightColor: 0xffffff, // RCB Bright Red
                midtoneColor: 0xffffff,   // Soft Red
                lowlightColor: 0xff8fab,  // White
                baseColor: 0xffffff,      // White Base
                blurFactor: 0.6,
                speed: 1.5,
                zoom: 1.2
            }));
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="lp-brand">
                    <div className="brand-icon-wrapper">
                        <i className="bi bi-calendar-check-fill"></i>
                    </div>
                    <span>MEHFIL ONE</span>
                </div>

                <div className="lp-nav-links">
                    <span onClick={() => scrollToSection(homeRef)} className="lp-nav-link">Home</span>
                    <span onClick={() => scrollToSection(aboutRef)} className="lp-nav-link">About</span>
                    <span onClick={() => scrollToSection(flowRef)} className="lp-nav-link">User Flow</span>
                    <span onClick={() => scrollToSection(plansRef)} className="lp-nav-link">Plans</span>
                </div>

                <div className="lp-nav-actions">
                    <button onClick={() => navigate('/vendor/register')} className="lp-btn-register">
                        Register
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="lp-hero" ref={homeRef}>
                <div className="lp-hero-container">
                    <div className="lp-hero-text animate-fade-in-up">
                        <div className="lp-badge-wrapper">
                            <span className="lp-badge">
                                <FaStar className="badge-icon" /> New: Simplified Vendor Onboarding
                            </span>
                        </div>
                        <h1 className="lp-hero-title delay-100">
                            Manage Your Venues <br />
                            <span className="text-gradient-red">With Elegance.</span>
                        </h1>
                        <p className="lp-hero-desc delay-200">
                            Mehfil One is the premium platform for elite venue owners and event managers.
                            Streamline bookings, operational excellence, and business growth.
                        </p>

                        <div className="lp-hero-actions delay-300">
                            <button onClick={() => navigate('/vendor/register')} className="lp-btn-hero-primary">
                                Get Started <FaArrowRight style={{ marginLeft: '10px' }} />
                            </button>
                        </div>
                    </div>

                    <div className="lp-hero-visual animate-fade-in-up delay-200">
                        {/* CSS-Only Dashboard Mockup */}
                        <div className="hero-dashboard-mockup">
                            {/* Header of Mockup */}
                            <div className="mockup-header">
                                <div className="mockup-dot red"></div>
                                <div className="mockup-dot yellow"></div>
                                <div className="mockup-dot green"></div>
                            </div>
                            {/* Body of Mockup */}
                            <div className="mockup-body">
                                <div className="mockup-sidebar">
                                    <div
                                        className={`mockup-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('dashboard')}
                                    >
                                        <FaChartLine />
                                    </div>
                                    <div
                                        className={`mockup-menu-item ${activeTab === 'calendar' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('calendar')}
                                    >
                                        <FaCalendarAlt />
                                    </div>
                                    <div
                                        className={`mockup-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <FaUserTie />
                                    </div>
                                    <div className="mockup-menu-item">
                                        <div className="mockup-line w-40"></div>
                                    </div>
                                    <div className="mockup-spacer"></div>
                                    <div className="mockup-menu-item bottom">
                                        <FaGem />
                                    </div>
                                </div>
                                <div className="mockup-content">
                                    {activeTab === 'dashboard' && (
                                        <>
                                            <div className="mockup-card-row">
                                                <div className="mockup-stat-card">
                                                    <FaChartLine className="mockup-icon red" />
                                                    <div className="mockup-line w-60" style={{ marginBottom: '0.4rem', height: '12px', background: 'var(--lp-border)' }}></div>
                                                    <div className="mockup-line w-40"></div>
                                                </div>
                                                <div className="mockup-stat-card">
                                                    <FaCalendarAlt className="mockup-icon red" />
                                                    <div className="mockup-line w-50" style={{ marginBottom: '0.4rem', height: '12px', background: 'var(--lp-border)' }}></div>
                                                    <div className="mockup-line w-30"></div>
                                                </div>
                                            </div>

                                            {/* New Contacts / Inquiries Section */}
                                            <div className="mockup-list-area">
                                                <div className="mockup-list-header">Recent Inquiries</div>
                                                <div className="mockup-list-item">
                                                    <div className="mockup-avatar bg-blue"></div>
                                                    <div className="mockup-line w-70"></div>
                                                </div>
                                                <div className="mockup-list-item">
                                                    <div className="mockup-avatar bg-amber"></div>
                                                    <div className="mockup-line w-50"></div>
                                                </div>
                                                <div className="mockup-list-item">
                                                    <div className="mockup-avatar bg-purple"></div>
                                                    <div className="mockup-line w-60"></div>
                                                </div>
                                            </div>

                                            <div className="mockup-chart-area">
                                                <div className="mockup-bar h-40"></div>
                                                <div className="mockup-bar h-60"></div>
                                                <div className="mockup-bar h-80"></div>
                                                <div className="mockup-bar h-50"></div>
                                                <div className="mockup-bar h-70"></div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'calendar' && (
                                        <div className="mockup-calendar-view" style={{ height: '100%' }}>
                                            <div className="mockup-list-header" style={{ marginBottom: '1rem' }}>Availability</div>
                                            <div className="mockup-calendar-grid">
                                                {[...Array(28)].map((_, i) => (
                                                    <div key={i} className={`calendar-day-placeholder ${[4, 10, 15, 22].includes(i) ? 'booked' : ''}`}></div>
                                                ))}
                                            </div>
                                            <div className="mockup-item-block" style={{ marginTop: '1.5rem', background: 'var(--lp-red-100)', padding: '0.8rem', borderRadius: '8px' }}>
                                                <div className="mockup-line w-60" style={{ background: 'var(--lp-red-600)', marginBottom: '0.4rem' }}></div>
                                                <div className="mockup-line w-40"></div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'profile' && (
                                        <div className="mockup-profile-view" style={{ textAlign: 'center', padding: '1rem' }}>
                                            <div className="mockup-avatar-large" style={{ width: '60px', height: '60px', background: 'var(--lp-red-100)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lp-red-600)' }}>
                                                <FaUserTie size={24} />
                                            </div>
                                            <div className="mockup-line w-60" style={{ margin: '0 auto 1rem', height: '12px', background: 'var(--lp-border)' }}></div>
                                            <div className="mockup-line w-40" style={{ margin: '0 auto 2rem' }}></div>

                                            <div className="mockup-card-row">
                                                <div className="mockup-stat-card">
                                                    <div className="mockup-line w-50" style={{ marginBottom: '0.5rem' }}></div>
                                                    <div className="mockup-line w-30"></div>
                                                </div>
                                                <div className="mockup-stat-card">
                                                    <div className="mockup-line w-50" style={{ marginBottom: '0.5rem' }}></div>
                                                    <div className="mockup-line w-30"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Floating Badge on top of Dashboard */}
                            <div className="mockup-floating-badge">
                                <FaCheckCircle className="text-green" />
                                <span>Verified Venue</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="lp-section" ref={aboutRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Experience Excellence</h2>
                    <p className="lp-section-subtitle">We provide a suite of premium tools designed to elevate your venue business.</p>
                </div>
                <div className="lp-features-grid">
                    {/* 1. Identity & Presence */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaUserTie /></div>
                        <h3>Vendor Profile</h3>
                        <p>Create a stunning digital profile. Showcase your amenities and galleries with high-end presentation.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaPaintBrush /></div>
                        <h3>Custom Branding</h3>
                        <p>Your brand, your identity. Personalize your venue page with custom themes and logos.</p>
                    </div>

                    {/* 2. Operations */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaCalendarAlt /></div>
                        <h3>Smart Calendar</h3>
                        <p>Effortlessly manage your schedule, block dates, and prevent conflicts with our intelligent system.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaBell /></div>
                        <h3>Instant Alerts</h3>
                        <p>Stay ahead with real-time SMS and email notifications for every premium inquiry.</p>
                    </div>

                    {/* 3. Business Growth */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaGem /></div>
                        <h3>Premium Leads</h3>
                        <p>Access a curated list of high-quality leads from verified users to boost your conversion rates.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaShieldAlt /></div>
                        <h3>Secure Payments</h3>
                        <p>Seamless, secure transaction management to ensure your finances are always protected.</p>
                    </div>

                    {/* 4. Insights & Support */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaChartLine /></div>
                        <h3>Growth Analytics</h3>
                        <p>Unlock deep insights into your earnings and booking trends to drive strategic decisions.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaHeadset /></div>
                        <h3>Concierge Support</h3>
                        <p>Our dedicated support team is available 24/7 to assist you with priority service.</p>
                    </div>
                </div>
            </section>

            {/* User Flow Section (Timeline Style) */}
            <section className="lp-section lp-section-alt" ref={flowRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Your Path to Success</h2>
                    <p className="lp-section-subtitle">A refined journey to get you started with Mehfil One.</p>
                </div>
                <div className="lp-timeline-container">
                    <div className="lp-timeline-line"></div>

                    {/* Step 1 */}
                    <div className="lp-timeline-item">
                        <div className="lp-timeline-dot"></div>
                        <div className="lp-timeline-content left">
                            <span className="lp-timeline-number">01</span>
                            <h4>Register</h4>
                            <p>Sign up as a refined vendor and complete your profile with business details.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="lp-timeline-item">
                        <div className="lp-timeline-dot"></div>
                        <div className="lp-timeline-content right">
                            <span className="lp-timeline-number">02</span>
                            <h4>List Venue</h4>
                            <p>Showcase your venue with high-resolution imagery and detailed amenity lists.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="lp-timeline-item">
                        <div className="lp-timeline-dot"></div>
                        <div className="lp-timeline-content left">
                            <span className="lp-timeline-number">03</span>
                            <h4>Get Verified</h4>
                            <p>Gain the trusted badge to attract elite clientele and boost visibility.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="lp-timeline-item">
                        <div className="lp-timeline-dot"></div>
                        <div className="lp-timeline-content right">
                            <span className="lp-timeline-number">04</span>
                            <h4>Manage & Grow</h4>
                            <p>Control bookings from one dashboard and watch your business thrive.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="lp-section" ref={plansRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Exclusive Membership</h2>
                    <p className="lp-section-subtitle">Choose the tier that complements your ambition.</p>
                </div>
                <div className="lp-plans-grid">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                        <div key={plan.id} className={`lp-plan-card ${plan.recommended ? 'recommended' : ''}`}>
                            {plan.recommended && <div className="lp-plan-badge">Most Popular</div>}
                            <h3 className="lp-plan-name">{plan.name}</h3>
                            <div className="lp-plan-price">{plan.currency}{plan.price.toLocaleString()}<span className="period">/ {plan.period}</span></div>
                            <div className="lp-plan-divider"></div>
                            <ul className="lp-plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}><FaCheckCircle className="feature-icon" /> {feature}</li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/vendor/register')} className="lp-btn-plan">
                                Select {plan.name}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-container">
                    <div className="lp-footer-col brand-col">
                        <div className="lp-brand footer-brand">
                            <i className="bi bi-calendar-check-fill"></i>
                            <span>MEHFIL ONE</span>
                        </div>
                        <p className="lp-footer-desc">
                            The premium solution for venue management.
                            Elevating events, one booking at a time.
                        </p>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li onClick={() => scrollToSection(homeRef)}>Home</li>
                            <li onClick={() => scrollToSection(aboutRef)}>About Us</li>
                            <li onClick={() => scrollToSection(plansRef)}>Pricing</li>
                            <li onClick={() => navigate('/vendor/register')}>Register</li>
                        </ul>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li>Help Center</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Vendor Guidelines</li>
                        </ul>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li><FaHeadset className="footer-icon" /> Support 24/7</li>
                            <li><FaBell className="footer-icon" /> +91 98765 43210</li>
                            <li><FaCheckCircle className="footer-icon" /> support@mehfilone.com</li>
                        </ul>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Mehfil One. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
