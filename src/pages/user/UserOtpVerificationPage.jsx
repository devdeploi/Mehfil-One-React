import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiRefreshCw, FiClock } from 'react-icons/fi';
import './UserAuthPage.css';
import { API_URL } from '../../utils/function';

const UserOtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    
    const regData = location.state?.formData;
    const baseUrl = API_URL.replace('/api', '');

    useEffect(() => {
        if (!regData || !regData.email) {
            navigate('/user/register');
        }
    }, [regData, navigate]);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        const fullOtp = otp.join('');

        if (fullOtp.length !== 6) {
            return setError('Please enter all 6 digits of the OTP');
        }

        try {
            setLoading(true);
            await axios.post(`${baseUrl}/api/auth/verify-otp`, {
                email: regData.email,
                otp: fullOtp
            });

            await axios.post(`${baseUrl}/api/auth/register-user`, {
                fullName: regData.fullName,
                email: regData.email,
                phone: regData.phone,
                password: regData.password,
                address: regData.address,
                city: regData.city
            });
            
            setSuccessMsg('Email verified successfully! Welcome to Mehfil One.');
            setTimeout(() => navigate('/user/login'), 2000);
        } catch (err) {
            console.error('Verification Error:', err);
            setError(err.response?.data?.msg || 'Invalid OTP. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        try {
            setLoading(true);
            setError('');
            await axios.post(`${baseUrl}/api/auth/send-otp`, {
                email: regData.email,
                phone: regData.phone
            });
            setSuccessMsg('A fresh verification code has been sent.');
            setResendTimer(30);
        } catch (err) {
            setError('Failed to resend OTP. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!regData) return null;

    return (
        <div className="vr-page-container">
            <nav className="vr-navbar">
                <div className="vr-nav-brand">MEHFIL ONE</div>
                <button onClick={() => navigate('/')} className="vr-nav-btn">Home</button>
            </nav>

            <div className="vr-content-wrapper">
                <div className="sa-login-card otp-card-premium" style={{ maxWidth: '500px' }}>
                    <div className="text-center mb-5">
                        <div className="otp-icon-wrapper">
                            <FiMail className="otp-icon-glow" />
                        </div>
                        <h2 className="otp-title mt-4">Account Verification</h2>
                        <p className="otp-subtitle mt-2">
                            Enter the 6-digit code sent to<br/>
                            <span className="text-dark fw-bold">{regData.email}</span>
                        </p>
                    </div>

                    {error && <div className="sa-alert sa-alert-error mb-4"><FiAlertCircle className="me-2" /> {error}</div>}
                    {successMsg && <div className="sa-alert sa-alert-success mb-4"><FiCheckCircle className="me-2" /> {successMsg}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="otp-digit-container mb-5">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    className="otp-digit-input"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    required
                                />
                            ))}
                        </div>

                        <button type="submit" className="sa-login-btn w-100 otp-submit-btn" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Verify & Register'}
                        </button>

                        <div className="text-center mt-4">
                            {resendTimer > 0 ? (
                                <p className="resend-text">
                                    <FiClock className="me-1" /> Resend code in <span className="fw-bold">{resendTimer}s</span>
                                </p>
                            ) : (
                                <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={loading}>
                                    <FiRefreshCw className="me-2" /> Resend Verification Code
                                </button>
                            )}
                        </div>

                        <button 
                            type="button" 
                            className="back-btn mt-5"
                            onClick={() => navigate('/user/register')}
                        >
                            <FiArrowLeft className="me-2" /> Change Email Address
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserOtpVerificationPage;
