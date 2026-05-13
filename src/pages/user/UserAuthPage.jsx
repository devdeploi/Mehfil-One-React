import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiAlertCircle, FiArrowLeft, FiMapPin, FiFileText, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { API_URL } from '../../utils/function';
import './UserAuthPage.css';

const UserAuthPage = ({ defaultView = 'login' }) => {
    const navigate = useNavigate();
    const [view, setView] = useState(defaultView);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        otp: ''
    });
    const [otpStep, setOtpStep] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setView(defaultView);
        setError('');
        setSuccessMsg('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setOtpStep(false);
        setOtpArray(['', '', '', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));
    }, [defaultView]);

    const calculateStrength = (password) => {
        let strength = 0;
        if (!password) return 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8 && /\d/.test(password)) strength += 1;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[!@#$%^&*]/.test(password)) strength += 1;
        return strength + 1;
    };

    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otpArray];
        newOtp[index] = value.substring(value.length - 1);
        setOtpArray(newOtp);
        setFormData({ ...formData, otp: newOtp.join('') });

        // Auto focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
            if (name === 'password') {
                setPasswordStrength(value ? calculateStrength(value) : 0);
            }
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (view === 'register') {
            // First step: Send OTP
            if (formData.password !== formData.confirmPassword) {
                return setError('Passwords do not match');
            }
            try {
                setLoading(true);
                const baseUrl = API_URL.replace('/api', '');
                await axios.post(`${baseUrl}/api/auth/send-otp`, {
                    email: formData.email,
                    phone: formData.phone
                });
                
                // Navigate to the verification page with form data
                navigate('/user/verify-otp', { state: { formData } });
            } catch (err) {
                console.error('Registration OTP Error:', err);
                setError(err.response?.data?.msg || 'Failed to send OTP. Please check your connection.');
            } finally {
                setLoading(false);
            }
        } else if (view === 'forgot') {
            try {
                setLoading(true);
                await axios.post(`${API_URL}/auth/forgot-password`, { email: formData.email });
                setSuccessMsg('OTP sent to your email');
                setView('verify-reset');
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        } else if (view === 'verify-reset') {
            try {
                setLoading(true);
                await axios.post(`${API_URL}/auth/verify-otp`, { 
                    email: formData.email, 
                    otp: formData.otp 
                });
                setSuccessMsg('OTP verified! Now create your new password.');
                setView('reset');
            } catch (err) {
                setError(err.response?.data?.msg || 'Invalid OTP');
            } finally {
                setLoading(false);
            }
        } else if (view === 'reset') {
            if (formData.password !== formData.confirmPassword) {
                return setError('Passwords do not match');
            }
            try {
                setLoading(true);
                await axios.post(`${API_URL}/auth/reset-password`, { 
                    email: formData.email, 
                    otp: formData.otp, 
                    newPassword: formData.password 
                });
                setSuccessMsg('Password reset successful! redirecting to login...');
                setTimeout(() => setView('login'), 2000);
            } catch (err) {
                setError(err.response?.data?.msg || 'Password reset failed');
            } finally {
                setLoading(false);
            }
        } else {
            // Login flow remains same
            try {
                setLoading(true);
                const baseUrl = API_URL.replace('/api', '');
                const res = await axios.post(`${baseUrl}/api/auth/login-user`, {
                    email: formData.email,
                    password: formData.password
                });
                
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                setSuccessMsg('Login successful!');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } catch (err) {
                setError(err.response?.data?.msg || 'Login failed');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="vr-page-container">
            {/* Navbar */}
            <nav className="vr-navbar">
                <div className="container d-flex align-items-center justify-content-between">
                    <div className="nav-left d-flex align-items-center gap-3">
                        <button onClick={() => navigate('/')} className="vr-nav-btn icon-btn">
                            <FiHome />
                        </button>
                        <div className="vr-nav-divider"></div>
                        <span className="vr-nav-title">
                            {view === 'login' ? 'Login' : 
                             view === 'register' ? 'Register' : 'Security'}
                        </span>
                    </div>

                    <div className="vr-nav-brand">MEHFIL <span className="text-red">ONE</span></div>

                    <div className="nav-right">
                        {/* Empty spacer to keep brand centered */}
                        <div style={{width: '40px'}}></div>
                    </div>
                </div>
            </nav>

            <div className="vr-content-wrapper">
                <div className="sa-login-card vr-card-wide" style={{ maxWidth: (view === 'login' || view === 'forgot' || view === 'reset' || view === 'verify-reset') ? '480px' : '850px' }}>
                    <h2 className="sa-login-title">
                        {view === 'login' ? 'User Login' : 
                         view === 'forgot' ? 'Forgot Password' : 
                         view === 'verify-reset' ? 'Verify OTP' :
                         view === 'reset' ? 'New Password' : 'User Registration'}
                    </h2>
                    
                    <p className="text-center text-muted mb-4" style={{marginTop: '-1.5rem'}}>
                        {view === 'login' ? 'Welcome back! Please enter your details.' : 
                         view === 'forgot' ? 'Enter your email to receive an OTP.' : 
                         view === 'verify-reset' ? `Enter the 6-digit code sent to ${formData.email}` :
                         view === 'reset' ? 'Create a new secure password for your account.' : 
                         'Join Mehfil One and start booking venues.'}
                    </p>

                    {error && <div className="user-auth-alert error"><FiAlertCircle /> {error}</div>}
                    {successMsg && <div className="user-auth-alert success"><FiAlertCircle /> {successMsg}</div>}

                    <form className="sa-login-form" onSubmit={handleSubmit}>
                        {view === 'register' ? (
                            <>
                                {/* ... register fields ... */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name</label>
                                        <div className="position-relative">
                                            <FiUser className="input-icon-left" />
                                            <input type="text" name="fullName" className="form-control ps-5" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <div className="position-relative">
                                            <FiPhone className="input-icon-left" />
                                            <input type="tel" name="phone" className="form-control ps-5" placeholder="10-digit mobile" value={formData.phone} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Full Address</label>
                                        <div className="position-relative">
                                            <FiMapPin className="input-icon-left" />
                                            <input type="text" name="address" className="form-control ps-5" placeholder="Building, Street, Area" value={formData.address} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">City</label>
                                        <div className="position-relative">
                                            <FiMapPin className="input-icon-left" />
                                            <input type="text" name="city" className="form-control ps-5" placeholder="City" value={formData.city} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email Address</label>
                                        <div className="position-relative">
                                            <FiMail className="input-icon-left" />
                                            <input type="email" name="email" className="form-control ps-5" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Password</label>
                                        <div className="position-relative">
                                            <FiLock className="input-icon-left" />
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                name="password" 
                                                className="form-control ps-5 pe-5" 
                                                placeholder="••••••••" 
                                                value={formData.password} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="password-toggle-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <div className="position-relative">
                                            <FiLock className="input-icon-left" />
                                            <input 
                                                type={showConfirmPassword ? 'text' : 'password'} 
                                                name="confirmPassword" 
                                                className="form-control ps-5 pe-5" 
                                                placeholder="••••••••" 
                                                value={formData.confirmPassword} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="password-toggle-icon"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : view === 'forgot' ? (
                            <>
                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Enter Email Address</label>
                                        <div className="position-relative">
                                            <FiMail className="input-icon-left" />
                                            <input type="email" name="email" className="form-control ps-5" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="form-text mt-2 text-center">We will send a 6-digit OTP to this email</div>
                                    </div>
                                </div>
                            </>
                        ) : view === 'verify-reset' ? (
                            <>
                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label d-block text-center mb-4">Verification OTP</label>
                                        <div className="d-flex justify-content-center gap-2 mb-4">
                                            {otpArray.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    className="form-control text-center fw-bold"
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '60px', 
                                                        fontSize: '1.5rem', 
                                                        borderRadius: '12px',
                                                        border: '2px solid #e2e8f0',
                                                        background: '#f8fafc'
                                                    }}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                    maxLength="1"
                                                    autoComplete="off"
                                                />
                                            ))}
                                        </div>
                                        <div className="form-text mt-2 text-center text-muted">Please enter the 6-digit code sent to your email</div>
                                    </div>
                                </div>
                            </>
                        ) : view === 'reset' ? (
                            <>
                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">New Password</label>
                                        <div className="position-relative">
                                            <FiLock className="input-icon-left" />
                                            <input type={showPassword ? 'text' : 'password'} name="password" className="form-control ps-5 pe-5" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                            <button type="button" className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
                                        </div>
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <div className="position-relative">
                                            <FiLock className="input-icon-left" />
                                            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className="form-control ps-5 pe-5" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                                            <button type="button" className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Email Address</label>
                                        <div className="position-relative">
                                            <FiMail className="input-icon-left" />
                                            <input type="email" name="email" className="form-control ps-5" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Password</label>
                                        <div className="position-relative">
                                            <FiLock className="input-icon-left" />
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                name="password" 
                                                className="form-control ps-5 pe-5" 
                                                placeholder="••••••••" 
                                                value={formData.password} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="password-toggle-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-12 text-end mb-2">
                                        <span 
                                            className="text-danger small fw-bold" 
                                            style={{cursor:'pointer', fontSize: '0.8rem'}}
                                            onClick={() => setView('forgot')}
                                        >
                                            Forgot Password?
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="mt-4">
                            <button type="submit" className="sa-login-btn" disabled={loading}>
                                {loading ? 'Processing...' : 
                                 view === 'forgot' ? 'Send Reset OTP' : 
                                 view === 'verify-reset' ? 'Verify OTP' :
                                 view === 'reset' ? 'Update Password' : 
                                 view === 'login' ? 'Login' : 
                                 otpStep ? 'Verify & Create Account' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="user-auth-footer mt-4 text-center">
                        {view === 'forgot' || view === 'reset' ? (
                            <p className="text-muted">Remember your password? <span className="text-danger fw-bold" style={{cursor:'pointer'}} onClick={() => setView('login')}>Back to Login</span></p>
                        ) : view === 'login' ? (
                            <p className="text-muted">Don't have an account? <span className="text-danger fw-bold" style={{cursor:'pointer'}} onClick={() => navigate('/user/register')}>Register here</span></p>
                        ) : (
                            <p className="text-muted">Already have an account? <span className="text-danger fw-bold" style={{cursor:'pointer'}} onClick={() => navigate('/user/login')}>Login here</span></p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="vr-footer">
                <div className="vr-footer-brand">MEHFIL ONE</div>
                <div className="vr-footer-right">
                    <span>&copy; {new Date().getFullYear()} Mehfil One. All rights reserved.</span>
                    <span className="vr-footer-sep">|</span>
                    <span onClick={() => navigate('/terms')} style={{cursor:'pointer'}}>Terms</span>
                    <span className="vr-footer-sep">|</span>
                    <span onClick={() => navigate('/policy')} style={{cursor:'pointer'}}>Privacy</span>
                </div>
            </footer>
        </div>
    );
};

export default UserAuthPage;
