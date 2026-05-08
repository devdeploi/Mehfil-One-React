import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaBuilding, FaSave, FaPhone, FaUser, FaClock, FaCalendarAlt, FaSun, FaMoon, FaCalendarDay, FaWallet, FaCreditCard, FaMobileAlt, FaCheckCircle, FaHourglassHalf, FaBan, FaUsers, FaRupeeSign, FaMapMarkerAlt, FaSnowflake, FaBolt, FaParking, FaVideo, FaMicrophone, FaCouch, FaShieldAlt, FaTint, FaConciergeBell, FaChair, FaMinus, FaPlus, FaTags } from 'react-icons/fa';
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
        bookingStatus: 'Confirmed',
        price: ''
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
        const initialShift = hasMorning ? 'Evening' : (hasEvening ? 'Morning' : 'Morning');
        const currentMahal = mahals.find(m => m.id === selectedMahalId);
        let defaultPrice = '';
        if (currentMahal) {
            if (initialShift === 'Morning') defaultPrice = currentMahal.morningPrice || '';
            else if (initialShift === 'Evening') defaultPrice = currentMahal.eveningPrice || '';
            else if (initialShift === 'Full Day') defaultPrice = currentMahal.fullDayPrice || '';
        }

        setFormData({
            customerName: '',
            customerPhone: '',
            shift: initialShift,
            paymentMode: 'Offline - Cash',
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
            price: defaultPrice
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
                bookingStatus: formData.bookingStatus,
                price: formData.price
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
    const currentMahal = mahals.find(m => m.id === selectedMahalId);

    return (
        <div className="card border-0 shadow-sm p-4 h-100">
            {renderHeader()}
            {viewMode === 'calendar' && renderLegend()}
            {viewMode === 'calendar' && renderCalendarGrid()}
            {viewMode === 'month' && renderMonthGrid()}
            {viewMode === 'year' && renderYearGrid()}

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(10,10,20,0.72)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
                    <div className="rounded-4 shadow-lg" style={{ width: '960px', maxWidth: '97vw', background: '#f4f6fb', border: '1px solid rgba(200,200,220,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '93vh', overflow: 'hidden' }}>
                        {/* ── Premium Modal Header ── */}
                        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(200,210,230,0.6)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#e63946,#c1121f)', boxShadow: '0 4px 14px rgba(220,53,69,0.35)' }}>
                                    <FaCalendarAlt style={{ color: '#fff', fontSize: 18 }} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold" style={{ fontSize: '1.1rem', color: '#1a1a2e', letterSpacing: '-0.3px' }}>{filteredModalBookings.length > 0 ? 'Manage Bookings' : 'New Booking'}</h3>
                                    <div style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: 500 }}>
                                        <FaCalendarDay style={{ marginRight: 5, color: '#e63946' }} />
                                        {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(220,53,69,0.08)', color: '#e63946', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(220,53,69,0.18)'} onMouseLeave={e => e.currentTarget.style.background='rgba(220,53,69,0.08)'}><FaTimes /></button>
                        </div>
                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                            {/* ═══ LEFT PANEL: Venue Details ═══ */}
                            {(() => {
                                const mahal = currentMahal;
                                if (!mahal) return null;
                                const facilityList = [
                                    { key: 'ac', label: 'AC', icon: <FaSnowflake /> },
                                    { key: 'generator', label: 'Generator', icon: <FaBolt /> },
                                    { key: 'parking', label: 'Parking', icon: <FaParking /> },
                                    { key: 'cctv', label: 'CCTV', icon: <FaShieldAlt /> },
                                    { key: 'soundSystem', label: 'Sound System', icon: <FaMicrophone /> },
                                    { key: 'stage', label: 'Stage', icon: <FaConciergeBell /> },
                                    { key: 'lift', label: 'Lift', icon: <FaCouch /> },
                                    { key: 'drinkingWater', label: 'Water', icon: <FaTint /> },
                                ].filter(f => mahal.facilities?.[f.key]);

                                return (
                                    <div style={{ width: 330, minWidth: 330, background: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)', overflowY: 'auto', overflowX: 'hidden', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                                        {/* Decorative blobs */}
                                        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(230,57,70,0.12)', pointerEvents: 'none' }} />
                                        <div style={{ position: 'absolute', bottom: 40, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />

                                        {/* Venue badge + name */}
                                        <div>
                                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', color: '#e63946', textTransform: 'uppercase', background: 'rgba(230,57,70,0.12)', borderRadius: 20, padding: '3px 10px', display: 'inline-block', marginBottom: 10 }}>{mahal.mahalType || 'Venue'}</span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>{mahal.mahalName}</div>
                                            {(mahal.city || mahal.district) && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    <FaMapMarkerAlt style={{ color: '#e63946', fontSize: 10 }} />
                                                    {[mahal.street, mahal.city, mahal.district].filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected date chip */}
                                        <div style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            <FaCalendarAlt style={{ color: '#e63946', fontSize: 13 }} />
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Booking Date</div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                            </div>
                                        </div>

                                        {/* Eligible Discount Offer */}
                                        {(mahal.discountMin > 0 || mahal.discountMax > 0) && (
                                            <div style={{ background: 'linear-gradient(90deg, rgba(230,57,70,0.15) 0%, rgba(99,102,241,0.15) 100%)', border: '1px dashed rgba(230,57,70,0.4)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #e63946, #6366f1)' }}></div>
                                                <FaTags style={{ color: '#fca5a5', fontSize: 18 }} />
                                                <div>
                                                    <div style={{ fontSize: '0.62rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, marginBottom: 2 }}>Eligible Discount</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                                                        {mahal.discountMin || 0}% <span style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 3px', fontWeight: 600 }}>to</span> {mahal.discountMax || 0}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Capacity + Price stats */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            {[
                                                { icon: <FaUsers style={{ color: '#60a5fa', fontSize: 14 }} />, label: 'Seating', val: mahal.seatingCapacity || '—' },
                                                { icon: <FaChair style={{ color: '#a78bfa', fontSize: 14 }} />, label: 'Dining', val: mahal.diningCapacity || '—' },
                                                { icon: <FaParking style={{ color: '#34d399', fontSize: 13 }} />, label: 'Parking', val: mahal.parkingCapacity || '—' },
                                                { icon: <FaRupeeSign style={{ color: '#fbbf24', fontSize: 13 }} />, label: 'Full Day', val: mahal.fullDayPrice ? `₹${mahal.fullDayPrice.toLocaleString('en-IN')}` : '—' },
                                            ].map(({ icon, label, val }) => (
                                                <div key={label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                                                    <div style={{ marginBottom: 4 }}>{icon}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{val}</div>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shift timings */}
                                        {(mahal.morningTimeFrom || mahal.eveningTimeFrom) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', color: '#475569', textTransform: 'uppercase' }}>Shift Timings</div>
                                                {mahal.morningTimeFrom && (
                                                    <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <FaSun style={{ color: '#f59e0b', fontSize: 13, flexShrink: 0 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Morning</div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24' }}>{mahal.morningTimeFrom} – {mahal.morningTimeTo || '...'}</div>
                                                        </div>
                                                        {mahal.morningPrice && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>₹{mahal.morningPrice.toLocaleString('en-IN')}</span>}
                                                    </div>
                                                )}
                                                {mahal.eveningTimeFrom && (
                                                    <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <FaMoon style={{ color: '#60a5fa', fontSize: 12, flexShrink: 0 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Evening</div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa' }}>{mahal.eveningTimeFrom} – {mahal.eveningTimeTo || '...'}</div>
                                                        </div>
                                                        {mahal.eveningPrice && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>₹{mahal.eveningPrice.toLocaleString('en-IN')}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Contact */}
                                        {mahal.mobile && (
                                            <a href={`tel:${mahal.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '9px 14px', textDecoration: 'none' }}>
                                                <FaPhone style={{ color: '#4ade80', fontSize: 13 }} />
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Contact</div>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{mahal.mobile}</div>
                                                </div>
                                            </a>
                                        )}

                                        {/* Facilities */}
                                        {facilityList.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>Amenities</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {facilityList.map(f => (
                                                        <span key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 11px', fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>
                                                            <span style={{ color: '#4ade80', fontSize: 10 }}>{f.icon}</span>{f.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Owner */}
                                        {mahal.ownerName && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e63946,#c1121f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaUser style={{ color: '#fff', fontSize: 13 }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Owner</div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{mahal.ownerName}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ═══ RIGHT PANEL: Bookings + Form ═══ */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#fff', borderRadius: '0 16px 16px 0' }}>

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
                                    {/* ── Section Label ── */}
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,rgba(220,53,69,0.4),transparent)' }} />
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#e63946', textTransform: 'uppercase' }}>New Booking</span>
                                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,rgba(220,53,69,0.4),transparent)' }} />
                                    </div>

                                    {/* ── Customer Details Row ── */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 6, display: 'block' }}>Customer Name</label>
                                            <div className="d-flex align-items-center" style={{ background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onFocusCapture={e => e.currentTarget.style.borderColor='#e63946'} onBlurCapture={e => e.currentTarget.style.borderColor='#e9ecef'}>
                                                <span style={{ padding: '0 12px', color: '#e63946' }}><FaUser style={{ fontSize: 13 }} /></span>
                                                <input
                                                    style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 12px 11px 0', fontSize: '0.9rem', color: '#1a1a2e', background: 'transparent', fontWeight: 500 }}
                                                    placeholder="Full name"
                                                    required
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 6, display: 'block' }}>Phone Number</label>
                                            <div className="d-flex align-items-center" style={{ background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onFocusCapture={e => e.currentTarget.style.borderColor='#e63946'} onBlurCapture={e => e.currentTarget.style.borderColor='#e9ecef'}>
                                                <span style={{ padding: '0 12px', color: '#e63946' }}><FaPhone style={{ fontSize: 13 }} /></span>
                                                <input
                                                    style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 12px 11px 0', fontSize: '0.9rem', color: '#1a1a2e', background: 'transparent', fontWeight: 500 }}
                                                    placeholder="Mobile number"
                                                    required
                                                    value={formData.customerPhone}
                                                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Shift Selector ── */}
                                    <div className="mb-3">
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 8, display: 'block' }}>Booking Shift</label>
                                        <div style={{ display: 'flex', gap: 0, background: '#f0f2f5', borderRadius: 12, padding: 4 }}>
                                            {[
                                                { val: 'Morning', icon: <FaSun style={{ fontSize: 13 }} />, color: '#f59e0b', disabled: hasMorning, defaultPrice: currentMahal?.morningPrice },
                                                { val: 'Evening', icon: <FaMoon style={{ fontSize: 12 }} />, color: '#3b82f6', disabled: hasEvening, defaultPrice: currentMahal?.eveningPrice },
                                                { val: 'Full Day', icon: <FaCalendarDay style={{ fontSize: 12 }} />, color: '#e63946', disabled: hasMorning || hasEvening, defaultPrice: currentMahal?.fullDayPrice }
                                            ].map(({ val, icon, color, disabled, defaultPrice }, idx, arr) => {
                                                const isActive = formData.shift === val;
                                                return (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            if (!disabled) {
                                                                setFormData({ ...formData, shift: val, price: defaultPrice || '', appliedDiscount: '' });
                                                            }
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '9px 10px',
                                                            borderRadius: 9,
                                                            border: 'none',
                                                            background: isActive ? '#fff' : 'transparent',
                                                            color: isActive ? color : '#94a3b8',
                                                            fontWeight: isActive ? 700 : 500,
                                                            fontSize: '0.82rem',
                                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                                            opacity: disabled ? 0.38 : 1,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                            transition: 'all 0.18s',
                                                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {icon}
                                                        <span>{val}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Pricing Row ── */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-5">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 0 }}>Discount %</label>
                                                {currentMahal && (currentMahal.discountMax > 0 || currentMahal.discountMin > 0) && (
                                                    <span style={{ fontSize: '0.6rem', color: '#e63946', fontWeight: 700, background: '#fff3f4', padding: '1px 6px', borderRadius: 4 }}>Range: {currentMahal.discountMin || 0}% - {currentMahal.discountMax || 0}%</span>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center" style={{ background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s', padding: '4px' }} onFocusCapture={e => e.currentTarget.style.borderColor='#e63946'} onBlurCapture={e => e.currentTarget.style.borderColor='#e9ecef'}>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const current = Number(formData.appliedDiscount) || 0;
                                                        const minAllowed = currentMahal?.discountMin || 0;
                                                        let val = current - 1;
                                                        
                                                        // Jump straight to 0 (no discount) if we hit or go below the minimum
                                                        if (current <= minAllowed) val = 0;
                                                        
                                                        const maxAllowed = currentMahal?.discountMax || 100;
                                                        const finalDiscount = val <= 0 ? '' : Math.min(val, maxAllowed);
                                                        
                                                        let defaultPrice = 0;
                                                        if (formData.shift === 'Morning') defaultPrice = currentMahal?.morningPrice || 0;
                                                        else if (formData.shift === 'Evening') defaultPrice = currentMahal?.eveningPrice || 0;
                                                        else if (formData.shift === 'Full Day') defaultPrice = currentMahal?.fullDayPrice || 0;
                                                        
                                                        let newPrice = defaultPrice;
                                                        if (finalDiscount !== '' && newPrice > 0) newPrice = Math.round(newPrice - (newPrice * finalDiscount / 100));
                                                        setFormData({ ...formData, appliedDiscount: finalDiscount, price: newPrice || '' });
                                                    }}
                                                    style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: 'none', borderRadius: 8, color: '#64748b', cursor: 'pointer', transition: '0.2s', flexShrink: 0 }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                                                    onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                                                >
                                                    <FaMinus style={{ fontSize: '0.75rem' }} />
                                                </button>
                                                
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <input
                                                        type="number"
                                                        style={{ width: '40px', border: 'none', outline: 'none', textAlign: 'center', fontSize: '1.05rem', color: '#1a1a2e', background: 'transparent', fontWeight: 800, padding: 0 }}
                                                        placeholder="0"
                                                        className="hide-spinners"
                                                        value={formData.appliedDiscount || ''}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            const maxAllowed = currentMahal?.discountMax || 100;
                                                            const clamped = Math.min(val, maxAllowed);
                                                            const finalDiscount = e.target.value === '' ? '' : Math.max(0, clamped);
                                                            let defaultPrice = 0;
                                                            if (formData.shift === 'Morning') defaultPrice = currentMahal?.morningPrice || 0;
                                                            else if (formData.shift === 'Evening') defaultPrice = currentMahal?.eveningPrice || 0;
                                                            else if (formData.shift === 'Full Day') defaultPrice = currentMahal?.fullDayPrice || 0;
                                                            let newPrice = defaultPrice;
                                                            if (finalDiscount !== '' && newPrice > 0) {
                                                                newPrice = Math.round(newPrice - (newPrice * finalDiscount / 100));
                                                            }
                                                            setFormData({ ...formData, appliedDiscount: finalDiscount, price: newPrice || '' });
                                                        }}
                                                        onBlur={() => {
                                                            let current = Number(formData.appliedDiscount);
                                                            if (!current || current === 0) return;
                                                            const minAllowed = currentMahal?.discountMin || 0;
                                                            if (current > 0 && current < minAllowed) {
                                                                let defaultPrice = 0;
                                                                if (formData.shift === 'Morning') defaultPrice = currentMahal?.morningPrice || 0;
                                                                else if (formData.shift === 'Evening') defaultPrice = currentMahal?.eveningPrice || 0;
                                                                else if (formData.shift === 'Full Day') defaultPrice = currentMahal?.fullDayPrice || 0;
                                                                let newPrice = defaultPrice;
                                                                if (newPrice > 0) newPrice = Math.round(newPrice - (newPrice * minAllowed / 100));
                                                                setFormData({ ...formData, appliedDiscount: minAllowed, price: newPrice || '' });
                                                            }
                                                        }}
                                                    />
                                                    <span style={{ color: '#e63946', fontWeight: 800, fontSize: '0.9rem' }}>%</span>
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const current = Number(formData.appliedDiscount) || 0;
                                                        const minAllowed = currentMahal?.discountMin || 0;
                                                        let val = current + 1;
                                                        
                                                        // If starting from 0, jump immediately to the minimum allowed discount!
                                                        if (current === 0 && minAllowed > 0) val = minAllowed;
                                                        // If somehow below min Allowed, jump to minAllowed
                                                        else if (current > 0 && current < minAllowed) val = minAllowed;
                                                        
                                                        const maxAllowed = currentMahal?.discountMax || 100;
                                                        const finalDiscount = Math.min(val, maxAllowed);
                                                        
                                                        let defaultPrice = 0;
                                                        if (formData.shift === 'Morning') defaultPrice = currentMahal?.morningPrice || 0;
                                                        else if (formData.shift === 'Evening') defaultPrice = currentMahal?.eveningPrice || 0;
                                                        else if (formData.shift === 'Full Day') defaultPrice = currentMahal?.fullDayPrice || 0;
                                                        
                                                        let newPrice = defaultPrice;
                                                        if (finalDiscount > 0 && newPrice > 0) newPrice = Math.round(newPrice - (newPrice * finalDiscount / 100));
                                                        setFormData({ ...formData, appliedDiscount: finalDiscount, price: newPrice || '' });
                                                    }}
                                                    style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff3f4', border: 'none', borderRadius: 8, color: '#e63946', cursor: 'pointer', transition: '0.2s', flexShrink: 0 }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'}
                                                    onMouseOut={e => e.currentTarget.style.background = '#fff3f4'}
                                                >
                                                    <FaPlus style={{ fontSize: '0.75rem' }} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-7">
                                            {(() => {
                                                let basePrice = 0;
                                                if (formData.shift === 'Morning') basePrice = currentMahal?.morningPrice || 0;
                                                else if (formData.shift === 'Evening') basePrice = currentMahal?.eveningPrice || 0;
                                                else if (formData.shift === 'Full Day') basePrice = currentMahal?.fullDayPrice || 0;
                                                
                                                let appliedDiscountPercent = Number(formData.appliedDiscount) || 0;
                                                let discountAmount = Math.round(basePrice * (appliedDiscountPercent / 100));
                                                let finalPrice = formData.price || basePrice;

                                                return (
                                                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: 12, padding: '12px 16px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Base Price</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{basePrice.toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Discount ({appliedDiscountPercent}%)</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5' }}>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-end mt-auto">
                                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Agreed Price</span>
                                                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>₹{finalPrice.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    {/* ── Payment Mode ── */}
                                    <div className="mb-3">
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 8, display: 'block' }}>Payment Mode</label>
                                        <div style={{ display: 'flex', gap: 0, background: '#f0f2f5', borderRadius: 12, padding: 4 }}>
                                            {[
                                                { val: 'Offline - Cash', label: 'Cash', icon: <FaWallet style={{ fontSize: 12 }} />, color: '#059669' },
                                                { val: 'Offline - UPI', label: 'UPI', icon: <FaMobileAlt style={{ fontSize: 13 }} />, color: '#7c3aed' },
                                                { val: 'Online', label: 'Online', icon: <FaCreditCard style={{ fontSize: 12 }} />, color: '#0369a1' }
                                            ].map(({ val, label, icon, color }) => {
                                                const isActive = formData.paymentMode === val;
                                                return (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentMode: val })}
                                                        style={{
                                                            flex: 1,
                                                            padding: '9px 10px',
                                                            borderRadius: 9,
                                                            border: 'none',
                                                            background: isActive ? '#fff' : 'transparent',
                                                            color: isActive ? color : '#94a3b8',
                                                            fontWeight: isActive ? 700 : 500,
                                                            fontSize: '0.82rem',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                            transition: 'all 0.18s',
                                                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {icon}
                                                        <span>{label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Status Row ── */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 8, display: 'block' }}>Payment Status</label>
                                            <div style={{ display: 'flex', gap: 0, background: '#f0f2f5', borderRadius: 12, padding: 4 }}>
                                                {[
                                                    { val: 'Pending', icon: <FaHourglassHalf style={{ fontSize: 11 }} />, color: '#d97706' },
                                                    { val: 'Paid', icon: <FaCheckCircle style={{ fontSize: 11 }} />, color: '#059669' },
                                                    { val: 'Partial', icon: <FaWallet style={{ fontSize: 11 }} />, color: '#2563eb' }
                                                ].map(({ val, icon, color }) => {
                                                    const isActive = formData.paymentStatus === val;
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, paymentStatus: val })}
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 6px',
                                                                borderRadius: 9,
                                                                border: 'none',
                                                                background: isActive ? '#fff' : 'transparent',
                                                                color: isActive ? color : '#94a3b8',
                                                                fontWeight: isActive ? 700 : 500,
                                                                fontSize: '0.74rem',
                                                                cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                                transition: 'all 0.18s',
                                                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {icon}<span>{val}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6c757d', marginBottom: 8, display: 'block' }}>Booking Status</label>
                                            <div style={{ display: 'flex', gap: 0, background: '#f0f2f5', borderRadius: 12, padding: 4 }}>
                                                {[
                                                    { val: 'Confirmed', icon: <FaCheckCircle style={{ fontSize: 11 }} />, color: '#059669' },
                                                    { val: 'Pending', icon: <FaHourglassHalf style={{ fontSize: 11 }} />, color: '#d97706' },
                                                    { val: 'Cancelled', icon: <FaBan style={{ fontSize: 11 }} />, color: '#dc2626' }
                                                ].map(({ val, icon, color }) => {
                                                    const isActive = formData.bookingStatus === val;
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, bookingStatus: val })}
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 6px',
                                                                borderRadius: 9,
                                                                border: 'none',
                                                                background: isActive ? '#fff' : 'transparent',
                                                                color: isActive ? color : '#94a3b8',
                                                                fontWeight: isActive ? 700 : 500,
                                                                fontSize: '0.74rem',
                                                                cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                                transition: 'all 0.18s',
                                                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {icon}<span>{val}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Submit Button ── */}
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                            background: 'linear-gradient(135deg,#e63946 0%,#c1121f 100%)',
                                            color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            boxShadow: '0 6px 20px rgba(220,53,69,0.4)', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                                    >
                                        <FaCheckCircle style={{ fontSize: 16 }} />
                                        Confirm Booking
                                    </button>
                                </form>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAvailability;
