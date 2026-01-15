import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { API_URL } from '../../utils/function';
import '../../styles/superadmin/Dashboard.css';

const VendorDashboard = () => {
    // State
    const [vendorProfile, setVendorProfile] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
        online: 0,
        offline: 0,
        totalRevenue: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const rawUser = localStorage.getItem('vendor_user');

            const user = JSON.parse(rawUser || '{}');

            // Handle both 'id' (from simple object) and '_id' (from Mongo document)
            const userId = user.id || user._id;

            if (!userId) {
                console.warn("No user ID found, skipping fetch.");
                setLoading(false);
                return;
            }

            try {
                // Parallel requests for better performance
                const [bookingsRes, vendorRes] = await Promise.all([
                    axios.get(`${API_URL}/bookings?vendorId=${userId}&all=true`),
                    axios.get(`${API_URL}/vendors/${userId}`)
                ]);

                // Update Vendor Profile
                if (vendorRes.data) {
                    setVendorProfile(vendorRes.data);
                    localStorage.setItem('vendor_user', JSON.stringify(vendorRes.data));
                }

                const bookings = bookingsRes.data.bookings || [];


                let total = 0;
                let confirm = 0;
                let pend = 0;
                let on = 0;
                let off = 0;
                let list = [];

                // Process bookings
                bookings.forEach(booking => {
                    total++;
                    // Status Check
                    if (booking.bookingStatus === 'Confirmed') confirm++;
                    else if (booking.bookingStatus === 'Pending') pend++;

                    // Payment Mode Check
                    if (booking.paymentMode?.toLowerCase().includes('online')) on++;
                    else off++;

                    // Format date for display
                    const dateObj = new Date(booking.date);
                    const dateStr = dateObj.toISOString().split('T')[0];

                    list.push({
                        ...booking,
                        date: dateStr,
                        customer: booking.customerName || booking.customer
                    });
                });

                // Sort by date upcoming
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                list.sort((a, b) => new Date(a.date) - new Date(b.date));

                const futureEvents = list.filter(b => new Date(b.date) >= today).slice(0, 5);

                setStats(prev => ({
                    ...prev,
                    totalBookings: total,
                    confirmed: confirm,
                    pending: pend,
                    online: on,
                    offline: off
                }));
                setUpcomingEvents(futureEvents);
                setAllBookings(list);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const localUser = JSON.parse(localStorage.getItem('vendor_user') || '{}');
    const displayUser = vendorProfile || localUser;
    const currentPlanName = displayUser.plan || 'Standard';
    const currentPlan = SUBSCRIPTION_PLANS.find(p => p.name === currentPlanName) || SUBSCRIPTION_PLANS[0];

    if (loading) {
        return <div className="p-5 text-center">Loading Dashboard...</div>;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="sa-dashboard-title mb-0">Vendor Dashboard</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className={`badge rounded-pill px-3 py-2 ${currentPlan.name === 'Premium' ? 'bg-gradient-gold text-dark' : 'bg-primary'}`}>
                        <i className={`bi ${currentPlan.name === 'Premium' ? 'bi-star-fill' : 'bi-shield-check'} me-2`}></i>
                        {currentPlan.name} Plan
                    </span>
                </div>
            </div>

            <div className="row g-4">
                {/* Total Bookings */}
                <div className="col-md-4">
                    <div className="sa-stat-card icon-red h-100">
                        <div className="sa-stat-content">
                            <span className="sa-stat-title">Total Bookings</span>
                            <span className="sa-stat-value">{stats.totalBookings}</span>
                            <div className="d-flex gap-3 mt-2 small text-muted">
                                <span><i className="bi bi-circle-fill text-success fs-6 me-1"></i> {stats.confirmed} Confirmed</span>
                                <span><i className="bi bi-circle-fill text-warning fs-6 me-1"></i> {stats.pending} Pending</span>
                            </div>
                        </div>
                        <div className="sa-icon-wrapper">
                            <i className="bi bi-calendar-check"></i>
                        </div>
                        <div className="sa-watermark-icon">
                            <i className="bi bi-calendar-check"></i>
                        </div>
                    </div>
                </div>

                {/* Booking Mode Stats */}
                <div className="col-md-4">
                    <div className="sa-stat-card icon-gold h-100">
                        <div className="sa-stat-content">
                            <span className="sa-stat-title">Booking Sources</span>
                            <span className="sa-stat-value">{stats.online} <span className="fs-6 text-muted">Online</span></span>
                            <span className="text-dark fw-bold mt-1">{stats.offline} <span className="text-muted fw-normal">Offline Entries</span></span>
                        </div>
                        <div className="sa-icon-wrapper">
                            <i className="bi bi-laptop"></i>
                        </div>
                        <div className="sa-watermark-icon">
                            <i className="bi bi-laptop"></i>
                        </div>
                    </div>
                </div>

                {/* Next Event */}
                <div className="col-md-4">
                    <div className="sa-stat-card icon-black h-100">
                        <div className="sa-stat-content">
                            <span className="sa-stat-title">Next Event</span>
                            {upcomingEvents.length > 0 ? (
                                <>
                                    <span className="sa-stat-value" style={{ fontSize: '1.8rem' }}>{upcomingEvents[0].customer}</span>
                                    <span className="text-success fw-bold mt-2"><i className="bi bi-clock me-1"></i> {upcomingEvents[0].date}</span>
                                    <span className="small text-muted">{upcomingEvents[0].shift}</span>
                                </>
                            ) : (
                                <span className="sa-stat-value text-muted" style={{ fontSize: '1.5rem' }}>No Upcoming</span>
                            )}
                        </div>
                        <div className="sa-icon-wrapper">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-4">
                {/* Upcoming Events List */}
                <div className="col-lg-5">
                    <div className="sa-card-wrapper h-100">
                        <h2 className="sa-section-title mb-4">Upcoming Events</h2>
                        <div className="list-group list-group-flush">
                            {upcomingEvents.length > 0 ? upcomingEvents.map((evt, idx) => (
                                <div key={idx} className="list-group-item px-0 border-bottom d-flex align-items-center justify-content-between py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 text-center me-3" style={{ minWidth: '50px' }}>
                                            <div className="fw-bold text-danger" style={{ fontSize: '0.8rem' }}>{new Date(evt.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                            <div className="fw-bold fs-5">{new Date(evt.date).getDate()}</div>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold text-dark">{evt.customer}</h6>
                                            <small className="text-muted">{evt.shift} • {evt.paymentMode || 'Unknown'}</small>
                                        </div>
                                    </div>
                                    <span className={`badge ${evt.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{evt.paymentStatus || 'Paid'}</span>
                                </div>
                            )) : (
                                <div className="text-center text-muted py-4">No upcoming events found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Bookings Table */}
                <div className="col-lg-7">
                    <div className="sa-card-wrapper h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="sa-section-title">All Bookings</h2>
                            <button className="btn btn-sm btn-outline-secondary">Export CSV</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table sa-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allBookings.slice(0, 8).map((booking, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="fw-bold text-dark mb-0">{booking.date}</div>
                                                <small className="text-muted">{booking.shift}</small>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">{booking.customer}</div>
                                                <small className="text-muted">{booking.phone || booking.customerPhone}</small>
                                            </td>
                                            <td>
                                                {booking.bookingStatus === 'Confirmed'
                                                    ? <span className="badge bg-light-success text-success border border-success px-2 py-1 rounded-pill">Confirmed</span>
                                                    : <span className="badge bg-light-warning text-warning border border-warning px-2 py-1 rounded-pill">{booking.bookingStatus || 'Confirmed'}</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`sa-status-dot ${booking.paymentStatus === 'Paid' ? 'active' : 'pending'}`}></span>
                                                {booking.paymentStatus || 'Paid'}
                                            </td>
                                            <td>
                                                <small className="text-muted fw-bold">{booking.paymentMode || 'Online'}</small>
                                            </td>
                                        </tr>
                                    ))}
                                    {allBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">No bookings found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
