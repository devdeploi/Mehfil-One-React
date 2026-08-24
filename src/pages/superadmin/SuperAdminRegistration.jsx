import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/superadmin/SuperAdminLogin.css'; // Reusing Login styles for consistency
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import { generateAdminLoginUrl } from '../../utils/function';

const SuperAdminRegistration = () => {
    const { toast, showToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        address: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') {
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData({ ...formData, [name]: alphabetsOnly });
        } else if (name === 'mobile') {
            const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numbersOnly });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        // Dummy Registration Logic
        showToast('Registration Successful! Please Login.', 'success');
        setTimeout(() => navigate(generateAdminLoginUrl()), 1500);
    };

    return (
        <div className="sa-login-container">
            <Toast toast={toast} />
            <div className="sa-login-card">
                <div className="sa-login-brand">
                    <img src="/Mehfil_One.png" alt="Mehfil One Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', WebkitTextFillColor: 'initial', background: 'none' }} />
                    <span>SUPER ADMIN</span>
                </div>
                <h2 className="sa-login-title">Admin Sign Up</h2>
                <p className="sa-login-subtitle">Register a new system administrator account</p>

                <form onSubmit={handleRegister} className="sa-login-form">
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            className="form-control"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            className="form-control"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                            name="address"
                            className="form-control"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows="3"
                            placeholder="Enter your full address"
                        ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary sa-login-btn">Register</button>

                    <div className="text-center mt-4">
                        <Link to={generateAdminLoginUrl()} className="text-decoration-none text-light opacity-75 hover-opacity-100" style={{ fontSize: '0.9rem', transition: 'opacity 0.2s' }}>
                            Already have an account? <span className="text-warning fw-bold">Login</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminRegistration;
