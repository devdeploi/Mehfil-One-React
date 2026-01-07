import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const VendorAvailability = () => {
    // Current date being viewed in calendar
    const [currentDate, setCurrentDate] = useState(new Date());

    // Initial Mock Bookings
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('vendor_bookings_v2');
        if (saved) return JSON.parse(saved);

        return {
            "2025-12-10": [{ shift: 'Morning', customer: 'Past User 1', phone: '000', paymentMode: 'Offline - Cash', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2025-12-15": [{ shift: 'Evening', customer: 'Past User 2', phone: '000', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2025-12-25": [{ shift: 'Full Day', customer: 'Past User 3', phone: '000', paymentMode: 'Offline - UPI', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],

            "2026-01-05": [{ shift: 'Morning', customer: 'Alice', phone: '123', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],
            "2026-01-08": [{ shift: 'Evening', customer: 'Bob', phone: '456', paymentMode: 'Offline - Cash', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }],
            "2026-01-12": [
                { shift: 'Morning', customer: 'Charlie', phone: '789', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
                { shift: 'Evening', customer: 'Dave', phone: '101', paymentMode: 'Offline - UPI', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }
            ],
            "2026-01-20": [{ shift: 'Full Day', customer: 'Eve Jhon', phone: '202', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }],

            "2026-02-14": [
                { shift: 'Morning', customer: 'Romeo', phone: '303', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
                { shift: 'Evening', customer: 'Maaz', phone: '30300', paymentMode: 'Online', paymentStatus: 'Paid', bookingStatus: 'Confirmed' }
            ],
            "2026-02-28": [{ shift: 'Full Day', customer: 'Wedding', phone: '404', paymentMode: 'Offline - Cash', paymentStatus: 'Pending', bookingStatus: 'Confirmed' }]
        };
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        shift: 'Morning', // Morning, Evening, Full Day
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

    const handleDateClick = (dayStr) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
        const dayBookings = bookings[dateStr] || [];

        // Determine available shift default
        const hasMorning = dayBookings.some(b => b.shift === 'Morning');
        const hasEvening = dayBookings.some(b => b.shift === 'Evening');

        setSelectedDate(dateStr);
        setEditingUpdates({}); // Reset local edits
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

    // Track local changes for existing bookings
    const handleLocalUpdate = (index, field, value) => {
        setEditingUpdates(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value
            }
        }));
    };

    // Save changes for a specific booking
    const handleSaveChanges = (index) => {
        const updates = editingUpdates[index];
        if (!updates) return;

        const dateBookings = [...bookings[selectedDate]];
        dateBookings[index] = { ...dateBookings[index], ...updates };

        const updatedBookings = { ...bookings, [selectedDate]: dateBookings };
        setBookings(updatedBookings);
        localStorage.setItem('vendor_bookings_v2', JSON.stringify(updatedBookings));

        // Clear local edits for this item
        setEditingUpdates(prev => {
            const newState = { ...prev };
            delete newState[index];
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

        const existing = bookings[selectedDate] || [];
        const isFullDay = existing.some(b => b.shift === 'Full Day');
        const hasMorning = existing.some(b => b.shift === 'Morning');
        const hasEvening = existing.some(b => b.shift === 'Evening');

        if (isFullDay) {
            alert("This date is already fully booked!");
            return;
        }
        if (formData.shift === 'Full Day' && existing.length > 0) {
            alert("Cannot book Full Day as there are existing bookings.");
            return;
        }
        if (formData.shift === 'Morning' && hasMorning) {
            alert("Morning shift is already booked.");
            return;
        }
        if (formData.shift === 'Evening' && hasEvening) {
            alert("Evening shift is already booked.");
            return;
        }

        const newBooking = {
            shift: formData.shift,
            customer: formData.customerName,
            phone: formData.customerPhone,
            paymentMode: formData.paymentMode,
            paymentStatus: formData.paymentStatus,
            bookingStatus: formData.bookingStatus
        };

        const updatedBookings = { ...bookings, [selectedDate]: [...existing, newBooking] };
        setBookings(updatedBookings);
        localStorage.setItem('vendor_bookings_v2', JSON.stringify(updatedBookings));
        // Don't close modal to allow further edits/adds if needed, or close as preferred. 
        // User flow usually expects close on "Add".
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
        const dayBookings = bookings[dateStr] || [];

        // Past Dates Logic
        if (isPast) {
            if (dayBookings.length === 0) {
                // Past with no bookings -> Disabled
                return { status: 'Disabled', color: 'bg-light text-muted opacity-50', headerColor: 'bg-light', headerText: 'text-muted', isPast: true, isDisabled: true };
            }
            // Past with bookings -> Completed (Green Header)
            return { status: 'Completed', color: 'bg-white', headerColor: 'bg-success', headerText: 'text-white', isPast: true };
        }

        // Future/Today Logic
        if (dayBookings.some(b => b.shift === 'Full Day')) return { status: 'Full', color: 'bg-white', headerColor: 'bg-danger', headerText: 'text-white', isPast };

        const hasMorning = dayBookings.some(b => b.shift === 'Morning');
        const hasEvening = dayBookings.some(b => b.shift === 'Evening');

        // Combined logic (Purple for split usage)
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-light rounded-circle shadow-sm" onClick={() => changePeriod(-1)}><FaChevronLeft /></button>

                <h4 className="fw-bold mb-0 text-dark cursor-pointer hover-opacity" onClick={toggleViewMode} style={{ cursor: 'pointer' }}>
                    {title} <small className="text-muted ms-2" style={{ fontSize: '0.6em' }}><i className="bi bi-caret-down-fill"></i></small>
                </h4>

                <button className="btn btn-light rounded-circle shadow-sm" onClick={() => changePeriod(1)}><FaChevronRight /></button>
            </div>
        );
    };

    const renderMonthGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {Array.from({ length: 12 }).map((_, i) => {
                const isSelected = currentDate.getMonth() === i;
                const monthStr = new Date(0, i).toLocaleString('default', { month: 'long' });
                const now = new Date();
                const isCurrentMonth = now.getMonth() === i && now.getFullYear() === currentDate.getFullYear();

                return (
                    <div
                        key={i}
                        className={`rounded-3 p-4 text-center fw-bold transition-all shadow-sm cursor-pointer ${isSelected ? 'bg-danger text-white' : 'bg-light text-dark'} ${isCurrentMonth && !isSelected ? 'border border-danger text-danger' : ''}`}
                        style={{ cursor: 'pointer', border: isSelected ? 'none' : '1px solid #e2e8f0' }}
                        onClick={() => handleMonthSelect(i)}
                    >
                        {monthStr}
                        {isCurrentMonth && <div style={{ fontSize: '0.6rem', fontWeight: 'normal', marginTop: '4px', textTransform: 'uppercase' }}>Current</div>}
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
                const isCurrentYear = new Date().getFullYear() === year;
                return (
                    <div
                        key={i}
                        className={`rounded-3 p-3 text-center fw-bold transition-all shadow-sm cursor-pointer ${isSelected ? 'bg-danger text-white' : 'bg-light text-dark'} ${isCurrentYear && !isSelected ? 'border border-danger text-danger' : ''}`}
                        style={{ cursor: 'pointer', border: isSelected ? 'none' : '1px solid #e2e8f0' }}
                        onClick={() => handleYearSelect(year)}
                    >
                        {year}
                    </div>
                );
            })}
        </div>
    );

    const renderLegend = () => (
        <div className="d-flex flex-wrap align-items-center gap-4 mb-4 p-3 rounded-4 border bg-white shadow-sm">
            <span className="small fw-bold text-uppercase text-muted ls-1">Availability Key:</span>
            <div className="d-flex align-items-center">
                <i className="bi bi-brightness-high-fill text-warning fs-5 me-2"></i>
                <span className="small fw-bold text-dark">Morning</span>
            </div>
            <div className="d-flex align-items-center">
                <i className="bi bi-moon-stars-fill text-info fs-5 me-2"></i>
                <span className="small fw-bold text-dark">Evening</span>
            </div>
            <div className="d-flex align-items-center">
                <i className="bi bi-calendar-check-fill text-danger fs-5 me-2"></i>
                <span className="small fw-bold text-dark">Full Day</span>
            </div>
            <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '20px', height: '20px', backgroundColor: '#800080', color: 'white', fontSize: '10px' }}>
                    <i className="bi bi-arrows-collapse"></i>
                </div>
                <span className="small fw-bold text-dark">Split (Purple)</span>
            </div>
            <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill text-success fs-5 me-2"></i>
                <span className="small fw-bold text-dark">Completed</span>
            </div>
            <div className="ms-auto">
                <span className="badge bg-light text-secondary border">Click date to edit</span>
            </div>
        </div>
    );

    const renderCalendarGrid = () => (
        <>
            <div className="d-grid text-center mb-3" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="small fw-bold text-secondary text-uppercase tracking-wide" style={{ fontSize: '0.75rem' }}>{day}</div>
                ))}
            </div>
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayBookings = bookings[dateStr] || [];
                    const { status, color, style, isDisabled, isPast, headerColor, headerText, headerStyle } = checkAvailability(day);

                    return (
                        <div
                            key={day}
                            className={`rounded-3 text-start position-relative shadow-sm transition-all hover-scale border-0 ${color}`}
                            style={{
                                minHeight: '110px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                overflow: 'hidden',
                                ...style
                            }}
                            onClick={() => !isDisabled && handleDateClick(day)}
                        >
                            {/* Colored Header Spanning Full Width */}
                            <div className={`d-flex justify-content-between align-items-center px-3 py-2 ${headerColor} ${headerText}`} style={{ ...headerStyle }}>
                                <span className="fw-bold fs-5">{day}</span>
                                {status !== 'Available' && status !== 'Disabled' && (
                                    <div className="d-flex gap-1 align-items-center">
                                        {status === 'Completed' ? (
                                            // Past Icons
                                            (() => {
                                                const hasFull = dayBookings.some(b => b.shift === 'Full Day');
                                                const hasMor = dayBookings.some(b => b.shift === 'Morning');
                                                const hasEve = dayBookings.some(b => b.shift === 'Evening');

                                                if (hasFull) return <i className="bi bi-calendar-event-fill text-white fs-5"></i>;
                                                if (hasMor && hasEve) return (
                                                    <>
                                                        <i className="bi bi-brightness-high-fill text-white fs-6"></i>
                                                        <i className="bi bi-moon-stars-fill text-white fs-6"></i>
                                                    </>
                                                );
                                                if (hasMor) return <i className="bi bi-brightness-high-fill fs-5 text-dark"></i>;
                                                if (hasEve) return <i className="bi bi-moon-stars-fill fs-5 text-white"></i>;
                                                return <i className="bi bi-check-circle-fill text-white"></i>;
                                            })()
                                        ) : (
                                            // Future Icons
                                            (() => {
                                                const hasFull = dayBookings.some(b => b.shift === 'Full Day');
                                                const hasMor = dayBookings.some(b => b.shift === 'Morning');
                                                const hasEve = dayBookings.some(b => b.shift === 'Evening');

                                                if (hasFull) return <i className="bi bi-calendar-event-fill text-white fs-5"></i>;
                                                if (hasMor && hasEve) return (
                                                    <>
                                                        <i className="bi bi-brightness-high-fill text-white fs-6"></i>
                                                        <i className="bi bi-moon-stars-fill text-white fs-6"></i>
                                                    </>
                                                );
                                                if (hasMor) return <i className="bi bi-brightness-high-fill text-dark fs-5"></i>;
                                                if (hasEve) return <i className="bi bi-moon-stars-fill text-dark fs-5"></i>;
                                                return null;
                                            })()
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Card Body - Booking Details */}
                            <div className="d-flex flex-column gap-1 p-2">
                                {dayBookings.length > 0 ? dayBookings.map((bk, idx) => (
                                    <div key={idx} className="d-flex align-items-center px-1 py-1">
                                        <div className="text-truncate w-100 fw-bold" style={{ fontSize: '0.7rem', color: '#444' }}>
                                            {/* Shift Icon beside Customer Name */}
                                            {bk.shift === 'Morning' && <i className="bi bi-brightness-high-fill text-warning me-1"></i>}
                                            {bk.shift === 'Evening' && <i className="bi bi-moon-stars-fill text-info me-1"></i>}
                                            {bk.shift === 'Full Day' && <i className="bi bi-calendar-event-fill text-danger me-1"></i>}

                                            {bk.customer} {isPast && <span className="ms-1 opacity-75 fw-normal">(Ended)</span>}
                                        </div>
                                    </div>
                                )) : (
                                    <span style={{ fontSize: '0.65rem' }} className="text-muted px-1">{status === 'Disabled' ? '' : 'Available'}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    // Helper for Modal Logic
    const currentDayBookings = bookings[selectedDate] || [];
    const hasFullDay = currentDayBookings.some(b => b.shift === 'Full Day');
    const hasMorning = currentDayBookings.some(b => b.shift === 'Morning');
    const hasEvening = currentDayBookings.some(b => b.shift === 'Evening');
    const isDayFull = hasFullDay || (hasMorning && hasEvening);
    const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastSelected = selectedDateObj < today;

    return (
        <div className="card border-0 shadow-sm p-4 h-100">
            {renderHeader()}

            {viewMode === 'calendar' && renderLegend()}
            {viewMode === 'calendar' && renderCalendarGrid()}
            {viewMode === 'month' && renderMonthGrid()}
            {viewMode === 'year' && renderYearGrid()}

            {/* Modal */}
            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
                    <div className="bg-white rounded-4 shadow-lg" style={{ width: '400px', maxWidth: '90%', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                            <div>
                                <h3 className="modal-title fs-5 fw-bold mb-1">
                                    {bookings[selectedDate] && bookings[selectedDate].length > 0 ? 'Manage Bookings' : 'Add Booking'}
                                </h3>
                                <div className="text-muted small">{new Date(selectedDate).toDateString()}</div>
                            </div>
                            <button className="btn btn-sm btn-light rounded-circle shadow-sm" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>

                        <div className="modal-body p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            {/* Existing Bookings List */}
                            {bookings[selectedDate] && bookings[selectedDate].length > 0 && (
                                <div className="mb-4">
                                    <h6 className="sa-section-title border-bottom pb-2 mb-3" style={{ fontSize: '0.85rem' }}>Existing Bookings ({bookings[selectedDate].length})</h6>
                                    <div className="d-flex flex-column gap-3">
                                        {bookings[selectedDate].map((booking, idx) => {
                                            const updates = editingUpdates[idx] || {};
                                            const currentPaymentStatus = updates.paymentStatus || booking.paymentStatus || 'Pending';
                                            const currentBookingStatus = updates.bookingStatus || booking.bookingStatus || 'Confirmed';
                                            const hasChanges = Object.keys(updates).length > 0;

                                            return (
                                                <div key={idx} className="p-3 bg-light rounded-3 border">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div>
                                                            <span className={`badge ${booking.shift === 'Full Day' ? 'bg-danger' : 'bg-primary'} mb-1 me-2`}>{booking.shift}</span>
                                                            <span className={`badge ${booking.bookingStatus === 'Cancelled' ? 'bg-secondary' : booking.bookingStatus === 'Confirmed' ? 'bg-success' : 'bg-warning text-dark'} mb-1`}>{booking.bookingStatus || 'Confirmed'}</span>

                                                            {booking.paymentStatus === 'Paid' ? (
                                                                <h6 className="mb-0 fw-bold text-success mt-1">{booking.customer} <i className="bi bi-check-circle-fill small"></i> (Paid)</h6>
                                                            ) : (
                                                                <h6 className="mb-0 fw-bold mt-1">{booking.customer}</h6>
                                                            )}
                                                            <small className="text-muted d-block">{booking.phone}</small>
                                                        </div>
                                                        {hasChanges && (
                                                            <button
                                                                className="btn btn-sm btn-dark shadow-sm px-3"
                                                                onClick={() => handleSaveChanges(idx)}
                                                            >
                                                                Update
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Payment:</small>
                                                            {isPastSelected && booking.paymentStatus === 'Paid' ? (
                                                                <span className="badge bg-success">Paid</span>
                                                            ) : (
                                                                <select
                                                                    className="form-select form-select-sm py-0"
                                                                    style={{ width: '90px', fontSize: '0.75rem' }}
                                                                    value={currentPaymentStatus}
                                                                    onChange={(e) => handleLocalUpdate(idx, 'paymentStatus', e.target.value)}
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Paid">Paid</option>
                                                                    <option value="Partial">Partial</option>
                                                                </select>
                                                            )}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Status:</small>
                                                            <select
                                                                className="form-select form-select-sm py-0"
                                                                style={{ width: '100px', fontSize: '0.75rem' }}
                                                                value={currentBookingStatus}
                                                                onChange={(e) => handleLocalUpdate(idx, 'bookingStatus', e.target.value)}
                                                            >
                                                                <option value="Confirmed">Confirmed</option>
                                                                <option value="Pending">Pending</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                                <option value="Completed">Completed</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="text-end mt-1">
                                                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>{booking.paymentMode}</small>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(!isDayFull && !isPastSelected) && (
                                <>
                                    {bookings[selectedDate] && bookings[selectedDate].length > 0 && <hr className="my-4" />}
                                    <h6 className="sa-section-title border-bottom pb-2 mb-3" style={{ fontSize: '0.85rem' }}>Add New Booking</h6>

                                    <form onSubmit={handleSaveBooking}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Customer Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                required
                                                value={formData.customerName}
                                                placeholder="Enter name"
                                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                required
                                                value={formData.customerPhone}
                                                placeholder="Enter phone"
                                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Shift Selection</label>
                                            <select
                                                className="form-select"
                                                style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                                value={formData.shift}
                                                onChange={e => setFormData({ ...formData, shift: e.target.value })}
                                            >
                                                <option value="Morning">Morning Shift</option>
                                                <option value="Evening">Evening Shift</option>
                                                <option value="Full Day">Full Day</option>
                                            </select>
                                        </div>

                                        <div className="row g-3 mb-4">
                                            <div className="col-12">
                                                <h6 className="sa-section-title border-bottom pb-2 mb-3" style={{ fontSize: '0.85rem' }}>Payment & Status</h6>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Payment Mode</label>
                                                <select
                                                    className="form-select"
                                                    style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                    value={formData.paymentMode}
                                                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                                                >
                                                    <option value="Offline - Cash">Offline - Cash</option>
                                                    <option value="Offline - UPI">Offline - UPI</option>
                                                    <option value="Online">Online (System)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Payment Status</label>
                                                <select
                                                    className="form-select"
                                                    style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                    value={formData.paymentStatus}
                                                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Partial">Partial</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Booking Status</label>
                                                <select
                                                    className="form-select"
                                                    style={{ padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                    value={formData.bookingStatus}
                                                    onChange={e => setFormData({ ...formData, bookingStatus: e.target.value })}
                                                >
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Pending">Pending</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button
                                                type="submit"
                                                className="btn text-white fw-bold shadow-sm"
                                                style={{
                                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                    padding: '12px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Confirm Booking
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAvailability;
