import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaBuilding, FaSave, FaPhone, FaUser, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import '../../styles/superadmin/Dashboard.css';

const VendorAvailability = () => {

    const [mahals, setMahals] = useState([]);
    const [selectedMahalId, setSelectedMahalId] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- 1. Fetch Mahals ---
    useEffect(() => {
        const fetchMahals = async () => {
            try {
                const storedUser = localStorage.getItem('vendor_user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    // Handle both 'id' (from simple object) and '_id' (from Mongo document)
                    const userId = user.id || user._id;
                    // Assuming endpoint supports fetching by vendorId
                    const response = await axios.get(`${API_URL}/mahals?vendorId=${userId}`);
                    // Map _id to id for compatibility or update usage
                    const mappedMahals = response.data.mahals.map(m => ({ ...m, id: m._id }));
                    setMahals(mappedMahals);

                    if (mappedMahals.length > 0) {
                        setSelectedMahalId(mappedMahals[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching mahals", error);
            }
        };
        fetchMahals();
    }, []);


    // --- 2. Calendar State ---
    const [currentDate, setCurrentDate] = useState(new Date());

    // Bookings State: Map {'YYYY-MM-DD': [bookings]}
    const [bookings, setBookings] = useState({});

    // Fetch Bookings when Mahal or Month changes
    useEffect(() => {
        if (!selectedMahalId) return;
        fetchBookings();
    }, [selectedMahalId, currentDate.getMonth(), currentDate.getFullYear()]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            // Fetch for the whole month (or just 'all' for simplicity as per controller)
            // Using 'all=true' to get all bookings for the mahal to fill the calendar easily
            // In a real large app, we would fetch by range.
            const response = await axios.get(`${API_URL}/bookings`, {
                params: {
                    mahalId: selectedMahalId,
                    all: 'true'
                }
            });

            // Transform [ { date: 'ISO...', ... } ] -> { 'YYYY-MM-DD': [...] }
            const bookingsMap = {};
            response.data.bookings.forEach(booking => {
                const d = new Date(booking.date);
                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                if (!bookingsMap[dateKey]) {
                    bookingsMap[dateKey] = [];
                }
                bookingsMap[dateKey].push(booking);
            });
            setBookings(bookingsMap);

        } catch (error) {
            console.error("Error fetching bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        shift: 'Morning',
        paymentMode: 'Offline - Cash',
        paymentStatus: 'Pending',
        bookingStatus: 'Confirmed'
    });

    const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'month', 'year'
    const [yearRangeStart, setYearRangeStart] = useState(Math.floor(new Date().getFullYear() / 20) * 20);

    const toggleViewMode = () => {
        if (viewMode === 'calendar') setViewMode('month');
        else if (viewMode === 'month') setViewMode('year');
    };

    const changePeriod = (offset) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'calendar') {
            newDate.setMonth(newDate.getMonth() + offset);
        } else if (viewMode === 'month') {
            newDate.setFullYear(newDate.getFullYear() + offset);
        } else if (viewMode === 'year') {
            setYearRangeStart(prev => prev + (offset * 20));
            return;
        }
        setCurrentDate(newDate);
    };

    const [editingUpdates, setEditingUpdates] = useState({});

    // --- Helper to Filter Bookings by Mahal ---
    // Now that bookings are fetched specifically for the selected Mahal from API, 
    // the 'bookings' state ONLY contains bookings for the selected mahal.
    // So we just need to get by Date.
    const getBookingsForDate = (dateStr) => {
        return bookings[dateStr] || [];
    };

    const handleDateClick = (dayStr) => {
        if (!selectedMahalId) {
            alert("Please select a Mahal first.");
            return;
        }
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;

        // Get bookings for this Date
        const relevantBookings = getBookingsForDate(dateStr);

        const hasMorning = relevantBookings.some(b => b.shift === 'Morning');
        const hasEvening = relevantBookings.some(b => b.shift === 'Evening');

        setSelectedDate(dateStr);
        setEditingUpdates({});
        setFormData({
            customerName: '',
            customerPhone: '',
            shift: hasMorning ? 'Evening' : (hasEvening ? 'Morning' : 'Morning'),
            paymentMode: 'Offline - Cash',
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed'
        });
        setShowModal(true);
    };

    const handleLocalUpdate = (bookingId, field, value) => {
        setEditingUpdates(prev => ({ ...prev, [bookingId]: { ...prev[bookingId], [field]: value } }));
    };

    const handleSaveChanges = async (bookingId) => {
        const updates = editingUpdates[bookingId];
        if (!updates) return;

        try {
            await axios.put(`${API_URL}/bookings/${bookingId}`, updates);
            alert("Booking updated successfully!");

            // Optimistic Update or Refetch
            fetchBookings();

            setEditingUpdates(prev => {
                const newState = { ...prev };
                delete newState[bookingId];
                return newState;
            });
            setShowModal(false);
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update booking.");
        }
    };

    const handleMonthSelect = (monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setViewMode('calendar');
    };

    const handleYearSelect = (year) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setViewMode('month');
    };

    const handleSaveBooking = async (e) => {
        e.preventDefault();
        if (!selectedMahalId) return;

        try {
            const payload = {
                mahalId: selectedMahalId,
                date: selectedDate, // YYYY-MM-DD string is fine, backend converts
                shift: formData.shift,
                customerName: formData.customerName, // Backend expects customerName, frontend form used customerName
                customerPhone: formData.customerPhone,
                paymentMode: formData.paymentMode,
                paymentStatus: formData.paymentStatus,
                bookingStatus: formData.bookingStatus
            };

            await axios.post(`${API_URL}/bookings`, payload);
            alert("Booking Confirmed!");
            setShowModal(false);
            fetchBookings(); // Refresh

        } catch (error) {
            console.error("Booking failed", error);
            const msg = error.response?.data?.msg || "Booking failed.";
            alert(msg);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const blankDays = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const checkAvailability = (day) => {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = dateObj < today;

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayBookings = getBookingsForDate(dateStr);

        // Past Dates Logic
        if (isPast) {
            if (dayBookings.length === 0) {
                return { status: 'Disabled', color: 'bg-light text-muted opacity-50', headerColor: 'bg-light', headerText: 'text-muted', isPast: true, isDisabled: true };
            }
            return { status: 'Completed', color: 'bg-white', headerColor: 'bg-success', headerText: 'text-white', isPast: true };
        }

        // Future/Today Logic
        // Filter out cancelled bookings if any (though backend query filters them usually, good to be safe)
        const activeBookings = dayBookings.filter(b => b.bookingStatus !== 'Cancelled');

        if (activeBookings.some(b => b.shift === 'Full Day')) return { status: 'Full', color: 'bg-white', headerColor: 'bg-danger', headerText: 'text-white', isPast };

        const hasMorning = activeBookings.some(b => b.shift === 'Morning');
        const hasEvening = activeBookings.some(b => b.shift === 'Evening');

        if (hasMorning && hasEvening) return { status: 'Full', color: 'bg-white', headerStyle: { backgroundColor: '#800080' }, headerText: 'text-white', isPast };

        if (hasMorning) return { status: 'Morning Booked', color: 'bg-white', headerColor: 'bg-warning', headerText: 'text-dark', isPast };
        if (hasEvening) return { status: 'Evening Booked', color: 'bg-white', headerColor: 'bg-info', headerText: 'text-dark', isPast };

        return { status: 'Available', color: 'bg-white', headerColor: 'bg-white', headerText: 'text-dark', isPast };
    };

    // --- Render Functions ---

    const renderHeader = () => {
        let title = "";
        if (viewMode === 'calendar') title = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        else if (viewMode === 'month') title = currentDate.getFullYear();
        else if (viewMode === 'year') title = `${yearRangeStart} - ${yearRangeStart + 19}`;

        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                {/* 1. Left: Mahal Selector */}
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-secondary text-uppercase small d-none d-md-block">Viewing:</span>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-primary">
                            <FaBuilding />
                        </span>
                        <select
                            className="form-select border-start-0 fw-bold shadow-sm"
                            style={{ maxWidth: '250px', cursor: 'pointer' }}
                            value={selectedMahalId || ''}
                            onChange={(e) => setSelectedMahalId(e.target.value)} // Value is string usually from select
                        >
                            {mahals.map(m => (
                                <option key={m.id} value={m.id}>{m.mahalName || m.hallName}</option>
                            ))}
                            {mahals.length === 0 && <option value="">No Mahals Found</option>}
                        </select>
                    </div>
                </div>

                {/* 2. Middle/Right: Date Navigation */}
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light rounded-circle shadow-sm" onClick={() => changePeriod(-1)}><FaChevronLeft /></button>
                    <h4 className="fw-bold mb-0 text-dark cursor-pointer hover-opacity" onClick={toggleViewMode} style={{ cursor: 'pointer', minWidth: '150px', textAlign: 'center' }}>
                        {title}
                    </h4>
                    <button className="btn btn-light rounded-circle shadow-sm" onClick={() => changePeriod(1)}><FaChevronRight /></button>
                </div>
            </div>
        );
    };

    const renderMonthGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {Array.from({ length: 12 }).map((_, i) => {
                const isSelected = currentDate.getMonth() === i;
                const monthStr = new Date(0, i).toLocaleString('default', { month: 'long' });
                return (
                    <div key={i} className={`rounded-3 p-4 text-center fw-bold shadow-sm cursor-pointer ${isSelected ? 'bg-danger text-white' : 'bg-light'}`} onClick={() => handleMonthSelect(i)}>
                        {monthStr}
                    </div>
                );
            })}
        </div>
    );

    const renderYearGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {Array.from({ length: 20 }).map((_, i) => {
                const year = yearRangeStart + i;
                const isSelected = currentDate.getFullYear() === year;
                return (
                    <div key={i} className={`rounded-3 p-3 text-center fw-bold shadow-sm cursor-pointer ${isSelected ? 'bg-danger text-white' : 'bg-light'}`} onClick={() => handleYearSelect(year)}>
                        {year}
                    </div>
                );
            })}
        </div>
    );

    const renderLegend = () => (
        <div className="d-flex flex-wrap align-items-center gap-4 mb-4 p-3 rounded-4 border bg-white shadow-sm">
            <span className="small fw-bold text-uppercase text-muted ls-1">Key:</span>
            <div className="d-flex align-items-center"><i className="bi bi-brightness-high-fill text-warning fs-5 me-2"></i><span className="small">Morning</span></div>
            <div className="d-flex align-items-center"><i className="bi bi-moon-stars-fill text-info fs-5 me-2"></i><span className="small">Evening</span></div>
            <div className="d-flex align-items-center"><i className="bi bi-calendar-check-fill text-danger fs-5 me-2"></i><span className="small">Full Day</span></div>
            <div className="d-flex align-items-center"><div className="rounded-circle me-2" style={{ width: '15px', height: '15px', backgroundColor: '#800080' }}></div><span className="small">Both</span></div>
        </div>
    );

    const renderCalendarGrid = () => (
        <>
            <div className="d-grid text-center mb-3" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="small text-secondary fw-bold text-uppercase">{d}</div>)}
            </div>
            {loading ? (
                <div className="text-center py-5 text-muted">Loading Bookings...</div>
            ) : (
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(day => {
                        const { status, color, style, isDisabled, isPast, headerColor, headerText, headerStyle } = checkAvailability(day);
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayBookings = getBookingsForDate(dateStr);

                        return (
                            <div
                                key={day}
                                className={`rounded-3 text-start position-relative shadow-sm hover-scale border-0 ${color}`}
                                style={{ minHeight: '110px', cursor: isDisabled ? 'not-allowed' : 'pointer', overflow: 'hidden', ...style }}
                                onClick={() => !isDisabled && handleDateClick(day)}
                            >
                                <div className={`d-flex justify-content-between align-items-center px-3 py-2 ${headerColor} ${headerText}`} style={{ ...headerStyle }}>
                                    <span className="fw-bold">{day}</span>
                                    {status !== 'Available' && status !== 'Disabled' && (
                                        <div className="d-flex gap-1">
                                            {dayBookings.some(b => b.shift === 'Morning') && <i className="bi bi-brightness-high-fill text-dark small"></i>}
                                            {dayBookings.some(b => b.shift === 'Evening') && <i className="bi bi-moon-stars-fill text-white small"></i>}
                                            {dayBookings.some(b => b.shift === 'Full Day') && <i className="bi bi-calendar-event-fill text-white small"></i>}
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-1 p-2">
                                    {dayBookings.map((bk, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between px-1 mb-1">
                                            <div className="text-truncate fw-bold text-dark" style={{ fontSize: '0.7rem', maxWidth: '65%' }}>
                                                {bk.shift === 'Morning' && <i className="bi bi-brightness-high-fill text-warning me-1"></i>}
                                                {bk.shift === 'Evening' && <i className="bi bi-moon-stars-fill text-info me-1"></i>}
                                                {bk.shift === 'Full Day' && <i className="bi bi-calendar-event-fill text-danger me-1"></i>}
                                                <span title={bk.customerName || bk.customer}>{bk.customerName || bk.customer}</span>
                                            </div>
                                            <span className={`badge ${bk.bookingStatus === 'Confirmed' ? 'bg-success' : bk.bookingStatus === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill`} style={{ fontSize: '0.55rem', padding: '2px 5px' }}>
                                                {bk.bookingStatus}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    // Modal Helpers
    const filteredModalBookings = getBookingsForDate(selectedDate);
    const hasFullDay = filteredModalBookings.some(b => b.shift === 'Full Day');
    const hasMorning = filteredModalBookings.some(b => b.shift === 'Morning');
    const hasEvening = filteredModalBookings.some(b => b.shift === 'Evening');
    const isDayFull = hasFullDay || (hasMorning && hasEvening);
    const isPastSelected = selectedDate ? new Date(selectedDate) < new Date().setHours(0, 0, 0, 0) : false;

    return (
        <div className="card border-0 shadow-sm p-4 h-100">
            {renderHeader()}
            {viewMode === 'calendar' && renderLegend()}
            {viewMode === 'calendar' && renderCalendarGrid()}
            {viewMode === 'month' && renderMonthGrid()}
            {viewMode === 'year' && renderYearGrid()}

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
                    <div className="bg-white rounded-4 shadow-lg" style={{ width: '400px', maxWidth: '90%' }}>
                        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                            <div>
                                <h3 className="modal-title fs-5 fw-bold mb-1">{filteredModalBookings.length > 0 ? 'Manage Bookings' : 'Add Booking'}</h3>
                                <div className="text-muted small">{new Date(selectedDate).toDateString()}</div>
                            </div>
                            <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            {filteredModalBookings.length > 0 && (
                                <div className="mb-4">
                                    {filteredModalBookings.map((booking, idx) => {
                                        const bookingId = booking._id; // Real ID
                                        const updates = editingUpdates[bookingId] || {};
                                        const payStatus = updates.paymentStatus || booking.paymentStatus;
                                        const bookStatus = updates.bookingStatus || booking.bookingStatus;

                                        // Status Colors
                                        const getStatusColor = (status) => {
                                            switch (status) {
                                                case 'Paid': return 'text-success bg-success-subtle';
                                                case 'Confirmed': return 'text-success bg-success-subtle';
                                                case 'Pending': return 'text-warning bg-warning-subtle';
                                                case 'Partial': return 'text-primary bg-primary-subtle';
                                                case 'Cancelled': return 'text-danger bg-danger-subtle';
                                                default: return 'text-secondary bg-light';
                                            }
                                        };

                                        return (
                                            <div key={bookingId} className="p-3 bg-white rounded-4 border shadow-sm mb-3 position-relative overflow-hidden hover-shadow transition-all">
                                                {/* Left Status Strip */}
                                                <div className={`position-absolute top-0 start-0 h-100`}
                                                    style={{ width: '4px', backgroundColor: booking.shift === 'Morning' ? '#ffc107' : booking.shift === 'Evening' ? '#0dcaf0' : '#dc3545' }}>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-start mb-3 ps-2">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span className={`badge rounded-pill ${booking.shift === 'Morning' ? 'bg-warning text-dark' : booking.shift === 'Evening' ? 'bg-info text-dark' : 'bg-danger text-white'}`}>
                                                                <FaClock className="me-1 mb-1" />{booking.shift}
                                                            </span>
                                                            <span className="badge bg-light text-secondary border fw-normal">
                                                                {booking.paymentMode}
                                                            </span>
                                                        </div>
                                                        <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                                            <FaUser className="text-secondary small" />
                                                            {booking.customerName || booking.customer}
                                                        </h6>
                                                        <small className="text-muted d-flex align-items-center gap-2">
                                                            <FaPhone className="text-secondary small" />
                                                            {booking.customerPhone || 'No Phone Provided'}
                                                        </small>
                                                    </div>

                                                    {/* Save Button (Condition: Show if changed) */}
                                                    {(updates.paymentStatus || updates.bookingStatus) && (
                                                        <button
                                                            className="btn btn-sm btn-dark rounded-pill px-3 shadow-sm d-flex align-items-center gap-2 animate__animated animate__fadeIn"
                                                            onClick={() => handleSaveChanges(bookingId)}
                                                        >
                                                            <FaSave /> Save
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="row g-2 ps-2">
                                                    <div className="col-6">
                                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Payment Status</label>
                                                        <select
                                                            className={`form-select form-select-sm fw-bold border-0 ${getStatusColor(payStatus)}`}
                                                            value={payStatus}
                                                            onChange={(e) => handleLocalUpdate(bookingId, 'paymentStatus', e.target.value)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Partial">Partial</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Booking Status</label>
                                                        <select
                                                            className={`form-select form-select-sm fw-bold border-0 ${getStatusColor(bookStatus)}`}
                                                            value={bookStatus}
                                                            onChange={(e) => handleLocalUpdate(bookingId, 'bookingStatus', e.target.value)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Confirmed">Confirmed</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {!isDayFull && !isPastSelected && (
                                <form onSubmit={handleSaveBooking}>
                                    <h6 className="sa-section-title border-bottom pb-2 mb-3">New Booking ({mahals.find(m => m.id === selectedMahalId)?.hallName || mahals.find(m => m.id === selectedMahalId)?.mahalName})</h6>
                                    <div className="mb-3"><input className="form-control" placeholder="Name" required value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} /></div>
                                    <div className="mb-3"><input className="form-control" placeholder="Phone" required value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} /></div>
                                    <div className="mb-3">
                                        <select className="form-select" value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })}>
                                            <option value="Morning">Morning</option><option value="Evening">Evening</option><option value="Full Day">Full Day</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Payment Mode</label>
                                        <select className="form-select" value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}>
                                            <option value="Offline - Cash">Offline - Cash</option>
                                            <option value="Offline - UPI">Offline - UPI</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Payment Status</label>
                                            <select className="form-select" value={formData.paymentStatus} onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}>
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                                <option value="Partial">Partial</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Booking Status</label>
                                            <select className="form-select" value={formData.bookingStatus} onChange={e => setFormData({ ...formData, bookingStatus: e.target.value })}>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-danger w-100">Confirm Booking</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAvailability;
