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
                    <h2 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.02em', color: '#111' }}>Featured Venues</h2>
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
                
                <div className="text-center mt-5 pt-4">
                    <button className="btn btn-outline-dark rounded-pill px-5 py-3 fw-bold transition-all">
                        Discover All Venues
                    </button>
                </div>
            </div>

            <style>{`
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
            `}</style>
        </section>
    );
};

export default Venues;
