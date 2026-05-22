import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowRight, FaRocket, FaShieldAlt, FaCheckCircle, FaPlay } from 'react-icons/fa';
import Lanyard from './Lanyard';

const STATS = [
    { value: '500+', label: 'Elite Venues' },
    { value: '10K+', label: 'Events Hosted' },
    { value: '98%',  label: 'Satisfaction' },
];

const TRUST_ITEMS = [
    'No credit card required',
    'Setup in minutes',
    'Cancel anytime',
];

const Hero = ({ homeRef, activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const blobRef = useRef(null);

    /* Parallax blob on mouse move */
    useEffect(() => {
        const move = (e) => {
            if (!blobRef.current) return;
            const x = (e.clientX / window.innerWidth  - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;
            blobRef.current.style.transform = `translate(${x}px, ${y}px)`;
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <section ref={homeRef} className="hero-section">
            {/* ── Background ── */}
            <div className="hero-bg-layer" />

            {/* Parallax blob */}
            <div ref={blobRef} className="hero-parallax-blob" />

            {/* Floating particles */}
            <div className="hero-particles">
                {[
                    { w:5, l:'8%',  t:'18%', d:'8s',  delay:'0s'   },
                    { w:3, l:'15%', t:'72%', d:'10s', delay:'1.2s' },
                    { w:6, l:'80%', t:'22%', d:'7s',  delay:'0.5s' },
                    { w:4, l:'88%', t:'65%', d:'9s',  delay:'2s'   },
                    { w:3, l:'50%', t:'88%', d:'11s', delay:'0.8s' },
                    { w:5, l:'35%', t:'10%', d:'8s',  delay:'1.5s' },
                ].map((p, i) => (
                    <span key={i} className="hero-particle" style={{
                        width: p.w, height: p.w,
                        left: p.l, top: p.t,
                        animationDuration: p.d,
                        animationDelay: p.delay,
                    }} />
                ))}
            </div>

            <div className="hero-container">
                <div className="hero-layout">

                    {/* ── LEFT: Content ── */}
                    <div className="hero-content">

                        {/* Badge */}
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            <FaStar style={{ fontSize: '0.6rem', color: '#dc3545' }} />
                            THE GOLD STANDARD FOR VENUES
                        </div>

                        {/* Heading */}
                        <h1 className="hero-title">
                            Scale Your<br />
                            <span className="hero-title-accent">Venue Empire.</span>
                        </h1>

                        {/* Description */}
                        <p className="hero-desc">
                            The definitive platform for high-end venue management.
                            Automate operations, maximize revenue, and deliver
                            extraordinary events with Mehfil One's elite toolkit.
                        </p>

                        {/* Trust chips */}
                        <div className="hero-trust-chips">
                            {TRUST_ITEMS.map((t, i) => (
                                <span key={i} className="hero-chip">
                                    <FaCheckCircle className="hero-chip-icon" />
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="hero-ctas">
                            <button className="hero-btn-primary" onClick={() => navigate('/vendor/register')}>
                                Get Started Free
                                <FaArrowRight className="hero-btn-arrow" />
                            </button>
                            <button className="hero-btn-secondary">
                                <span className="hero-play-icon"><FaPlay style={{ fontSize: '0.65rem' }} /></span>
                                See How It Works
                            </button>
                        </div>

                        {/* Stats strip */}
                        <div className="hero-stats">
                            {STATS.map((s, i) => (
                                <React.Fragment key={i}>
                                    <div className="hero-stat">
                                        <div className="hero-stat-value">{s.value}</div>
                                        <div className="hero-stat-label">{s.label}</div>
                                    </div>
                                    {i < STATS.length - 1 && <div className="hero-stat-divider" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Visual ── */}
                    <div className="hero-visual">
                        {/* Glow behind Lanyard */}
                        <div className="hero-visual-glow" />
                        <div className="hero-lanyard-wrap">
                            <Lanyard position={[0, 3, 24]} gravity={[0, -40, 0]} transparent={true} />
                        </div>

                        {/* Floating info cards */}
                        <div className="hero-float-card hero-float-card--tl">
                            <span className="hero-float-icon"><FaRocket /></span>
                            <div>
                                <div className="hero-float-val">500+</div>
                                <div className="hero-float-lbl">Venues Live</div>
                            </div>
                        </div>
                        <div className="hero-float-card hero-float-card--br">
                            <span className="hero-float-icon hero-float-icon--green"><FaShieldAlt /></span>
                            <div>
                                <div className="hero-float-val">100%</div>
                                <div className="hero-float-lbl">Secure</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* ── Section ── */
                .hero-section {
                    position: relative;
                    overflow: hidden;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    font-family: 'Outfit', sans-serif;
                    background: #ffffff;
                }

                /* Background gradient */
                .hero-bg-layer {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 60% 50% at 70% 20%, rgba(220,53,69,0.07) 0%, transparent 70%),
                        radial-gradient(ellipse 50% 60% at 10% 80%, rgba(220,53,69,0.05) 0%, transparent 70%),
                        linear-gradient(170deg, #fff8f8 0%, #ffffff 50%, #fff5f6 100%);
                    pointer-events: none;
                }

                /* Parallax blob */
                .hero-parallax-blob {
                    position: absolute;
                    width: 700px; height: 700px;
                    top: 50%; right: -10%;
                    transform: translateY(-50%);
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(220,53,69,0.08) 0%, transparent 70%);
                    filter: blur(60px);
                    pointer-events: none;
                    transition: transform 0.2s ease-out;
                    will-change: transform;
                }

                /* Particles */
                .hero-particles { position: absolute; inset: 0; pointer-events: none; }
                .hero-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(220,53,69,0.3);
                    animation: hero-float linear infinite;
                }
                @keyframes hero-float {
                    0%   { transform: translateY(0) scale(1); opacity: 0; }
                    15%  { opacity: 0.8; }
                    85%  { opacity: 0.4; }
                    100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
                }

                /* Container */
                .hero-container {
                    max-width: 1260px;
                    margin: 0 auto;
                    padding: 100px 5% 80px;
                    position: relative;
                    z-index: 2;
                    width: 100%;
                }

                /* Layout */
                .hero-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: center;
                }

                /* ── Content ── */
                .hero-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                /* Badge */
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #dc3545;
                    background: rgba(220,53,69,0.07);
                    border: 1px solid rgba(220,53,69,0.18);
                    padding: 7px 18px;
                    border-radius: 999px;
                    margin-bottom: 28px;
                    width: fit-content;
                }
                .hero-badge-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #dc3545;
                    animation: hero-pulse 2s ease-in-out infinite;
                }
                @keyframes hero-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(1.4); }
                }

                /* Title */
                .hero-title {
                    font-size: clamp(2.8rem, 5.5vw, 5rem);
                    font-weight: 900;
                    color: #111111;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin: 0 0 24px;
                }
                .hero-title-accent {
                    background: linear-gradient(to right, #dc3545 20%, #ff6b7a 50%, #dc3545 80%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: hero-sweep 4s linear infinite;
                }
                @keyframes hero-sweep {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                /* Description */
                .hero-desc {
                    font-size: 1.05rem;
                    color: #64748b;
                    line-height: 1.85;
                    margin: 0 0 24px;
                    max-width: 520px;
                }

                /* Trust chips */
                .hero-trust-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .hero-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #475569;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 5px 12px;
                    border-radius: 999px;
                }
                .hero-chip-icon { color: #dc3545; font-size: 0.7rem; }

                /* CTAs */
                .hero-ctas {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px;
                    margin-bottom: 40px;
                }
                .hero-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px 32px;
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    cursor: pointer;
                    box-shadow: 0 8px 28px rgba(220,53,69,0.35);
                    transition: transform 0.25s, box-shadow 0.25s;
                }
                .hero-btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 14px 36px rgba(220,53,69,0.45);
                }
                .hero-btn-arrow {
                    font-size: 0.85rem;
                    transition: transform 0.2s;
                }
                .hero-btn-primary:hover .hero-btn-arrow {
                    transform: translateX(4px);
                }
                .hero-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 28px;
                    background: white;
                    color: #111;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
                }
                .hero-btn-secondary:hover {
                    transform: translateY(-2px);
                    border-color: rgba(220,53,69,0.25);
                    box-shadow: 0 8px 24px rgba(220,53,69,0.1);
                }
                .hero-play-icon {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                /* Stats */
                .hero-stats {
                    display: flex;
                    align-items: center;
                    gap: 28px;
                    padding: 24px 28px;
                    background: white;
                    border: 1px solid rgba(220,53,69,0.1);
                    border-radius: 18px;
                    box-shadow: 0 4px 20px rgba(220,53,69,0.07);
                    width: fit-content;
                }
                .hero-stat { text-align: center; }
                .hero-stat-value {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #111;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                .hero-stat-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #94a3b8;
                }
                .hero-stat-divider {
                    width: 1px;
                    height: 36px;
                    background: rgba(220,53,69,0.12);
                }

                /* ── Visual ── */
                .hero-visual {
                    position: relative;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .hero-visual-glow {
                    position: absolute;
                    width: 400px; height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(220,53,69,0.12) 0%, transparent 70%);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    filter: blur(30px);
                }
                .hero-lanyard-wrap {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 150%;
                    height: 700px;
                }

                /* Floating cards */
                .hero-float-card {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    border: 1px solid rgba(220,53,69,0.12);
                    border-radius: 14px;
                    padding: 14px 18px;
                    box-shadow: 0 8px 32px rgba(220,53,69,0.1);
                    z-index: 10;
                    animation: hero-bob 4s ease-in-out infinite;
                }
                .hero-float-card--tl { top: 10%; left: -5%; animation-delay: 0s; }
                .hero-float-card--br { bottom: 18%; right: -5%; animation-delay: 1.5s; }
                @keyframes hero-bob {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-8px); }
                }
                .hero-float-icon {
                    width: 34px; height: 34px;
                    border-radius: 10px;
                    background: rgba(220,53,69,0.1);
                    color: #dc3545;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }
                .hero-float-icon--green {
                    background: rgba(34,197,94,0.1);
                    color: #16a34a;
                }
                .hero-float-val {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #111;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .hero-float-lbl {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #94a3b8;
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .hero-layout {
                        grid-template-columns: 1fr;
                        gap: 0;
                        text-align: center;
                    }
                    .hero-visual { display: none; }
                    .hero-badge { margin: 0 auto 24px; }
                    .hero-desc  { margin: 0 auto 20px; max-width: 100%; }
                    .hero-trust-chips { justify-content: center; }
                    .hero-ctas  { justify-content: center; }
                    .hero-stats { margin: 0 auto; }
                    .hero-content { align-items: center; }
                }

                @media (max-width: 640px) {
                    .hero-section { min-height: auto; }
                    .hero-container { padding: 90px 6% 60px; }
                    .hero-title {
                        font-size: 2.2rem;
                        letter-spacing: -0.03em;
                    }
                    .hero-desc { font-size: 0.95rem; }
                    .hero-badge { font-size: 0.58rem; padding: 6px 14px; }
                    .hero-ctas {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .hero-btn-primary,
                    .hero-btn-secondary { justify-content: center; width: 100%; }
                    .hero-trust-chips { gap: 8px; }
                    .hero-chip { font-size: 0.72rem; }
                    .hero-stats {
                        width: 100%;
                        justify-content: space-around;
                        gap: 0;
                        padding: 18px 16px;
                    }
                    .hero-stat-divider { display: block; }
                    .hero-stat-value { font-size: 1.3rem; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
