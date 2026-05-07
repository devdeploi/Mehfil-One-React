import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { FiArrowLeft, FiCheckCircle, FiStar, FiCalendar, FiMapPin, FiUsers, FiInfo, FiMessageCircle, FiSend, FiClock } from 'react-icons/fi';
import { FaRupeeSign, FaChevronRight } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from './components/Footer';

const VenueDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [venue, setVenue] = useState(null);
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'details');
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState('calendar'); // 'calendar', 'month', 'year'
    const [yearRangeStart, setYearRangeStart] = useState(Math.floor(new Date().getFullYear() / 12) * 12);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchVenueDetails();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchBookings();
        }
    }, [id, calendarDate.getMonth(), calendarDate.getFullYear()]);

    const fetchVenueDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/mahals/${id}`);
            setVenue(res.data.mahal || res.data);
            fetchReviews();
        } catch (error) {
            console.error("Error fetching venue details", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/reviews/${id}`);
            setReviews(res.data.reviews || []);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/bookings`, {
                params: {
                    mahalId: id,
                    all: 'true'
                }
            });
            setBookings(res.data.bookings || []);
        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to add a review");
            return;
        }
        if (!newReview.comment) return;

        setReviewLoading(true);
        try {
            await axios.post(`${API_URL}/reviews/add`, {
                mahalId: id,
                userId: user.id || user._id,
                userName: user.name,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            console.error("Error adding review", error);
        } finally {
            setReviewLoading(false);
        }
    };

    const getBookingStatus = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => b.date.startsWith(dateStr));
        if (dayBookings.length === 0) return { status: 'Free', color: 'text-success' };
        const shifts = dayBookings.map(b => b.shift);
        if (shifts.includes('Full Day')) return { status: 'Fully Booked', color: 'text-danger' };
        if (shifts.includes('Morning') && shifts.includes('Evening')) return { status: 'Fully Booked', color: 'text-danger' };
        if (shifts.includes('Morning')) return { status: 'Evening Free', color: 'text-warning' };
        if (shifts.includes('Evening')) return { status: 'Morning Free', color: 'text-warning' };
        return { status: 'Booked', color: 'text-danger' };
    };

    const changePeriod = (offset) => {
        const newDate = new Date(calendarDate);
        if (calendarView === 'calendar') {
            newDate.setMonth(newDate.getMonth() + offset);
        } else if (calendarView === 'month') {
            newDate.setFullYear(newDate.getFullYear() + offset);
        } else if (calendarView === 'year') {
            setYearRangeStart(prev => prev + (offset * 12));
            return;
        }
        setCalendarDate(newDate);
    };

    const toggleViewMode = () => {
        if (calendarView === 'calendar') setCalendarView('month');
        else if (calendarView === 'month') setCalendarView('year');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-danger" role="status"></div>
        </div>
    );

    if (!venue) return (
        <div className="text-center py-5">
            <h3>Venue not found</h3>
            <button className="btn btn-dark mt-3" onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );

    return (
        <div className="venue-details-page bg-white min-vh-100">
            <Navbar />
            
            {/* Hero Header Section - Responsive Height */}
            <div className="venue-hero-section position-relative" style={{ overflow: 'hidden' }}>
                <img src={`${API_URL.replace('/api', '')}/${venue.coverImage}`} alt="" className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute top-0 left-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85))' }}></div>
                
                <div className="position-absolute bottom-0 start-0 w-100 p-3 p-md-5">
                    <div className="container">
                        <button 
                            onClick={() => navigate(-1)}
                            className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 mb-3 mb-md-4 p-0 animate-fade-in"
                            style={{ fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            <FiArrowLeft /> Back to Discovery
                        </button>
                        <div className="row align-items-end g-4">
                            <div className="col-lg-8">
                                <h1 className="venue-title fw-bold text-white mb-2 animate-fade-in-up" style={{ letterSpacing: '-0.03em' }}>{venue.mahalName}</h1>
                                <div className="d-flex flex-wrap align-items-center gap-3 gap-md-4 text-white-50 animate-fade-in-up delay-100">
                                    <div className="d-flex align-items-center gap-2 small"><FiMapPin className="text-danger" /> {venue.city}, {venue.district}</div>
                                    <div className="d-flex align-items-center gap-2 small"><FiUsers className="text-danger" /> {venue.seatingCapacity}+ Guests</div>
                                    <div className="d-flex align-items-center gap-2 small">
                                        <div className="d-flex gap-1 text-warning">
                                            {[1,2,3,4,5].map(s => <FiStar key={s} size={12} fill={s <= 4 ? "currentColor" : "none"} />)}
                                        </div>
                                        <span className="text-white fw-bold">4.8</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 text-lg-end d-none d-lg-block">
                                <div className="glass-card d-inline-block p-4 rounded-4 animate-fade-in-up delay-200" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <div className="text-white-50 small fw-bold text-uppercase mb-1">Starting From</div>
                                    <div className="h2 fw-bold text-white mb-0 d-flex align-items-center justify-content-lg-end gap-2">
                                        <FaRupeeSign /> {venue.fullDayPrice?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Price Sticky Header */}
            <div className="d-lg-none bg-dark text-white p-3 sticky-top shadow-lg" style={{ top: '60px', zIndex: 1000 }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <div className="small text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Starting Price</div>
                        <div className="h5 fw-bold mb-0"><FaRupeeSign size={14} /> {venue.fullDayPrice?.toLocaleString()}</div>
                    </div>
                    <button className="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm">Book Now</button>
                </div>
            </div>

            {/* Content Tabs Section */}
            <div className="container py-4 py-md-5">
                <div className="row g-4 g-lg-5">
                    {/* Main Content Area */}
                    <div className="col-lg-8">
                        {/* Tab Headers - Scrollable on mobile */}
                        <div className="d-flex border-bottom mb-4 mb-md-5 overflow-auto hide-scrollbar" style={{ gap: '2rem', whiteSpace: 'nowrap' }}>
                            {['details', 'availability', 'reviews'].map(tab => (
                                <div 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 fw-bold cursor-pointer transition-all text-uppercase tracking-widest ${activeTab === tab ? 'text-danger border-bottom border-danger border-3' : 'text-muted'}`}
                                    style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'details' && (
                                <div className="animate-fade-in">
                                    <h4 className="fw-bold mb-4">About the Venue</h4>
                                    <p className="text-muted lh-lg mb-5" style={{ textAlign: 'justify', fontSize: '1rem' }}>{venue.description}</p>
                                    
                                    <h5 className="fw-bold mb-4 mt-5 pt-3">Elite Amenities</h5>
                                    <div className="row g-3">
                                        {Object.entries(venue.facilities || {}).map(([key, val]) => (
                                            val && (
                                                <div key={key} className="col-md-4 col-6">
                                                    <div className="p-3 p-md-4 rounded-4 border bg-light h-100 d-flex flex-column align-items-center text-center gap-2">
                                                        <div className="p-2 bg-white rounded-circle text-danger shadow-sm"><FiCheckCircle size={20} /></div>
                                                        <div className="fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>{key}</div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    <h5 className="fw-bold mb-4 mt-5 pt-3">Gallery Showcase</h5>
                                    <div className="row g-3">
                                        {venue.galleryImages?.map((img, i) => (
                                            <div key={i} className="col-md-6 col-12">
                                                <div className="overflow-hidden rounded-4 shadow-sm" style={{ height: '240px' }}>
                                                    <img src={`${API_URL.replace('/api', '')}/${img}`} className="w-100 h-100 object-fit-cover transition-all hover-scale" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'availability' && (
                                <div className="animate-fade-in">
                                    <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <h5 className="fw-bold mb-0">Booking Calendar</h5>
                                            <div className="d-flex gap-2">
                                                <button onClick={() => changePeriod(-1)} className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center shadow-sm border"><FiArrowLeft size={14} /></button>
                                                <button onClick={toggleViewMode} className="btn btn-sm btn-light px-3 rounded-pill fw-bold border shadow-sm">
                                                    {calendarView === 'calendar' && calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    {calendarView === 'month' && calendarDate.getFullYear()}
                                                    {calendarView === 'year' && `${yearRangeStart} - ${yearRangeStart + 11}`}
                                                </button>
                                                <button onClick={() => changePeriod(1)} className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center shadow-sm border"><FaChevronRight size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <div className="d-flex align-items-center gap-1 small fw-bold" style={{ fontSize: '0.7rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dcfce7' }}></div> Free</div>
                                            <div className="d-flex align-items-center gap-1 small fw-bold" style={{ fontSize: '0.7rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fef9c3' }}></div> Partial</div>
                                            <div className="d-flex align-items-center gap-1 small fw-bold" style={{ fontSize: '0.7rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fee2e2' }}></div> Booked</div>
                                        </div>
                                    </div>

                                    <div className="calendar-container bg-light p-3 p-md-4 rounded-4 border position-relative overflow-hidden" style={{ minHeight: '380px' }}>
                                        {calendarView === 'calendar' && (
                                            <div className="animate-fade-in">
                                                <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                                        <div key={`${day}-${idx}`} className="text-center small fw-bold text-muted pb-2" style={{ fontSize: '0.7rem' }}>{day}</div>
                                                    ))}
                                                    
                                                    {(() => {
                                                        const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
                                                        const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
                                                        const prevDays = Array.from({ length: firstDay });
                                                        const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                                                        
                                                        return (
                                                            <>
                                                                {prevDays.map((_, i) => <div key={`empty-${i}`} />)}
                                                                {currentDays.map(day => {
                                                                    const dateObj = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                                                                    const { status } = getBookingStatus(dateObj);
                                                                    
                                                                    let bgColor = 'white';
                                                                    if (status === 'Free') bgColor = '#dcfce7';
                                                                    else if (status.includes('Free')) bgColor = '#fef9c3';
                                                                    else if (status.includes('Booked')) bgColor = '#fee2e2';

                                                                    return (
                                                                        <div 
                                                                            key={day} 
                                                                            className="calendar-day-box shadow-sm transition-all"
                                                                            style={{
                                                                                aspectRatio: '1/1',
                                                                                background: bgColor,
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: 'pointer',
                                                                                border: '1px solid rgba(0,0,0,0.03)'
                                                                            }}
                                                                        >
                                                                            <div className="fw-bold" style={{ fontSize: '0.75rem' }}>{day}</div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {calendarView === 'month' && (
                                            <div className="animate-fade-in py-3">
                                                <div className="row g-3">
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                                                        <div key={month} className="col-4 col-md-3">
                                                            <div 
                                                                onClick={() => { setCalendarDate(new Date(calendarDate.getFullYear(), idx, 1)); setCalendarView('calendar'); }}
                                                                className={`p-3 rounded-4 border text-center fw-bold transition-all hover-scale-sm cursor-pointer ${calendarDate.getMonth() === idx ? 'bg-danger text-white shadow-lg border-0' : 'bg-white shadow-sm'}`}
                                                            >
                                                                {month}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {calendarView === 'year' && (
                                            <div className="animate-fade-in py-3">
                                                <div className="row g-3">
                                                    {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((year) => (
                                                        <div key={year} className="col-4 col-md-3">
                                                            <div 
                                                                onClick={() => { setCalendarDate(new Date(year, calendarDate.getMonth(), 1)); setCalendarView('month'); }}
                                                                className={`p-3 rounded-4 border text-center fw-bold transition-all hover-scale-sm cursor-pointer ${calendarDate.getFullYear() === year ? 'bg-danger text-white shadow-lg border-0' : 'bg-white shadow-sm'}`}
                                                            >
                                                                {year}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 p-3 p-md-4 rounded-4 border bg-white shadow-sm">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                            <FiCalendar className="text-danger" /> Selection Summary
                                        </h6>
                                        <p className="text-muted small mb-3">Availability for {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} is displayed above.</p>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <div className="p-2 border rounded-3 text-center">
                                                    <div className="text-muted fw-bold" style={{ fontSize: '0.55rem' }}>MORNING</div>
                                                    <div className="fw-bold small">{venue.morningTimeFrom} - {venue.morningTimeTo}</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 border rounded-3 text-center">
                                                    <div className="text-muted fw-bold" style={{ fontSize: '0.55rem' }}>EVENING</div>
                                                    <div className="fw-bold small">{venue.eveningTimeFrom} - {venue.eveningTimeTo}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="animate-fade-in">
                                    {user ? (
                                        <div className="p-4 p-md-5 rounded-4 border bg-light mb-4 mb-md-5">
                                            <h5 className="fw-bold mb-4">Share Feedback</h5>
                                            <form onSubmit={handleAddReview}>
                                                <div className="mb-4 d-flex gap-2">
                                                    {[1,2,3,4,5].map(s => (
                                                        <FiStar 
                                                            key={s} 
                                                            size={24} 
                                                            className="cursor-pointer"
                                                            fill={s <= newReview.rating ? '#ffc107' : 'none'}
                                                            color={s <= newReview.rating ? '#ffc107' : '#ddd'}
                                                            onClick={() => setNewReview({ ...newReview, rating: s })}
                                                        />
                                                    ))}
                                                </div>
                                                <textarea 
                                                    className="form-control rounded-4 p-3 border-0 shadow-sm mb-4" 
                                                    rows="3" 
                                                    placeholder="Tell others about your experience..."
                                                    value={newReview.comment}
                                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                ></textarea>
                                                <button className="btn btn-danger w-100 rounded-pill fw-bold" disabled={reviewLoading}>
                                                    {reviewLoading ? 'Posting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-4 border bg-light text-center mb-4">
                                            <h6 className="text-muted fw-bold mb-0">Sign in to leave a review</h6>
                                        </div>
                                    )}

                                    <div className="d-flex flex-column gap-3">
                                        {reviews.map(review => (
                                            <div key={review._id} className="p-4 rounded-4 border bg-white shadow-sm">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="p-2 rounded-circle bg-danger text-white fw-bold d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                                            {review.userName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold small">{review.userName}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-1">
                                                        {[1,2,3,4,5].map(s => <FiStar key={s} size={10} fill={s <= review.rating ? '#ffc107' : 'none'} color={s <= review.rating ? '#ffc107' : '#ddd'} />)}
                                                    </div>
                                                </div>
                                                <p className="text-muted mb-0 small lh-base">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area - Stacked on Mobile */}
                    <div className="col-lg-4">
                        <div className="sticky-top" style={{ top: '140px' }}>
                            <div className="card border-0 shadow-premium rounded-4 overflow-hidden mb-4 d-none d-lg-block">
                                <div className="p-4 bg-dark text-white text-center">
                                    <div className="small text-white-50 text-uppercase tracking-widest mb-1">Reservation Info</div>
                                    <h5 className="fw-bold mb-0">Secure Your Date</h5>
                                </div>
                                <div className="p-4">
                                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                        <span className="text-muted">Morning Slot</span>
                                        <span className="fw-bold text-dark"><FaRupeeSign /> {venue.morningPrice?.toLocaleString() || venue.fullDayPrice/2}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                        <span className="text-muted">Evening Slot</span>
                                        <span className="fw-bold text-dark"><FaRupeeSign /> {venue.eveningPrice?.toLocaleString() || venue.fullDayPrice/2}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="text-muted h6 mb-0">Full Day</span>
                                        <span className="fw-bold text-danger h5 mb-0"><FaRupeeSign /> {venue.fullDayPrice?.toLocaleString()}</span>
                                    </div>
                                    <button className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-lg transition-all transform hover-scale-md">
                                        Book This Venue
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-4 border bg-light">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FiInfo className="text-danger" /> Expert Assistance
                                </h6>
                                <p className="small text-muted mb-4">Need help? Our specialists are here to assist with your booking.</p>
                                <button className="btn btn-outline-dark w-100 rounded-pill py-2 small fw-bold">
                                    Contact Owner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                .venue-hero-section { height: 45vh; }
                .venue-title { font-size: 2.2rem; }
                @media (min-width: 768px) {
                    .venue-hero-section { height: 55vh; }
                    .venue-title { font-size: 3.5rem; }
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .shadow-premium { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); }
                .hover-scale:hover { transform: scale(1.05); }
                .hover-scale-sm:hover { transform: scale(1.02); }
            `}</style>
        </div>
    );
};

export default VenueDetailsPage;
