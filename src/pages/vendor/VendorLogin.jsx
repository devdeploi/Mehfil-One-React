import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/function';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';
import '../../styles/vendor/VendorLogin.css';

const VendorLogin = () => {
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
                    touchControls: false,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0xffffff,
                    midtoneColor: 0xffffff,
                    lowlightColor: 0xff8fab,
                    baseColor: 0xffffff,
                    blurFactor: 0.4,
                    speed: 1.0,
                    zoom: 0.8
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

    // UI Feedback
    const [loginError, setLoginError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleOtpBoxChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = resetData.otp.split('');
        while (newOtp.length < 6) newOtp.push('');

        newOtp[index] = element.value;
        const finalOtp = newOtp.join('').substring(0, 6);
        setResetData(prev => ({ ...prev, otp: finalOtp }));

        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleOtpBoxKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!resetData.otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (!data || isNaN(data)) return;
        setResetData(prev => ({ ...prev, otp: data.slice(0, 6) }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);

            if (response.status === 200) {
                const userData = response.data.vendor;
                
                if (userData.role !== 'vendor') {
                    setLoginError('This portal is for vendors only.');
                    setShakeTrigger(prev => prev + 1);
                    return;
                }

                localStorage.setItem('vendor_user', JSON.stringify(userData));
                navigate('/vendor/dashboard');
            }
        } catch (error) {
            console.error('Login Error:', error);
            const msg = error.response?.data?.msg || 'Login failed';
            setLoginError(msg);
            setShakeTrigger(prev => prev + 1);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoginError('');
        setSuccessMsg('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: resetData.email });
            if (response.status === 200) {
                setSuccessMsg('Verification code sent to your email.');
                setView('otp');
            }
        } catch (error) {
            console.error('Forgot Password Error:', error);
            const msg = error.response?.data?.msg || 'Failed to send verification code';
            setLoginError(msg);
            setShakeTrigger(prev => prev + 1);
            setView('forgot'); // Stay on forgot view if error
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/verify-otp`, { 
                email: resetData.email, 
                otp: resetData.otp 
            });
            if (response.data.status === 'success') {
                setView('reset');
                setOtpError('');
                setLoginError('');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            const msg = error.response?.data?.msg || 'Invalid OTP. Please check the code.';
            setOtpError(msg);
            setShakeTrigger(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (resetData.password !== resetData.confirmPassword) {
            setPasswordError('Passwords do not match');
            setShakeTrigger(prev => prev + 1);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                email: resetData.email,
                otp: resetData.otp,
                newPassword: resetData.password
            });

            if (response.status === 200) {
                setSuccessMsg('Password Reset Successfully! Please login with your new password.');
                setView('login');
                // Clear reset data
                setResetData({ email: '', otp: '', password: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            const msg = error.response?.data?.msg || 'Failed to reset password';
            setPasswordError(msg);
            setShakeTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="v-login-container" ref={vantaRef}>
            <div className={`v-login-card ${view === 'reset' ? 'v-register-mode' : ''}`}>
                <div className="v-login-brand">
                    <i className="bi bi-shop"></i>
                    <span>VENDOR PORTAL</span>
                </div>

                {view === 'login' && (
                    <>
                        <h2 className="v-login-title">Partner Login</h2>
                        <p className="v-login-subtitle">Manage your venue and bookings with ease</p>

                        {successMsg && (
                            <div className="d-flex align-items-center gap-2 mb-3 justify-content-center" style={{ color: '#4ade80', fontSize: '0.9rem' }}>
                                <i className="bi bi-check-circle-fill"></i>
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="v-login-form">
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="vendor@example.com"
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
                                        placeholder="••••••••"
                                    />
                                    <button type="button" className="btn v-password-toggle" onClick={() => setShowPassword(!showPassword)}>
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
                                className="btn btn-primary v-login-btn mt-2"
                            >
                                Sign In
                            </button>

                            {loginError && (
                                <div key={shakeTrigger} className="animate-shake d-flex align-items-center justify-content-center gap-2 mt-3" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    <span>{loginError}</span>
                                </div>
                            )}

                            <div className="text-center mt-4">
                                <button type="button" onClick={() => navigate('/vendor/register')} className="btn btn-link text-decoration-none" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    Don't have an account? <span className="text-danger fw-bold">Register Now</span>
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'forgot' && (
                    <>
                        <h2 className="v-login-title">Reset Password</h2>
                        <p className="v-login-subtitle">Enter your email to receive an OTP</p>
                        <form onSubmit={handleSendOTP} className="v-login-form">
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={resetData.email}
                                    onChange={handleResetChange}
                                    required
                                    placeholder="vendor@example.com"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary v-login-btn" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                            <div className="text-center mt-3">
                                <button type="button" onClick={() => setView('login')} className="btn btn-link text-muted text-decoration-none">Back to Login</button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'otp' && (
                    <>
                        <h2 className="v-login-title">Enter OTP</h2>
                        <p className="v-login-subtitle">We sent a 6-digit code to {resetData.email}</p>
                        <form onSubmit={handleVerifyOTP} className="v-login-form">
                            <div className="mb-4 d-flex justify-content-center gap-2">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        className="form-control text-center v-otp-box"
                                        maxLength={1}
                                        value={resetData.otp[index] || ''}
                                        onChange={(e) => handleOtpBoxChange(e.target, index)}
                                        onKeyDown={(e) => handleOtpBoxKeyDown(e, index)}
                                        onFocus={e => e.target.select()}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        required
                                    />
                                ))}
                            </div>

                            {otpError && (
                                <div key={shakeTrigger} className="animate-shake d-flex align-items-center justify-content-center gap-2 mb-3" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span>{otpError}</span>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary v-login-btn" disabled={isLoading || resetData.otp.length !== 6}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                            <div className="text-center mt-3 d-flex flex-column gap-2">
                                <button type="button" onClick={handleSendOTP} className="btn btn-link text-muted text-decoration-none small" disabled={isLoading}>
                                    Resend Code
                                </button>
                                <button type="button" onClick={() => setView('login')} className="btn btn-link text-muted text-decoration-none small">
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'reset' && (
                    <>
                        <h2 className="v-login-title">New Password</h2>
                        <p className="v-login-subtitle">Create a strong password for your account</p>
                        <form onSubmit={handleResetPassword} className="v-login-form">
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
                                    <button type="button" className="btn v-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
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
                                    <button type="button" className="btn v-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                                {passwordError && (
                                    <div key={shakeTrigger} className="animate-shake d-flex align-items-center gap-2 mt-2" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                        <i className="bi bi-exclamation-circle"></i>
                                        <span>{passwordError}</span>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary v-login-btn">Reset Password</button>
                            <div className="text-center mt-3">
                                <button type="button" onClick={() => setView('login')} className="btn btn-link text-muted text-decoration-none small">Back to Login</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default VendorLogin;
