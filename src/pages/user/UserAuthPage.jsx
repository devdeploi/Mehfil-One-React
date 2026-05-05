import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiAlertCircle, FiArrowLeft, FiMapPin, FiFileText, FiEye, FiEyeOff } from 'react-icons/fi';
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
        proofDocument: null
    });
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
            if (formData.password !== formData.confirmPassword) {
                return setError('Passwords do not match');
            }
            if (!formData.proofDocument) {
                return setError('Identity proof document is required');
            }

            try {
                setLoading(true);
                const data = new FormData();
                data.append('fullName', formData.fullName);
                data.append('email', formData.email);
                data.append('phone', formData.phone);
                data.append('password', formData.password);
                data.append('address', formData.address);
                data.append('city', formData.city);
                data.append('proofDocument', formData.proofDocument);

                const res = await axios.post('http://localhost:5000/api/auth/register-user', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                setSuccessMsg('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/user/login');
                    window.location.reload();
                }, 2000);
            } catch (err) {
                setError(err.response?.data?.msg || 'Registration failed');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                const res = await axios.post('http://localhost:5000/api/auth/login-user', {
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
                <div className="sa-login-card vr-card-wide" style={{ maxWidth: '850px' }}>
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

                                <div className="row">
                                    <div className="col-md-12 mb-4">
                                        <label className="form-label">ID Proof (PDF/Image)</label>
                                        <div className="form-control p-2 bg-light d-flex align-items-center" style={{ height: '50px' }}>
                                            <FiFileText className="text-muted me-2 ms-1" />
                                            <input 
                                                type="file" 
                                                name="proofDocument" 
                                                className="border-0 bg-transparent w-100"
                                                onChange={handleChange} 
                                                required 
                                                accept=".pdf,image/*"
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="row justify-content-center">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email Address</label>
                                    <div className="position-relative">
                                        <FiMail className="input-icon-left" />
                                        <input type="email" name="email" className="form-control ps-5" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
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
                            </div>
                        )}

                        <div className="row justify-content-center mt-2">
                            <div className={view === 'login' ? 'col-md-6' : 'col-md-4'}>
                                <button type="submit" className="sa-login-btn w-100" disabled={loading}>
                                    {loading ? 'Processing...' : view === 'login' ? 'Login' : 'Create Account'}
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
