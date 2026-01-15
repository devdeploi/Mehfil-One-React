import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/function';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';
import '../../styles/superadmin/SuperAdminLogin.css';

const SuperAdminLogin = () => {
    const navigate = useNavigate();

    // Vanta Effect
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = React.useRef(null);

    React.useEffect(() => {
        if (!vantaEffect && vantaRef.current) {
            try {
                setVantaEffect(FOG({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: false,
                    touchControls: false, // Disabled for performance
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0xffffff,
                    midtoneColor: 0xffffff,
                    lowlightColor: 0xff8fab,
                    baseColor: 0xffffff,
                    blurFactor: 0.4, // Reduced blur
                    speed: 1.0, // Reduced speed
                    zoom: 0.8 // Reduced zoom
                }));
            } catch (error) {
                console.warn("Vanta Effect failed to initialize", error);
            }
        }
        return () => {
            if (vantaEffect) {
                vantaEffect.destroy();
                setVantaEffect(null);
            }
        };
    }, [vantaEffect]);

    const [view, setView] = useState('login'); // login, forgot, otp, reset
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login Data
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Forgot Password Data
    const [resetData, setResetData] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [shakeTrigger, setShakeTrigger] = useState(0);
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [showOTPModal, setShowOTPModal] = useState(false);

    // UI Feedback
    const [loginError, setLoginError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const calculateStrength = (password) => {
        let strength = 0;
        if (!password) return 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8 && /\d/.test(password)) strength += 1;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[!@#$%^&*]/.test(password)) strength += 1;
        return strength + 1;
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        if (loginError) setLoginError('');
        if (successMsg) setSuccessMsg('');
    };

    const handleResetChange = (e) => {
        const { name, value } = e.target;
        setResetData(prev => ({ ...prev, [name]: value }));

        if (name === 'otp' && otpError) setOtpError('');
        if (name === 'password' || name === 'confirmPassword') setPasswordError('');
        if (name === 'password') {
            setPasswordStrength(value ? calculateStrength(value) : 0);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);

            if (response.status === 200) {
                // Save user data (and token if available later)
                const userData = response.data.vendor;
                localStorage.setItem('vendor_user', JSON.stringify(userData));

                // Role-based navigation
                if (userData.role === 'superadmin') {
                    navigate('/superadmin/dashboard');
                } else {
                    navigate('/vendor/dashboard');
                }
            }
        } catch (error) {
            console.error('Login Error:', error);
            const msg = error.response?.data?.msg || 'Login failed';
            setLoginError(msg);
            setShakeTrigger(prev => prev + 1);
        }
    };

    const handleSendOTP = (e) => {
        e.preventDefault();
        setLoginError('');
        setSuccessMsg('');
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOTP(code);
        setShowOTPModal(true);
        setView('otp');
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (resetData.otp === generatedOTP) {
            setView('reset');
            setOtpError('');
        } else {
            setOtpError('Invalid OTP. Please check the code.');
            setShakeTrigger(prev => prev + 1);
        }
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (resetData.password !== resetData.confirmPassword) {
            setPasswordError('Passwords do not match');
            setShakeTrigger(prev => prev + 1);
            return;
        }
        // Success
        setSuccessMsg('Password Reset Successfully!');
        setView('login');
    };

    return (
        <div className="sa-login-container" ref={vantaRef}>
            <div className={`sa-login-card ${view === 'reset' ? 'sa-register-mode' : ''}`}>
                <div className="sa-login-brand">
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>MEHFIL ONE</span>
                </div>

                {view === 'login' && (
                    <>
                        <h2 className="sa-login-title">Welcome Back</h2>
                        <p className="sa-login-subtitle">Enter your credentials to access the admin panel</p>

                        {successMsg && (
                            <div className="d-flex align-items-center gap-2 mb-3 justify-content-center" style={{ color: '#4ade80', fontSize: '0.9rem' }}>
                                <i className="bi bi-check-circle-fill"></i>
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="sa-login-form">
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <div className="position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-control pe-5"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                        placeholder="Enter your password"
                                    />
                                    <button type="button" className="btn sa-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="text-end mb-3">
                                <button type="button" onClick={() => setView('forgot')} className="btn btn-link text-decoration-none" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    Forgot Password?
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary sa-login-btn mt-2"
                            >
                                Login
                            </button>

                            {loginError && (
                                <div key={shakeTrigger} className="animate-shake d-flex align-items-center justify-content-center gap-2 mt-3" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    <span>{loginError}</span>
                                </div>
                            )}

                            {/* <div className="text-center mt-4">
                                <button type="button" onClick={() => navigate('/vendor/register')} className="btn btn-link text-decoration-none" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    Don't have an account? <span className="text-danger fw-bold">Register as Vendor</span>
                                </button>
                            </div> */}
                        </form>
                    </>
                )}

                {view === 'forgot' && (
                    <>
                        <h2 className="sa-login-title">Reset Password</h2>
                        <p className="sa-login-subtitle">Enter your email to receive an OTP</p>
                        <form onSubmit={handleSendOTP} className="sa-login-form">
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={resetData.email}
                                    onChange={handleResetChange}
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary sa-login-btn">Send OTP</button>
                            <div className="text-center mt-3">
                                <button type="button" onClick={() => setView('login')} className="btn btn-link text-muted text-decoration-none">Back to Login</button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'otp' && (
                    <>
                        <h2 className="sa-login-title">Enter OTP</h2>
                        <p className="sa-login-subtitle">We sent a code to {resetData.email}</p>
                        <form onSubmit={handleVerifyOTP} className="sa-login-form">
                            <div className="mb-3">
                                <label className="form-label">4-Digit Code</label>
                                <input
                                    type="text"
                                    name="otp"
                                    className="form-control text-center"
                                    style={{ letterSpacing: '0.5em', fontSize: '1.2rem' }}
                                    value={resetData.otp}
                                    onChange={handleResetChange}
                                    required
                                    placeholder="----"
                                    maxLength={4}
                                />
                                <div className="form-text text-muted text-center mt-2">Check your email for the code</div>
                            </div>

                            {otpError && (
                                <div key={shakeTrigger} className="animate-shake d-flex align-items-center justify-content-center gap-2 mb-3" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span>{otpError}</span>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary sa-login-btn">Verify</button>
                            <div className="text-center mt-3">
                                <button type="button" onClick={() => setView('forgot')} className="btn btn-link text-muted text-decoration-none">Resend Code</button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'reset' && (
                    <>
                        <h2 className="sa-login-title">New Password</h2>
                        <p className="sa-login-subtitle">Create a strong password for your account</p>
                        <form onSubmit={handleResetPassword} className="sa-login-form">
                            <div className="mb-3">
                                <label className="form-label">New Password</label>
                                <div className="position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-control pe-5"
                                        value={resetData.password}
                                        onChange={handleResetChange}
                                        required
                                        placeholder="New Password"
                                    />
                                    <button type="button" className="btn sa-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                                {resetData.password && (
                                    <>
                                        <div className="mt-2 d-flex gap-1" style={{ height: '4px' }}>
                                            {[1, 2, 3, 4].map(level => (
                                                <div key={level} className="flex-grow-1 rounded-pill" style={{
                                                    background: level <= passwordStrength ? (passwordStrength === 1 ? '#dc2626' : passwordStrength === 2 ? '#fbbf24' : passwordStrength === 3 ? '#3b82f6' : '#22c55e') : '#e2e8f0',
                                                    transition: 'background-color 0.5s ease'
                                                }}></div>
                                            ))}
                                        </div>
                                        <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.75rem' }}>
                                            <span className="text-muted">Use 8+ characters</span>
                                            <span style={{ color: passwordStrength === 1 ? '#dc2626' : passwordStrength === 2 ? '#fbbf24' : passwordStrength === 3 ? '#3b82f6' : '#22c55e', fontWeight: 'bold' }}>
                                                {passwordStrength === 1 && "Weak"} {passwordStrength === 2 && "Fair"} {passwordStrength === 3 && "Good"} {passwordStrength === 4 && "Strong"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Confirm Password</label>
                                <div className="position-relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="form-control pe-5"
                                        value={resetData.confirmPassword}
                                        onChange={handleResetChange}
                                        required
                                        placeholder="Confirm Password"
                                    />
                                    <button type="button" className="btn sa-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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
                            <button type="submit" className="btn btn-primary sa-login-btn">Reset Password</button>
                        </form>
                    </>
                )}
            </div>

            {/* Mock OTP Modal */}
            {showOTPModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', padding: '2rem', borderRadius: '16px',
                        textAlign: 'center', maxWidth: '300px', width: '90%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', color: '#dc2626', marginBottom: '1rem' }}>
                            <i className="bi bi-envelope-open-fill"></i>
                        </div>
                        <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontWeight: 'bold' }}>OTP Received</h4>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Your verification code is:</p>
                        <div style={{
                            background: '#f1f5f9', padding: '1rem', borderRadius: '8px',
                            fontSize: '2rem', fontWeight: 'bold', letterSpacing: '0.2em',
                            color: '#0f172a', marginBottom: '1.5rem', border: '2px dashed #cbd5e1'
                        }}>
                            {generatedOTP}
                        </div>
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => setShowOTPModal(false)}
                            style={{ borderRadius: '8px', fontWeight: '600' }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminLogin;
