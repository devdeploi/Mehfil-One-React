import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { FaCheck, FaLock, FaUser, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import '../../styles/superadmin/SuperAdminLogin.css';
import '../../styles/vendor/VendorRegistration.css';

const VendorRegistration = () => {
    const navigate = useNavigate();
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
        return strength + 1; // Base level is 1 (Weak) if typed, max 4
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(3); // Move to Payment after plan selection
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types, but keep the shake trigger available for next submit
        if (name === 'password' || name === 'confirmPassword') setPasswordError('');
        if (name === 'password') {
            setPasswordStrength(value ? calculateStrength(value) : 0);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Validation for Step 1 (Account Details)
        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                setPasswordError('Passwords do not match.');
                setShakeTrigger(prev => prev + 1);
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Final validation check (redundant but safe)
        if (formData.password !== formData.confirmPassword) return;

        setIsProcessing(true);

        // Mock API Call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Save mock user for login
        localStorage.setItem('mock_vendor_user', JSON.stringify({
            email: formData.email,
            role: 'vendor',
            name: formData.businessName
        }));

        alert('Registration Successful! Redirecting to login...');
        navigate('/superadmin/login');
    };

    return (
        <div className="sa-login-container">
            {/* Added vr-card-wide to allow wider content for plans */}
            <div className="sa-login-card vr-card-wide">
                <div className="sa-login-brand">
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>MEHFIL ONE</span>
                </div>

                <h2 className="sa-login-title">Vendor Registration</h2>

                <div className="vr-steps">
                    <div className={`vr-step ${step >= 1 ? 'active' : ''}`}>1. Account Details</div>
                    <div className="vr-line"></div>
                    <div className={`vr-step ${step >= 2 ? 'active' : ''}`}>2. Select Plan</div>
                    <div className="vr-line"></div>
                    <div className={`vr-step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
                </div>

                <div className="vr-content pt-2">
                    {step === 2 && (
                        <>
                            <div className="vr-form-header">
                                <button type="button" onClick={handleBack} className="vr-back-btn" title="Back"><FaArrowLeft /></button>
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

                    {step === 1 && (
                        <form onSubmit={handleNext} className="sa-login-form">
                            <div className="vr-form-header">
                                {/* No back button on first step */}
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

                            <button type="submit" className="sa-login-btn mt-4">
                                Continue
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="sa-login-form">
                            <div className="vr-form-header">
                                <button type="button" onClick={handleBack} className="vr-back-btn" title="Back"><FaArrowLeft /></button>
                                <h3>Secure Payment</h3>
                            </div>

                            <div className="vr-summary-card">
                                <div className="d-flex justify-content-between">
                                    <span>Selected Plan:</span>
                                    <strong>{selectedPlan?.name}</strong>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span>Total to pay:</span>
                                    <strong className="text-primary" style={{ fontSize: '1.2rem' }}>
                                        {selectedPlan?.currency}{selectedPlan?.price}
                                    </strong>
                                </div>
                            </div>

                            <div className="vr-payment-mock">
                                <div className="mb-3">
                                    <label className="form-label">Cardholder Name</label>
                                    <input type="text" name="cardName" required value={formData.cardName} onChange={handleInputChange} className="form-control" placeholder="Name on card" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Card Number</label>
                                    <div className="position-relative">
                                        <input type="text" name="cardNumber" required value={formData.cardNumber} onChange={handleInputChange} className="form-control" placeholder="0000 0000 0000 0000" />
                                        <FaCreditCard className="vr-input-icon" />
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label">Expiry Date</label>
                                        <input type="text" name="expiry" required value={formData.expiry} onChange={handleInputChange} className="form-control" placeholder="MM/YY" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">CVC</label>
                                        <div className="position-relative">
                                            <input type="text" name="cvc" required value={formData.cvc} onChange={handleInputChange} className="form-control" placeholder="123" />
                                            <FaLock className="vr-input-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="sa-login-btn mt-4" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : `Pay ${selectedPlan?.currency}${selectedPlan?.price} & Register`}
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
