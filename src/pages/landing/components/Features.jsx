import React, { useState, useRef } from 'react';
import {
    FaUserTie, FaPaintBrush, FaCalendarAlt, FaBell,
    FaGem, FaShieldAlt, FaChartLine, FaHeadset, FaMobileAlt
} from 'react-icons/fa';

const features = [
    { icon: <FaGem />,        title: 'Premium Leads',      description: 'Access a curated list of high-quality leads from verified users to boost your conversion rates.',          glow: 'rgba(220,53,69,0.6)' },
    { icon: <FaChartLine />,  title: 'Growth Analytics',   description: 'Unlock deep insights into your earnings and booking trends to drive strategic decisions.',                   glow: 'rgba(255,100,120,0.55)' },
    { icon: <FaShieldAlt />,  title: 'Secure Payments',    description: 'Seamless, secure transaction management to ensure your finances are always protected.',                      glow: 'rgba(180,30,50,0.55)' },
    { icon: <FaCalendarAlt />,title: 'Smart Calendar',     description: 'Manage your schedule, block dates, and prevent conflicts with our intelligent booking system.',              glow: 'rgba(220,53,69,0.6)' },
    { icon: <FaUserTie />,    title: 'Vendor Profile',     description: 'Create a stunning digital profile showcasing your amenities and galleries with premium presentation.',        glow: 'rgba(255,80,100,0.55)' },
    { icon: <FaPaintBrush />, title: 'Custom Branding',    description: 'Your brand, your identity. Personalize your venue page with custom themes and logos.',                       glow: 'rgba(200,40,60,0.55)' },
    { icon: <FaBell />,       title: 'Instant Alerts',     description: 'Stay ahead with real-time SMS and email notifications for every premium inquiry received.',                   glow: 'rgba(220,53,69,0.6)' },
    { icon: <FaHeadset />,    title: 'Concierge Support',  description: 'Our dedicated support team is available 24/7 to assist you with priority service.',                          glow: 'rgba(255,100,120,0.55)' },
    { icon: <FaMobileAlt />,  title: 'Mobile Management',  description: 'Manage bookings and inquiries on the go with our fully responsive mobile-first platform.',                    glow: 'rgba(180,30,50,0.55)' },
];

