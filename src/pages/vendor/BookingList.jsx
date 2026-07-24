import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaCalendarAlt, FaUser, FaPhone, FaSearch, FaFilter,
    FaChevronRight, FaChevronLeft, FaBuilding, FaClock,
    FaCheckCircle, FaHourglassHalf, FaBan, FaEllipsisV,
    FaArrowRight, FaRupeeSign, FaEye, FaTrash, FaInfoCircle,
    FaCheck, FaTimes, FaLayerGroup, FaSnowflake, FaBolt,
    FaMicrophone, FaParking, FaChevronCircleUp, FaTint,
    FaBed, FaPaintBrush, FaStore, FaUtensils, FaUsers,
    FaDownload, FaPrint
} from 'react-icons/fa';

import { API_URL } from '../../utils/function';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [mahals, setMahals] = useState([]);
    const [selectedMahal, setSelectedMahal] = useState('All');
    const [activeTab, setActiveTab] = useState('Online'); // 'Online' or 'Offline'

    // Modal & Details States
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Verification Modal States
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyAmount, setVerifyAmount] = useState('');
    const [isFullAdvance, setIsFullAdvance] = useState(false);

    // Collect Balance States
    const [showCollectBalanceModal, setShowCollectBalanceModal] = useState(false);
    const [collectBalanceAmount, setCollectBalanceAmount] = useState('');

    // Editing Status States
    const [tempStatus, setTempStatus] = useState({ bookingStatus: '', paymentStatus: '', balancePaid: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);

    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const vendorData = JSON.parse(localStorage.getItem('vendor_user'));
        if (vendorData) {
            fetchMahals(vendorData.id || vendorData._id);
        }
    }, []);

    useEffect(() => {
        const vendorData = JSON.parse(localStorage.getItem('vendor_user'));
        if (vendorData && mahals.length > 0) {
            fetchAllBookings(vendorData.id || vendorData._id, currentPage);
        }
    }, [currentPage, mahals]);

    const fetchMahals = async (vendorId) => {
        try {
            const res = await axios.get(`${API_URL}/mahals?vendorId=${vendorId}`);
            setMahals(res.data.mahals || []);
        } catch (error) {
            console.error("Error fetching mahals", error);
            setLoading(false);
        }
    };

    const fetchAllBookings = async (vendorId, page) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/bookings`, {
                params: { vendorId, page, limit: 50 }
            });

            // Backend now populates mahalId and returns paginated data
            const processed = (res.data.bookings || []).map(b => ({
                ...b,
                mahalName: b.mahalId?.mahalName || 'Unknown Venue'
            }));

            setBookings(processed);
            setTotalPages(res.data.totalPages);
            setTotalBookings(res.data.totalBookings);
        } catch (error) {
            console.error("Error fetching bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/bookings/${id}`);
            setBookings(prev => prev.filter(b => b._id !== id));
            if (selectedBooking?._id === id) setShowDetailsModal(false);
            showToast("Booking deleted successfully.", "success");
        } catch (error) {
            showToast("Error deleting booking.", "error");
        }
    };

    const handleUpdateStatus = async (id, field, value) => {
        try {
            setIsUpdating(true);
            await axios.put(`${API_URL}/bookings/${id}`, { [field]: value });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, [field]: value } : b));
            if (selectedBooking?._id === id) {
                setShowDetailsModal(false);
            }
            showToast("Status updated successfully!", "success");
        } catch (error) {
            showToast("Error updating status.", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveManagementChanges = async () => {
        setIsUpdating(true);
        try {
            const updates = {};
            if (tempStatus.bookingStatus !== selectedBooking.bookingStatus) updates.bookingStatus = tempStatus.bookingStatus;
            if (tempStatus.paymentStatus !== selectedBooking.paymentStatus) updates.paymentStatus = tempStatus.paymentStatus;
            if (tempStatus.balancePaid !== (selectedBooking.balancePaid || 0)) updates.balancePaid = tempStatus.balancePaid;

            if (Object.keys(updates).length > 0) {
                await axios.put(`${API_URL}/bookings/${selectedBooking._id}`, updates);
                showToast("Management changes saved successfully!", "success");
                
                const vendorData = JSON.parse(localStorage.getItem('vendor_user'));
                fetchAllBookings(vendorData.id || vendorData._id, currentPage);
                
                setSelectedBooking(prev => ({ ...prev, ...updates }));
                setShowDetailsModal(false);
            }
        } catch (error) {
            console.error("Failed to save changes", error);
            showToast("Failed to save changes", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCollectBalance = () => {
        if (!collectBalanceAmount || isNaN(collectBalanceAmount) || Number(collectBalanceAmount) <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }
        
        const currentBalancePaid = tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0);
        const newBalancePaid = currentBalancePaid + Number(collectBalanceAmount);
        
        const isFullyPaid = (Number(selectedBooking.advancePaid || 0) + newBalancePaid) >= Number(selectedBooking.totalAmount || 0);
        
        let newPaymentStatus = tempStatus.paymentStatus;
        if (isFullyPaid) {
            newPaymentStatus = 'Paid';
        } else if (tempStatus.paymentStatus === 'Pending') {
            newPaymentStatus = 'Partial';
        }
        
        setTempStatus(prev => ({
            ...prev,
            balancePaid: newBalancePaid,
            paymentStatus: newPaymentStatus
        }));
        
        showToast("Balance staged. Please click 'Save Management Changes' to confirm.", "success");
        setShowCollectBalanceModal(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed':
                return <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 border border-success-subtle">Confirmed</span>;
            case 'Pending':
                return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 border border-warning-subtle">Pending</span>;
            case 'Cancelled':
                return <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2 border border-danger-subtle">Cancelled</span>;
            default:
                return <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2 border border-secondary-subtle">{status}</span>;
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.customerPhone || '').includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
        const matchesMahal = selectedMahal === 'All' || b.mahalId === selectedMahal || b.mahalId?._id === selectedMahal;

        // Tab Filter: If bookingType is missing, treat as Offline (older bookings)
        const type = b.bookingType || 'Offline';
        const matchesTab = type === activeTab;

        return matchesSearch && matchesStatus && matchesMahal && matchesTab;
    });

    const formatDateRange = (booking) => {
        const start = new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        if (booking.isMultiDay && booking.endDate) {
            const end = new Date(booking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">{start}</span>
                    <FaArrowRight className="text-muted small" />
                    <span className="fw-bold">{end}</span>
                </div>
            );
        }
        return <span className="fw-bold">{start}</span>;
    };

    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });

    const handleDownloadReceipt = async (booking) => {
        setIsGeneratingPDF(true);
        const bookingId = booking._id.slice(-6).toUpperCase();
        const startDate = new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const endDate = booking.isMultiDay && booking.endDate
            ? new Date(booking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : null;
        const createdAt = booking.createdAt
            ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        // Format dates and numbers safely
        const formatMoney = (amount) => Number(amount || 0).toLocaleString('en-IN');
        
        const calculatePending = () => Math.max(0, Number(booking.totalAmount || 0) - Number(booking.advancePaid || 0) - Number(booking.balancePaid || 0));

        const selectedFacilities = booking.extraFacilities
            ? Object.entries(booking.extraFacilities).filter(([_, f]) => f.selected)
            : [];

        const shiftLabel = booking.isMultiDay && booking.dayShifts
            ? Object.values(booking.dayShifts).join(' / ')
            : (booking.shift || 'Full Day');

        const statusWatermark = booking.paymentStatus === 'Paid' 
            ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:120px;font-weight:bold;color:rgba(0,0,0,0.04);z-index:-1;pointer-events:none;white-space:nowrap;">PAID IN FULL</div>'
            : booking.paymentStatus === 'Cancelled'
            ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:120px;font-weight:bold;color:rgba(0,0,0,0.04);z-index:-1;pointer-events:none;white-space:nowrap;">CANCELLED</div>'
            : '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:120px;font-weight:bold;color:rgba(0,0,0,0.04);z-index:-1;pointer-events:none;white-space:nowrap;">BALANCE DUE</div>';

        const receiptHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice #${bookingId}</title>
<style>
  body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { 
    width: 794px; min-height: 1123px; box-sizing: border-box; margin: auto; background: white; 
    display: flex; flex-direction: column; position: relative; overflow: hidden;
  }
  
  /* Top Banner */
  .top-banner { padding: 50px 60px 30px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; }
  .logo-text { font-size: 32px; font-weight: bold; margin: 0; line-height: 1; color: #000; text-transform: uppercase; }
  .logo-sub { font-size: 11px; color: #666; font-weight: normal; margin-top: 6px; text-transform: uppercase; }
  
  .invoice-title { font-size: 40px; font-weight: bold; color: #000; margin: 0; line-height: 1; text-transform: uppercase; text-align: right; }
  .invoice-sub { font-size: 14px; color: #333; text-align: right; margin-top: 8px; }

  /* Body Content */
  .content { padding: 40px 60px; flex: 1; display: flex; flex-direction: column; z-index: 1; position: relative; }
  
  /* Details Section */
  .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
  .bill-to { flex: 1; padding-right: 20px; }
  .box-label { font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .client-name { font-size: 20px; font-weight: bold; color: #000; margin-bottom: 8px; text-transform: capitalize; }
  .client-contact { font-size: 14px; color: #333; line-height: 1.6; }
  
  .invoice-meta { width: 300px; }
  .meta-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
  .meta-label { font-size: 13px; color: #666; }
  .meta-value { font-size: 13px; color: #000; font-weight: bold; }

  /* Venue Info Banner */
  .venue-banner { background: #fafafa; border: 1px solid #ccc; padding: 15px 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; }
  .venue-name { font-size: 16px; font-weight: bold; color: #000; }
  .venue-dates { font-size: 14px; color: #333; }

  /* Table */
  .table-wrapper { margin-bottom: 40px; border: 1px solid #000; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f0f0f0; color: #000; border-bottom: 2px solid #000; }
  th { padding: 12px 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: left; }
  th.right { text-align: right; }
  td { padding: 15px 20px; border-bottom: 1px solid #ccc; background: white; }
  tr:last-child td { border-bottom: none; }
  .item-title { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 4px; }
  .item-desc { font-size: 12px; color: #666; }
  td.amount { text-align: right; font-size: 14px; font-weight: bold; color: #000; }

  /* Lower Section */
  .lower-section { display: flex; justify-content: space-between; align-items: flex-end; }
  
  .auth-sign { text-align: center; margin-bottom: 10px; margin-left: 20px; }
  .sign-line { width: 180px; height: 1px; background: #000; margin: 0 auto 10px; }
  .sign-text { font-size: 12px; color: #000; font-weight: bold; text-transform: uppercase; }

  .summary-box { width: 350px; }
  .sum-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .sum-row.total { border-top: 2px solid #000; border-bottom: none; padding-top: 15px; margin-top: 5px; }
  .sum-row.total .lbl { font-size: 18px; font-weight: bold; color: #000; }
  .sum-row.total .val { font-size: 20px; font-weight: bold; color: #000; }

  /* Payment Badge */
  .payment-status-box { margin-top: 20px; display: inline-block; padding: 10px 24px; font-size: 16px; font-weight: bold; text-transform: uppercase; border: 2px solid #000; float: right; clear: both; color: #000; }

  /* Footer */
  .footer { padding: 30px 60px; color: #666; font-size: 12px; line-height: 1.5; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: center; background: #fafafa; margin-top: auto; }
  .footer-title { color: #000; font-weight: bold; margin-bottom: 6px; font-size: 14px; text-transform: uppercase; }
  .footer-right { text-align: right; color: #000; font-weight: bold; }
</style>
</head>
<body>
<div class="sheet">
  ${statusWatermark}

  <div class="top-banner">
    <div style="display: flex; align-items: center; gap: 15px;">
      <img src="/Mehfil_One.png" alt="Logo" style="height: 50px; width: 50px; object-fit: contain; display: block;" />
      <div>
        <div class="logo-text">MEHFIL-ONE</div>
        <div class="logo-sub" style="margin-top: 5px;">Premium Venue Booking</div>
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-sub">Reference No: #${bookingId}</div>
    </div>
  </div>
  
  <div class="content">
    
    <div class="details-grid">
      <div class="bill-to">
        <div class="box-label">Billed To</div>
        <div class="client-name">${booking.customerName}</div>
        <div class="client-contact">
          Phone: ${booking.customerPhone}<br/>
          Guests: ${booking.guests || 'N/A'}<br/>
          Booking Type: ${booking.bookingType || 'Offline'}
        </div>
      </div>
      
      <div class="invoice-meta">
        <div class="box-label">Details</div>
        <div class="meta-item">
          <span class="meta-label">Date Issued:</span>
          <span class="meta-value">${createdAt}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Transaction Ref:</span>
          <span class="meta-value">${booking.transactionId || 'N/A'}</span>
        </div>
        <div class="meta-item" style="border: none; padding-bottom: 0;">
          <span class="meta-label">Payment Mode:</span>
          <span class="meta-value">${booking.paymentMode || 'N/A'}</span>
        </div>
      </div>
    </div>

    <div class="venue-banner">
      <div class="venue-name">
        Venue: ${booking.mahalName}
      </div>
      <div class="venue-dates">
        Event Date: ${startDate}${endDate ? ' - ' + endDate : ''} &nbsp;|&nbsp; Shift: ${shiftLabel}
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right" style="width: 180px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">Venue Base Price</div>
              <div class="item-desc">Core venue rental charges for the selected shift and dates</div>
            </td>
            <td class="amount">Rs. ${formatMoney(booking.price)}</td>
          </tr>
          ${selectedFacilities.length > 0 ? selectedFacilities.map(([key, f]) => `
          <tr>
            <td>
              <div class="item-title">Facility: ${key.charAt(0).toUpperCase() + key.slice(1)}</div>
            </td>
            <td class="amount">Rs. ${formatMoney(f.price)}</td>
          </tr>
          `).join('') : `
          <tr>
            <td>
              <div class="item-title">Standard Amenities</div>
              <div class="item-desc">Standard features included with the venue base price</div>
            </td>
            <td class="amount">Rs. 0</td>
          </tr>
          `}
        </tbody>
      </table>
    </div>

    <div class="lower-section">
      <div class="auth-sign">
        <div class="sign-line"></div>
        <div class="sign-text">Authorized Signature</div>
      </div>

      <div>
        <div class="summary-box">
          <div class="sum-row">
            <span>Subtotal</span>
            <span>Rs. ${formatMoney(booking.totalAmount)}</span>
          </div>
          <div class="sum-row">
            <span>Advance Paid ${booking.isVerified ? '(Verified)' : ''}</span>
            <span>- Rs. ${formatMoney(booking.advancePaid)}</span>
          </div>
          ${Number(booking.balancePaid || 0) > 0 ? `
          <div class="sum-row">
            <span>Balance Paid</span>
            <span>- Rs. ${formatMoney(booking.balancePaid)}</span>
          </div>
          ` : ''}
          <div class="sum-row total">
            <span class="lbl">Total Due</span>
            <span class="val">Rs. ${formatMoney(calculatePending())}</span>
          </div>
        </div>
        
        <div class="payment-status-box">
          STATUS: ${booking.paymentStatus}
        </div>
      </div>
    </div>

  </div><!-- /content -->
  
  <div class="footer">
    <div>
      <div class="footer-title">Thank you for your business!</div>
      If you have any questions about this invoice, please contact MEHFIL-ONE support.
    </div>
  </div>

</div>
</body>
</html>`;

        // ---- Off-screen render ----
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-9999;overflow:visible;';
        container.innerHTML = receiptHTML
            .replace(/[\s\S]*<body>/, '')
            .replace(/<\/body>[\s\S]*/, '');

        // Inject styles
        const styleMatch = receiptHTML.match(/<style>([\s\S]*?)<\/style>/);
        if (styleMatch) {
            const styleEl = document.createElement('style');
            styleEl.textContent = styleMatch[1];
            container.prepend(styleEl);
        }
        document.body.appendChild(container);

        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

            // Wait a tick for fonts/styles to apply
            await new Promise(r => setTimeout(r, 300));

            const sheetEl = container.querySelector('.sheet') || container;
            const canvas = await window.html2canvas(sheetEl, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 794,
                width: 794,
            });

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Force entire canvas into exactly ONE A4 page (210 x 297 mm)
            const imgData = canvas.toDataURL('image/jpeg', 0.96);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            const safeName = booking.customerName.replace(/\s+/g, '_');
            pdf.save(`Receipt_${bookingId}_${safeName}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            showToast('Could not generate PDF. Please try again.', 'error');
        } finally {
            document.body.removeChild(container);
            setIsGeneratingPDF(false);
        }
    };

    const toastStyles = `
        @keyframes slideInTop {
            from {transform: translateY(-100%); opacity: 0; }
            to {transform: translateY(0); opacity: 1; }
        }
        .custom-toast {
            animation: slideInTop 0.3s ease-out;
            z-index: 9999;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
    `;

    return (
        <div className="container-fluid py-4" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <style>{toastStyles}</style>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`custom-toast position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 d-flex align-items-center gap-3 bg-white border-${toast.type === 'error' ? 'danger' : 'success'} border-start border-5`} style={{ minWidth: '300px' }}>
                    <div className={`text-${toast.type === 'error' ? 'danger' : 'success'}`}>
                        {toast.type === 'error' ? <FaBan size={20} /> : <FaCheckCircle size={20} />}
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold">{toast.type === 'error' ? 'Error' : 'Success'}</h6>
                        <small className="text-secondary">{toast.message}</small>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Reservations</h2>
                    <p className="text-muted small mb-0">Manage and track all your venue bookings in one place.</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="d-flex mb-4 p-1 bg-white shadow-sm rounded-4" style={{ width: 'fit-content' }}>
                <button
                    onClick={() => setActiveTab('Online')}
                    className={`btn px-4 py-2 rounded-4 fw-bold transition-all ${activeTab === 'Online' ? 'bg-danger text-white shadow-sm' : 'text-muted border-0 bg-transparent'}`}
                    style={{ fontSize: '0.85rem' }}
                >
                    Online Bookings
                </button>
                <button
                    onClick={() => setActiveTab('Offline')}
                    className={`btn px-4 py-2 rounded-4 fw-bold transition-all ${activeTab === 'Offline' ? 'bg-danger text-white shadow-sm' : 'text-muted border-0 bg-transparent'}`}
                    style={{ fontSize: '0.85rem' }}
                >
                    Offline (Walk-in)
                </button>
            </div>

            {/* Filters Bar */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-body p-3 bg-white">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group input-group-merge">
                                <span className="input-group-text bg-light border-0"><FaSearch className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0 ps-0"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex align-items-center gap-2">
                                <FaBuilding className="text-muted small" />
                                <select
                                    className="form-select border-0 bg-light fw-bold text-dark"
                                    style={{ fontSize: '0.85rem' }}
                                    value={selectedMahal}
                                    onChange={(e) => setSelectedMahal(e.target.value)}
                                >
                                    <option value="All">All Venues</option>
                                    {mahals.map(m => <option key={m._id} value={m._id}>{m.mahalName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex align-items-center gap-2">
                                <FaFilter className="text-muted small" />
                                <select
                                    className="form-select border-0 bg-light fw-bold text-dark"
                                    style={{ fontSize: '0.85rem' }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2 text-md-end">
                            <span className="text-muted small fw-bold">{totalBookings} Total Bookings Found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Event Date</th>
                                <th className="py-3 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Customer Details</th>
                                <th className="py-3 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Venue & Shift</th>
                                <th className="py-3 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Total Amount</th>
                                <th className="py-3 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Status</th>
                                <th className="py-3 text-muted fw-bold small text-uppercase text-center" style={{ letterSpacing: '1px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-danger spinner-border-sm me-2"></div>
                                        <span className="text-muted">Loading reservations...</span>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="mb-3"><FaCalendarAlt className="text-light display-4" /></div>
                                        <h5 className="text-dark fw-bold">No Bookings Found</h5>
                                        <p className="text-muted small">Try adjusting your filters or search term.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} style={{ transition: 'all 0.2s' }}>
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`rounded-3 p-2 d-flex flex-column align-items-center justify-content-center ${booking.isMultiDay ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'}`} style={{ width: 50, height: 50 }}>
                                                    <span className="fw-bold" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{new Date(booking.date).getDate()}</span>
                                                    <span className="small fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>{new Date(booking.date).toLocaleString('default', { month: 'short' })}</span>
                                                </div>
                                                <div>
                                                    {formatDateRange(booking)}
                                                    {booking.isMultiDay && <span className="badge bg-primary rounded-pill mt-1" style={{ fontSize: '0.55rem' }}>MULTI-DAY</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark">{booking.customerName}</span>
                                                <span className="text-muted small d-flex align-items-center gap-1">
                                                    <FaPhone size={10} /> {booking.customerPhone}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark small">{booking.mahalName}</span>
                                                <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                                    <FaClock size={10} className="text-primary" />
                                                    {booking.isMultiDay ? `${booking.shift} to ${booking.endShift || 'Full'}` : booking.shift}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-danger">₹{Number(booking.totalAmount || booking.price || 0).toLocaleString('en-IN')}</span>
                                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>{booking.paymentStatus === 'Paid' ? 'Paid via ' : 'Pending via '}{booking.paymentMode}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {getStatusBadge(booking.bookingStatus)}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setTempStatus({
                                                            bookingStatus: booking.bookingStatus,
                                                            paymentStatus: booking.paymentStatus,
                                                            balancePaid: booking.balancePaid || 0
                                                        });
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="btn btn-sm rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
                                                    title="View Details"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBooking(booking._id)}
                                                    className="btn btn-sm rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                                                    title="Delete Booking"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && bookings.length > 0 && (
                    <div className="px-4 py-3 bg-light d-flex justify-content-between align-items-center border-top">
                        <span className="text-muted small">
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            <span className="ms-2">(Total {totalBookings} results)</span>
                        </span>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-white btn-sm border shadow-sm bg-white" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            <button 
                                className="btn btn-white btn-sm border shadow-sm bg-white" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Details Modal - Custom Full Screen Overlay */}
            {showDetailsModal && selectedBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: '#fff', width: '100%', maxWidth: '950px', maxHeight: '90vh',
                        borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
                        animation: 'modalSlideUp 0.3s ease-out'
                    }}>
                        {/* Header */}
                        <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-danger rounded-circle p-3 d-flex align-items-center justify-content-center text-white shadow-lg" style={{ width: 56, height: 56 }}>
                                    <FaCalendarAlt size={24} />
                                </div>
                                <div>
                                    <h5 className="fw-bold text-dark mb-0">{selectedBooking.customerName}</h5>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span className="text-muted small fw-bold">#{selectedBooking._id.slice(-6).toUpperCase()}</span>
                                        <span className="text-muted small px-2 border-start border-end">Booking Details</span>
                                        {getStatusBadge(selectedBooking.bookingStatus)}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    onClick={() => handleDownloadReceipt(selectedBooking)}
                                    disabled={isGeneratingPDF}
                                    className="btn d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-pill shadow-sm"
                                    style={{
                                        background: isGeneratingPDF
                                            ? 'linear-gradient(135deg, #475569, #334155)'
                                            : 'linear-gradient(135deg, #1e293b, #0f172a)',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.3px',
                                        opacity: isGeneratingPDF ? 0.85 : 1,
                                        minWidth: '155px',
                                        justifyContent: 'center'
                                    }}
                                    title="Download PDF Receipt"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload size={12} />
                                            Download Receipt
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border"
                                    style={{ width: 40, height: 40, background: '#f1f5f9' }}
                                >
                                    <FaTimes className="text-secondary" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 custom-scrollbar" style={{ overflowY: 'auto', background: '#f8fafc', flex: 1 }}>
                            <div className="row g-4">
                                {/* Left Column: Customer & Event Info */}
                                <div className="col-lg-7">
                                    {/* Customer Card */}
                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                        <h6 className="fw-bold mb-3 text-muted x-small text-uppercase d-flex align-items-center gap-2">
                                            <FaUser className="text-danger" /> Primary Contact
                                        </h6>
                                        <div className="d-flex align-items-center gap-4">
                                            <div>
                                                <div className="small text-muted">Phone Number</div>
                                                <div className="fw-bold text-dark">{selectedBooking.customerPhone}</div>
                                            </div>
                                            <div className="ms-auto">
                                                <a href={`tel:${selectedBooking.customerPhone}`} className="btn btn-danger-soft rounded-pill px-3 py-2 fw-bold small">
                                                    <FaPhone className="me-2" size={10} /> Call Now
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Venue & Timing Card */}
                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                        <h6 className="fw-bold mb-3 text-muted x-small text-uppercase d-flex align-items-center gap-2">
                                            <FaBuilding className="text-danger" /> Venue & Duration
                                        </h6>
                                        <div className="mb-3">
                                            <div className="small text-muted">Selected Venue</div>
                                            <div className="fw-bold text-dark">{selectedBooking.mahalName}</div>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="small text-muted">Start Date</div>
                                                <div className="fw-bold text-dark">{new Date(selectedBooking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                            {selectedBooking.isMultiDay && (
                                                <div className="col-6">
                                                    <div className="small text-muted">End Date</div>
                                                    <div className="fw-bold text-dark">{new Date(selectedBooking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                </div>
                                            )}
                                            <div className="col-6">
                                                <div className="small text-muted">Guest Count</div>
                                                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                                    <FaUsers className="text-muted" size={12} /> {selectedBooking.guests || 'Not specified'}
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="small text-muted">Booking Type</div>
                                                <span className={`badge rounded-pill ${selectedBooking.bookingType === 'Online' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.6rem' }}>
                                                    {selectedBooking.bookingType || 'Offline'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Event Shift Schedule */}
                                        <div className="mt-4 pt-3 border-top">
                                            <div className="small text-muted mb-2 fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>Event Shift Schedule</div>
                                            <div className="row g-2">
                                                {!selectedBooking.isMultiDay ? (
                                                    <div className="col-6">
                                                        <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center border">
                                                            <div className="x-small fw-bold text-dark">{new Date(selectedBooking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                            <span className={`x-small fw-bold px-2 py-1 rounded ${selectedBooking.shift === 'Morning' ? 'bg-warning-subtle text-warning' : selectedBooking.shift === 'Evening' ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'}`}>
                                                                {selectedBooking.shift || 'Full Day'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    selectedBooking.dayShifts && Object.entries(selectedBooking.dayShifts).sort().map(([date, shift]) => (
                                                        <div key={date} className="col-6">
                                                            <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center border">
                                                                <div className="x-small fw-bold text-dark">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                                <span className={`x-small fw-bold px-2 py-1 rounded ${shift === 'Morning' ? 'bg-warning-subtle text-warning' : shift === 'Evening' ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'}`}>
                                                                    {shift}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facilities Card - Moved to Left Side */}
                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                        <h6 className="fw-bold mb-3 text-muted x-small text-uppercase d-flex align-items-center gap-2">
                                            <FaBolt className="text-danger" /> Facilities Included
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedBooking.extraFacilities ? (
                                                Object.entries(selectedBooking.extraFacilities)
                                                    .filter(([_, f]) => f.selected)
                                                    .map(([key, _]) => (
                                                        <span key={key} className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-normal" style={{ fontSize: '0.65rem' }}>
                                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-muted small italic">No extra facilities selected</span>
                                            )}
                                            {(!selectedBooking.extraFacilities || Object.values(selectedBooking.extraFacilities).every(f => !f.selected)) && (
                                                <span className="text-muted small italic">Standard amenities only</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Financials & Facilities */}
                                <div className="col-lg-5">
                                    {/* Payment Card */}
                                    <div className="bg-dark text-white p-4 rounded-4 shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                                        <h6 className="fw-bold mb-4 text-white-50 x-small text-uppercase d-flex align-items-center gap-2">
                                            <FaRupeeSign className="text-danger" /> Financial Overview
                                        </h6>
                                        <div className="space-y-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="text-white-50 small">Venue Price</span>
                                                <span className="fw-bold">₹{Number(selectedBooking.price || 0).toLocaleString()}</span>
                                            </div>

                                            {/* Itemized Facilities */}
                                            {selectedBooking.extraFacilities && Object.entries(selectedBooking.extraFacilities).map(([key, f]) => f.selected && (
                                                <div key={key} className="d-flex justify-content-between align-items-center mb-1 animate-fade-in" style={{ opacity: 0.9 }}>
                                                    <span className="text-white-50" style={{ fontSize: '0.7rem' }}>+ {key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                                    <span className="text-white-50 small">₹{Number(f.price || 0).toLocaleString()}</span>
                                                </div>
                                            ))}

                                            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-white-10 mt-2">
                                                <div className="d-flex flex-column">
                                                    <span className="text-white-50 small">Advance Paid</span>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="text-success fw-bold">₹{Number(selectedBooking.advancePaid || 0).toLocaleString()}</span>
                                                        {selectedBooking.isVerified ? (
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: '0.55rem' }}>
                                                                <FaCheckCircle className="me-1" size={8} /> VERIFIED
                                                            </span>
                                                        ) : (
                                                            selectedBooking.transactionId && (
                                                                <button
                                                                    onClick={() => {
                                                                        setVerifyAmount('');
                                                                        setIsFullAdvance(false);
                                                                        setShowVerifyModal(true);
                                                                    }}
                                                                    className="btn btn-warning btn-sm py-0 px-2 fw-bold text-dark rounded-pill"
                                                                    style={{ fontSize: '0.55rem' }}
                                                                >
                                                                    VERIFY
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0)) > 0 && (
                                                <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-white-10 mt-2">
                                                    <div className="d-flex flex-column">
                                                        <span className="text-white-50 small">Balance Paid</span>
                                                        <span className="text-success fw-bold">₹{Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0)).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between align-items-end pt-2 pb-3 border-bottom border-white-10">
                                                <div>
                                                    <div className="text-white-50 fw-bold text-uppercase" style={{ fontSize: '0.55rem' }}>Pending Balance</div>
                                                    <div className="h5 fw-bold text-warning mb-0">₹{Math.max(0, Number(selectedBooking.totalAmount || 0) - Number(selectedBooking.advancePaid || 0) - Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0))).toLocaleString()}</div>
                                                </div>
                                                <div className="text-end">
                                                    {Math.max(0, Number(selectedBooking.totalAmount || 0) - Number(selectedBooking.advancePaid || 0) - Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0))) > 0 && (
                                                        <button 
                                                            className="btn btn-sm btn-outline-light rounded-pill px-3"
                                                            style={{ fontSize: '0.65rem', fontWeight: 600 }}
                                                            onClick={() => {
                                                                setCollectBalanceAmount('');
                                                                setShowCollectBalanceModal(true);
                                                            }}
                                                        >
                                                            Collect Balance
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-end pt-2">
                                                <div>
                                                    <div className="text-white-50 fw-bold text-uppercase" style={{ fontSize: '0.55rem' }}>Total Amount</div>
                                                    <div className="h4 fw-bold text-danger mb-0">₹{Number(selectedBooking.totalAmount || 0).toLocaleString()}</div>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge rounded-pill ${tempStatus.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} px-3`} style={{ fontSize: '0.65rem' }}>
                                                        {tempStatus.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Transaction ID Card */}
                                {selectedBooking.transactionId && (
                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 border-primary-subtle">
                                        <h6 className="fw-bold mb-2 text-muted x-small text-uppercase d-flex align-items-center gap-2">
                                            <FaInfoCircle className="text-primary" /> Payment Reference
                                        </h6>
                                        <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>UPI Transaction ID</div>
                                        <div className="p-2 bg-light rounded text-center fw-bold border text-primary" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>
                                            {selectedBooking.transactionId}
                                        </div>
                                    </div>
                                )}

                                {/* Status Manager */}
                                <div className="bg-white p-4 rounded-4 shadow-sm border border-danger-subtle">
                                    <h6 className="fw-bold mb-3 text-muted x-small text-uppercase d-flex align-items-center gap-2">
                                        <FaCheckCircle className="text-danger" /> Management Actions
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted text-uppercase mb-1">Booking Status</label>
                                            <select
                                                className="form-select border-light bg-light fw-bold"
                                                style={{ fontSize: '0.85rem' }}
                                                value={tempStatus.bookingStatus}
                                                onChange={(e) => setTempStatus(prev => ({ ...prev, bookingStatus: e.target.value }))}
                                                disabled={isUpdating}
                                            >
                                                <option value="Pending">Pending Approval</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted text-uppercase mb-1">Payment Status</label>
                                            <select
                                                className="form-select border-light bg-light fw-bold"
                                                style={{ fontSize: '0.85rem' }}
                                                value={tempStatus.paymentStatus}
                                                onChange={(e) => setTempStatus(prev => ({ ...prev, paymentStatus: e.target.value }))}
                                                disabled={isUpdating}
                                            >
                                                <option value="Pending">Payment Pending</option>
                                                <option value="Partial">Partial Payment</option>
                                                <option value="Paid">Payment Received</option>
                                            </select>
                                        </div>
                                        <div className="col-12 pt-2">
                                            <button
                                                onClick={handleSaveManagementChanges}
                                                disabled={isUpdating || (tempStatus.bookingStatus === selectedBooking.bookingStatus && tempStatus.paymentStatus === selectedBooking.paymentStatus && tempStatus.balancePaid === (selectedBooking.balancePaid || 0))}
                                                className="btn btn-danger w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                            >
                                                <FaCheckCircle size={14} /> {isUpdating ? 'Saving...' : 'Save Management Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Verification Modal */}
            {showVerifyModal && selectedBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div className="bg-white rounded-5 shadow-2xl p-4 p-md-5" style={{ width: '100%', maxWidth: '450px', animation: 'modalSlideUp 0.3s ease-out' }}>
                        <div className="text-center mb-4">
                            <div className="bg-warning-subtle text-warning rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm">
                                <FaRupeeSign size={24} />
                            </div>
                            <h5 className="fw-bold text-dark">Confirm Payment</h5>
                            <p className="text-muted small">Please verify the payment received in your account related to this booking.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="form-label x-small fw-bold text-muted text-uppercase">Amount Received (INR)</label>
                                <div className="input-group shadow-sm rounded-4 overflow-hidden border">
                                    <span className="input-group-text bg-light border-0 fw-bold">₹</span>
                                    <input
                                        type="number"
                                        className="form-control border-0 p-3 fw-bold"
                                        placeholder="0.00"
                                        value={verifyAmount}
                                        onChange={(e) => {
                                            setVerifyAmount(e.target.value);
                                            setIsFullAdvance(false);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-bold small text-dark">Full Advance Paid</div>
                                    <div className="x-small text-muted">Expected: ₹{Number(selectedBooking.advancePaid || 1000).toLocaleString()}</div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input custom-switch"
                                        type="checkbox"
                                        checked={isFullAdvance}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIsFullAdvance(checked);
                                            if (checked) {
                                                // Default to a sensible advance amount if not specified
                                                setVerifyAmount(selectedBooking.advancePaid || 1000);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 pt-3">
                                <button
                                    onClick={() => setShowVerifyModal(false)}
                                    className="btn btn-light flex-fill rounded-pill py-3 fw-bold border"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!verifyAmount || isUpdating}
                                    onClick={async () => {
                                        await handleUpdateStatus(selectedBooking._id, 'advancePaid', Number(verifyAmount));
                                        await handleUpdateStatus(selectedBooking._id, 'isVerified', true);
                                        setShowVerifyModal(false);
                                    }}
                                    className="btn btn-danger flex-fill rounded-pill py-3 fw-bold shadow-lg"
                                >
                                    {isUpdating ? 'Verifying...' : 'Verify & Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collect Balance Modal */}
            {showCollectBalanceModal && selectedBooking && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-3 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 10001 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
                        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark">Collect Balance</h5>
                            <button onClick={() => setShowCollectBalanceModal(false)} className="btn btn-link text-muted p-0 text-decoration-none h4 mb-0">&times;</button>
                        </div>
                        <div className="p-4">
                            <p className="small text-muted mb-4">
                                Enter the balance amount collected from the customer. This will update the booking's financial records and notify the customer.
                            </p>
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted text-uppercase">Pending Balance</label>
                                <div className="h4 text-warning fw-bold">₹{Math.max(0, Number(selectedBooking.totalAmount || 0) - Number(selectedBooking.advancePaid || 0) - Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0))).toLocaleString()}</div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted text-uppercase">Amount Collected</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">₹</span>
                                    <input 
                                        type="number" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Enter amount"
                                        value={collectBalanceAmount}
                                        onChange={(e) => setCollectBalanceAmount(e.target.value)}
                                        autoFocus
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={() => setCollectBalanceAmount(Math.max(0, Number(selectedBooking.totalAmount || 0) - Number(selectedBooking.advancePaid || 0) - Number(tempStatus.balancePaid !== undefined ? tempStatus.balancePaid : (selectedBooking.balancePaid || 0))).toString())}
                                    >
                                        Full
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                className="btn btn-dark w-100 py-3 fw-bold rounded-3"
                                onClick={handleCollectBalance}
                                disabled={isUpdating || !collectBalanceAmount}
                            >
                                {isUpdating ? 'Updating...' : 'Confirm Collection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .shadow-2xl { boxShadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .bg-danger-soft { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
                .btn-danger-soft:hover { background: #dc3545; color: #fff; }
                .white-10 { border-color: rgba(255, 255, 255, 0.1); }
                .x-small { font-size: 0.65rem; }
                .space-y-3 > * + * { margin-top: 1rem; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default BookingList;
