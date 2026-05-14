import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../utils/function';
import { FaUsers, FaMapMarkerAlt, FaRupeeSign, FaStar, FaChevronRight, FaSnowflake } from 'react-icons/fa';

const Venues = ({ venuesRef }) => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

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

        fetchAllVenues();
    }, []);

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
                    <h2 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.02em', color: '#111' }}>Our Best Wedding Halls</h2>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>Discover the most exquisite spaces for your once-in-a-lifetime celebrations.</p>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {venues.length > 0 ? (
                            venues.slice(0, 6).map((venue, index) => (
                                <div key={venue._id} className="col-lg-4 col-md-6 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="venue-card-premium h-100 shadow-sm transition-all" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                                        {/* Image Section */}
                                        <div className="position-relative" style={{ height: '260px', cursor: 'pointer', overflow: 'hidden' }} onClick={() => handleOpenDetail(venue, 'details')}>
                                            <img 
                                                src={`${API_URL.replace('/api', '')}/${venue.coverImage}`} 
                                                alt={venue.mahalName} 
                                                className="w-100 h-100 object-fit-cover transition-all venue-img" 
                                            />
                                            
                                            {/* Badges Overlay */}
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
                                                {venue.facilities?.ac && (
                                                    <div className="badge bg-info text-white shadow-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                        <FaSnowflake size={10} /> AC
                                                    </div>
                                                )}
                                            </div>

                                            {/* Location Overlay */}
                                            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                                                <div className="d-flex align-items-center gap-2 text-white small fw-bold">
                                                    <FaMapMarkerAlt size={12} className="text-danger" />
                                                    {venue.city}, {venue.district}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.01em', color: '#111', cursor: 'pointer' }} onClick={() => handleOpenDetail(venue, 'details')}>{venue.mahalName}</h4>
                                            </div>
                                            
                                            <p className="text-muted small mb-4 line-clamp-2" style={{ minHeight: '40px' }}>{venue.description}</p>
                                            
                                            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-light">
                                                <div className="d-flex flex-column gap-1 text-muted small">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FaUsers className="text-danger" size={14} />
                                                        <span className="fw-bold">{venue.seatingCapacity}+ Guests</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {venue.facilities?.ac ? (
                                                            <>
                                                                <FaSnowflake className="text-info" size={12} />
                                                                <span className="fw-bold">Air Conditioned</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #666' }}></div>
                                                                <span className="fw-bold">Non-AC Hall</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="small text-muted mb-1" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Starting From</div>
                                                    <div className="fw-bold text-dark d-flex align-items-center gap-1" style={{ fontSize: '1.1rem' }}>
                                                        <FaRupeeSign size={14} className="text-danger" />
                                                        {venue.fullDayPrice?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Button */}
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => handleOpenDetail(venue, 'details')}
                                                    className="btn-premium-action w-100 rounded-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all transform hover-scale-md"
                                                    style={{ 
                                                        fontSize: '0.9rem', 
                                                        letterSpacing: '0.02em',
                                                        background: 'linear-gradient(90deg, #0f0f0f 0%, #440a0e 40%, #dc3545 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <span style={{ position: 'relative', zIndex: 2 }}>Explore Mahal & Availability</span>
                                                    <FaChevronRight size={12} style={{ position: 'relative', zIndex: 2 }} />
                                                    <div className="btn-sweep"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h3 className="text-muted">No venues found</h3>
                            </div>
                        )}
                    </div>
                )}

                {!loading && venues.length > 0 && (
                    <div className="text-center mt-5 animate-fade-in">
                        <button 
                            className="btn btn-danger btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg transform-hover"
                            onClick={() => navigate('/all-venues')}
                            style={{ 
                                background: 'linear-gradient(45deg, #C8102E, #E31837)',
                                border: 'none',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Discover ALL Mahal
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .venue-card-premium {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .venue-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
                }
                .venue-card-premium:hover .venue-img {
                    transform: scale(1.1);
                }
                .venue-img {
                    transition: all 0.6s ease;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .btn-premium-action {
                    transition: all 0.3s ease;
                }
                .btn-premium-action:hover {
                    transform: scale(1.02);
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
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .transform-hover {
                    transition: all 0.3s ease;
                }
                .transform-hover:hover {
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 15px 30px rgba(200, 16, 46, 0.4) !important;
                }
            `}</style>
        </section>
    );
};

export default Venues;
