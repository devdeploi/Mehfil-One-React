import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_URL } from '../../utils/function';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { FaCheck, FaLock, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import '../../styles/superadmin/SuperAdminLogin.css';
import '../../styles/vendor/VendorRegistration.css';
import Terms from '../common/Terms';
import Policy from '../common/Policy';

const toastStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .custom-toast-glass {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-left: 5px solid;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
`;

const VendorRegistration = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const getSavedData = () => {
        try {
            const saved = sessionStorage.getItem('vendorRegistrationData');
            if (!saved) return null;

            const parsed = JSON.parse(saved);

            // Reconstruct File object if it exists
            if (parsed.formData && parsed.formData.proofDocument && parsed.formData.proofDocument.data) {
                const { data, name } = parsed.formData.proofDocument;
                parsed.formData.proofDocument = dataURLtoFile(data, name);
            }

            return parsed;
        } catch (e) {
            console.error('Error parsing saved data', e);
            return null;
        }
    };

    // Load initial state lazily — nav state takes priority over sessionStorage
    const planFromNav = location.state?.selectedPlan || null;
    const [step, setStep] = useState(() => planFromNav ? 2 : (getSavedData()?.step || 1));
    const [selectedPlan, setSelectedPlan] = useState(
        () => planFromNav || getSavedData()?.selectedPlan || null
    );
    const [formData, setFormData] = useState(() => {
        const saved = getSavedData();
        return {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            cardNumber: '',
            expiry: '',
            cvc: '',
            cardName: '',
            businessName: '',
            gstNumber: '',
            businessAddress: '',
            upiId: '',
            proofDocument: null,
            ...saved?.formData
        };
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // New state for post-payment processing
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [upiError, setUpiError] = useState('');
    const [shakeTrigger, setShakeTrigger] = useState(0);


    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(() => getSavedData()?.isOtpVerified || false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Registration Success State
    const [isRegistered, setIsRegistered] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(() => getSavedData()?.termsAccepted || false);
    const [isYearly, setIsYearly] = useState(() => planFromNav?.isYearly || getSavedData()?.isYearly || false);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleNavigate = async (path) => {
        await saveRegistrationState();
        navigate(path);
    };

    // Manual Save for Policy Navigation
    const saveRegistrationState = async () => {
        let proofDocData = null;
        if (formData.proofDocument instanceof File) {
            try {
                // Check file size (limit to ~4MB for safety)
                if (formData.proofDocument.size > 4 * 1024 * 1024) {
                    console.warn("File too large to save in session");
                } else {
                    const base64 = await fileToBase64(formData.proofDocument);
                    proofDocData = {
                        name: formData.proofDocument.name,
                        data: base64
                    };
                }
            } catch (err) {
                console.error("Error saving file", err);
            }
        } else if (formData.proofDocument && formData.proofDocument.name && formData.proofDocument.size) {
            // It's already a file object (maybe restored), we need to re-read it?
            // Actually if it's a File object, the code above handles it.
            // If it's something else, ignore.
        }

        const dataToSave = {
            formData: {
                ...formData,
                proofDocument: proofDocData // Store as object with Base64
            },
            step,
            selectedPlan,
            termsAccepted,
            isOtpVerified,
            isYearly
        };
        sessionStorage.setItem('vendorRegistrationData', JSON.stringify(dataToSave));
    };

    // Removed Auto-Save Effect


    const calculateStrength = (password) => {
        let strength = 0;
        if (!password) return 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8 && /\d/.test(password)) strength += 1;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[!@#$%^&*]/.test(password)) strength += 1;
        return strength + 1;
    };

    const handlePlanSelect = (plan) => {
        const planWithPricing = {
            ...plan,
            price: isYearly ? plan.yearlyPrice : 0, // Free trial, but Razorpay needs min 1 which is handled during checkout
            period: isYearly ? '/yr' : '/mo',
            isYearly
        };
        setSelectedPlan(planWithPricing);
        setStep(2);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'fullName' || name === 'businessName') {
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: alphabetsOnly }));
        } else if (name === 'phone') {
            const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        } else if (name === 'gstNumber') {
            const upperVal = value.toUpperCase();
            if (upperVal.length > 15) {
                showToast('GST Number must be exactly 15 characters.', 'error');
                return;
            }
            setFormData(prev => ({ ...prev, [name]: upperVal }));
        } else if (name === 'proofDocument') {
            setFormData(prev => ({ ...prev, proofDocument: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name === 'password' || name === 'confirmPassword') setPasswordError('');
        if (name === 'upiId') setUpiError('');
        if (name === 'password') {
            setPasswordStrength(value ? calculateStrength(value) : 0);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 2) {
            if (formData.password !== formData.confirmPassword) {
                setPasswordError('Passwords do not match.');
                setShakeTrigger(prev => prev + 1);
                return;
            }

            if (formData.phone && formData.phone.length !== 10) {
                showToast('Phone number must be exactly 10 digits.', 'error');
                return;
            }

            // UPI Validation
            const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/;
            if (!upiRegex.test(formData.upiId)) {
                setUpiError('Please enter a valid UPI ID (e.g. user@bank)');
                setShakeTrigger(prev => prev + 1);
                return;
            }

            // Trigger OTP Sending
            handleSendOtp();
            return;
        }
        if (step === 4) { // Payment Step
            handlePayment();
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        
        // For now, it's set to 1 Rupee (the minimum allowed by Razorpay) for all plans.
        // When changing to use constants.js amounts later, update this to:
        // let baseAmount = isYearly ? selectedPlan?.yearlyPrice : selectedPlan?.monthlyPrice;
        let baseAmount = 1; 
        
        let amountToPay = baseAmount;
        
        // Only apply GST and convenience fee if it's a real price (greater than the 1 rupee dummy charge)
        if (baseAmount > 1) {
            const gst = baseAmount * 0.18;
            const convenienceFee = baseAmount * 0.02;
            amountToPay = Math.round(baseAmount + gst + convenienceFee);
        }

        if (amountToPay === 0) {
            setIsRegistering(true);
            await registerVendor('free_plan', 'free_order', 0);
            setIsProcessing(false);
            return;
        }

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            showToast('Razorpay SDK failed to load. Are you online?', 'error');
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Fetch Razorpay Key
            const keyRes = await axios.get(`${API_URL}/payment/key`);
            const razorpayKey = keyRes.data.key;

            // 2. Create Order
            const orderResult = await axios.post(`${API_URL}/payment/create-order`, {
                amount: amountToPay,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            const { id: order_id, currency, amount } = orderResult.data;

            // 3. Initialize Options
            const options = {
                key: razorpayKey, // Enter the Key ID generated from the Dashboard
                amount: amount.toString(),
                currency: currency,
                name: "Mehfil One",
                description: `Subscription for ${selectedPlan.name}`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyResult = await axios.post(`${API_URL}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResult.data.status === 'success') {
                            // 4. Register Vendor on Success
                            setIsRegistering(true); // Start showing "Sending Mail..." UI
                            await registerVendor(response.razorpay_payment_id, response.razorpay_order_id);
                        } else {
                            showToast('Payment Verification Failed', 'error');
                        }
                    } catch (error) {
                        console.error('Payment Verification Error:', error);
                        showToast('Payment Verification Failed', 'error');
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#dc2626"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setIsProcessing(false);
        } catch (error) {
            console.error('Payment Error:', error);
            showToast('Could not initiate payment.', 'error');
            setIsProcessing(false);
        }
    };

    const registerVendor = async (paymentId, orderId, paidAmount) => {
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('fullName', formData.fullName);
            formDataPayload.append('email', formData.email);
            formDataPayload.append('phone', formData.phone);
            formDataPayload.append('password', formData.password);
            formDataPayload.append('plan', selectedPlan?.name || 'Basic');
            formDataPayload.append('billingCycle', isYearly ? 'yearly' : 'monthly');
            formDataPayload.append('businessName', formData.businessName);
            formDataPayload.append('gstNumber', formData.gstNumber);
            formDataPayload.append('businessAddress', formData.businessAddress);
            formDataPayload.append('upiId', formData.upiId);
            formDataPayload.append('paymentId', paymentId);
            formDataPayload.append('orderId', orderId);
            formDataPayload.append('amount', paidAmount !== undefined ? paidAmount : (isYearly ? selectedPlan?.yearlyPrice : 1));
            if (formData.proofDocument) {
                formDataPayload.append('proofDocument', formData.proofDocument);
            }

            const response = await axios.post(`${API_URL}/auth/register`, formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201) {
                // Clear storage on success
                sessionStorage.removeItem('vendorRegistrationData');
                // showToast('Registration Successful! Redirecting to login...', 'success');
                // navigate('/superadmin/login');
                setIsRegistered(true);
                setIsRegistering(false); // Stop showing "Sending Mail..." UI
            }
        } catch (error) {
            console.error('Registration Error:', error);
            showToast('An error occurred during registration.', 'error');
            setIsRegistering(false); // Revert on error
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handlePayment();
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            showToast('Please enter an email address first.', 'error');
            return;
        }
        setOtpLoading(true);
        try {
            await axios.post(`${API_URL}/auth/send-otp`, { email: formData.email });
            setIsOtpSent(true);
            setStep(3); // Move to OTP Step
            showToast('OTP sent to your email.', 'success');
        } catch (error) {
            console.error('Send OTP Error:', error);
            showToast(error.response?.data?.msg || 'Failed to send OTP.', 'error');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            showToast('Please enter the OTP.', 'error');
            return;
        }
        setOtpLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/verify-otp`, { email: formData.email, otp });
            if (res.data.status === 'success') {
                setIsOtpVerified(true);
                setIsOtpSent(false); // Clear OTP sent state as we are verified
                setStep(4); // Navigate to Payment Step
                showToast('Email Verified Successfully!', 'success');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            showToast(error.response?.data?.msg || 'Invalid OTP.', 'error');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleCancelOtp = () => {
        setIsOtpSent(false);
        setOtp('');
    };

    // Animation styles for Toast
    // OTP Input Handlers
    const handleOtpBoxChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = otp.split('');
        // Ensure newOtp has 6 chars if it's empty
        while (newOtp.length < 6) newOtp.push('');

        newOtp[index] = element.value;
        const finalOtp = newOtp.join('').substring(0, 6);
        setOtp(finalOtp);

        // Focus next input
        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleOtpBoxKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (!data || isNaN(data)) return;
        setOtp(data.slice(0, 6));
    };

    return (
        <div className="vr-page-container">
            <style>{toastStyles}</style>

            {/* Navbar */}
            <nav className="vr-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%' }}>
                <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                    <span className="vr-nav-brand">MEHFIL ONE</span>
                </div>
                <button onClick={() => navigate('/')} className="vr-nav-btn">
                    Home
                </button>
            </nav>

            {/* Toast Notification */}
            {toast.show && (
                <div
                    className="position-fixed top-0 end-0 m-4 p-3 rounded-3 custom-toast-glass d-flex align-items-center gap-3 pe-4"
                    style={{
                        zIndex: 9999,
                        borderLeftColor: toast.type === 'error' ? '#dc2626' : '#22c55e',
                        minWidth: '300px'
                    }}
                >
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                        style={{
                            width: '32px', height: '32px',
                            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            color: toast.type === 'error' ? '#dc2626' : '#22c55e'
                        }}
                    >
                        <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-lg'}`}></i>
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                            {toast.type === 'error' ? 'Error' : 'Success'}
                        </h6>
                        <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="vr-content-wrapper">
                <div className="sa-login-card vr-card-wide">
                    {/* <div className="sa-login-brand">
                        <i className="bi bi-calendar-check-fill"></i>
                        <span>MEHFIL ONE</span>
                    </div> */}

                    <h2 className="sa-login-title">Vendor Registration</h2>

                    {!isOtpSent && !isRegistered && (
                        <div className="vr-steps">
                            <div className={`vr-step ${step >= 1 ? 'active' : ''}`}>1</div>
                            <div className="vr-line"></div>
                            <div className={`vr-step ${step >= 2 ? 'active' : ''}`}>2</div>
                            <div className="vr-line"></div>
                            <div className={`vr-step ${step >= 3 ? 'active' : ''}`}>3</div>
                            <div className="vr-line"></div>
                            <div className={`vr-step ${step >= 4 ? 'active' : ''}`}>4</div>
                        </div>
                    )}


                    <div className="vr-content pt-2">

                        <div>
                            {isRegistering ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-danger mb-4" style={{ width: '3rem', height: '3rem' }} role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h3 className="mb-3 text-dark">Finalizing Registration...</h3>
                                    <p className="text-muted fs-5">
                                        Please wait while we verify your payment and send your confirmation email.
                                    </p>
                                    <p className="text-danger fw-bold mt-2">Do not close this window.</p>
                                </div>
                            ) : isRegistered ? (
                                <div className="text-center py-5">
                                    <div className="mb-4">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h3 className="mb-3 text-dark">Registration Successful!</h3>
                                    <p className="text-muted fs-5">
                                        Your registration was successful. You will be notified after verification.
                                    </p>
                                    <button className="sa-login-btn mt-4" onClick={() => navigate('/')}>
                                        Return to Home
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {step === 1 && (
                                        <>
                                            {!isYearly && (
                                                <div style={{ position: 'relative', width: '100%', background: '#dc3545', color: '#fff', padding: '10px 0', zIndex: 10, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(220,53,69,0.3)', marginBottom: '24px', borderRadius: '8px', overflow: 'hidden' }}>
                                                    <marquee scrollamount="12"> 🎉 Launch Offers one month Free trial 🎉 Launch Offers one month Free trial 🎉 Launch Offers one month Free trial </marquee>
                                                </div>
                                            )}
                                            <div className="vr-form-header text-center mb-4">
                                                <h3 className="mb-3">Select a Plan</h3>
                                                <div className="d-flex justify-content-center">
                                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '5px', display: 'inline-flex' }}>
                                                        <button 
                                                            type="button"
                                                            className="btn btn-sm rounded-pill px-4 fw-bold border-0" 
                                                            style={!isYearly ? { background: '#ffffff', color: '#dc3545', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : { color: '#64748b' }}
                                                            onClick={() => setIsYearly(false)}
                                                        >
                                                            Monthly
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            className="btn btn-sm rounded-pill px-4 fw-bold border-0 d-flex align-items-center gap-2" 
                                                            style={isYearly ? { background: '#ffffff', color: '#dc3545', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : { color: '#64748b' }}
                                                            onClick={() => setIsYearly(true)}
                                                        >
                                                            Yearly <span className="badge rounded-pill bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>Save ~20%</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="vr-plans-grid">
                                                {SUBSCRIPTION_PLANS.map(plan => {
                                                    const price = isYearly ? plan.yearlyPrice : 0;
                                                    const period = isYearly ? '/yr' : '/mo';
                                                    return (
                                                    <div key={plan.id} className={`vr-plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}>
                                                        {plan.recommended && <div className="vr-plan-badge">Most Popular</div>}
                                                        <h3>{plan.name}</h3>
                                                        <div className="vr-price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {!isYearly && (
                                                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.4rem', fontWeight: '600', marginRight: '10px' }}>
                                                                    {plan.currency}{plan.monthlyPrice}
                                                                </span>
                                                            )}
                                                            <span className="pr-currency" style={{ fontSize: '1rem', alignSelf: 'flex-start', marginTop: '4px', fontWeight: '700' }}>{plan.currency}</span>
                                                            <span className="pr-amount" style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: 1 }}>{price.toLocaleString('en-IN')}</span>
                                                            <span className="pr-period" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginLeft: '2px', alignSelf: 'flex-end', marginBottom: '8px' }}>{period}</span>
                                                        </div>
                                                        <ul className="vr-features">
                                                            {plan.features.map((f, i) => (
                                                                <li key={i}><FaCheck /> {f}</li>
                                                            ))}
                                                        </ul>
                                                        <button
                                                            className={selectedPlan?.id === plan.id ? "sa-login-btn mt-3" : "vr-btn-select mt-3"}
                                                            onClick={() => handlePlanSelect(plan)}
                                                            style={selectedPlan?.id === plan.id ? { marginTop: '0' } : {}}
                                                        >
                                                            {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                                        </button>
                                                    </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <form onSubmit={handleNext} className="sa-login-form">
                                            <div className="vr-form-header justify-content-center">
                                                <h3>Account Details</h3>
                                            </div>

                                            <div className="row g-3">
                                                {/* Business Details Section */}
                                                <div className="col-12">
                                                    <h5 className="text-muted border-bottom pb-2 mb-3">Business Details</h5>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Business Name <span className="text-danger">*</span></label>
                                                    <input type="text" name="businessName" required value={formData.businessName} onChange={handleInputChange} className="form-control" placeholder="My Event Company" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">GST Number <span className="text-danger">*</span></label>
                                                    <input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleInputChange} className="form-control" placeholder="22AAAAA0000A1Z5" maxLength="15" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Business Address <span className="text-danger">*</span></label>
                                                    <textarea name="businessAddress" required value={formData.businessAddress} onChange={handleInputChange} className="form-control" rows="2" placeholder="123, Main Street, City"></textarea>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Proof Upload (ID/License) <span className="text-danger">*</span></label>
                                                    <input type="file" name="proofDocument" required onChange={handleInputChange} className="form-control" accept="image/*,application/pdf" />
                                                    <div className="form-text text-muted">Upload a valid ID proof or Business License (Image or PDF).</div>
                                                </div>

                                                {/* Personal Details Section */}
                                                <div className="col-12 mt-4">
                                                    <h5 className="text-muted border-bottom pb-2 mb-3">Personal Details</h5>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="form-control" placeholder="John Doe" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Phone <span className="text-danger">*</span></label>
                                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="form-control" placeholder="+1 234..." />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Email Address <span className="text-danger">*</span></label>
                                                    <div className="input-group">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            required
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="form-control"
                                                            placeholder="name@company.com"
                                                            disabled={isOtpVerified}
                                                            style={isOtpVerified ? { backgroundColor: '#f0fdf4', borderColor: '#22c55e', color: '#15803d' } : {}}
                                                        />
                                                        {isOtpVerified && (
                                                            <span className="input-group-text bg-success text-white border-success">
                                                                <i className="bi bi-check-circle-fill"></i>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">UPI ID <span className="text-danger">*</span></label>
                                                    <div className="position-relative">
                                                        <input
                                                            type="text"
                                                            name="upiId"
                                                            required
                                                            value={formData.upiId}
                                                            onChange={handleInputChange}
                                                            className={`form-control ${formData.upiId && !/^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/.test(formData.upiId) ? 'is-invalid' : (formData.upiId && /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/.test(formData.upiId) ? 'is-valid' : '')}`}
                                                            placeholder="user@bank"
                                                            style={{ paddingRight: '40px' }}
                                                        />
                                                        {formData.upiId && (
                                                            <div className="position-absolute end-0 top-50 translate-middle-y me-3 animate-fade-in" style={{ zIndex: 5 }}>
                                                                {/^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/.test(formData.upiId) ? (
                                                                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '1.1rem' }}></i>
                                                                ) : (
                                                                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '1.1rem' }}></i>
                                                                )}
                                                            </div>
                                                        )}
                                                        {upiError && (
                                                            <div className="invalid-feedback animate-shake d-flex align-items-center gap-1 mt-1">
                                                                <i className="bi bi-exclamation-circle"></i>
                                                                {upiError}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Password <span className="text-danger">*</span></label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
                                                            required
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            className="form-control pe-5"
                                                            placeholder="••••••••"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn sa-password-toggle"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            tabIndex="-1"
                                                        >
                                                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                                        </button>
                                                    </div>
                                                    {formData.password && (
                                                        <>
                                                            <div className="mt-2 d-flex gap-1" style={{ height: '4px' }}>
                                                                {[1, 2, 3, 4].map(level => (
                                                                    <div
                                                                        key={level}
                                                                        className="flex-grow-1 rounded-pill"
                                                                        style={{
                                                                            background: level <= passwordStrength
                                                                                ? (passwordStrength === 1 ? '#dc2626' :
                                                                                    passwordStrength === 2 ? '#fbbf24' :
                                                                                        passwordStrength === 3 ? '#3b82f6' : '#22c55e')
                                                                                : '#e2e8f0',
                                                                            transition: 'background-color 0.5s ease'
                                                                        }}
                                                                    ></div>
                                                                ))}
                                                            </div>
                                                            <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.75rem' }}>
                                                                <span className="text-muted">Use 8+ characters</span>
                                                                <span style={{
                                                                    color: passwordStrength === 1 ? '#dc2626' :
                                                                        passwordStrength === 2 ? '#fbbf24' :
                                                                            passwordStrength === 3 ? '#3b82f6' : '#22c55e',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {passwordStrength === 1 && "Weak"}
                                                                    {passwordStrength === 2 && "Fair"}
                                                                    {passwordStrength === 3 && "Good"}
                                                                    {passwordStrength === 4 && "Strong"}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirmPassword"
                                                            required
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            className="form-control pe-5"
                                                            placeholder="••••••••"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn sa-password-toggle"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            tabIndex="-1"
                                                        >
                                                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                                        </button>
                                                    </div>
                                                    {passwordError && (
                                                        <div key={shakeTrigger} className="animate-shake d-flex align-items-center gap-2 mt-2" style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                                                            <i className="bi bi-exclamation-circle"></i>
                                                            <span>{passwordError}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="sa-login-btn mt-4"
                                                disabled={otpLoading}
                                            >
                                                {otpLoading ? 'Sending OTP...' : 'Next: Verify Email'}
                                            </button>
                                        </form>
                                    )}

                                    {step === 3 && (
                                        <div className="sa-login-form">
                                            <div className="vr-form-header justify-content-center">
                                                <h3>Verify Email Address</h3>
                                            </div>
                                            <p className="text-muted text-center mb-4">
                                                We've sent a 6-digit code to <br /> <span className="text-dark fw-bold">{formData.email}</span>
                                            </p>



                                            <div className="mb-4 d-flex justify-content-center gap-2">
                                                {[...Array(6)].map((_, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        className="form-control text-center p-0"
                                                        maxLength={1}
                                                        style={{ width: '45px', height: '45px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                                        value={otp[index] || ''}
                                                        onChange={(e) => handleOtpBoxChange(e.target, index)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
                                                                e.target.previousSibling.focus();
                                                            }
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                                    />
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                className="sa-login-btn mb-3"
                                                onClick={handleVerifyOtp}
                                                disabled={otpLoading || otp.length !== 6}
                                            >
                                                {otpLoading ? 'Verifying...' : 'Verify & Continue'}
                                            </button>

                                            <div className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-muted text-decoration-none small"
                                                    onClick={handleSendOtp}
                                                    disabled={otpLoading}
                                                >
                                                    Resend OTP
                                                </button>
                                            </div>
                                            {/* Back button removed */}
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <form onSubmit={handleNext} className="sa-login-form">
                                            <div className="vr-form-header justify-content-center">
                                                <h3>Payment & Confirmation</h3>
                                            </div>

                                            <div className="text-muted mb-4" style={{ textAlign: 'justify', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div className="p-3 bg-light rounded border mb-4">
                                                    <h5 className="text-dark mb-3 border-bottom pb-2">Order Summary</h5>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Selected Plan:</span>
                                                        <span className="text-dark fw-bold">{selectedPlan?.name}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Business Name:</span>
                                                        <span className="text-dark">{formData.businessName}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Email:</span>
                                                        <span className="text-dark">{formData.email}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                                                        <span className="fw-bold text-dark">Total Payable:</span>
                                                        <span className="fw-bold text-danger fs-5">₹{isYearly ? selectedPlan?.yearlyPrice : 1}</span>
                                                    </div>
                                                </div>

                                                <p className="mb-2">
                                                    Payments are processed securely via <strong>Razorpay</strong>.
                                                </p>

                                                <div className="mt-4 p-3 bg-light rounded border d-flex align-items-start gap-2 mb-3">
                                                    <input
                                                        className="form-check-input mt-1 shadow-none"
                                                        type="checkbox"
                                                        id="termsCheckStep3"
                                                        checked={termsAccepted}
                                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                                        style={{ cursor: 'pointer', flexShrink: 0 }}
                                                    />
                                                    <label className="text-muted small" htmlFor="termsCheckStep3" style={{ cursor: 'pointer', lineHeight: '1.5' }}>
                                                        I have read and agree to the <span onClick={() => setShowTermsModal(true)} className="text-danger text-decoration-none fw-bold" style={{ cursor: 'pointer' }}>Terms and Conditions</span> and <span onClick={() => setShowPolicyModal(true)} className="text-danger text-decoration-none fw-bold" style={{ cursor: 'pointer' }}>Communication Policy</span>.
                                                    </label>
                                                </div>
                                            </div>



                                            <button
                                                type="submit"
                                                className="sa-login-btn mt-4"
                                                disabled={isProcessing || !termsAccepted}
                                            >
                                                {isProcessing ? 'Processing Payment...' : ((isYearly ? selectedPlan?.yearlyPrice : 1) === 0 ? 'Register for Free' : `Pay ₹${isYearly ? selectedPlan?.yearlyPrice : 1} & Register`)}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>


                    {!isRegistered && (
                        <div className="text-center mt-4">
                            <p className="text-muted small">
                                Already have an account?{' '}
                                <Link to="/vendor/login" className="text-danger fw-bold text-decoration-none">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                background: '#0f172a',
                color: '#94a3b8',
                padding: '32px 24px 20px',
                marginTop: 'auto',
                fontFamily: "'Outfit', sans-serif"
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                        {/* Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: 34, height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                                Mehfil <span style={{ color: '#dc3545' }}>One</span>
                            </span>
                        </div>

                        {/* Nav links */}
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Privacy Policy', action: () => setShowPolicyModal(true) },
                                { label: 'Terms of Service', action: () => setShowTermsModal(true) },
                                { label: 'Sign In', to: '/vendor/login' },
                            ].map((item) => (
                                item.to ? (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        style={{
                                            color: '#94a3b8',
                                            textDecoration: 'none',
                                            fontSize: '0.82rem',
                                            fontWeight: 500,
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={e => e.target.style.color = '#f1f5f9'}
                                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        key={item.label}
                                        onClick={item.action}
                                        style={{
                                            color: '#94a3b8',
                                            textDecoration: 'none',
                                            fontSize: '0.82rem',
                                            fontWeight: 500,
                                            transition: 'color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => e.target.style.color = '#f1f5f9'}
                                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        {item.label}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                        <span>© {new Date().getFullYear()} Mehfil One. All rights reserved.</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                            Secure &amp; Encrypted Registration
                        </span>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            {showPolicyModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Communication Policy</h4>
                            <button onClick={() => setShowPolicyModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.background = '#e2e8f0'; e.target.style.color = '#0f172a';}} onMouseLeave={e => {e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b';}}>
                                &times;
                            </button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            <Policy />
                        </div>
                    </div>
                </div>
            )}
            
            {showTermsModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Terms and Conditions</h4>
                            <button onClick={() => setShowTermsModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.background = '#e2e8f0'; e.target.style.color = '#0f172a';}} onMouseLeave={e => {e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b';}}>
                                &times;
                            </button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            <Terms />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorRegistration;
