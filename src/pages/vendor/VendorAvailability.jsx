import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaBuilding } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const VendorAvailability = () => {

    const [mahals, setMahals] = useState([]);
    const [selectedMahalId, setSelectedMahalId] = useState(null);

    useEffect(() => {
        const savedHalls = localStorage.getItem('mock_vendor_halls');
        let initialHalls = [];
        if (savedHalls) {
            initialHalls = JSON.parse(savedHalls);
        } else {
            // Default Fallback
            initialHalls = [
                { id: 1, hallName: 'Grand Royal Palace' },
                { id: 2, hallName: 'Sunset Garden Hall' }
            ];
            // Save this so MahalProfile could technically see it if we updated it (but we aren't updating MahalProfile right now)
            localStorage.setItem('mock_vendor_halls', JSON.stringify(initialHalls));
        }
        setMahals(initialHalls);
        if (initialHalls.length > 0) {
            setSelectedMahalId(initialHalls[0].id);
        }
    }, []);


    // --- 2. Calendar State ---
    const [currentDate, setCurrentDate] = useState(new Date());

    // Bookings State
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('vendor_bookings_v2');
        if (saved) return JSON.parse(saved);

        // Comprehensive Mock Data for Demo
        return {
            // --- MAHAL ID 1: Grand Royal Palace ---
            // Past
            "2025-12-01": [{ mahalId: 1, shift: 'Morning', customer: 'John Doe', phone: '9876543210', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Completed' }],
            "2025-12-05": [{ mahalId: 1, shift: 'Full Day', customer: 'Sarah Smith', phone: '9876543211', paymentMode: 'Offline - Cash', paymentStatus: 'Paid', bookingStatus: 'Completed' }],
            // Present / Near Future (Jan 2026)
            "2026-01-10": [{ mahalId: 1, shift: 'Morning', customer: 'Alice Brown', phone: '9876543212', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2026-01-15": [{ mahalId: 1, shift: 'Evening', customer: 'Bob Wilson', phone: '9876543213', paymentMode: 'Offline - UPI', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }],
            "2026-01-20": [
                { mahalId: 1, shift: 'Morning', customer: 'Charlie Davis', phone: '9876543214', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
                { mahalId: 1, shift: 'Evening', customer: 'Dave Miller', phone: '9876543215', paymentMode: 'Offline - Cash', paymentStatus: 'Partial', bookingStatus: 'Confirmed' }
            ],
            // Future
            "2026-02-14": [{ mahalId: 1, shift: 'Full Day', customer: 'Valentine Wedding', phone: '9876543216', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2026-03-01": [{ mahalId: 1, shift: 'Morning', customer: 'Spring Fest', phone: '9876543217', paymentMode: 'Offline - UPI', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }],

            // --- MAHAL ID 2: Sunset Garden Hall ---
            // Past
            "2025-12-02": [{ mahalId: 2, shift: 'Evening', customer: 'Emily Clark', phone: '8765432109', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Completed' }],
            "2025-12-12": [{ mahalId: 2, shift: 'Morning', customer: 'Frank White', phone: '8765432108', paymentMode: 'Offline - Cash', paymentStatus: 'Paid', bookingStatus: 'Completed' }],
            // Present / Near Future (Jan 2026)
            "2026-01-08": [{ mahalId: 2, shift: 'Full Day', customer: 'Corporate Event', phone: '8765432107', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2026-01-12": [{ mahalId: 2, shift: 'Morning', customer: 'Grace Hall', phone: '8765432106', paymentMode: 'Offline - UPI', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }],
            "2026-01-25": [{ mahalId: 2, shift: 'Evening', customer: 'Henry Ford', phone: '8765432105', paymentMode: 'Offline - Cash', paymentStatus: 'Partial', bookingStatus: 'Confirmed' }],
            // Future
            "2026-02-20": [{ mahalId: 2, shift: 'Full Day', customer: 'Silver Jubilee', phone: '8765432104', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2026-03-10": [
                { mahalId: 2, shift: 'Morning', customer: 'Morning Prayer', phone: '8765432103', paymentMode: 'Offline - UPI', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
                { mahalId: 2, shift: 'Evening', customer: 'Evening Reception', phone: '8765432102', paymentMode: 'Online', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }
            ]
        };
    });

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
    const getBookingsForDateAndMahal = (dateStr) => {
        const dayBookings = bookings[dateStr] || [];
        if (!selectedMahalId) return [];
        // Filter by ID. If legacy booking has no ID, assume match if it's the first mahal (optional fallback)
        return dayBookings.filter(b => b.mahalId === selectedMahalId || (b.mahalId === undefined && selectedMahalId === mahals[0]?.id));
    };

    const handleDateClick = (dayStr) => {
        if (!selectedMahalId) {
            alert("Please select a Mahal first.");
            return;
        }
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;

        // Filter bookings for this Date AND Selected Mahal
        const relevantBookings = getBookingsForDateAndMahal(dateStr);

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

    const handleLocalUpdate = (index, field, value) => {
        setEditingUpdates(prev => ({ ...prev, [index]: { ...prev[index], [field]: value } }));
    };

    const handleSaveChanges = (bookingIndex) => {
        // Note: bookingIndex here refers to the index in the *filtered* list used in the modal?
        // Actually, to update the main state correctly, we need to know the index in the main `bookings[dateStr]` array.
        // Simpler approach: find the specific booking object in the main array and update it.
        // But since we don't have unique IDs for bookings, we'll rely on the filter.

        const dateStr = selectedDate;
        const allDateBookings = bookings[dateStr] || [];

        // Retrieve the specific booking being edited from the Filtered view
        const filteredList = getBookingsForDateAndMahal(dateStr);
        const bookingToUpdate = filteredList[bookingIndex]; // This is the old object

        const updates = editingUpdates[bookingIndex];
        if (!updates || !bookingToUpdate) return;

        // Find index in master list
        const masterIndex = allDateBookings.indexOf(bookingToUpdate);
        if (masterIndex === -1) return;

        const updatedBooking = { ...allDateBookings[masterIndex], ...updates };
        const newAllDateBookings = [...allDateBookings];
        newAllDateBookings[masterIndex] = updatedBooking;

        const updatedBookings = { ...bookings, [dateStr]: newAllDateBookings };
        setBookings(updatedBookings);
        localStorage.setItem('vendor_bookings_v2', JSON.stringify(updatedBookings));

        setEditingUpdates(prev => {
            const newState = { ...prev };
            delete newState[bookingIndex];
            return newState;
        });
    };

    const handleMonthSelect = (monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setViewMode('calendar');
    };

    const handleYearSelect = (year) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setViewMode('month');
    };

    const handleSaveBooking = (e) => {
        e.preventDefault();
        if (!selectedMahalId) return;

        const dateStr = selectedDate;
        const existingAll = bookings[dateStr] || [];
        const existingForMahal = getBookingsForDateAndMahal(dateStr);

        const isFullDay = existingForMahal.some(b => b.shift === 'Full Day');
        const hasMorning = existingForMahal.some(b => b.shift === 'Morning');
        const hasEvening = existingForMahal.some(b => b.shift === 'Evening');

        if (isFullDay) return alert("This date is already fully booked!");
        if (formData.shift === 'Full Day' && existingForMahal.length > 0) return alert("Cannot book Full Day with existing bookings.");
        if (formData.shift === 'Morning' && hasMorning) return alert("Morning shift is already booked.");
        if (formData.shift === 'Evening' && hasEvening) return alert("Evening shift is already booked.");

        const newBooking = {
            mahalId: selectedMahalId, // CRITICAL: Link to Mahal
            shift: formData.shift,
            customer: formData.customerName,
            phone: formData.customerPhone,
            paymentMode: formData.paymentMode,
            paymentStatus: formData.paymentStatus,
            bookingStatus: formData.bookingStatus
        };

        const updatedBookings = { ...bookings, [dateStr]: [...existingAll, newBooking] };
        setBookings(updatedBookings);
        localStorage.setItem('vendor_bookings_v2', JSON.stringify(updatedBookings));
        setShowModal(false);
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

        // USE FILTERED BOOKINGS
        const dayBookings = getBookingsForDateAndMahal(dateStr);

        // Past Dates Logic
        if (isPast) {
            if (dayBookings.length === 0) {
                return { status: 'Disabled', color: 'bg-light text-muted opacity-50', headerColor: 'bg-light', headerText: 'text-muted', isPast: true, isDisabled: true };
            }
            return { status: 'Completed', color: 'bg-white', headerColor: 'bg-success', headerText: 'text-white', isPast: true };
        }

        // Future/Today Logic
        if (dayBookings.some(b => b.shift === 'Full Day')) return { status: 'Full', color: 'bg-white', headerColor: 'bg-danger', headerText: 'text-white', isPast };

        const hasMorning = dayBookings.some(b => b.shift === 'Morning');
        const hasEvening = dayBookings.some(b => b.shift === 'Evening');

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
                            onChange={(e) => setSelectedMahalId(Number(e.target.value))}
                        >
                            {mahals.map(m => (
                                <option key={m.id} value={m.id}>{m.hallName}</option>
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
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    // USE FILTERED BOOKINGS HERE
                    const dayBookings = getBookingsForDateAndMahal(dateStr);
                    const { status, color, style, isDisabled, isPast, headerColor, headerText, headerStyle } = checkAvailability(day);

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
                                    <div key={idx} className="d-flex align-items-center px-1">
                                        <div className="text-truncate fw-bold w-100" style={{ fontSize: '0.7rem', color: '#444' }}>
                                            {bk.shift === 'Morning' && <i className="bi bi-brightness-high-fill text-warning me-1"></i>}
                                            {bk.shift === 'Evening' && <i className="bi bi-moon-stars-fill text-info me-1"></i>}
                                            {bk.shift === 'Full Day' && <i className="bi bi-calendar-event-fill text-danger me-1"></i>}
                                            {bk.customer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    // Modal Helpers
    const filteredModalBookings = getBookingsForDateAndMahal(selectedDate);
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
                                    <h6 className="sa-section-title border-bottom pb-2 mb-3">Existing Bookings</h6>
                                    {filteredModalBookings.map((booking, idx) => {
                                        // Since we are iterating filtering logic, idx here matches idx used in render -> but update needs care.
                                        // We use handleSaveChanges(idx) where idx is the index IN THE FILTERED LIST.
                                        const updates = editingUpdates[idx] || {};
                                        const payStatus = updates.paymentStatus || booking.paymentStatus;
                                        const bookStatus = updates.bookingStatus || booking.bookingStatus;
                                        return (
                                            <div key={idx} className="p-3 bg-light rounded-3 border mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div><span className="badge bg-primary me-2">{booking.shift}</span><h6 className="d-inline">{booking.customer}</h6></div>
                                                    {(updates.paymentStatus || updates.bookingStatus) && <button className="btn btn-xs btn-dark" onClick={() => handleSaveChanges(idx)}>Save</button>}
                                                </div>
                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <select className="form-select form-select-sm" value={payStatus} onChange={(e) => handleLocalUpdate(idx, 'paymentStatus', e.target.value)}>
                                                            <option value="Pending">Pending</option><option value="Paid">Paid</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-6">
                                                        <select className="form-select form-select-sm" value={bookStatus} onChange={(e) => handleLocalUpdate(idx, 'bookingStatus', e.target.value)}>
                                                            <option value="Confirmed">Confirmed</option><option value="Cancelled">Cancelled</option>
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
                                    <h6 className="sa-section-title border-bottom pb-2 mb-3">New Booking ({mahals.find(m => m.id === selectedMahalId)?.hallName})</h6>
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
