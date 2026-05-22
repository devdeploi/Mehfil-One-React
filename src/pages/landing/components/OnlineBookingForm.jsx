import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FaCalendarAlt, FaUser, FaPhone, FaCheckCircle, FaClock, FaRupeeSign, 
    FaSnowflake, FaBolt, FaMicrophone, FaParking, FaChevronCircleUp, 
    FaTint, FaLayerGroup, FaBed, FaPaintBrush, FaStore, FaUtensils,
    FaPlus, FaMinus, FaTags, FaInfoCircle, FaUsers
} from 'react-icons/fa';
import { API_URL } from '../../../utils/function';

const OnlineBookingForm = ({ venue, selectedDate, bookings = {}, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [multiDayWarning, setMultiDayWarning] = useState(false);

    // Helper to get YYYY-MM-DD local string
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    // Get booked shifts for the selected date
    const bookedShifts = useMemo(() => {
        if (!selectedDate) return [];
        const dStr = formatDate(selectedDate);
        const dayBookings = (bookings[dStr] || []).filter(b => b.bookingStatus !== 'Cancelled');
        return dayBookings.map(b => b.displayShift || b.shift);
    }, [selectedDate, bookings, formatDate]);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        shift: 'Morning',
        isMultiDay: false,
        endDate: '',
        dayShifts: {}, // Map { 'YYYY-MM-DD': 'Shift' }
        guests: '',
        transactionId: '',
        extraFacilities: {
            ac: { selected: false, price: venue?.facilities?.acPrice || 0 },
            generator: { selected: false, price: venue?.facilities?.generatorPrice || 0 },
            soundSystem: { selected: false, price: venue?.facilities?.soundSystemPrice || 0 },
            parking: { selected: false, price: venue?.facilities?.parkingPrice || 0 },
            lift: { selected: false, price: venue?.facilities?.liftPrice || 0 },
            drinkingWater: { selected: false, price: venue?.facilities?.drinkingWaterPrice || 0 },
            cleaning: { selected: false, price: venue?.facilities?.cleaningPrice || 0 },
            stage: { selected: false, price: venue?.facilities?.stagePrice || 0 },
            rooms: { selected: false, price: venue?.facilities?.roomsPrice || 0 },
            decoration: { selected: false, price: venue?.decoration?.items?.[0]?.startPrice || 0 },
            stalls: { selected: false, price: venue?.stalls?.price || 0 },
            utensils: { selected: false, price: venue?.utensils?.price || 0 },
            catering: { selected: false, price: venue?.catering?.startPrice || 0 }
        }
    });

    // Auto-select first available shift
    useEffect(() => {
        if (bookedShifts.includes('Full Day') || (bookedShifts.includes('Morning') && bookedShifts.includes('Evening'))) {
            // All booked - shouldn't happen if getBookingStatus worked, but safety first
        } else if (bookedShifts.includes('Morning')) {
            setFormData(prev => ({ ...prev, shift: 'Evening' }));
        } else if (bookedShifts.includes('Evening')) {
            setFormData(prev => ({ ...prev, shift: 'Morning' }));
        }
    }, [bookedShifts]);

    // Populate user data
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('vendor_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFormData(prev => ({
                ...prev,
                customerName: user.fullName || user.name || '',
                customerPhone: user.phone || user.mobile || ''
            }));
        }
    }, []);

    const recommendedPrice = useMemo(() => {
        if (!venue || !selectedDate) return 0;
        const mPrice = Number(venue.morningPrice) || 0;
        const ePrice = Number(venue.eveningPrice) || 0;
        const fPrice = Number(venue.fullDayPrice) || 0;

        const getShiftPrice = (shift) => {
            if (shift === 'Morning') return mPrice;
            if (shift === 'Evening') return ePrice;
            return fPrice;
        };

        if (!formData.isMultiDay) {
            return getShiftPrice(formData.shift);
        }

        let total = 0;
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = formData.endDate ? new Date(formData.endDate) : start;
        end.setHours(0, 0, 0, 0);
        
        let curr = new Date(start);
        while (curr <= end) {
            const dStr = formatDate(curr);
            const shift = formData.dayShifts[dStr] || 'Full Day';
            total += getShiftPrice(shift);
            // Move to next day safely
            curr.setDate(curr.getDate() + 1);
            curr.setHours(0, 0, 0, 0);
        }
        return total;
    }, [formData.isMultiDay, formData.endDate, formData.dayShifts, formData.shift, selectedDate, venue]);

    const numDays = useMemo(() => {
        if (!formData.isMultiDay || !formData.endDate) return 1;
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(formData.endDate);
        end.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(1, diffDays);
    }, [formData.isMultiDay, formData.endDate, selectedDate]);

    const totalFacilitiesPrice = useMemo(() => {
        return Object.values(formData.extraFacilities).reduce((acc, f) => acc + (f.selected ? Number(f.price || 0) * numDays : 0), 0);
    }, [formData.extraFacilities, numDays]);

    const totalAdvance = (venue.advanceAmount || 0) * numDays;
    const finalAmount = recommendedPrice + totalFacilitiesPrice;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Multi-day warning check: if any of the spanned dates are booked
        if (formData.isMultiDay && formData.endDate) {
            let curr = new Date(selectedDate);
            const end = new Date(formData.endDate);
            while (curr <= end) {
                const dStr = formatDate(curr);
                const dayBookings = (bookings[dStr] || []).filter(b => b.bookingStatus !== 'Cancelled');
                // Simple overlap check - can be more granular
                if (dayBookings.length > 0) {
                    const isMorningTaken = dayBookings.some(b => (b.displayShift || b.shift) === 'Morning' || (b.displayShift || b.shift) === 'Full Day');
                    const isEveningTaken = dayBookings.some(b => (b.displayShift || b.shift) === 'Evening' || (b.displayShift || b.shift) === 'Full Day');
                    
                    if (isMorningTaken || isEveningTaken) {
                        alert(`Warning: ${curr.toLocaleDateString()} already has a booking. This multi-day request might overlap with existing reservations.`);
                        return;
                    }
                }
                curr.setDate(curr.getDate() + 1);
            }
        }

        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor_user') || '{}');
            const dateStr = formatDate(selectedDate);
            const payload = {
                mahalId: venue._id || venue.id,
                userId: storedUser.id || storedUser._id,
                date: dateStr,
                shift: formData.shift,
                isMultiDay: formData.isMultiDay,
                endDate: formData.isMultiDay ? formData.endDate : null,
                dayShifts: formData.dayShifts,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                bookingType: 'Online',
                bookingStatus: 'Pending',
                paymentStatus: 'Pending',
                price: recommendedPrice,
                extraFacilities: Object.fromEntries(
                    Object.entries(formData.extraFacilities).map(([key, f]) => [
                        key, 
                        { ...f, price: f.selected ? Number(f.price || 0) * numDays : f.price }
                    ])
                ),
                totalAmount: finalAmount,
                guests: formData.guests,
                advancePaid: totalAdvance,
                transactionId: formData.transactionId
            };

            await axios.post(`${API_URL}/bookings`, payload);
            alert("Booking Request Submitted Successfully!");
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.msg || "Booking failed.");
        } finally {
            setLoading(false);
        }
    };

    const toggleFacility = (key) => {
        setFormData(prev => ({
            ...prev,
            extraFacilities: {
                ...prev.extraFacilities,
                [key]: { ...prev.extraFacilities[key], selected: !prev.extraFacilities[key].selected }
            }
        }));
    };

    const handleUpiPay = () => {
        const upiId = venue.vendorId?.upiId;
        const vendorName = venue.vendorId?.fullName || venue.mahalName;
        const amount = totalAdvance;
        const note = `Booking Advance for ${venue.mahalName} (${numDays} Days) starting ${formatDate(selectedDate)}`;
        
        if (!upiId) {
            alert("Vendor payment details are currently unavailable. Please try again later or contact support.");
            return;
        }

        if (amount <= 0) {
            alert("Advance amount is not set. Please contact the venue.");
            return;
        }

        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(vendorName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
        window.location.href = upiUrl;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("UPI ID copied to clipboard!");
    };

    const isShiftDisabled = (s) => {
        if (bookedShifts.includes('Full Day')) return true;
        if (s === 'Full Day' && (bookedShifts.includes('Morning') || bookedShifts.includes('Evening'))) return true;
        if (s === 'Morning' && bookedShifts.includes('Morning')) return true;
        if (s === 'Evening' && bookedShifts.includes('Evening')) return true;
        return false;
    };

    return (
        <form onSubmit={handleSubmit} className="online-booking-form animate-fade-in" style={{ overflowX: 'hidden' }}>
            <div className="row g-4">
                {/* Left Column: Form Inputs */}
                <div className="col-lg-7">
                    <div className="d-flex flex-column gap-4 h-100">
                        <div className="bg-light-subtle p-4 rounded-4 border border-light-subtle h-100">
                            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <FaUser className="text-danger" /> Primary Details
                            </h6>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Full Name</label>
                                    <div className="input-group shadow-sm rounded-4 overflow-hidden border">
                                        <span className="input-group-text bg-white border-0"><FaUser className="text-danger-light" size={12} /></span>
                                        <input 
                                            type="text" 
                                            className="form-control border-0 p-3" 
                                            placeholder="Enter your name"
                                            value={formData.customerName}
                                            onChange={e => setFormData({...formData, customerName: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Contact Number</label>
                                    <div className="input-group shadow-sm rounded-4 overflow-hidden border">
                                        <span className="input-group-text bg-white border-0"><FaPhone className="text-danger-light" size={12} /></span>
                                        <input 
                                            type="text" 
                                            className="form-control border-0 p-3" 
                                            placeholder="Phone number"
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Estimated Guests</label>
                                    <div className="input-group shadow-sm rounded-4 overflow-hidden border">
                                        <span className="input-group-text bg-white border-0"><FaUsers className="text-danger-light" size={12} /></span>
                                        <input 
                                            type="number" 
                                            className="form-control border-0 p-3" 
                                            placeholder={`Max ${venue.seatingCapacity}`}
                                            value={formData.guests}
                                            onChange={e => setFormData({...formData, guests: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-12 mt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-0 tracking-wider">
                                            {formData.isMultiDay ? 'Select End Date First' : 'Booking Shift'}
                                        </label>
                                        <div className="form-check form-switch d-flex align-items-center gap-2">
                                            <input 
                                                className="form-check-input custom-switch" 
                                                type="checkbox" 
                                                id="multiDaySwitch"
                                                checked={formData.isMultiDay}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    const dStr = formatDate(selectedDate);
                                                    setFormData(prev => ({
                                                        ...prev, 
                                                        isMultiDay: checked,
                                                        dayShifts: checked ? { [dStr]: prev.shift } : {}
                                                    }));
                                                    if(checked) setMultiDayWarning(true);
                                                }}
                                            />
                                            <label className="form-check-label small fw-bold text-danger" htmlFor="multiDaySwitch" style={{ cursor: 'pointer' }}>Multi-day Booking</label>
                                        </div>
                                    </div>

                                    {formData.isMultiDay ? (
                                        <div className="animate-fade-in">
                                            <div className="input-group shadow-sm rounded-4 overflow-hidden border mb-3">
                                                <span className="input-group-text bg-white border-0"><FaCalendarAlt className="text-danger-light" size={12} /></span>
                                                <input 
                                                    type="date" 
                                                    className="form-control border-0 p-3" 
                                                    value={formData.endDate}
                                                    onChange={e => {
                                                        const end = e.target.value;
                                                        const start = new Date(selectedDate);
                                                        const endDateObj = new Date(end);
                                                        const newDayShifts = {};
                                                        let curr = new Date(start);
                                                        while (curr <= endDateObj) {
                                                            const dStr = formatDate(curr);
                                                            newDayShifts[dStr] = formData.dayShifts[dStr] || 'Full Day';
                                                            curr.setDate(curr.getDate() + 1);
                                                        }
                                                        setFormData(prev => ({ ...prev, endDate: end, dayShifts: newDayShifts }));
                                                    }}
                                                    onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    min={formatDate(selectedDate)}
                                                    required
                                                />
                                            </div>

                                            {formData.endDate && (
                                                <div className="mt-3">
                                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 tracking-wider d-block">Select Shifts for Each Day</label>
                                                    <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden', padding: '5px' }}>
                                                        <div className="row g-2">
                                                            {Object.keys(formData.dayShifts).sort().map((dStr) => (
                                                                <div key={dStr} className="col-6">
                                                                    <div className="p-2 rounded-3 border bg-white shadow-sm">
                                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                                            <span className="fw-bold text-dark" style={{ fontSize: '0.65rem' }}>
                                                                                {new Date(dStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                            </span>
                                                                            <span className="text-muted" style={{ fontSize: '0.55rem' }}>
                                                                                {new Date(dStr).toLocaleDateString('en-IN', { weekday: 'short' })}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: 2, background: '#f0f2f5', borderRadius: 8, padding: 2 }}>
                                                                            {[
                                                                                { val: 'Morning', icon: <FaClock />, color: '#f59e0b' },
                                                                                { val: 'Evening', icon: <FaClock />, color: '#3b82f6' },
                                                                                { val: 'Full Day', icon: <FaCheckCircle />, color: '#e63946' }
                                                                            ].map((item) => (
                                                                                <button
                                                                                    key={item.val} type="button"
                                                                                    onClick={() => setFormData(prev => ({
                                                                                        ...prev,
                                                                                        dayShifts: { ...prev.dayShifts, [dStr]: item.val }
                                                                                    }))}
                                                                                    className={`btn p-1 flex-fill border-0 rounded-2 d-flex flex-column align-items-center transition-all ${formData.dayShifts[dStr] === item.val ? 'bg-white shadow-sm' : 'opacity-50'}`}
                                                                                    style={{ fontSize: '0.55rem' }}
                                                                                >
                                                                                    <span style={{ color: formData.dayShifts[dStr] === item.val ? item.color : '#94a3b8' }}>
                                                                                        {React.cloneElement(item.icon, { size: 8 })}
                                                                                    </span>
                                                                                    <span className="fw-bold" style={{ color: formData.dayShifts[dStr] === item.val ? '#1a1a2e' : '#94a3b8' }}>
                                                                                        {item.val === 'Full Day' ? 'Full' : item.val[0]}
                                                                                    </span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="d-flex gap-1 bg-white p-1 rounded-4 shadow-sm border">
                                            {['Morning', 'Evening', 'Full Day'].map(s => {
                                                const disabled = isShiftDisabled(s);
                                                return (
                                                    <button 
                                                        key={s} type="button"
                                                        disabled={disabled}
                                                        onClick={() => setFormData({...formData, shift: s})}
                                                        className={`btn flex-fill rounded-3 py-2 fw-bold transition-all ${formData.shift === s ? 'bg-danger text-white shadow-sm' : 'text-muted border-0'} ${disabled ? 'opacity-25' : ''}`}
                                                        style={{ fontSize: '0.75rem', position: 'relative' }}
                                                    >
                                                        {s}
                                                        {disabled && <span className="position-absolute start-50 translate-middle-x" style={{ fontSize: '0.45rem', bottom: '2px', color: '#ff8a94' }}>BOOKED</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Facilities Selection (Premium Add-ons - Left Bottom) */}
                        <div className="bg-light-subtle p-4 rounded-4 border border-light-subtle shadow-sm">
                            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <FaBolt className="text-danger" /> Premium Add-ons
                            </h6>
                            <div className="row g-2 custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {[
                                    { key: 'ac', label: 'AC', icon: <FaSnowflake />, available: venue?.facilities?.ac },
                                    { key: 'generator', label: 'Genset', icon: <FaBolt />, available: venue?.facilities?.generator },
                                    { key: 'soundSystem', label: 'Audio', icon: <FaMicrophone />, available: venue?.facilities?.soundSystem },
                                    { key: 'parking', label: 'Parking', icon: <FaParking />, available: venue?.facilities?.parking },
                                    { key: 'lift', label: 'Lift', icon: <FaChevronCircleUp />, available: venue?.facilities?.lift },
                                    { key: 'drinkingWater', label: 'Water', icon: <FaTint />, available: venue?.facilities?.drinkingWater },
                                    { key: 'stage', label: 'Stage', icon: <FaLayerGroup />, available: venue?.facilities?.stage },
                                    { key: 'rooms', label: 'Rooms', icon: <FaBed />, available: venue?.facilities?.rooms },
                                    { key: 'decoration', label: 'Decor', icon: <FaPaintBrush />, available: venue?.decoration?.available },
                                    { key: 'stalls', label: 'Stalls', icon: <FaStore />, available: venue?.stalls?.available },
                                    { key: 'utensils', label: 'Utensils', icon: <FaUtensils />, available: venue?.utensils?.available },
                                    { key: 'catering', label: 'Catering', icon: <FaUtensils />, available: venue?.catering?.available }
                                ].map(f => f.available && (
                                    <div key={f.key} className="col-md-3 col-4">
                                        <div 
                                            onClick={() => toggleFacility(f.key)}
                                            className={`p-2 rounded-3 border transition-all cursor-pointer d-flex flex-column align-items-center gap-1 position-relative ${formData.extraFacilities[f.key].selected ? 'border-danger bg-danger-soft' : 'border-light bg-white opacity-75'}`}
                                            title={`₹${formData.extraFacilities[f.key].price || 0}`}
                                        >
                                            <div className={`${formData.extraFacilities[f.key].selected ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '1rem' }}>{f.icon}</div>
                                            <div className="fw-bold text-center lh-1" style={{ fontSize: '0.55rem', textTransform: 'uppercase' }}>{f.label}</div>
                                            <div className={`fw-bold ${formData.extraFacilities[f.key].selected ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.5rem' }}>
                                                {Number(formData.extraFacilities[f.key].price) > 0 ? `₹${formData.extraFacilities[f.key].price}` : 'Free'}
                                            </div>
                                            {formData.extraFacilities[f.key].selected && <FaCheckCircle className="text-danger position-absolute top-0 end-0 m-1" size={8} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Receipt & Payment */}
                <div className="col-lg-5">
                    <div className="d-flex flex-column gap-4 h-100">
                        {/* Pricing Summary */}
                        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '24px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                    <FaTags className="text-danger" /> Order Review
                                </h6>
                                <span className="badge bg-white-10 text-white-50 x-small rounded-pill px-2">Estimate</span>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                                    <span className="text-white-50">Venue Rent</span>
                                    <span className="fw-bold text-white">₹{recommendedPrice.toLocaleString()}</span>
                                </div>
                                
                                {totalFacilitiesPrice > 0 && (
                                    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                                        <span className="text-white-50">Facilities Add-ons</span>
                                        <span className="text-success fw-bold">+ ₹{totalFacilitiesPrice.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="border-top border-white-10 pt-3 mt-3 d-flex justify-content-between align-items-end">
                                    <div>
                                        <div className="text-white-50 fw-bold text-uppercase tracking-wider" style={{ fontSize: '0.55rem' }}>Total Amount</div>
                                        <div className="text-muted" style={{ fontSize: '0.5rem' }}>Final Total</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="h3 fw-bold mb-0 text-danger" style={{ lineHeight: 1 }}>₹{finalAmount.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-danger-soft p-4 rounded-4 border border-danger-subtle shadow-sm animate-fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                                    <i className="bi bi-shield-lock-fill"></i> Secure Advance Payment
                                </h6>
                                <span className="badge bg-danger rounded-pill x-small">Required</span>
                            </div>
                            
                            <div className="p-3 bg-white rounded-4 border border-danger-subtle mb-3 text-center">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Advance Amount ({numDays} {numDays > 1 ? 'Days' : 'Day'})</div>
                                <div className="h4 fw-bold text-dark mb-3">₹{totalAdvance.toLocaleString()}</div>
                                
                                {/* QR Code for Desktop/Mobile Scans */}
                                {venue.vendorId?.upiId && (
                                    <div className="mb-3 p-2 bg-light rounded-3 d-inline-block border">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${venue.vendorId.upiId}&pn=${venue.vendorId.fullName || venue.mahalName}&am=${totalAdvance}&cu=INR`)}`} 
                                            alt="Scan to Pay"
                                            style={{ width: '120px', height: '120px' }}
                                        />
                                        <div className="mt-1 small text-muted fw-bold" style={{ fontSize: '0.55rem' }}>SCAN TO PAY</div>
                                    </div>
                                )}

                                <div className="d-flex flex-column gap-2">
                                    <button 
                                        type="button"
                                        onClick={handleUpiPay}
                                        className="btn btn-danger w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <i className="bi bi-phone-fill"></i> Pay using UPI App
                                    </button>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-danger text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Transaction ID (after payment)</label>
                                <div className="input-group shadow-sm rounded-4 overflow-hidden border border-danger-subtle">
                                    <span className="input-group-text bg-white border-0"><i className="bi bi-hash text-danger"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-0 p-3" 
                                        placeholder="Enter 12-digit UPI Transaction ID"
                                        value={formData.transactionId}
                                        onChange={e => setFormData({...formData, transactionId: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                                        required
                                        minLength={12}
                                        maxLength={22}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                </div>
                                <p className="text-muted x-small mt-2 mb-0">
                                    <FaInfoCircle className="text-danger me-1" /> Enter the 12-digit UTR/Transaction ID from your UPI app.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
 
                {/* Footer Actions */}
                <div className="col-12 mt-2">
                    <button 
                        type="submit" 
                        disabled={loading || formData.transactionId.length < 12}
                        className={`btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-lg transform-active d-flex align-items-center justify-content-center gap-3 ${formData.transactionId.length < 12 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ background: 'linear-gradient(135deg, #111, #333)', border: 'none' }}
                    >
                        {loading ? 'Processing Request...' : (
                            <>
                                <FaCheckCircle size={18} /> {formData.transactionId.length >= 12 ? 'Confirm Booking Request' : 'Enter Valid Transaction ID to Confirm'}
                            </>
                        )}
                    </button>
                    <p className="text-muted text-center small mt-3 mb-0" style={{ fontSize: '0.7rem' }}>
                        <FaInfoCircle size={10} className="me-1 text-danger" /> Manager will verify and call you back for final confirmation and payment details.
                    </p>
                </div>
            </div>

            <style>{`
                .bg-danger-soft { background: rgba(220, 53, 69, 0.05); }
                .bg-white-10 { background: rgba(255, 255, 255, 0.1); }
                .text-danger-light { color: #ff8a94; }
                .x-small { font-size: 0.6rem; }
                .space-y-2 > * + * { margin-top: 0.75rem; }
                .online-booking-form { max-height: 75vh; overflow-y: auto; padding-right: 8px; }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-switch:checked { background-color: #dc3545; border-color: #dc3545; }
                .bg-light-subtle { background-color: #f8fafc; }
                @media (max-width: 991px) {
                    .online-booking-form { max-height: none; overflow-y: visible; }
                }
            `}</style>
        </form>
    );
};

export default OnlineBookingForm;
