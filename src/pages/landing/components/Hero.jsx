import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowRight, FaChartLine, FaCalendarAlt, FaUserTie, FaGem, FaCheckCircle, FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';

// Import premium background assets
import heroBg1 from '../../../assets/landing/hero-bg-1.png';
import heroBg2 from '../../../assets/landing/hero-bg-2.png';

const Hero = ({ homeRef, activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    return (
        <section className="lp-hero position-relative overflow-hidden py-5" ref={homeRef} style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', contain: 'paint' }}>
            {/* Grain Texture Overlay */}
            <div className="position-absolute w-100 h-100 top-0 left-0" style={{ pointerEvents: 'none', zIndex: 1, opacity: 0.03, background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Cinematic Background Atmosphere */}
            <div className="position-absolute d-none d-xl-block" style={{ top: '-5%', right: '-2%', width: '45%', height: '75%', zIndex: 0, opacity: 0.18 }}>
                <img src={heroBg1} alt="" className="w-100 h-100" style={{ objectFit: 'cover', borderRadius: '50%', filter: 'blur(30px)' }} />
            </div>
            <div className="position-absolute d-none d-xl-block" style={{ bottom: '-10%', left: '-5%', width: '40%', height: '65%', zIndex: 0, opacity: 0.12 }}>
                <img src={heroBg2} alt="" className="w-100 h-100" style={{ objectFit: 'cover', borderRadius: '50%', filter: 'blur(35px)' }} />
            </div>

            <div className="container position-relative py-5" style={{ zIndex: 2 }}>
                <div className="row align-items-center g-5">
                    
                    {/* Content Column */}
                    <div className="col-lg-7 text-center text-lg-start animate-fade-in-up">
                        <div className="mb-4">
                            <span className="badge rounded-pill px-4 py-2 shadow-sm" style={{ background: 'white', color: '#C8102E', border: '1px solid rgba(200, 16, 46, 0.1)', letterSpacing: '0.12em', fontWeight: 800, fontSize: '0.7rem' }}>
                                <FaStar className="me-2 animate-pulse-small" /> THE GOLD STANDARD FOR VENUES
                            </span>
                        </div>
                        
                        <h1 className="display-3 fw-bolder mb-4 lh-sm hero-main-title" style={{ letterSpacing: '-0.04em', color: '#111' }}>
                            Scale Your <br />
                            <span className="text-gradient-red sweep-text">Venue Empire.</span>
                        </h1>
                        
                        <p className="lead text-muted mb-5 mx-auto mx-lg-0 pe-lg-5" style={{ lineHeight: 1.8, maxWidth: '640px' }}>
                            The definitive platform for high-end venue management. 
                            Automate operations, maximize revenue, and deliver 
                            extraordinary events with Mehfil One's elite toolkit.
                        </p>

                        <div className="d-flex flex-column flex-md-row justify-content-center justify-content-lg-start gap-3 mb-5">
                            <button 
                                onClick={() => navigate('/vendor/register')} 
                                className="btn btn-dark btn-lg px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-3 shadow-lg"
                                style={{ background: '#111' }}
                            >
                                Get Started Free <FaArrowRight />
                            </button>
                            <button 
                                className="btn btn-outline-dark btn-lg px-5 py-3 rounded-pill fw-bold"
                                style={{ border: '2px solid #111' }}
                            >
                                See How It Works
                            </button>
                        </div>

                        {/* Social Proof Strip */}
                        <div className="d-flex flex-wrap justify-content-center justify-content-lg-start align-items-center gap-4 py-4 px-4 rounded-4 shadow-sm bg-white border mt-2 mx-auto mx-lg-0" style={{ width: 'fit-content' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-danger-subtle rounded-3 text-danger"><FaRocket size={18} /></div>
                                <div className="lh-1 text-start">
                                    <div className="fw-bold h5 mb-0">500+</div>
                                    <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>Elite Venues</div>
                                </div>
                            </div>
                            <div className="vr d-none d-md-block" style={{ height: '35px', opacity: 0.1 }}></div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-success-subtle rounded-3 text-success"><FaShieldAlt size={18} /></div>
                                <div className="lh-1 text-start">
                                    <div className="fw-bold h5 mb-0">100%</div>
                                    <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>Secure Tech</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Column */}
                    <div className="col-lg-5 animate-fade-in-up delay-200 mt-5 mt-lg-0">
                        <div className="position-relative p-2 mx-auto" style={{ maxWidth: '450px' }}>
                            <div className="hero-dashboard-mockup shadow-2xl rounded-4 overflow-hidden border border-8 border-dark bg-dark">
                                <div className="mockup-header px-3 py-2 d-flex gap-1 bg-dark">
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></div>
                                </div>
                                <div className="mockup-body d-flex bg-white" style={{ height: '380px' }}>
                                    <div className="sidebar p-2 border-end bg-light d-flex flex-column align-items-center" style={{ width: '60px' }}>
                                        <div className="mb-3 opacity-25 mt-2"><FaChartLine size={16} /></div>
                                        <div className="mb-3 text-danger"><FaCalendarAlt size={16} /></div>
                                        <div className="mb-3 opacity-25"><FaUserTie size={16} /></div>
                                    </div>
                                    <div className="content flex-grow-1 p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="fw-bold small text-dark">Revenue</div>
                                            <div className="badge bg-danger rounded-pill smaller" style={{ fontSize: '0.5rem' }}>LIVE</div>
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <div className="p-2 bg-light rounded-3">
                                                    <div className="fw-bold text-dark small">₹2.4M</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 bg-danger-subtle rounded-3 text-danger">
                                                    <div className="fw-bold small">88%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border rounded-3 bg-light">
                                            <div className="d-flex align-items-end gap-1" style={{ height: '80px' }}>
                                                <div className="bg-danger-subtle flex-grow-1 rounded-top" style={{ height: '35%' }}></div>
                                                <div className="bg-danger flex-grow-1 rounded-top" style={{ height: '65%' }}></div>
                                                <div className="bg-danger-subtle flex-grow-1 rounded-top" style={{ height: '45%' }}></div>
                                                <div className="bg-danger flex-grow-1 rounded-top" style={{ height: '90%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Card */}
                            <div className="position-absolute animate-float d-none d-md-block" style={{ top: '-20px', right: '-30px', zIndex: 10 }}>
                                <div className="p-3 bg-white rounded-4 shadow-lg border d-flex align-items-center gap-3">
                                    <div className="bg-success rounded-circle p-2 text-white d-flex"><FaCheckCircle size={14} /></div>
                                    <div className="small fw-bold">Booking Confirmed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hero-main-title { font-size: 2.5rem; line-height: 1.2; }
                @media (min-width: 768px) {
                    .hero-main-title { font-size: 4.5rem; }
                }
                
                .hero-dashboard-mockup {
                    transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
                    transition: transform 0.5s ease;
                }
                @media (max-width: 991px) {
                    .hero-dashboard-mockup { transform: none; }
                }

                .text-gradient-red {
                    background: linear-gradient(135deg, #C8102E 0%, #ff4d4d 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                @keyframes sweep {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .sweep-text {
                    background: linear-gradient(to right, #C8102E 20%, #ff8080 40%, #ff8080 60%, #C8102E 80%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: sweep 4s linear infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 5s infinite ease-in-out; }
                
                .shadow-2xl { box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.3); }
            `}</style>
        </section>
    );
};

export default Hero;
