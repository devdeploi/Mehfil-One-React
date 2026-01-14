import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../utils/function';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { FaCheck, FaLock, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import '../../styles/superadmin/SuperAdminLogin.css';
import '../../styles/vendor/VendorRegistration.css';
import Terms from '../common/Terms';
import Policy from '../common/Policy';

const VendorRegistration = () => {

    const RAZORPAY_KEY_ID = "rzp_test_S0aFMLxRqwkL8z";
    const isTestMode = RAZORPAY_KEY_ID.startsWith('rzp_test_');

    const navigate = useNavigate();

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

    // Load initial state immediately
    const savedState = getSavedData();

    const [step, setStep] = useState(savedState?.step || 1);
    const [selectedPlan, setSelectedPlan] = useState(savedState?.selectedPlan || null);
    const [formData, setFormData] = useState({
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
        proofDocument: null,
        ...savedState?.formData
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [shakeTrigger, setShakeTrigger] = useState(0);


    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(savedState?.isOtpVerified || false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Registration Success State
    const [isRegistered, setIsRegistered] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(savedState?.termsAccepted || false);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
            isOtpVerified
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
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'proofDocument') {
            setFormData(prev => ({ ...prev, proofDocument: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name === 'password' || name === 'confirmPassword') setPasswordError('');
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
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            showToast('Razorpay SDK failed to load. Are you online?', 'error');
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Create Order
            const orderResult = await axios.post(`${API_URL}/payment/create-order`, {
                amount: selectedPlan.price,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            const { id: order_id, currency, amount } = orderResult.data;

            // 2. Initialize Options
            const options = {
                key: RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
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

    const registerVendor = async (paymentId, orderId) => {
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('fullName', formData.fullName);
            formDataPayload.append('email', formData.email);
            formDataPayload.append('phone', formData.phone);
            formDataPayload.append('password', formData.password);
            formDataPayload.append('plan', selectedPlan?.name || 'Standard');
            formDataPayload.append('businessName', formData.businessName);
            formDataPayload.append('gstNumber', formData.gstNumber);
            formDataPayload.append('businessAddress', formData.businessAddress);
            formDataPayload.append('paymentId', paymentId);
            formDataPayload.append('orderId', orderId);
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
            }
        } catch (error) {
            console.error('Registration Error:', error);
            showToast('An error occurred during registration.', 'error');
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

    return (
        <div className="sa-login-container">
            <style>{toastStyles}</style>

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
                        {isRegistered ? (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h3 className="mb-3 text-white">Registration Successful!</h3>
                                <p className="text-white-50 fs-5">
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
                                        <div className="vr-form-header">
                                            <h3>Select a Plan</h3>
                                        </div>
                                        <div className="vr-plans-grid">
                                            {SUBSCRIPTION_PLANS.map(plan => (
                                                <div key={plan.id} className={`vr-plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}>
                                                    {plan.recommended && <div className="vr-plan-badge">Most Popular</div>}
                                                    <h3>{plan.name}</h3>
                                                    <div className="vr-price">
                                                        {plan.currency}{plan.price}<span>{plan.period}</span>
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
                                            ))}
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <form onSubmit={handleNext} className="sa-login-form">
                                        <div className="vr-form-header">
                                            <button type="button" onClick={handleBack} className="vr-back-btn" title="Back"><FaArrowLeft /></button>
                                            <h3>Account Details</h3>
                                        </div>

                                        <div className="row g-3">
                                            {/* Business Details Section */}
                                            <div className="col-12">
                                                <h5 className="text-white-50 border-bottom border-secondary pb-2 mb-3">Business Details</h5>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Business Name</label>
                                                <input type="text" name="businessName" required value={formData.businessName} onChange={handleInputChange} className="form-control" placeholder="My Event Company" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">GST Number</label>
                                                <input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleInputChange} className="form-control" placeholder="22AAAAA0000A1Z5" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Business Address</label>
                                                <textarea name="businessAddress" required value={formData.businessAddress} onChange={handleInputChange} className="form-control" rows="2" placeholder="123, Main Street, City"></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Proof Upload (ID/License)</label>
                                                <input type="file" name="proofDocument" required onChange={handleInputChange} className="form-control" accept="image/*,application/pdf" />
                                                <div className="form-text text-white-50">Upload a valid ID proof or Business License (Image or PDF).</div>
                                            </div>

                                            {/* Personal Details Section */}
                                            <div className="col-12 mt-4">
                                                <h5 className="text-white-50 border-bottom border-secondary pb-2 mb-3">Personal Details</h5>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Full Name</label>
                                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="form-control" placeholder="John Doe" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Phone</label>
                                                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="form-control" placeholder="+1 234..." />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Email Address</label>
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
                                                        style={isOtpVerified ? { backgroundColor: '#183921', borderColor: '#22c55e', color: '#fff' } : {}}
                                                    />
                                                    {isOtpVerified && (
                                                        <span className="input-group-text bg-success text-white border-success">
                                                            <i className="bi bi-check-circle-fill"></i>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Password</label>
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
                                                                            : 'rgba(255,255,255,0.1)',
                                                                        transition: 'background-color 0.5s ease'
                                                                    }}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                        <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.75rem' }}>
                                                            <span className="text-white-50">Use 8+ characters</span>
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
                                                <label className="form-label">Confirm Password</label>
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
                                                    <div key={shakeTrigger} className="animate-shake d-flex align-items-center gap-2 mt-2" style={{ color: '#d9e711ff', fontSize: '0.85rem' }}>
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
                                        <p className="text-white-50 text-center mb-4">
                                            We've sent a 6-digit code to <br /> <span className="text-white">{formData.email}</span>
                                        </p>

                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                className="form-control text-center fs-4 letter-spacing-2"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            />
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
                                                className="btn btn-link text-white-50 text-decoration-none small"
                                                onClick={handleSendOtp}
                                                disabled={otpLoading}
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                        <div className="text-center mt-2">
                                            <button type="button" onClick={() => setStep(2)} className="btn btn-link text-white-50 text-decoration-none small">
                                                Back to Details
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <form onSubmit={handleNext} className="sa-login-form">
                                        <div className="vr-form-header">
                                            <button type="button" onClick={handleBack} className="vr-back-btn" title="Back"><FaArrowLeft /></button>
                                            <h3>Payment & Confirmation</h3>
                                        </div>

                                        <div className="text-white-50 mb-4" style={{ textAlign: 'justify', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            <div className="p-3 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-25 mb-4">
                                                <h5 className="text-white mb-3 border-bottom border-secondary pb-2">Order Summary</h5>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Selected Plan:</span>
                                                    <span className="text-white fw-bold">{selectedPlan?.name}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Business Name:</span>
                                                    <span className="text-white">{formData.businessName}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Email:</span>
                                                    <span className="text-white">{formData.email}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-50">
                                                    <span className="fw-bold text-white">Total Payable:</span>
                                                    <span className="fw-bold text-danger fs-5">₹{selectedPlan?.price}</span>
                                                </div>
                                            </div>

                                            <p className="mb-2">
                                                Payments are processed securely via <strong>Razorpay</strong>.
                                            </p>

                                            <div className="mt-4 p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex align-items-start gap-2 mb-3">
                                                <input
                                                    className="form-check-input mt-1 shadow-none"
                                                    type="checkbox"
                                                    id="termsCheckStep3"
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                    style={{ cursor: 'pointer', flexShrink: 0 }}
                                                />
                                                <label className="text-white small" htmlFor="termsCheckStep3" style={{ cursor: 'pointer', lineHeight: '1.5' }}>
                                                    I have read and agree to the <span onClick={() => handleNavigate('/terms')} className="text-success text-decoration-none fw-bold" style={{ cursor: 'pointer' }}>Terms and Conditions</span> and <span onClick={() => handleNavigate('/policy')} className="text-success text-decoration-none fw-bold" style={{ cursor: 'pointer' }}>Communication Policy</span>.
                                                </label>
                                            </div>
                                        </div>



                                        <button
                                            type="submit"
                                            className="sa-login-btn mt-4"
                                            disabled={isProcessing || !termsAccepted}
                                        >
                                            {isProcessing ? 'Processing Payment...' : (isTestMode ? `Pay ₹${selectedPlan?.price}` : `Pay ₹${selectedPlan?.price} & Register`)}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="text-center pb-3">
                    <button type="button" onClick={() => navigate('/superadmin/login')} className="btn btn-link text-white-50 text-decoration-none" style={{ fontSize: '0.9rem' }}>
                        Already have an account? <span className="text-white fw-bold">Login</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorRegistration;