const TiltCard = ({ feature, index }) => {
    const ref = useRef(null);
    const [style, setStyle] = useState({});
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
    const [active, setActive] = useState(false);

    const handleMouseMove = (e) => {
        const card = ref.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -10;
        const rotateY = ((x - cx) / cx) * 10;
        setStyle({
            transform: `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`,
        });
        setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const handleMouseLeave = () => {
        setStyle({ transform: 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)' });
        setActive(false);
    };

    return (
        <div
            ref={ref}
            className="fc2-card"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={handleMouseLeave}
            style={style}
        >
            {/* Mouse-follow spotlight */}
            <div
                className="fc2-spotlight"
                style={{
                    background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${feature.glow} 0%, transparent 60%)`,
                    opacity: active ? 1 : 0,
                }}
            />

            {/* Card content */}
            <div className="fc2-card-inner">
                {/* Icon */}
                <div className="fc2-icon-wrap">
                    <div className="fc2-icon-glow" style={{ boxShadow: active ? `0 0 40px 10px ${feature.glow}` : 'none' }} />
                    <div className="fc2-icon">{feature.icon}</div>
                </div>

                {/* Index */}
                <span className="fc2-num">{String(index + 1).padStart(2, '0')}</span>

                <h3 className="fc2-title">{feature.title}</h3>
                <p className="fc2-desc">{feature.description}</p>
            </div>

            {/* Glass border shine */}
            <div className="fc2-border-shine" style={{ opacity: active ? 1 : 0 }} />
        </div>
    );
};

const Features = ({ aboutRef }) => {
    return (
        <section ref={aboutRef} className="fc2-section">
            {/* Floating particles background */}
            <div className="fc2-grid-pattern">
                {[
                    { w:4,  left:'8%',   top:'20%', dur:'7s',  delay:'0s'   },
                    { w:3,  left:'18%',  top:'70%', dur:'9s',  delay:'1.2s' },
                    { w:5,  left:'30%',  top:'40%', dur:'6s',  delay:'0.5s' },
                    { w:3,  left:'45%',  top:'15%', dur:'11s', delay:'2s'   },
                    { w:4,  left:'55%',  top:'80%', dur:'8s',  delay:'0.8s' },
                    { w:6,  left:'65%',  top:'35%', dur:'10s', delay:'1.5s' },
                    { w:3,  left:'75%',  top:'60%', dur:'7s',  delay:'3s'   },
                    { w:5,  left:'85%',  top:'25%', dur:'9s',  delay:'0.3s' },
                    { w:4,  left:'92%',  top:'75%', dur:'6s',  delay:'2.5s' },
                    { w:3,  left:'22%',  top:'90%', dur:'8s',  delay:'1s'   },
                    { w:5,  left:'50%',  top:'55%', dur:'12s', delay:'0.7s' },
                    { w:4,  left:'38%',  top:'82%', dur:'7s',  delay:'1.8s' },
                ].map((p, i) => (
                    <span key={i} className="fc2-particle" style={{
                        width: p.w, height: p.w,
                        left: p.left, top: p.top,
                        animationDuration: p.dur,
                        animationDelay: p.delay,
                    }} />
                ))}
            </div>

            {/* Ambient light orbs */}
            <div className="fc2-orb fc2-orb-1" />
            <div className="fc2-orb fc2-orb-2" />
            <div className="fc2-orb fc2-orb-3" />

            <div className="fc2-container">
                {/* Header */}
                <div className="fc2-header">
                    <span className="fc2-pill">FEATURES</span>
                    <h2 className="fc2-heading">
                        Experience <span className="fc2-red">Excellence</span>
                    </h2>
                    <p className="fc2-sub">
                        A suite of premium tools designed to elevate your venue business.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="fc2-grid">
                    {features.map((f, i) => (
                        <TiltCard key={i} feature={f} index={i} />
                    ))}
                </div>
            </div>

            <style>{`
                /* ── Section ── */
                .fc2-section {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(150deg, #fce8ea 0%, #fdf5f5 40%, #f9e4e7 100%);
                    padding: 120px 5%;
                    font-family: 'Outfit', sans-serif;
                }

                /* Floating particles */
                .fc2-grid-pattern {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                .fc2-grid-pattern::before,
                .fc2-grid-pattern::after {
                    content: '';
                    position: absolute;
                    border-radius: 50%;
                }

                /* Scattered dot particles via multiple box-shadows */
                .fc2-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(220,53,69,0.25);
                    animation: fc2-float linear infinite;
                    pointer-events: none;
                }
                @keyframes fc2-float {
                    0%   { transform: translateY(0px) scale(1);   opacity: 0; }
                    15%  { opacity: 1; }
                    85%  { opacity: 0.6; }
                    100% { transform: translateY(-120px) scale(0.6); opacity: 0; }
                }

                /* Ambient orbs */
                .fc2-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                }
                .fc2-orb-1 {
                    width: 600px; height: 600px;
                    top: -180px; right: -120px;
                    background: rgba(220,53,69,0.22);
                }
                .fc2-orb-2 {
                    width: 480px; height: 480px;
                    bottom: -120px; left: -100px;
                    background: rgba(180,20,40,0.18);
                }
                .fc2-orb-3 {
                    width: 360px; height: 360px;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(220,53,69,0.12);
                }

                /* Container */
                .fc2-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                /* Header */
                .fc2-header {
                    text-align: center;
                    margin-bottom: 72px;
                }
                .fc2-pill {
                    display: inline-block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #dc3545;
                    background: rgba(220,53,69,0.08);
                    border: 1px solid rgba(220,53,69,0.2);
                    padding: 6px 20px;
                    border-radius: 999px;
                    margin-bottom: 20px;
                }
                .fc2-heading {
                    font-size: clamp(2rem, 4vw, 3.2rem);
                    font-weight: 800;
                    color: #1a0608;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    margin: 0 0 14px;
                }
                .fc2-red {
                    background: linear-gradient(135deg, #dc3545, #ff6b7a);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .fc2-sub {
                    color: #7a3a40;
                    font-size: 1rem;
                    max-width: 460px;
                    margin: 0 auto;
                    line-height: 1.8;
                }

                /* Grid */
                .fc2-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                /* ── Tilt Card ── */
                .fc2-card {
                    position: relative;
                    border-radius: 22px;
                    padding: 2px;
                    cursor: default;
                    transition: transform 0.12s ease-out;
                    background: linear-gradient(135deg, rgba(220,53,69,0.35), rgba(180,30,50,0.1));
                    box-shadow: 0 8px 32px rgba(180,30,50,0.18), 0 2px 8px rgba(0,0,0,0.08);
                    overflow: hidden;
                }

                /* Mouse-follow spotlight */
                .fc2-spotlight {
                    position: absolute;
                    inset: 0;
                    border-radius: 22px;
                    pointer-events: none;
                    transition: opacity 0.3s;
                    z-index: 0;
                }

                /* Inner content */
                .fc2-card-inner {
                    position: relative;
                    z-index: 2;
                    background: rgba(255, 248, 248, 0.88);
                    border-radius: 20px;
                    padding: 32px 26px;
                    height: 100%;
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(220,53,69,0.1);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
                }

                /* Border shine on hover */
                .fc2-border-shine {
                    position: absolute;
                    inset: 0;
                    border-radius: 22px;
                    border: 1px solid rgba(220,53,69,0.45);
                    pointer-events: none;
                    transition: opacity 0.3s;
                    z-index: 3;
                }

                /* Icon */
                .fc2-icon-wrap {
                    position: relative;
                    width: 58px;
                    height: 58px;
                    margin-bottom: 20px;
                }
                .fc2-icon-glow {
                    position: absolute;
                    inset: 0;
                    border-radius: 16px;
                    transition: box-shadow 0.3s;
                }
                .fc2-icon {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    color: #dc3545;
                    background: rgba(220,53,69,0.1);
                    border: 1px solid rgba(220,53,69,0.2);
                    border-radius: 16px;
                    transition: background 0.3s, color 0.3s, box-shadow 0.3s;
                }
                .fc2-card:hover .fc2-icon {
                    background: #dc3545;
                    color: #fff;
                    box-shadow: 0 6px 20px rgba(220,53,69,0.35);
                }

                /* Step number */
                .fc2-num {
                    position: absolute;
                    top: 18px;
                    right: 22px;
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: rgba(220,53,69,0.07);
                    letter-spacing: -0.04em;
                    line-height: 1;
                    user-select: none;
                    pointer-events: none;
                }

                /* Text */
                .fc2-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #1a0608;
                    letter-spacing: -0.015em;
                    margin: 0 0 10px;
                }
                .fc2-desc {
                    font-size: 0.875rem;
                    color: #7a3a40;
                    line-height: 1.75;
                    margin: 0;
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .fc2-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 640px) {
                    .fc2-section { padding: 80px 5%; }
                    .fc2-header  { margin-bottom: 44px; }
                    .fc2-grid    { grid-template-columns: 1fr; gap: 14px; }
                    .fc2-card-inner { padding: 26px 20px; }
                }
            `}</style>
        </section>
    );
};

export default Features;
