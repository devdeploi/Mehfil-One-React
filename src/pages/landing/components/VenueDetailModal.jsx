import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../utils/function';
import { FiX, FiCheckCircle, FiStar, FiCalendar, FiMapPin, FiUsers, FiInfo, FiMessageCircle, FiSend, FiClock } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const VenueDetailModal = ({ venue, initialTab, onClose }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'details');
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (venue) {
            fetchReviews();
            fetchBookings();
        }
    }, [venue]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/reviews/${venue._id}`);
            setReviews(res.data.reviews || []);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/bookings?mahalId=${venue._id}&all=true`);
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
                mahalId: venue._id,
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

    // Helper to check if a date is booked
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

    // Generate next 30 days
    const nextDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    if (!venue) return null;

    return (
        <div className="venue-modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="venue-modal-content animate-fade-in-up" style={{
                background: 'white', width: '100%', maxWidth: '1000px', maxHeight: '90vh',
                borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }}>
                {/* Close Button */}
                <button onClick={onClose} className="position-absolute border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center bg-white" style={{
                    top: '20px', right: '20px', width: '45px', height: '45px', zIndex: 10
                }}>
                    <FiX size={24} />
                </button>

                <div className="row g-0 flex-grow-1 overflow-hidden">
                    {/* Left: Gallery & Hero Image */}
                    <div className="col-lg-5 d-none d-lg-block bg-light" style={{ height: 'auto', borderRight: '1px solid #eee' }}>
                        <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                            <img src={`${API_URL.replace('/api', '')}/${venue.coverImage}`} alt="" className="w-100 h-100 object-fit-cover" />
                        </div>
                        <div className="p-4">
                            <h5 className="fw-bold mb-3">Gallery</h5>
                            <div className="row g-2">
                                {venue.galleryImages?.slice(0, 4).map((img, i) => (
                                    <div key={i} className="col-6">
                                        <img src={`${API_URL.replace('/api', '')}/${img}`} className="w-100 rounded-3 shadow-sm" style={{ height: '100px', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-4" style={{ background: 'rgba(200,16,46,0.05)' }}>
                                <div className="small text-muted fw-bold text-uppercase tracking-widest mb-2" style={{ fontSize: '0.65rem' }}>Location Details</div>
                                <div className="d-flex align-items-center gap-2 small fw-bold mb-1">
                                    <FiMapPin className="text-danger" /> {venue.city}, {venue.district}
                                </div>
                                <div className="text-muted small">{venue.doorNo}, {venue.street}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tabs & Content */}
                    <div className="col-lg-7 d-flex flex-column h-100 overflow-hidden">
                        {/* Header Tabs */}
                        <div className="d-flex border-bottom px-4 pt-4 bg-white" style={{ gap: '2rem' }}>
                            <div 
                                onClick={() => setActiveTab('details')}
                                className={`pb-3 fw-bold cursor-pointer transition-all ${activeTab === 'details' ? 'text-danger border-bottom border-danger border-3' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <FiInfo className="me-2" /> Details
                            </div>
                            <div 
                                onClick={() => setActiveTab('availability')}
                                className={`pb-3 fw-bold cursor-pointer transition-all ${activeTab === 'availability' ? 'text-danger border-bottom border-danger border-3' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <FiCalendar className="me-2" /> Availability
                            </div>
                            <div 
                                onClick={() => setActiveTab('reviews')}
                                className={`pb-3 fw-bold cursor-pointer transition-all ${activeTab === 'reviews' ? 'text-danger border-bottom border-danger border-3' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <FiMessageCircle className="me-2" /> Reviews
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                            {activeTab === 'details' && (
                                <div className="animate-fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="fw-bold h3 mb-0">{venue.mahalName}</h2>
                                        <div className="badge bg-danger p-2 px-3 rounded-pill fw-bold d-flex align-items-center gap-1 shadow-sm">
                                            <FaRupeeSign /> {venue.fullDayPrice?.toLocaleString()}
                                        </div>
                                    </div>

                                    <p className="text-muted fs-5 lh-lg mb-5">{venue.description}</p>

                                    <div className="row g-4 mb-5">
                                        <div className="col-md-6">
                                            <div className="p-3 border rounded-4 bg-light d-flex align-items-center gap-3">
                                                <div className="p-2 bg-white rounded-3 shadow-sm text-danger"><FiUsers size={20} /></div>
                                                <div>
                                                    <div className="small text-muted fw-bold">Capacity</div>
                                                    <div className="fw-bold">{venue.seatingCapacity} Guests</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-3 border rounded-4 bg-light d-flex align-items-center gap-3">
                                                <div className="p-2 bg-white rounded-3 shadow-sm text-danger"><FiClock size={20} /></div>
                                                <div>
                                                    <div className="small text-muted fw-bold">Shift Timing</div>
                                                    <div className="fw-bold">{venue.morningTimeFrom} - {venue.eveningTimeTo}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-4">Premium Facilities</h5>
                                    <div className="row g-3">
                                        {Object.entries(venue.facilities || {}).map(([key, val]) => (
                                            val && (
                                                <div key={key} className="col-md-4 col-6">
                                                    <div className="d-flex align-items-center gap-2 text-dark fw-bold small text-uppercase tracking-wider">
                                                        <FiCheckCircle className="text-success" /> {key}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'availability' && (
                                <div className="animate-fade-in">
                                    <div className="mb-4 p-3 rounded-4 bg-info-subtle border border-info-subtle text-info d-flex align-items-center gap-3">
                                        <FiInfo size={20} />
                                        <div className="small fw-bold">Showing real-time availability for the next 30 days.</div>
                                    </div>
                                    
                                    <div className="d-flex flex-column gap-2">
                                        {nextDays.map((date, idx) => {
                                            const { status, color } = getBookingStatus(date);
                                            return (
                                                <div key={idx} className="p-3 border rounded-4 d-flex justify-content-between align-items-center bg-white shadow-sm transition-all hover-scale-sm">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="text-center p-2 rounded-3 bg-light" style={{ minWidth: '60px' }}>
                                                            <div className="small fw-bold text-muted">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                            <div className="h5 fw-bold mb-0">{date.getDate()}</div>
                                                        </div>
                                                        <div className="fw-bold">{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                    <div className={`fw-bold ${color} px-3 py-1 rounded-pill`} style={{ background: 'rgba(0,0,0,0.03)', fontSize: '0.8rem' }}>
                                                        {status}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="animate-fade-in">
                                    {/* Add Review Form */}
                                    {user ? (
                                        <div className="p-4 rounded-4 border bg-light mb-5">
                                            <h5 className="fw-bold mb-3">Add a Review</h5>
                                            <form onSubmit={handleAddReview}>
                                                <div className="mb-3 d-flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FiStar 
                                                            key={star} 
                                                            size={24} 
                                                            className="cursor-pointer transition-all"
                                                            fill={star <= newReview.rating ? '#ffc107' : 'none'}
                                                            color={star <= newReview.rating ? '#ffc107' : '#ddd'}
                                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                </div>
                                                <textarea 
                                                    className="form-control rounded-4 p-3 mb-3 border-0 shadow-sm"
                                                    rows="3"
                                                    placeholder="Share your experience with this venue..."
                                                    value={newReview.comment}
                                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                ></textarea>
                                                <button 
                                                    className="btn btn-danger w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                                    disabled={reviewLoading}
                                                >
                                                    {reviewLoading ? 'Posting...' : <><FiSend /> Post Review</>}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-4 border bg-light text-center mb-5">
                                            <p className="text-muted mb-0 fw-bold">Please sign in to share your experience.</p>
                                        </div>
                                    )}

                                    <h5 className="fw-bold mb-4">Guest Feedback ({reviews.length})</h5>
                                    <div className="d-flex flex-column gap-4">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <div key={review._id} className="p-4 rounded-4 border bg-white shadow-sm">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="p-3 rounded-circle bg-danger text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                                {review.userName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold">{review.userName}</div>
                                                                <div className="small text-muted">{new Date(review.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <FiStar 
                                                                    key={i} 
                                                                    size={14} 
                                                                    fill={i < review.rating ? '#ffc107' : 'none'}
                                                                    color={i < review.rating ? '#ffc107' : '#ddd'}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-muted mb-0">{review.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <FiMessageCircle size={40} className="opacity-25 mb-3" />
                                                <p>No reviews yet. Be the first to share your thoughts!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                .hover-scale-sm:hover { transform: scale(1.02); }
            `}</style>
        </div>
    );
};

export default VenueDetailModal;
