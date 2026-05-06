import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiAlertCircle, FiArrowLeft, FiMapPin, FiFileText, FiEye, FiEyeOff } from 'react-icons/fi';
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
                <div className="vr-nav-brand">MEHFIL ONE</div>
                <button onClick={() => navigate('/')} className="vr-nav-btn">
                    Home
                </button>
            </nav>

            <div className="vr-content-wrapper">
                <div className="sa-login-card vr-card-wide" style={{ maxWidth: view === 'login' ? '480px' : '850px' }}>
                    <h2 className="sa-login-title">{view === 'login' ? 'User Login' : 'User Registration'}</h2>
                    
                    <p className="text-center text-muted mb-4" style={{marginTop: '-1.5rem'}}>
                        {view === 'login' ? 'Welcome back! Please enter your details.' : 'Join Mehfil One and start booking venues.'}
                    </p>

                    {error && <div className="user-auth-alert error"><FiAlertCircle /> {error}</div>}
                    {successMsg && <div className="user-auth-alert success"><FiAlertCircle /> {successMsg}</div>}

                    <form className="sa-login-form" onSubmit={handleSubmit}>
                        {view === 'register' ? (
                            <>
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
                                        <div className="sa-password-strength mt-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Use 8+ characters</span>
                                                <span className={`small fw-bold ${passwordStrength >= 3 ? 'text-success' : passwordStrength >= 2 ? 'text-warning' : 'text-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                    {passwordStrength >= 3 ? 'Strong' : passwordStrength >= 2 ? 'Medium' : passwordStrength > 0 ? 'Weak' : ''}
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '4px', background: '#f1f5f9' }}>
                                                <div 
                                                    className={`progress-bar ${passwordStrength >= 3 ? 'bg-success' : passwordStrength >= 2 ? 'bg-warning' : 'bg-danger'}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${(passwordStrength / 4) * 100}%`, transition: 'width 0.3s' }}
                                                ></div>
                                            </div>
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

                                {otpStep && (
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <div className="p-4 rounded-4 border-2 border-danger border-dashed bg-light text-center">
                                                <label className="form-label d-block mb-3">Enter 6-Digit OTP sent to your Email</label>
                                                <div className="position-relative d-inline-block w-100" style={{ maxWidth: '300px' }}>
                                                    <FiLock className="input-icon-left" />
                                                    <input 
                                                        type="text" 
                                                        name="otp" 
                                                        className="form-control ps-5 text-center fw-bold" 
                                                        style={{ letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                                                        placeholder="000000" 
                                                        maxLength="6"
                                                        value={formData.otp} 
                                                        onChange={handleChange} 
                                                        required 
                                                    />
                                                </div>
                                                <p className="mt-3 small text-muted">
                                                    Didn't receive OTP? <span className="text-danger fw-bold" style={{cursor:'pointer'}} onClick={() => setOtpStep(false)}>Click here to retry</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                </div>
                            </>
                        )}

                        <div className="row justify-content-center mt-2">
                            <div className={view === 'login' ? 'col-md-12' : 'col-md-4'}>
                                <button type="submit" className="sa-login-btn w-100" disabled={loading}>
                                    {loading ? 'Processing...' : view === 'login' ? 'Login' : otpStep ? 'Verify & Create Account' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="user-auth-footer mt-4 text-center">
                        {view === 'login' ? (
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
