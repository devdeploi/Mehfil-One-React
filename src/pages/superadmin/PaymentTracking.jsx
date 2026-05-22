import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { 
    FaEye, 
    FaCheckCircle, 
    FaClock, 
    FaTimesCircle, 
    FaSearch, 
    FaSync, 
    FaWallet, 
    FaHandHoldingUsd, 
    FaCalendarCheck, 
    FaTimes,
    FaRegCreditCard,
    FaInfoCircle,
    FaArrowDown
} from 'react-icons/fa';
import '../../styles/superadmin/PaymentTracking.css';

const PaymentTracking = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    
    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    
    // Modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchPayments = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/superadmin/payments`);
            setSubscriptions(res.data.subscriptions || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Format utility functions
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return 'sa-status-badge status-completed';
            case 'Pending':
            case 'Partial':
                return 'sa-status-badge status-pending';
            case 'Failed':
            case 'Cancelled':
                return 'sa-status-badge status-failed';
            default:
                return 'sa-status-badge';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return <FaCheckCircle className="me-1" />;
            case 'Pending':
            case 'Partial':
                return <FaClock className="me-1" />;
            case 'Failed':
            case 'Cancelled':
                return <FaTimesCircle className="me-1" />;
            default:
                return null;
        }
    };

    // Calculate metrics
    const totalPlatformRevenue = subscriptions
        .filter(s => s.status === 'Completed')
        .reduce((sum, s) => sum + s.amount, 0);

    const premiumSubscriptionsCount = subscriptions
        .filter(s => s.status === 'Completed' && s.plan === 'Premium')
        .length;

    const standardSubscriptionsCount = subscriptions
        .filter(s => s.status === 'Completed' && s.plan === 'Standard')
        .length;

    // Filter Subscription Transactions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const vendorName = sub.vendorId?.fullName || '';
        const businessName = sub.vendorId?.businessName || '';
        const email = sub.vendorId?.email || '';
        const paymentId = sub.paymentId || '';
        const orderId = sub.orderId || '';
        
        const matchesSearch = 
            vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderId.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
        
        return matchesSearch && matchesStatus && matchesPlan;
    });

    const openDetailsModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeDetailsModal = () => {
        setSelectedItem(null);
        setShowModal(false);
    };

    return (
        <div className="container-fluid py-4 px-md-4 sa-payment-wrapper">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="sa-page-title m-0">Live Vendor Payments &amp; Transactions</h1>
                    <p className="text-muted mb-0 mt-1">Monitor all platform subscription plans in real-time.</p>
                </div>
                <button 
                    className={`btn btn-outline-dark d-flex align-items-center gap-2 px-3 py-2 rounded-3 sa-refresh-btn ${refreshing ? 'spinning' : ''}`}
                    onClick={() => fetchPayments(true)}
                    disabled={loading || refreshing}
                >
                    <FaSync /> {refreshing ? 'Refreshing...' : 'Refresh Live Feed'}
                </button>
            </div>

            {/* Statistical Cards Grid */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-md-4">
                    <div className="sa-metric-card shadow-sm platform-rev border-0">
                        <div className="card-body p-4 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fw-semibold text-uppercase tracking-wider">Platform Revenue</span>
                                <h3 className="fs-2 fw-extrabold mt-1 mb-0">{formatCurrency(totalPlatformRevenue)}</h3>
                                <small className="text-success fw-bold d-block mt-2">Paid Subscriptions</small>
                            </div>
                            <div className="metric-icon-box bg-gold-soft text-gold">
                                <FaWallet size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="sa-metric-card shadow-sm bookings-vol border-0">
                        <div className="card-body p-4 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fw-semibold text-uppercase tracking-wider">Premium Subscriptions</span>
                                <h3 className="fs-2 fw-extrabold mt-1 mb-0">{premiumSubscriptionsCount}</h3>
                                <small className="text-primary fw-bold d-block mt-2">Active Premium Plans</small>
                            </div>
                            <div className="metric-icon-box bg-blue-soft text-blue">
                                <FaCalendarCheck size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="sa-metric-card shadow-sm cash-collected border-0">
                        <div className="card-body p-4 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fw-semibold text-uppercase tracking-wider">Standard Subscriptions</span>
                                <h3 className="fs-2 fw-extrabold mt-1 mb-0 text-emerald">{standardSubscriptionsCount}</h3>
                                <small className="text-emerald fw-bold d-block mt-2">Active Standard Plans</small>
                            </div>
                            <div className="metric-icon-box bg-green-soft text-green">
                                <FaHandHoldingUsd size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="sa-filter-controls p-4 mb-4 rounded-4 shadow-sm bg-white">
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-5">
                        <div className="input-group sa-input-group border rounded-3 overflow-hidden">
                            <span className="input-group-text bg-white border-0 text-muted ps-3">
                                <FaSearch />
                            </span>
                            <input 
                                type="text"
                                className="form-control border-0 py-2"
                                placeholder="Search by vendor name, business, email, transaction..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <select 
                            className="form-select sa-select py-2 rounded-3 border"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Payment Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <select 
                            className="form-select sa-select py-2 rounded-3 border"
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                        >
                            <option value="all">All Subscription Plans</option>
                            <option value="Standard">Standard (₹9,999/yr)</option>
                            <option value="Premium">Premium (₹24,999/yr)</option>
                        </select>
                    </div>

                    <div className="col-12 col-md d-flex justify-content-md-end justify-content-start mt-md-0 mt-3">
                        <span className="text-muted small fw-bold">
                            Showing {filteredSubscriptions.length} records
                        </span>
                    </div>
                </div>
            </div>

            {/* Live Data Tables Container */}
            <div className="sa-payment-container p-0 border rounded-4 shadow-sm overflow-hidden bg-white mb-5">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-gold mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 className="text-muted fw-bold">Streaming Live Transactions...</h5>
                    </div>
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-5">
                        <FaInfoCircle size={40} className="text-muted mb-3" />
                        <h5 className="text-dark fw-bold mb-1">No Subscription Transactions Found</h5>
                        <p className="text-muted">There are no records matching your active filters or search terms.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table sa-table align-middle text-nowrap mb-0">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Business Name</th>
                                    <th>Vendor Details</th>
                                    <th>Subscription Plan</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th className="text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscriptions.map(sub => (
                                    <tr key={sub._id}>
                                        <td className="text-muted small">{formatDate(sub.createdAt)}</td>
                                        <td className="fw-mono small text-muted font-monospace">{sub.paymentId}</td>
                                        <td className="fw-bold text-dark">{sub.vendorId?.businessName || 'N/A'}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold">{sub.vendorId?.fullName || 'N/A'}</span>
                                                <span className="text-muted small font-monospace" style={{ fontSize: '0.8rem' }}>{sub.vendorId?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${sub.plan === 'Premium' ? 'bg-premium-pill' : 'bg-standard-pill'} px-3 py-2 fw-extrabold`}>
                                                {sub.plan}
                                            </span>
                                        </td>
                                        <td className="fw-black text-dark fs-6">{formatCurrency(sub.amount)}</td>
                                        <td>
                                            <span className={getStatusBadge(sub.status)}>
                                                {getStatusIcon(sub.status)}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="sa-action-btn" 
                                                title="View Details"
                                                onClick={() => openDetailsModal(sub)}
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showModal && selectedItem && (
                <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" onClick={closeDetailsModal}>
                    <div className="modal-content-custom bg-white p-4 rounded-4 shadow-lg border animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                            <h4 className="fw-extrabold m-0 text-dark">
                                Subscription Payment Details
                            </h4>
                            <button className="btn btn-close-custom p-2 rounded-circle" onClick={closeDetailsModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body-custom">
                            <div className="text-center mb-4 bg-light py-4 rounded-4 border-dashed">
                                <span className="text-muted text-uppercase fw-semibold tracking-wider font-monospace d-block mb-1">Total Fee Paid</span>
                                <h2 className="fs-1 fw-black text-dark m-0">{formatCurrency(selectedItem.amount)}</h2>
                                <span className={`badge ${selectedItem.plan === 'Premium' ? 'bg-premium-pill' : 'bg-standard-pill'} px-3 py-2 mt-2 fw-extrabold`}>
                                    {selectedItem.plan} Plan Subscription
                                </span>
                            </div>

                            <h6 className="fw-bold border-bottom pb-2 mb-3 text-gold">Vendor Business Profile</h6>
                            <div className="row g-3 mb-4 text-start">
                                <div className="col-6">
                                    <label className="text-muted small d-block">Business Name</label>
                                    <span className="fw-bold text-dark">{selectedItem.vendorId?.businessName || 'N/A'}</span>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small d-block">Vendor Full Name</label>
                                    <span className="fw-bold text-dark">{selectedItem.vendorId?.fullName || 'N/A'}</span>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small d-block">Email Address</label>
                                    <span className="fw-bold text-dark font-monospace" style={{ fontSize: '0.9rem' }}>{selectedItem.vendorId?.email || 'N/A'}</span>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small d-block">Phone Number</label>
                                    <span className="fw-bold text-dark">{selectedItem.vendorId?.phone || 'N/A'}</span>
                                </div>
                            </div>

                            <h6 className="fw-bold border-bottom pb-2 mb-3 text-gold">Gateway Razorpay Details</h6>
                            <div className="row g-3 text-start">
                                <div className="col-12">
                                    <label className="text-muted small d-block">Razorpay Payment ID</label>
                                    <span className="fw-bold text-dark font-monospace" style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>{selectedItem.paymentId}</span>
                                </div>
                                <div className="col-12">
                                    <label className="text-muted small d-block">Razorpay Order ID</label>
                                    <span className="fw-bold text-dark font-monospace" style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>{selectedItem.orderId}</span>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small d-block">Transaction Method</label>
                                    <span className="fw-bold text-dark">{selectedItem.method}</span>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small d-block">Payment Date</label>
                                    <span className="fw-bold text-dark">{formatDate(selectedItem.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-top pt-3 mt-4 text-end">
                            <button className="btn btn-dark px-4 py-2 rounded-3" onClick={closeDetailsModal}>
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentTracking;
