import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowRight, FaRocket, FaShieldAlt, FaCheckCircle, FaPlay, FaBuilding } from 'react-icons/fa';
import heroBg1 from '../../../assets/landing/hero-bg-1.png';
import heroBg2 from '../../../assets/landing/hero-bg-2.png';
import { API_URL } from '../../../utils/function';


const TRUST_ITEMS = [
    'Online Booking System',
    'Mobile Friendly',
    'Digital Payments',
];

const Hero = ({ homeRef, activeTab, setActiveTab, venuesRef }) => {
    const navigate = useNavigate();
    const blobRef = useRef(null);

    const [heroImages, setHeroImages] = React.useState(() => {
        const stored = localStorage.getItem('hero_landing_images');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch(e) {}
        }
        return null;
    });

    useEffect(() => {
        const loadImages = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/hero-settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && (data.mainArch || data.horizontal || data.vertical || data.circular)) {
                        setHeroImages(data);
                        try {
                            localStorage.setItem('hero_landing_images', JSON.stringify(data));
                        } catch (err) {
                            console.warn("LocalStorage quota exceeded, skipping local cache.");
                        }
                        return;
                    }
                }
            } catch (e) {
                console.error("Error fetching hero images from backend API:", e);
            }

            const stored = localStorage.getItem('hero_landing_images');
            if (stored) {
                try {
                    setHeroImages(JSON.parse(stored));
                    return;
                } catch(e) {}
            }
            setHeroImages(null);
        };

        loadImages();
        window.addEventListener('hero_images_updated', loadImages);
        window.addEventListener('storage', loadImages);
        return () => {
            window.removeEventListener('hero_images_updated', loadImages);
            window.removeEventListener('storage', loadImages);
        };
    }, []);

    const imgMainArch = heroImages?.mainArch?.url || heroBg2;
    const titleMainArch = heroImages?.mainArch?.title || 'Royal Palace';
    const subtitleMainArch = heroImages?.mainArch?.subtitle || 'Featured';

    const imgHorizontal = heroImages?.horizontal?.url || heroBg1;
    const imgVertical = heroImages?.vertical?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
    const imgCircular = heroImages?.circular?.url || 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=600&q=80';

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
                        <h1 className="hero-title" style={{ fontSize: '3rem', lineHeight: '1.2' }}>
                            The Smart Platform for<br />
                            <span className="hero-title-accent">Modern Venue Management.</span>
                        </h1>

                        {/* Description */}
                        <p className="hero-desc">
                            Whether you're managing a wedding hall, banquet, convention center, or event venue, Mehfil One empowers vendors to streamline operations while giving customers a seamless booking experience from inquiry to confirmation.
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
                                Get Started
                                <FaArrowRight className="hero-btn-arrow" />
                            </button>
                            <button className="hero-btn-secondary" onClick={() => venuesRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                                <span className="hero-play-icon"><FaBuilding style={{ fontSize: '0.65rem' }} /></span>
                                Explore Venues
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT: Visual ── */}
                    <div className="hero-visual">
                        {/* Glow behind Layout */}
                        <div className="hero-visual-glow" />

                        {/* CLASSIC 3-IMAGE OVERLAPPING COMPOSITION */}
                        <div className="hero-collage position-relative w-100">
                            {/* Decorative Minimalist Elements */}
                            <div className="position-absolute" style={{ top: '10%', left: '0%', zIndex: 0, opacity: 0.6, animation: 'float 6s ease-in-out infinite' }}>
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <circle cx="50" cy="50" r="48" stroke="#dc3545" strokeWidth="2" strokeDasharray="8 8" />
                                </svg>
                            </div>
                            
                            {/* Small Circular Accent Image (Moved up so it doesn't hide text) */}
                            <div className="position-absolute shadow-lg overflow-hidden border border-4 border-white rounded-circle" style={{ width: '130px', height: '130px', top: '40%', right: '-8%', zIndex: 4, animation: 'float 6s ease-in-out infinite' }}>
                                <img src={imgCircular} alt="Accent Detail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            {/* Main Arch Image (Right Side) */}
                            <div className="position-absolute shadow-lg overflow-hidden border border-4 border-white" style={{ width: '320px', height: '460px', right: '0', top: '40px', zIndex: 1, borderRadius: '160px 160px 24px 24px', transition: 'all 0.5s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <img src={imgMainArch} alt="Premium Venue Arch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="position-absolute bottom-0 start-0 w-100 p-4 text-center" style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.95) 0%, transparent 100%)' }}>
                                    <h4 className="text-white fw-bold mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.3rem' }}>{titleMainArch}</h4>
                                    <small className="text-danger fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>{subtitleMainArch}</small>
                                </div>
                            </div>

                            {/* Horizontal Image (Top Left) */}
                            <div className="position-absolute shadow-lg overflow-hidden border border-4 border-white" style={{ width: '320px', height: '200px', left: '0', top: '0', zIndex: 2, borderRadius: '24px', transition: 'all 0.5s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
                                <img src={imgHorizontal} alt="Venue Horizontal" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                            </div>

                            {/* Vertical Image (Bottom Left) */}
                            <div className="position-absolute shadow-lg overflow-hidden border border-4 border-white" style={{ width: '260px', height: '320px', left: '30px', bottom: '0', zIndex: 3, borderRadius: '24px', transition: 'all 0.5s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
                                <img src={imgVertical} alt="Luxury Detail Vertical" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                            </div>
                        </div>                   </div>
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
                .hero-collage {
                    max-width: 600px;
                    height: 560px;
                    margin: 0 auto;
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
