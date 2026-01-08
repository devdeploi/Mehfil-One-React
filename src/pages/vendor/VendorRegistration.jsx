import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/function';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { FaCheck, FaLock, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import '../../styles/superadmin/SuperAdminLogin.css';
import '../../styles/vendor/VendorRegistration.css';

const VendorRegistration = () => {
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
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        cardName: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [shakeTrigger, setShakeTrigger] = useState(0);

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            // Direct Payment Trigger
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
            alert('Razorpay SDK failed to load. Are you online?');
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
                key: "rzp_test_S0aFMLxRqwkL8z", // Enter the Key ID generated from the Dashboard
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
                            await registerVendor();
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error('Payment Verification Error:', error);
                        alert('Payment Verification Failed');
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
            alert('Could not initiate payment.');
            setIsProcessing(false);
        }
    };

    const registerVendor = async () => {
        try {
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                plan: selectedPlan?.name || 'Standard'
            };

            const response = await axios.post(`${API_URL}/auth/register`, payload);

            if (response.status === 201) {
                alert('Registration Successful! Redirecting to login...');
                navigate('/superadmin/login');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            alert('An error occurred during registration.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handlePayment();
    };

    return (
        <div className="sa-login-container">
            <div className="sa-login-card vr-card-wide">
                <div className="sa-login-brand">
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>MEHFIL ONE</span>
                </div>

                <h2 className="sa-login-title">Vendor Registration</h2>

                <div className="vr-steps">
                    <div className={`vr-step ${step >= 1 ? 'active' : ''}`}>1. Select Plan</div>
                    <div className="vr-line"></div>
                    <div className={`vr-step ${step >= 2 ? 'active' : ''}`}>2. Account Details & Payment</div>
                </div>

                <div className="vr-content pt-2">
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
                                <h3>Personal Account</h3>
                            </div>

                            <div className="row g-3">
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
                                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="form-control" placeholder="name@company.com" />
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

                            <button type="submit" className="sa-login-btn mt-4" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Pay & Register'}
                            </button>
                        </form>
                    )}


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
