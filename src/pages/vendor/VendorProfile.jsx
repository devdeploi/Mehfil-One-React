import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { FaUser, FaPhone, FaEnvelope, FaSave, FaCamera, FaBuilding, FaIdCard, FaMapMarkerAlt, FaFileContract, FaFilePdf, FaFileDownload, FaExternalLinkAlt, FaCrown, FaStar, FaCheckCircle, FaExclamationTriangle, FaBan, FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaClock, FaRedo, FaArrowUp, FaArrowDown, FaShieldAlt, FaInfinity } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const VendorProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profile, setProfile] = useState({
        fullName: '',
        phone: '',
        email: '',
        profileImage: null,
        businessName: '',
        gstNumber: '',
        businessAddress: '',
        upiId: '',
        proofDocument: null,
        plan: 'Standard',
        planStartDate: null,
        planExpiryDate: null,
        createdAt: null
    });
    const [originalProfile, setOriginalProfile] = useState(null);
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [isYearlyBilling, setIsYearlyBilling] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const premiumPlanDetails = SUBSCRIPTION_PLANS.find(p => p.name === 'Premium');

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('vendor_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const userId = user.id || user._id;

                if (userId) {
                    try {
                        const response = await axios.get(`${API_URL}/vendors/${userId}`);
                        const vendorData = response.data;
                        const BASE_URL = API_URL.replace('/api', '');
                        const imageUrl = vendorData.profileImage ? `${BASE_URL}/${vendorData.profileImage}` : null;

                        const fetchedProfile = {
                            fullName: vendorData.fullName || '',
                            phone: vendorData.phone || '',
                            email: vendorData.email || '',
                            profileImage: imageUrl,
                            businessName: vendorData.businessName || '',
                            gstNumber: vendorData.gstNumber || '',
                            businessAddress: vendorData.businessAddress || '',
                            upiId: vendorData.upiId || '',
                            proofDocument: vendorData.proofDocument ? `${BASE_URL}/${vendorData.proofDocument}` : null,
                            plan: vendorData.plan || 'Standard',
                            createdAt: vendorData.createdAt || (vendorData._id ? new Date(parseInt(vendorData._id.substring(0, 8), 16) * 1000).toISOString() : null) || null,
                            planStartDate: vendorData.planStartDate || vendorData.createdAt || (vendorData._id ? new Date(parseInt(vendorData._id.substring(0, 8), 16) * 1000).toISOString() : null) || null,
                            planExpiryDate: vendorData.planExpiryDate || null
                        };
                        setProfile(fetchedProfile);
                        setOriginalProfile(fetchedProfile); // Store original profile for cancellation
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    }
                }
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'fullName') {
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setProfile(prev => ({ ...prev, [name]: alphabetsOnly }));
        } else if (name === 'phone') {
            const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
            setProfile(prev => ({ ...prev, [name]: numbersOnly }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Store the file itself for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profileImage: reader.result })); // For immediate preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        if (originalProfile) {
            setProfile(originalProfile);
        }
        setSelectedFile(null);
        setIsEditing(false);
    };

    const handleDowngrade = () => {
        setShowDowngradeModal(true);
    };

    const handleUpgrade = async () => {
        setShowUpgradeModal(false);
        setIsProcessingPayment(true);
        try {
            const storedUser = localStorage.getItem('vendor_user');
            if (!storedUser) {
                showToast('Please login first', 'error');
                setIsProcessingPayment(false);
                return;
            }
            const user = JSON.parse(storedUser);
            const userId = user.id || user._id;

            const premiumPlan = SUBSCRIPTION_PLANS.find(p => p.name === 'Premium');
            const premiumPrice = premiumPlan ? (isYearlyBilling ? premiumPlan.yearlyPrice : premiumPlan.monthlyPrice) : 24999;

            // 1. Fetch Razorpay Key
            const keyRes = await axios.get(`${API_URL}/payment/key`);
            const razorpayKey = keyRes.data.key;

            // 2. Create Order from backend
            const orderRes = await axios.post(`${API_URL}/payment/create-order`, {
                amount: premiumPrice, // Amount in INR
                currency: 'INR',
                receipt: `premium_upgrade_${userId}`
            });

            const order = orderRes.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: razorpayKey, 
                amount: order.amount,
                currency: order.currency,
                name: "Mehfil One",
                description: "Premium Plan Upgrade",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await axios.post(`${API_URL}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 4. Upgrade Vendor Plan and Save Payment Record
                        const upgradeRes = await axios.put(`${API_URL}/vendors/${userId}/upgrade`, {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            amount: premiumPrice,
                            billingCycle: isYearlyBilling ? 'yearly' : 'monthly'
                        });
                        showToast('Successfully upgraded to Premium Plan!', 'success');
                        
                        // Update UI state immediately with new dates from backend
                        const updatedVendor = upgradeRes.data.vendor;
                        setProfile(prev => ({
                            ...prev, 
                            plan: 'Premium',
                            planStartDate: updatedVendor.planStartDate,
                            planExpiryDate: updatedVendor.planExpiryDate
                        }));
                        setOriginalProfile(prev => ({
                            ...prev, 
                            plan: 'Premium',
                            planStartDate: updatedVendor.planStartDate,
                            planExpiryDate: updatedVendor.planExpiryDate
                        }));
                    } catch (err) {
                        console.error('Verification Error', err);
                        showToast('Payment verification failed. If money was deducted, contact support.', 'error');
                    }
                },
                prefill: {
                    name: user.fullName || 'Vendor',
                    email: user.email || '',
                    contact: user.phone || ''
                },
                theme: {
                    color: "#C8102E" // Application Primary Red Theme
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                showToast('Payment failed: ' + response.error.description, 'error');
            });
            rzp.open();
            
        } catch (error) {
            console.error("Upgrade Error", error);
            showToast('Failed to initiate payment', 'error');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleRenew = async () => {
        setShowRenewModal(false);
        setIsProcessingPayment(true);
        try {
            const storedUser = localStorage.getItem('vendor_user');
            if (!storedUser) {
                showToast('Please login first', 'error');
                setIsProcessingPayment(false);
                return;
            }
            const user = JSON.parse(storedUser);
            const userId = user.id || user._id;

            const planDetails = SUBSCRIPTION_PLANS.find(p => p.name === profile.plan) || SUBSCRIPTION_PLANS[0];
            const planPrice = isYearlyBilling ? planDetails.yearlyPrice : planDetails.monthlyPrice;

            // 1. Fetch Razorpay Key
            const keyRes = await axios.get(`${API_URL}/payment/key`);
            const razorpayKey = keyRes.data.key;

            // 2. Create Order from backend
            const orderRes = await axios.post(`${API_URL}/payment/create-order`, {
                amount: planPrice, // Amount in INR
                currency: 'INR',
                receipt: `plan_renew_${userId}`
            });

            const order = orderRes.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: razorpayKey, 
                amount: order.amount,
                currency: order.currency,
                name: "Mehfil One",
                description: `${profile.plan} Plan Renewal`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Verify Payment
                        await axios.post(`${API_URL}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // Renew Vendor Plan and Save Payment Record
                        const renewRes = await axios.put(`${API_URL}/vendors/${userId}/renew`, {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            amount: planPrice,
                            planName: profile.plan,
                            billingCycle: isYearlyBilling ? 'yearly' : 'monthly'
                        });
                        showToast(`Successfully renewed ${profile.plan} Plan!`, 'success');
                        
                        // Update UI state immediately with new dates
                        const updatedData = renewRes.data;
                        setProfile(prev => ({
                            ...prev, 
                            planStartDate: updatedData.planStartDate,
                            planExpiryDate: updatedData.planExpiryDate
                        }));
                        setOriginalProfile(prev => ({
                            ...prev, 
                            planStartDate: updatedData.planStartDate,
                            planExpiryDate: updatedData.planExpiryDate
                        }));
                    } catch (err) {
                        console.error('Verification Error', err);
                        showToast('Payment verification failed. If money was deducted, contact support.', 'error');
                    }
                },
                prefill: {
                    name: user.fullName || 'Vendor',
                    email: user.email || '',
                    contact: user.phone || ''
                },
                theme: {
                    color: "#C8102E" // Application Primary Red Theme
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                showToast('Payment failed: ' + response.error.description, 'error');
            });
            rzp.open();
            
        } catch (error) {
            console.error("Renew Error", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment';
            showToast(`Error: ${errorMsg}`, 'error');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const confirmDowngrade = async () => {
        const storedUser = localStorage.getItem('vendor_user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id;

        try {
            await axios.put(`${API_URL}/vendors/${userId}/downgrade`);
            showToast('Plan successfully downgraded to Standard.', 'success');
            setProfile(prev => ({...prev, plan: 'Standard'}));
            setOriginalProfile(prev => ({...prev, plan: 'Standard'}));
            setShowDowngradeModal(false);
        } catch (err) {
            console.error(err);
            showToast('Failed to downgrade plan.', 'error');
            setShowDowngradeModal(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (profile.phone && profile.phone.length !== 10) {
            showToast('Phone number must be exactly 10 digits.', 'error');
            return;
        }


        const storedUser = localStorage.getItem('vendor_user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id;

        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('phone', profile.phone);
        formData.append('businessName', profile.businessName);
        formData.append('gstNumber', profile.gstNumber);
        formData.append('businessAddress', profile.businessAddress);
        formData.append('upiId', profile.upiId);
        if (selectedFile) {
            formData.append('profileImage', selectedFile);
        }

        try {
            const response = await axios.put(`${API_URL}/vendors/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Updated Vendor Profile:", response.data);

            // Update original profile with new data
            const vendorData = response.data;
            const BASE_URL = API_URL.replace('/api', '');
            const newProfile = {
                fullName: vendorData.fullName,
                phone: vendorData.phone,
                email: vendorData.email,
                profileImage: vendorData.profileImage ? `${BASE_URL}/${vendorData.profileImage}` : null,
                businessName: vendorData.businessName,
                gstNumber: vendorData.gstNumber,
                businessAddress: vendorData.businessAddress,
                upiId: vendorData.upiId,
                proofDocument: vendorData.proofDocument ? `${BASE_URL}/${vendorData.proofDocument}` : null,
                plan: vendorData.plan || 'Standard',
                createdAt: profile.createdAt, // keep original createdAt
                planStartDate: vendorData.planStartDate || vendorData.createdAt || (vendorData._id ? new Date(parseInt(vendorData._id.substring(0, 8), 16) * 1000).toISOString() : null) || null,
                planExpiryDate: vendorData.planExpiryDate || null
            };

            setProfile(newProfile);
            setOriginalProfile(newProfile);
            setSelectedFile(null);
            setIsEditing(false);
            showToast('Profile Updated Successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile.', 'error');
        }
    };

    // Standard styling for inputs
    const inputStyle = {
        padding: '10px 15px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
    };

    // Toast Animation Styles
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
        <div className="container-fluid position-relative">
            <style>{toastStyles}</style>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`custom-toast position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 d-flex align-items-center gap-3 bg-white border-${toast.type === 'error' ? 'danger' : 'success'} border-start border-5`} style={{ minWidth: '300px' }}>
                    <div className={`text-${toast.type === 'error' ? 'danger' : 'success'}`}>
                        {toast.type === 'error' ? <i className="bi bi-x-circle-fill fs-5"></i> : <i className="bi bi-check-circle-fill fs-5"></i>}
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold">{toast.type === 'error' ? 'Error' : 'Success'}</h6>
                        <small className="text-secondary">{toast.message}</small>
                    </div>
                </div>
            )}

            {/* Downgrade Confirm Modal */}
            {showDowngradeModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white border-0">
                                <h5 className="modal-title fw-bold">Confirm Downgrade</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDowngradeModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <i className="bi bi-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5>Are you sure?</h5>
                                <p className="text-muted">You are about to downgrade to the Standard Plan. You will lose access to premium benefits and unlimited Mahal listings.</p>
                            </div>
                            <div className="modal-footer border-0 justify-content-center pb-4">
                                <button type="button" className="btn btn-light px-4 rounded-pill fw-bold" onClick={() => setShowDowngradeModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger px-4 rounded-pill fw-bold" onClick={confirmDowngrade}>Yes, Downgrade</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Confirm Modal */}
            {showUpgradeModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="modal-header text-white border-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <FaCrown /> Upgrade to Premium
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowUpgradeModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-start">
                                <h4 className="fw-bold text-dark mb-3 text-center">Unlock Premium Features</h4>
                                {premiumPlanDetails ? (
                                    <>
                                        <div className="d-flex justify-content-center mb-4">
                                            <div className="bg-light p-1 rounded-pill border" style={{ display: 'inline-flex' }}>
                                                <button
                                                    className={`btn rounded-pill px-4 py-2 ${!isYearlyBilling ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`}
                                                    onClick={() => setIsYearlyBilling(false)}
                                                    style={{ fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    className={`btn rounded-pill px-4 py-2 ${isYearlyBilling ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`}
                                                    onClick={() => setIsYearlyBilling(true)}
                                                    style={{ fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                                >
                                                    Yearly
                                                </button>
                                            </div>
                                        </div>
                                        <ul className="list-unstyled mb-4 mx-auto" style={{ maxWidth: '300px', lineHeight: '2' }}>
                                            {premiumPlanDetails.features.map((feature, idx) => (
                                                <li key={idx}><i className="bi bi-check-circle-fill text-success me-2"></i>{feature}</li>
                                            ))}
                                        </ul>
                                        <div className="p-3 bg-light rounded-3 text-center mb-2 mx-4 border">
                                            <span className="text-muted d-block mb-1 small text-uppercase fw-bold">Amount to pay</span>
                                            <h2 className="text-dark fw-bold mb-0">
                                                {premiumPlanDetails.currency}
                                                {isYearlyBilling ? premiumPlanDetails.yearlyPrice.toLocaleString('en-IN') : premiumPlanDetails.monthlyPrice.toLocaleString('en-IN')}
                                                <span className="fs-6 text-muted fw-normal">{isYearlyBilling ? '/yr' : '/mo'}</span>
                                            </h2>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-muted">Plan details not found.</p>
                                )}
                            </div>
                            <div className="modal-footer border-0 justify-content-center pb-4 pt-0 gap-3">
                                <button type="button" className="btn btn-light px-4 rounded-pill fw-bold text-muted border" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
                                <button type="button" className="btn px-4 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center gap-2" 
                                    onClick={handleUpgrade}
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                >
                                    <FaCrown /> Pay & Upgrade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Confirm Modal */}
            {showRenewModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="modal-header text-white border-0" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <FaCalendarCheck /> Renew {profile.plan} Plan
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRenewModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-start">
                                <h4 className="fw-bold text-dark mb-3 text-center">Select Billing Cycle</h4>
                                <div className="d-flex justify-content-center mb-4">
                                    <div className="bg-light p-1 rounded-pill border" style={{ display: 'inline-flex' }}>
                                        <button
                                            className={`btn rounded-pill px-4 py-2 ${!isYearlyBilling ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`}
                                            onClick={() => setIsYearlyBilling(false)}
                                            style={{ fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            className={`btn rounded-pill px-4 py-2 ${isYearlyBilling ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`}
                                            onClick={() => setIsYearlyBilling(true)}
                                            style={{ fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                        >
                                            Yearly
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 bg-light rounded-3 text-center mb-2 mx-4 border">
                                    <span className="text-muted d-block mb-1 small text-uppercase fw-bold">Amount to pay</span>
                                    <h2 className="text-dark fw-bold mb-0">
                                        {SUBSCRIPTION_PLANS[0].currency}
                                        {(() => {
                                            const planDetails = SUBSCRIPTION_PLANS.find(p => p.name === profile.plan) || SUBSCRIPTION_PLANS[0];
                                            return isYearlyBilling ? planDetails.yearlyPrice.toLocaleString('en-IN') : planDetails.monthlyPrice.toLocaleString('en-IN');
                                        })()}
                                        <span className="fs-6 text-muted fw-normal">{isYearlyBilling ? '/yr' : '/mo'}</span>
                                    </h2>
                                </div>
                            </div>
                            <div className="modal-footer border-0 justify-content-center pb-4 pt-0 gap-3">
                                <button type="button" className="btn btn-light px-4 rounded-pill fw-bold text-muted border" onClick={() => setShowRenewModal(false)}>Cancel</button>
                                <button type="button" className="btn px-4 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center gap-2" 
                                    onClick={handleRenew}
                                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                                >
                                    <FaCalendarCheck /> Pay & Renew
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="sa-dashboard-title mb-0">Vendor Profile</h1>
                {!isEditing && (
                    <button
                        className="btn text-white fw-bold shadow-sm"
                        onClick={() => setIsEditing(true)}
                        style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontSize: '0.85rem'
                        }}
                    >
                        <i className="bi bi-pencil me-2"></i> Edit Profile
                    </button>
                )}
            </div>

            <div className="row d-flex justify-content-center">
                <div className="col-lg-8">
                    <div className="sa-card-wrapper">
                        <form onSubmit={handleSave}>

                            {/* Profile Image Section */}
                            <div className="d-flex justify-content-center mb-4">
                                <div className="position-relative">
                                    <div
                                        className="rounded-circle overflow-hidden border border-3 border-light shadow-sm d-flex align-items-center justify-content-center bg-light"
                                        style={{ width: '120px', height: '120px' }}
                                    >
                                        {profile.profileImage ? (
                                            <img src={profile.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <FaUser size={50} className="text-secondary opacity-50" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <>
                                            <label
                                                htmlFor="profile-upload"
                                                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer hover-scale"
                                                style={{ cursor: 'pointer', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Upload Photo"
                                            >
                                                <FaCamera size={14} />
                                            </label>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={handleImageChange}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="row g-4">
                                {/* Subscription Plan Section */}
                                <div className="col-12">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Subscription Plan</h4>
                                </div>
                                <div className="col-12 mb-4">
                                    {(() => {
                                        // --- Date Calculations ---
                                        let expiryDateStr = profile.planExpiryDate;
                                        if (!expiryDateStr) {
                                            const startDate = profile.planStartDate ? new Date(profile.planStartDate) : new Date();
                                            const calculatedExpiry = new Date(startDate);
                                            calculatedExpiry.setFullYear(calculatedExpiry.getFullYear() + 1);
                                            expiryDateStr = calculatedExpiry;
                                        }
                                        const now = new Date();
                                        const expiry = new Date(expiryDateStr);
                                        const dueDate = new Date(expiry);
                                        dueDate.setDate(dueDate.getDate() + 7);
                                        const isExpired = now > expiry;
                                        const isSuspended = now > dueDate;
                                        const needsRenewal = isExpired || isSuspended;

                                        const daysLeft = isExpired ? 0 : Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                                        const dueDaysLeft = isSuspended ? 0 : Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                                        const createdTime = profile.createdAt ? new Date(profile.createdAt).getTime() : 0;
                                        const startTime = profile.planStartDate ? new Date(profile.planStartDate).getTime() : 0;
                                        
                                        // Determine if it's monthly/offer or yearly
                                        const isMonthly = (expiry.getTime() - startTime) < (1000 * 60 * 60 * 24 * 60);
                                        const planDurationLabel = isMonthly ? "(Launch Offer / Monthly)" : "(Yearly)";

                                        const isRenewed = (startTime - createdTime) > (1000 * 60 * 60 * 24);
                                        const startDateFormatted = profile.planStartDate
                                            ? new Date(profile.planStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : 'N/A';
                                        const expiryFormatted = expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

                                        const userPlan = SUBSCRIPTION_PLANS.find(p => p.name === profile.plan) || SUBSCRIPTION_PLANS[0];
                                        const isPremium = profile.plan === 'Premium';

                                        // --- Status Config ---
                                        let statusConfig;
                                        if (isSuspended) {
                                            statusConfig = { icon: <FaBan />, label: 'Suspended', bg: 'danger', text: 'white' };
                                        } else if (isExpired) {
                                            statusConfig = { icon: <FaCalendarTimes />, label: `Grace Period — ${dueDaysLeft} day${dueDaysLeft !== 1 ? 's' : ''} left`, bg: 'warning', text: 'dark' };
                                        } else {
                                            statusConfig = { icon: <FaCheckCircle />, label: `Active — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, bg: 'success', text: 'white' };
                                        }

                                        // --- Card gradient based on plan & status ---
                                        const cardStyle = isSuspended
                                            ? { background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)', border: '1.5px solid #f87171' }
                                            : isExpired
                                            ? { background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fcd34d' }
                                            : isPremium
                                            ? { background: 'linear-gradient(135deg, #fffdf0 0%, #fef9c3 100%)', border: '1.5px solid #f59e0b' }
                                            : { background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1.5px solid #7dd3fc' };

                                        return (
                                            <div className="rounded-4 p-4 shadow-sm" style={cardStyle}>
                                                {/* Top Row: Plan name + Status badge */}
                                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 48, height: 48,
                                                                background: isPremium ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            {isPremium
                                                                ? <FaCrown style={{ color: '#fff', fontSize: 22 }} />
                                                                : <FaShieldAlt style={{ color: '#fff', fontSize: 20 }} />
                                                            }
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                                                                {profile.plan} Plan <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{planDurationLabel}</span>
                                                            </h5>
                                                            <small className="text-secondary">
                                                                {userPlan.limits?.mahals === -1 
                                                                    ? 'Unlimited listings & premium benefits' 
                                                                    : `Up to ${userPlan.limits?.mahals || 2} Mahal listings`
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <span className={`badge bg-${statusConfig.bg} text-${statusConfig.text} d-flex align-items-center gap-1 px-3 py-2 rounded-pill`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                {/* Info Row: dates */}
                                                <div className="d-flex flex-wrap gap-3 mb-3">
                                                    <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.85rem' }}>
                                                        <FaCalendarAlt className="text-primary" />
                                                        <span>
                                                            <strong className="text-dark">{isRenewed ? (isPremium ? 'Upgraded/Renewed on' : 'Renewed on') : 'Joined on'}:</strong> {startDateFormatted}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.85rem' }}>
                                                        <FaCalendarCheck className={isSuspended ? 'text-danger' : isExpired ? 'text-warning' : 'text-success'} />
                                                        <span>
                                                            <strong className="text-dark">Expires on:</strong> {expiryFormatted}
                                                        </span>
                                                    </div>
                                                    {!isExpired && (
                                                        <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.85rem' }}>
                                                            <FaClock className="text-info" />
                                                            <span><strong className="text-dark">{daysLeft} days</strong> remaining</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Days left progress bar (only when active) */}
                                                {!isExpired && (() => {
                                                    const totalPlanDays = Math.max(1, Math.ceil((expiry.getTime() - startTime) / (1000 * 60 * 60 * 24)));
                                                    const usedDays = Math.max(0, totalPlanDays - Math.max(0, daysLeft));
                                                    const progressPercent = Math.max(0, Math.min((usedDays / totalPlanDays) * 100, 100));
                                                    const barColor = daysLeft > (totalPlanDays * 0.25) ? 'success' : daysLeft > (totalPlanDays * 0.1) ? 'warning' : 'danger';
                                                    return (
                                                        <div className="mb-3">
                                                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                                <span>Plan usage</span>
                                                                <span>{usedDays} / {totalPlanDays} days used</span>
                                                            </div>
                                                            <div className="progress rounded-pill" style={{ height: 8, background: '#e5e7eb' }}>
                                                                <div
                                                                    className={`progress-bar rounded-pill bg-${barColor}`}
                                                                    style={{ width: `${progressPercent}%`, transition: 'width 0.6s ease' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                    {userPlan.features.map((feature, idx) => (
                                                        <span key={idx} className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: isPremium ? '#fef3c7' : '#dbeafe', color: isPremium ? '#92400e' : '#1e40af', fontSize: '0.75rem' }}>
                                                            {isPremium && idx === 0 ? <FaInfinity /> : <FaCheckCircle />} {feature}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="d-flex flex-wrap gap-2">
                                                    {needsRenewal ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                                                                onClick={() => setShowRenewModal(true)}
                                                                disabled={isProcessingPayment}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                                                    color: '#fff',
                                                                    borderRadius: 10,
                                                                    padding: '8px 18px',
                                                                    border: 'none',
                                                                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                                                                }}
                                                            >
                                                                {isProcessingPayment
                                                                    ? <><FaClock className="me-1" /> Processing...</>
                                                                    : <><FaRedo /> Renew {profile.plan} Plan</>}
                                                            </button>
                                                            {isPremium && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                                                                    onClick={handleDowngrade}
                                                                    style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 10, padding: '8px 18px' }}
                                                                >
                                                                    <FaArrowDown /> Downgrade to Standard
                                                                </button>
                                                            )}
                                                            {!isPremium && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                                                                    onClick={() => setShowUpgradeModal(true)}
                                                                    disabled={isProcessingPayment}
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                        color: '#fff',
                                                                        border: 'none',
                                                                        borderRadius: 10,
                                                                        padding: '8px 18px',
                                                                        boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
                                                                    }}
                                                                >
                                                                    <FaCrown /> Upgrade to Premium
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : isPremium ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                                                            onClick={handleDowngrade}
                                                            style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 10, padding: '8px 18px' }}
                                                        >
                                                            <FaArrowDown /> Downgrade to Standard
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                                                            onClick={() => setShowUpgradeModal(true)}
                                                            disabled={isProcessingPayment}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 10,
                                                                padding: '8px 18px',
                                                                boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
                                                            }}
                                                        >
                                                            <FaCrown /> Upgrade to Premium
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Basic Info */}
                                <div className="col-12">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Personal Information</h4>
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Full Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaUser className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.fullName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Phone</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaPhone className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.phone}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaEnvelope className="text-secondary" /></span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control text-muted"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.email}
                                            readOnly={true}
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Business Info */}
                                <div className="col-12 mt-4">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Business Information</h4>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Business Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaBuilding className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="businessName"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.businessName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder={isEditing ? 'Enter Business Name' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">GST Number</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaIdCard className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.gstNumber}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder={isEditing ? 'Enter GST Number' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">UPI ID</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><i className="bi bi-wallet2 text-secondary"></i></span>
                                        <input
                                            type="text"
                                            name="upiId"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}
                                            value={profile.upiId}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder={isEditing ? 'user@bank' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Business Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0', borderBottomRightRadius: '0', border: '1px solid #e2e8f0' }}><FaMapMarkerAlt className="text-secondary" /></span>
                                        <textarea
                                            name="businessAddress"
                                            className="form-control"
                                            style={{ 
                                                ...inputStyle, 
                                                borderLeft: 'none', 
                                                borderTopLeftRadius: '0', 
                                                borderBottomLeftRadius: '0',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px',
                                                minHeight: '80px'
                                            }}
                                            value={profile.businessAddress}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder={isEditing ? 'Enter Business Address' : ''}
                                        />
                                    </div>
                                </div>

                                {/* Proof Document (Read-Only) */}
                                <div className="col-12 mt-4">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Proof Document</h4>
                                    <div className="card border-0 shadow-sm bg-light rounded-4 overflow-hidden">
                                        <div className="card-body p-4 text-center">
                                            {profile.proofDocument ? (
                                                (() => {
                                                    const extension = profile.proofDocument.split('.').pop().toLowerCase();
                                                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
                                                    const isPdf = extension === 'pdf';

                                                    if (isImage) {
                                                        return (
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="mb-3 rounded-3 overflow-hidden shadow-sm" style={{ maxWidth: '100%', border: '1px solid #e2e8f0' }}>
                                                                    <img
                                                                        src={profile.proofDocument}
                                                                        alt="Proof Document"
                                                                        className="img-fluid"
                                                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x300?text=Document+Not+Found'; }}
                                                                    />
                                                                </div>
                                                                <p className="text-muted small mb-0"><FaFileContract className="me-2" />This document is verified by Superadmin.</p>
                                                            </div>
                                                        );
                                                    } else if (isPdf) {
                                                        return (
                                                            <div className="d-flex flex-column align-items-center w-100">
                                                                <div className="rounded-3 overflow-hidden border bg-white mb-3 w-100" style={{ height: '450px' }}>
                                                                    <iframe
                                                                        src={profile.proofDocument}
                                                                        title="Proof Document PDF"
                                                                        width="100%"
                                                                        height="100%"
                                                                        style={{ border: 'none' }}
                                                                    >
                                                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                                                                            <FaFilePdf size={48} className="text-danger mb-3" />
                                                                            <p className="mb-3">This browser does not support PDFs. Please download the PDF to view it.</p>
                                                                            <a href={profile.proofDocument} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                                                <FaFileDownload className="me-2" /> Download PDF
                                                                            </a>
                                                                        </div>
                                                                    </iframe>
                                                                </div>
                                                                <p className="text-muted small mb-0"><FaFileContract className="me-2" />This document is verified by Superadmin.</p>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="rounded-3 border bg-white d-flex flex-column justify-content-center align-items-center p-5 text-center w-100" style={{ minHeight: '200px' }}>
                                                                <div className="mb-3 p-3 bg-light rounded-circle shadow-sm text-primary">
                                                                    <FaFileDownload size={32} />
                                                                </div>
                                                                <h6 className="mb-2 fw-bold text-dark">Document Available</h6>
                                                                <p className="text-muted small mb-4">This file type ({extension}) cannot be previewed directly.</p>
                                                                <a href={profile.proofDocument} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary px-4 rounded-pill fw-semibold hover-shadow">
                                                                    <FaExternalLinkAlt className="me-2" /> Open / Download
                                                                </a>
                                                                <p className="text-muted small mt-3 mb-0"><FaFileContract className="me-2" />This document is verified by Superadmin.</p>
                                                            </div>
                                                        );
                                                    }
                                                })()
                                            ) : (
                                                <div className="py-4 text-secondary">
                                                    <FaFileContract size={40} className="mb-3 opacity-25" />
                                                    <p className="mb-0 fw-medium">No proof document available.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                                    <button type="button" className="btn btn-light border" onClick={handleCancel}>Cancel</button>
                                    <button
                                        type="submit"
                                        className="btn text-white fw-bold shadow-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                            padding: '12px 30px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <FaSave className="me-2" /> Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
