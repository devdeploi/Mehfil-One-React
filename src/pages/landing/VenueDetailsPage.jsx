import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import OnlineBookingForm from './components/OnlineBookingForm';
import { FiArrowLeft, FiCheckCircle, FiStar, FiCalendar, FiMapPin, FiUsers, FiInfo, FiMessageCircle, FiSend, FiClock, FiPhone, FiMail } from 'react-icons/fi';
import { FaRupeeSign, FaChevronRight, FaTags, FaUsers, FaUtensils, FaCar } from 'react-icons/fa';
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

    // Booking Form State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        shift: 'Morning',
        fullName: user?.fullName || user?.name || '',
        phone: user?.phone || user?.mobile || '',
        guests: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);

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
                params: { mahalId: id, all: 'true' }
            });
            
            const bookingsMap = {};
            (res.data.bookings || []).forEach(booking => {
                if (booking.isMultiDay && booking.endDate) {
                    // Multi-day expansion
                    let curr = new Date(booking.date);
                    curr.setHours(0,0,0,0);
                    const end = new Date(booking.endDate);
                    end.setHours(0,0,0,0);

                    while (curr <= end) {
                        const dStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
                        if (!bookingsMap[dStr]) bookingsMap[dStr] = [];
                        
                        let dShift = 'Full Day';
                        const isStartDay = curr.getTime() === new Date(booking.date).setHours(0,0,0,0);
                        const isEndDay = curr.getTime() === end.getTime();

                        if (isStartDay) {
                            dShift = booking.shift === 'Evening' ? 'Evening' : 'Full Day';
                        } else if (isEndDay) {
                            const eShift = booking.endShift || booking.dayShifts?.[dStr] || 'Full Day';
                            dShift = eShift === 'Morning' ? 'Morning' : 'Full Day';
                        }

                        bookingsMap[dStr].push({ ...booking, displayShift: dShift });
                        curr.setDate(curr.getDate() + 1);
                    }
                } else {
                    const bDate = new Date(booking.date);
                    const dStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
                    if (!bookingsMap[dStr]) bookingsMap[dStr] = [];
                    bookingsMap[dStr].push({ ...booking, displayShift: booking.shift });
                }
            });
            setBookings(bookingsMap);
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < today) return { status: 'Closed', color: 'text-muted' };

        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        const dayBookings = (bookings[dateStr] || []).filter(b => b.bookingStatus !== 'Cancelled');
        
        if (dayBookings.length === 0) return { status: 'Available', color: 'text-success' };
        
        const shifts = dayBookings.map(b => b.displayShift || b.shift);
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
    const handleDateClick = (date, status) => {
        if (status === 'Closed') {
            alert("This date is in the past. Please select a future date for booking.");
            return;
        }
        if (status === 'Fully Booked') {
            alert("This date is fully booked. Please select another date.");
            return;
        }

        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        setSelectedDate(date);
        setBookingForm({
            ...bookingForm,
            fullName: user?.fullName || user?.name || '',
            phone: user?.phone || user?.mobile || ''
        });
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!bookingForm.shift || !bookingForm.guests) {
            alert("Please select a shift and enter number of guests.");
            return;
        }

        setBookingLoading(true);
        try {
            await axios.post(`${API_URL}/bookings`, {
                mahalId: id,
                customerName: bookingForm.fullName,
                customerPhone: bookingForm.phone,
                date: selectedDate.toISOString().split('T')[0],
                shift: bookingForm.shift,
                bookingType: 'Online',
                guests: bookingForm.guests
            });
            alert("Booking request submitted successfully! The manager will contact you soon.");
            setShowBookingModal(false);
            fetchBookings();
        } catch (error) {
            console.error("Error submitting booking", error);
            alert(error.response?.data?.message || "Failed to submit booking. Please try again.");
        } finally {
            setBookingLoading(false);
        }
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
                
                <div className="position-absolute top-0 start-0 w-100 p-3 p-md-5" style={{ zIndex: 10 }}>
                    <div className="container">
                        <button 
                            onClick={() => navigate(-1)}
                            className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 mb-0 p-0 animate-fade-in"
                            style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '80px' }}
                        >
                            <FiArrowLeft /> Back to Discovery
                        </button>
                    </div>
                </div>
                
                <div className="position-absolute bottom-0 start-0 w-100 p-3 p-md-5">
                    <div className="container">
                        <div className="row align-items-end g-4">
                            <div className="col-lg-8">
                                <h1 className="venue-title fw-bold text-white mb-2 animate-fade-in-up" style={{ letterSpacing: '-0.03em' }}>{venue.mahalName}</h1>
                                
                                {/* Eligible Discount Highlight Chip */}
                                {(venue.discountMin > 0 || venue.discountMax > 0) && (
                                    <div className="d-inline-flex align-items-center mb-3 animate-fade-in-up delay-100" style={{ background: 'linear-gradient(90deg, rgba(230,57,70,0.9) 0%, rgba(99,102,241,0.9) 100%)', borderRadius: '100px', padding: '6px 16px', gap: '8px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(230,57,70,0.5)' }}>
                                        <FaTags className="text-white" style={{ fontSize: '0.9rem' }} />
                                        <span className="text-white fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                            Special Offer: {venue.discountMin}% to {venue.discountMax}% Off
                                        </span>
                                    </div>
                                )}
                                <div className="d-flex flex-wrap align-items-center gap-3 gap-md-4 text-white-50 animate-fade-in-up delay-100">
                                    <div className="d-flex align-items-center gap-2 small"><FiMapPin className="text-danger" /> {venue.city}, {venue.district}</div>
                                    <div className="d-flex align-items-center gap-2 small"><FiUsers className="text-danger" /> {venue.seatingCapacity}+ Guests</div>
                                    <div className="d-flex align-items-center gap-2 small">
                                        <div className="d-flex gap-1 text-warning">
                                            {(() => {
                                                const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
                                                return [1,2,3,4,5].map(s => (
                                                    <FiStar key={s} size={12} fill={s <= Math.round(avg) ? "currentColor" : "none"} />
                                                ));
                                            })()}
                                        </div>
                                        <span className="text-white fw-bold">
                                            {reviews.length > 0 
                                                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                                                : "0.0"}
                                        </span>
                                        <span className="text-white-50">({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 text-lg-end d-none d-lg-block">
                                <div className="glass-card d-inline-block p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
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
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: 'linear-gradient(180deg, #dc3545, #ff8a94)' }} />
                                        <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.01em' }}>About the Venue</h4>
                                    </div>
                                    <p className="text-muted lh-lg mb-5" style={{ textAlign: 'justify', fontSize: '0.95rem', paddingLeft: '16px', borderLeft: '2px solid #f0f0f0' }}>{venue.description}</p>
                                    
                                    <div className="row g-4 mb-5">
                                        {[
                                            { label: 'Seating', value: venue.seatingCapacity, sub: 'Guests', icon: <FaUsers size={24} /> },
                                            { label: 'Dining', value: venue.diningCapacity, sub: 'Capacity', icon: <FaUtensils size={22} /> },
                                            { label: 'Parking', value: venue.parkingCapacity, sub: 'Vehicles', icon: <FaCar size={24} /> },
                                        ].map((stat) => (
                                            <div className="col-md-4" key={stat.label}>
                                                <div style={{
                                                    padding: '24px',
                                                    borderRadius: '16px',
                                                    background: 'linear-gradient(135deg, #fff 60%, #fff5f5 100%)',
                                                    border: '1px solid rgba(220,53,69,0.1)',
                                                    boxShadow: '0 4px 20px rgba(220,53,69,0.06)',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease'
                                                }} className="stat-detail-card">
                                                    <div style={{ 
                                                        width: '50px', height: '50px', 
                                                        borderRadius: '12px', background: 'rgba(220,53,69,0.08)', 
                                                        color: '#dc3545', display: 'flex', 
                                                        alignItems: 'center', justifyContent: 'center',
                                                        margin: '0 auto 12px auto' 
                                                    }}>
                                                        {stat.icon}
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#dc3545', marginBottom: '6px' }}>{stat.label}</div>
                                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>{stat.sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex align-items-center gap-3 mb-4 mt-5 pt-3">
                                        <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(180deg, #dc3545, #ff8a94)' }} />
                                        <h5 className="fw-bold mb-0">Elite Amenities</h5>
                                    </div>
                                    <div className="row g-3 mb-5">
                                        {Object.entries(venue.facilities || {}).map(([key, val]) => (
                                            val === true && !key.toLowerCase().includes('price') && (
                                                <div key={key} className="col-md-4 col-6">
                                                    <div style={{
                                                        padding: '14px 18px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #fff5f5, #fff)',
                                                        border: '1px solid rgba(220,53,69,0.12)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 10px rgba(220,53,69,0.04)',
                                                    }} className="amenity-chip">
                                                        <div style={{
                                                            width: '28px', height: '28px', borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #dc3545, #ff6b7a)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}>
                                                            <FiCheckCircle size={14} color="white" />
                                                        </div>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize', color: '#333', letterSpacing: '0.01em' }}>{key}</span>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    <div className="row g-4 mb-5">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3 mb-4 mt-4">
                                                <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(180deg, #dc3545, #ff8a94)' }} />
                                                <h5 className="fw-bold mb-0">Operational Timings</h5>
                                            </div>
                                            <div style={{ borderRadius: '16px', border: '1px solid rgba(220,53,69,0.1)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(220,53,69,0.05)' }}>
                                                <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #fff5f5, #fff)', borderBottom: '1px solid rgba(220,53,69,0.08)' }}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #dc3545, #ff6b7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220,53,69,0.3)', flexShrink: 0 }}>
                                                            <FiClock size={18} color="white" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#dc3545', marginBottom: '2px' }}>Morning Shift</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>{venue.morningTimeFrom} — {venue.morningTimeTo}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px 24px', background: '#fff' }}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #440a0e, #dc3545)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(68,10,14,0.25)', flexShrink: 0 }}>
                                                            <FiClock size={18} color="white" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#440a0e', marginBottom: '2px' }}>Evening Shift</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>{venue.eveningTimeFrom} — {venue.eveningTimeTo}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3 mb-4 mt-4">
                                                <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(180deg, #dc3545, #ff8a94)' }} />
                                                <h5 className="fw-bold mb-0">Location Details</h5>
                                            </div>
                                            <div style={{ borderRadius: '16px', border: '1px solid rgba(220,53,69,0.1)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(220,53,69,0.05)', height: 'calc(100% - 68px)' }}>
                                                <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #fff5f5, #fff)', borderBottom: '1px solid rgba(220,53,69,0.08)' }}>
                                                    <div className="d-flex align-items-start gap-3">
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #dc3545, #ff6b7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220,53,69,0.3)', flexShrink: 0, marginTop: '2px' }}>
                                                            <FiMapPin size={18} color="white" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#dc3545', marginBottom: '4px' }}>Full Address</div>
                                                            <div style={{ fontWeight: 700, color: '#111', marginBottom: '2px' }}>{venue.doorNo}, {venue.street}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{venue.city}, {venue.district} — {venue.pincode}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px 24px', background: '#fff' }}>
                                                    <div className="d-flex align-items-start gap-3">
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #440a0e, #dc3545)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(68,10,14,0.25)', flexShrink: 0, marginTop: '2px' }}>
                                                            <FiInfo size={18} color="white" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#440a0e', marginBottom: '4px' }}>Accessibility</div>
                                                            <div style={{ fontWeight: 700, color: '#111', marginBottom: '2px' }}>Prime Location in {venue.district}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Easily accessible by public transport</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                                        <div className="d-flex gap-3">
                                            <div className="d-flex align-items-center gap-2 small fw-bold" style={{ fontSize: '0.75rem', color: '#888' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e5e7eb' }}></div> Closed</div>
                                            <div className="d-flex align-items-center gap-2 small fw-bold" style={{ fontSize: '0.75rem', color: '#065f46' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div> Available</div>
                                            <div className="d-flex align-items-center gap-2 small fw-bold" style={{ fontSize: '0.75rem', color: '#92400e' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div> Fast Filling</div>
                                            <div className="d-flex align-items-center gap-2 small fw-bold" style={{ fontSize: '0.75rem', color: '#991b1b' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc3545' }}></div> Booked</div>
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
                                                                    let textColor = '#666';
                                                                    let borderColor = 'rgba(0,0,0,0.05)';
                                                                    let cursorStyle = 'pointer';
                                                                    
                                                                    if (status === 'Closed') {
                                                                        bgColor = '#f9fafb';
                                                                        textColor = '#9ca3af';
                                                                        borderColor = '#e5e7eb';
                                                                        cursorStyle = 'not-allowed';
                                                                    } else if (status === 'Available') {
                                                                        bgColor = '#f0fdf4';
                                                                        textColor = '#16a34a';
                                                                        borderColor = '#10b981';
                                                                    } else if (status.includes('Free')) {
                                                                        bgColor = '#fffbeb';
                                                                        textColor = '#d97706';
                                                                        borderColor = '#f59e0b';
                                                                    } else if (status.includes('Booked')) {
                                                                        bgColor = '#fef2f2';
                                                                        textColor = '#dc3545';
                                                                        borderColor = '#dc3545';
                                                                    }

                                                                    return (
                                                                        <div 
                                                                            key={day} 
                                                                            className="calendar-day-box shadow-sm transition-all"
                                                                            onClick={() => handleDateClick(dateObj, status)}
                                                                            style={{
                                                                                aspectRatio: '1/1',
                                                                                background: bgColor,
                                                                                color: textColor,
                                                                                borderRadius: '12px',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: cursorStyle,
                                                                                border: `1px solid ${borderColor}`,
                                                                                boxShadow: bgColor !== 'white' && status !== 'Closed' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                                                                                position: 'relative',
                                                                                opacity: status === 'Closed' ? 0.7 : 1
                                                                            }}
                                                                        >
                                                                            <div className="fw-bold" style={{ fontSize: '0.75rem' }}>{day}</div>
                                                                            {status !== 'Available' && status !== 'Booked' && (
                                                                                <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: textColor }}></div>
                                                                            )}
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
                                <div className="p-4 text-white" style={{ background: 'linear-gradient(135deg, #111 0%, #440a0e 100%)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <div className="small text-white-50 text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Premium Reservation</div>
                                        <div className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.6rem' }}>OFFER ACTIVE</div>
                                    </div>
                                    <h4 className="fw-bold mb-0">Booking Details</h4>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <div className="text-muted small fw-bold text-uppercase mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Pricing Options</div>
                                        
                                        <div className="p-3 rounded-4 mb-2 d-flex justify-content-between align-items-center transition-all hover-bg-light" style={{ border: '1px solid #f0f0f0' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 bg-light rounded-3 text-danger"><FiClock size={16} /></div>
                                                <div>
                                                    <div className="fw-bold small">Morning Slot</div>
                                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{venue.morningTimeFrom} - {venue.morningTimeTo}</div>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-dark"><FaRupeeSign size={12} /> {(venue.morningPrice || venue.fullDayPrice/2).toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-4 mb-2 d-flex justify-content-between align-items-center transition-all hover-bg-light" style={{ border: '1px solid #f0f0f0' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 bg-light rounded-3 text-danger"><FiClock size={16} /></div>
                                                <div>
                                                    <div className="fw-bold small">Evening Slot</div>
                                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{venue.eveningTimeFrom} - {venue.eveningTimeTo}</div>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-dark"><FaRupeeSign size={12} /> {(venue.eveningPrice || venue.fullDayPrice/2).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-4 bg-dark text-white d-flex justify-content-between align-items-center shadow-sm">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 bg-white-10 rounded-3 text-white"><FiCalendar size={16} /></div>
                                                <div>
                                                    <div className="fw-bold small">Full Day Booking</div>
                                                    <div className="text-white-50" style={{ fontSize: '0.65rem' }}>Full Day Access</div>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold" style={{ color: '#ff8a94' }}><FaRupeeSign size={12} /> {venue.fullDayPrice?.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="alert alert-light border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3" style={{ background: '#f8f9fa' }}>
                                        <div className="p-2 bg-white rounded-circle shadow-sm text-info"><FiInfo size={16} /></div>
                                        <div className="small text-muted lh-base">
                                            Price may vary based on guest count and special requirements. Taxes applicable as per norms.
                                        </div>
                                    </div>

                                    <button 
                                        className="btn btn-dark w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg transform-active"
                                        style={{ background: 'linear-gradient(135deg, #111, #333)', border: 'none' }}
                                        onClick={() => navigate('/user/register')}
                                    >
                                        Contact Manager to Book <FaChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-4 border bg-white shadow-sm">
                                <h6 className="fw-bold mb-3">Quick Support</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-3 text-danger"><FiPhone size={16} /></div>
                                        <div>
                                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Call Us</div>
                                            <div className="fw-bold small">+91 98765 43210</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-3 text-danger"><FiMail size={16} /></div>
                                        <div>
                                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Email Us</div>
                                            <div className="fw-bold small">support@mehfilone.com</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Premium Booking Modal */}
            {showBookingModal && (
                <div className="modal-overlay d-flex align-items-end align-items-md-center justify-content-center p-0 p-md-3" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', zIndex: 9999 }}>
                    <div className="booking-modal-card bg-white w-100 rounded-t-4 rounded-md-4 animate-slide-up shadow-2xl" style={{ maxWidth: '1000px', maxHeight: '95vh', overflowY: 'auto', overflowX: 'hidden' }}>
                        <div className="p-4 text-white d-flex justify-content-between align-items-center sticky-top" style={{ background: 'linear-gradient(135deg, #111, #440a0e)', zIndex: 10 }}>
                            <div>
                                <h5 className="fw-bold mb-0">Secure Your Slot</h5>
                                <div className="small text-white-50">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            <button onClick={() => setShowBookingModal(false)} className="btn btn-link text-white p-0 text-decoration-none h4 mb-0">&times;</button>
                        </div>
                        <div className="p-4">
                            <OnlineBookingForm 
                                venue={venue} 
                                selectedDate={selectedDate} 
                                bookings={bookings}
                                onClose={() => setShowBookingModal(false)}
                                onSuccess={() => {
                                    setShowBookingModal(false);
                                    fetchBookings();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', zIndex: 9999 }}>
                    <div className="bg-white p-4 p-md-5 rounded-4 text-center animate-fade-in shadow-2xl" style={{ maxWidth: '420px', width: '100%' }}>
                        <div className="p-4 bg-danger-soft rounded-circle d-inline-block mb-4 text-danger">
                            <FiUsers size={40} />
                        </div>
                        <h4 className="fw-bold mb-3">Members Only</h4>
                        <p className="text-muted mb-4 small">Please login or create an account to secure this venue for your special event.</p>
                        <div className="d-flex flex-column gap-2">
                            <button onClick={() => navigate('/user/login', { state: { from: location.pathname } })} className="btn btn-danger rounded-pill py-3 fw-bold shadow-sm">Sign In to Book</button>
                            <button onClick={() => navigate('/user/register')} className="btn btn-light rounded-pill py-3 fw-bold border">Create Free Account</button>
                            <button onClick={() => setShowLoginPrompt(false)} className="btn btn-link text-muted text-decoration-none mt-2 small">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .venue-hero-section { height: 50vh; min-height: 400px; }
                .venue-title { font-size: 2rem; line-height: 1.2; }
                @media (min-width: 768px) {
                    .venue-hero-section { height: 60vh; }
                    .venue-title { font-size: 3.5rem; }
                    .rounded-t-4 { border-top-left-radius: 24px !important; border-top-right-radius: 24px !important; }
                }
                @media (max-width: 767px) {
                    .venue-hero-section { height: 65vh; min-height: 450px; }
                    .venue-title { font-size: 2.2rem; }
                    .rounded-t-4 { border-top-left-radius: 32px !important; border-top-right-radius: 32px !important; }
                    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0, 0, 0.2, 1); }
                    .booking-modal-card { border-radius: 32px 32px 0 0 !important; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .bg-danger-soft { background: rgba(220, 53, 69, 0.08); }
                .alert-danger-soft { background: rgba(220, 53, 69, 0.05); color: #dc3545; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; opacity: 0; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .shadow-premium { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); }
                .hover-scale:hover { transform: scale(1.05); }
                .cursor-pointer { cursor: pointer; }
                .transform-active:active { transform: scale(0.98); }
                .border-transparent { border: 2px solid transparent; }
                .hover-scale-sm:hover { transform: scale(1.02); }
            `}</style>
        </div>
    );
};

export default VenueDetailsPage;
