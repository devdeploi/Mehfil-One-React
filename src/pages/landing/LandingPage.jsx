import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FaCheckCircle, FaCalendarAlt, FaUserTie, FaChartLine, FaCheckDouble, FaShieldAlt, FaHeadset, FaBell, FaPaintBrush } from 'react-icons/fa';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

const LandingPage = () => {
    const navigate = useNavigate();

    // Vanta Effect State
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null); // Fixed: Missing ref
    const [isScrolled, setIsScrolled] = useState(false); // Fixed: Missing state

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
                highlightColor: 0xfffbeb, // Very Light Amber Highlight
                midtoneColor: 0xfcd34d,   // Light Gold Midtone
                lowlightColor: 0xffffff,  // White Lowlight
                baseColor: 0xffffff,      // White Base
                blurFactor: 0.6,
                speed: 2.0,
                zoom: 1.5
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
            {/* Vanta Background Applied to Hero */}

            {/* Navbar */}
            <nav className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="lp-brand">
                    <i className="bi bi-calendar-check-fill"></i>
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
                <div className="animate-fade-in-up">
                    <span className="lp-badge">🚀 New: Simplified Vendor Onboarding</span>
                </div>
                <h1 className="lp-hero-title animate-fade-in-up delay-100">
                    Manage Your Venues <br />
                    <span>Like a Pro.</span>
                </h1>
                <p className="lp-hero-desc animate-fade-in-up delay-200">
                    Mehfil One is the ultimate platform for venue owners and event managers.
                    Streamline bookings, manage availability, and grow your business with our premium tools.
                </p>

                <div className="animate-fade-in-up delay-300">
                    <button onClick={() => navigate('/vendor/register')} className="lp-btn-hero-primary">
                        Get Started Now
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section className="lp-section lp-section-bg" ref={aboutRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Why Mehfil One?</h2>
                    <p className="lp-section-subtitle">We provide everything you need to manage your venue business efficiently.</p>
                </div>
                <div className="lp-features-grid">
                    {/* 1. Identity & Presence */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaUserTie /></div>
                        <h3>Vendor Profile</h3>
                        <p>Create a stunning digital profile for your venue. Upload galleries, list amenities, and showcase your best work.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaPaintBrush /></div>
                        <h3>Custom Branding</h3>
                        <p>Personalize your venue page with your own branding, logos, and custom color themes.</p>
                    </div>

                    {/* 2. Operations */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaCalendarAlt /></div>
                        <h3>Smart Calendar</h3>
                        <p>Effortlessly manage your booking calendar, block dates, and prevent double bookings with our real-time system.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaBell /></div>
                        <h3>Instant Alerts</h3>
                        <p>Stay updated with real-time SMS and email notifications for every new inquiry and booking.</p>
                    </div>

                    {/* 3. Business Growth */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaCheckDouble /></div>
                        <h3>Verified Leads</h3>
                        <p>Receive high-quality leads from verified users, ensuring genuine inquiries for your venue.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaShieldAlt /></div>
                        <h3>Secure Payments</h3>
                        <p>Seamless transaction management with secure payment gateways to keep your finances safe.</p>
                    </div>

                    {/* 4. Insights & Support */}
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaChartLine /></div>
                        <h3>Growth Analytics</h3>
                        <p>Track your earnings, booking trends, and customer insights to make data-driven decisions.</p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-icon"><FaHeadset /></div>
                        <h3>24/7 Support</h3>
                        <p>Our dedicated support team is available around the clock to assist you with any questions or issues.</p>
                    </div>
                </div>
            </section>

            {/* User Flow Section */}
            <section className="lp-section" ref={flowRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">How It Works</h2>
                    <p className="lp-section-subtitle">Get started with Mehfil One in 8 simple steps.</p>
                </div>
                <div className="lp-steps">
                    {/* Step 1: Subscribe */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">1</div>
                        <h4>Register</h4>
                        <p>Sign up as a vendor, choose a plan, and complete your business profile.</p>
                    </div>

                    {/* Step 2: Onboard */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">2</div>
                        <h4>List Venue</h4>
                        <p>Add your venue details, photos, and availability calendar.</p>
                    </div>

                    {/* Step 3: Verify */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">3</div>
                        <h4>Get Verified</h4>
                        <p>Complete your profile verification to gain trust and attract more premium clients.</p>
                    </div>

                    {/* Step 4: Operate */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">4</div>
                        <h4>Manage Bookings</h4>
                        <p>Use our smart dashboard to track inquiries, schedule events, and handle cancellations.</p>
                    </div>

                    {/* Step 5: Profit */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">5</div>
                        <h4>Start Earning</h4>
                        <p>Receive booking inquiries, manage clients, and grow your revenue.</p>
                    </div>

                    {/* Step 6: Feedback */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">6</div>
                        <h4>Build Reputation</h4>
                        <p>Collect reviews and ratings from satisfied customers to enhance your venue's credibility.</p>
                    </div>

                    {/* Step 7: Analyze */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">7</div>
                        <h4>Grow Business</h4>
                        <p>Leverage analytics and marketing tools to maximize your venue's occupancy.</p>
                    </div>

                    {/* Step 8: Scale */}
                    <div className="lp-step-card active">
                        <div className="lp-step-number">8</div>
                        <h4>Expand Reach</h4>
                        <p>Upgrade to premium plans to get featured listings and reach a wider audience.</p>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="lp-section lp-section-bg" ref={plansRef}>
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Simple Pricing</h2>
                    <p className="lp-section-subtitle">Choose the plan that fits your business needs.</p>
                </div>
                <div className="lp-plans-grid">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                        <div key={plan.id} className={`lp-plan-card ${plan.recommended ? 'recommended' : ''}`}>
                            {plan.recommended && <div className="lp-plan-badge">Best Value</div>}
                            <h3 className="lp-plan-name">{plan.name}</h3>
                            <div className="lp-plan-price">{plan.currency}{plan.price.toLocaleString()}<span>{plan.period}</span></div>
                            <ul className="lp-plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}><FaCheckCircle /> {feature}</li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/vendor/register')} className="lp-btn-plan">
                                Choose {plan.name}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>
                <p>&copy; {new Date().getFullYear()} Mehfil One. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
