import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../utils/function';
import { FaUsers, FaMapMarkerAlt, FaRupeeSign, FaStar, FaChevronRight } from 'react-icons/fa';
import { FiCalendar, FiInfo } from 'react-icons/fi';

const Venues = ({ venuesRef }) => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
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
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    useEffect(() => {
        const fetchAllVenues = async () => {
            try {
                const response = await axios.get(`${API_URL}/mahals`);
                setVenues(response.data.mahals || []);
            } catch (error) {
                console.error("Error fetching venues:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAllVenues();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleOpenDetail = (venue, tab = 'details') => {
        navigate(`/venue/${venue._id}`, { state: { initialTab: tab } });
    };

    return (
        <section className="lp-section py-5" ref={venuesRef} style={{ background: '#fcfcfc', overflow: 'hidden' }}>
            <div className="container py-5">
                <div className="text-center mb-5 animate-fade-in">
                    <span className="badge rounded-pill px-4 py-2 mb-3 shadow-sm" style={{ background: 'rgba(200, 16, 46, 0.1)', color: '#C8102E', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.7rem' }}>
                        CURATED SELECTION
                    </span>
                    <h2 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.02em', color: '#111' }}>Featured Venues</h2>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>Discover the most exquisite spaces for your once-in-a-lifetime celebrations.</p>
                </div>

                {!user ? (
                    <div className="lock-open-section position-relative" style={{ minHeight: '520px', borderRadius: '28px', overflow: 'hidden' }}>

                        {/* Blurred mock venue cards as background */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', gap: '20px', padding: '24px',
                            filter: 'blur(5px) saturate(0.8)',
                            opacity: 0.45,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            transform: 'scale(1.05)',
                        }}>
                            {[
                                { bg: 'linear-gradient(135deg,#1a1a2e,#C8102E)', title: 'Royal Mahal', loc: 'Chennai, Tamil Nadu', price: '₹85,000' },
                                { bg: 'linear-gradient(135deg,#16213e,#e63946)', title: 'Grand Celebrations', loc: 'Coimbatore, Tamil Nadu', price: '₹1,20,000' },
                                { bg: 'linear-gradient(135deg,#0f3460,#C8102E)', title: 'Elite Banquet', loc: 'Madurai, Tamil Nadu', price: '₹95,000' },
                            ].map((v, i) => (
                                <div key={i} style={{ flex: '1', minWidth: '220px', background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
                                    <div style={{ height: '200px', background: v.bg, position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', borderRadius: '20px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            ★ 4.{8 - i}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                                            📍 {v.loc}
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '6px' }}>{v.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '12px' }}>500+ Guests · AC Hall</div>
                                        <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '12px' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase' }}>Starting From</div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#C8102E' }}>{v.price}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dark overlay */}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(2px)', zIndex: 1 }} />

                        {/* Animated orbs */}
                        <div className="lock-orb lock-orb-1" />
                        <div className="lock-orb lock-orb-2" />
                        <div className="lock-orb lock-orb-3" />

                        {/* Open layout content */}
                        <div className="text-center position-relative py-5 px-3" style={{ zIndex: 2 }}>
                            <div className="lock-eyebrow mb-4">MEMBERS ONLY</div>

                            <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', color: '#111', lineHeight: 1.15 }}>
                                Discover Elite Mahals<br />
                                <span style={{ color: '#C8102E' }}>Made for Your Celebration</span>
                            </h2>

                            <p className="mx-auto mb-5" style={{ maxWidth: '460px', color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
                                Sign in to browse our handpicked collection of premium wedding halls, view real-time availability, and unlock exclusive pricing.
                            </p>

                            {/* Stats */}
                            <div className="d-flex flex-wrap justify-content-center gap-5 mb-5">
                                {[
                                    { num: '50+', label: 'Premium Venues' },
                                    { num: '100%', label: 'Verified Listings' },
                                    { num: 'Free', label: 'To Register' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{s.num}</div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <button className="lock-btn-primary" onClick={() => navigate('/user/register')}>
                                    <span>Get Started — It's Free</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                                <button className="lock-btn-secondary" onClick={() => navigate('/user/login')}>
                                    Sign In to Account
                                </button>
                            </div>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {venues.length > 0 ? (
                            venues.map((venue) => (
                                <div key={venue._id} className="col-lg-4 col-md-6 animate-fade-in-up">
                                    <div className="venue-card-premium h-100 shadow-sm transition-all" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                                        <div className="position-relative" style={{ height: '260px', cursor: 'pointer' }} onClick={() => handleOpenDetail(venue, 'details')}>
                                            <img 
                                                src={`${API_URL.replace('/api', '')}/${venue.coverImage}`} 
                                                alt={venue.mahalName} 
                                                className="w-100 h-100 object-fit-cover transition-all"
                                            />
                                            <div className="position-absolute top-0 end-0 m-3 d-flex flex-column align-items-end gap-2">
                                                <div className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                                    <FaStar className="text-warning" /> 
                                                    {venue.averageRating ? venue.averageRating.toFixed(1) : 'New'}
                                                </div>
                                                {venue.reviewCount > 0 && (
                                                    <div className="badge bg-dark text-white shadow-sm px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                                        {venue.reviewCount} Reviews
                                                    </div>
                                                )}
                                            </div>

                                            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                                                <div className="d-flex align-items-center gap-2 text-white small fw-bold">
                                                    <FaMapMarkerAlt size={12} className="text-danger" />
                                                    {venue.city}, {venue.district}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.01em', color: '#111', cursor: 'pointer' }} onClick={() => handleOpenDetail(venue, 'details')}>{venue.mahalName}</h4>
                                            </div>
                                            <p className="text-muted small mb-4 line-clamp-2" style={{ minHeight: '40px' }}>{venue.description}</p>
                                            
                                            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-light">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaUsers className="text-danger" />
                                                    <span className="fw-bold">{venue.seatingCapacity}+ Guests</span>
                                                </div>
                                                <div className="text-end">
                                                    <div className="small text-muted mb-1" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Starting From</div>
                                                    <div className="fw-bold text-dark d-flex align-items-center gap-1" style={{ fontSize: '1.1rem' }}>
                                                        <FaRupeeSign size={14} className="text-danger" />
                                                        {venue.fullDayPrice?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => handleOpenDetail(venue, 'details')}
                                                    className="btn btn-dark w-100 rounded-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all transform hover-scale-md"
                                                    style={{ fontSize: '0.9rem', letterSpacing: '0.02em' }}
                                                >
                                                    Explore Venue & Availability <FaChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h3 className="text-muted">No venues available at the moment.</h3>
                            </div>
                        )}
                    </div>
                )}
                
                {user && (
                    <div className="text-center mt-5 pt-4">
                        <button className="btn btn-outline-dark rounded-pill px-5 py-3 fw-bold transition-all">
                            Discover All Venues
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                /* Venue cards */
                .venue-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
                .venue-card-premium:hover img {
                    transform: scale(1.05);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Lock screen - open layout */
                .lock-open-section {
                    background: #f8f8f8;
                }

                /* Animated orbs */
                .lock-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                }
                .lock-orb-1 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(200,16,46,0.1) 0%, transparent 65%);
                    top: -100px; left: -100px;
                    animation: orbFloat1 9s ease-in-out infinite;
                }
                .lock-orb-2 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(100,50,120,0.07) 0%, transparent 65%);
                    bottom: -80px; right: -80px;
                    animation: orbFloat2 11s ease-in-out infinite;
                }
                .lock-orb-3 {
                    width: 220px; height: 220px;
                    background: radial-gradient(circle, rgba(200,16,46,0.06) 0%, transparent 65%);
                    top: 40%; left: 60%;
                    animation: orbFloat1 7s ease-in-out infinite reverse;
                }
                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(30px, 20px) scale(1.08); }
                }
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(-20px, -30px) scale(1.06); }
                }

                /* Eyebrow label */
                .lock-eyebrow {
                    display: inline-block;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    color: #C8102E;
                    background: rgba(200,16,46,0.07);
                    padding: 5px 16px;
                    border-radius: 999px;
                }

                /* Primary CTA */
                .lock-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: #0a0a0a;
                    color: #fff;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.16);
                }
                .lock-btn-primary::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.5s ease;
                }
                .lock-btn-primary:hover::before { transform: translateX(100%); }
                .lock-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 32px rgba(0,0,0,0.2);
                }

                /* Secondary CTA */
                .lock-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    background: transparent;
                    color: #333;
                    border: 1.5px solid rgba(0,0,0,0.14);
                    padding: 15px 30px;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.25s;
                }
                .lock-btn-secondary:hover {
                    background: #0a0a0a;
                    color: #fff;
                    border-color: #0a0a0a;
                    transform: translateY(-2px);
                }

            `}</style>
        </section>
    );
};

export default Venues;
