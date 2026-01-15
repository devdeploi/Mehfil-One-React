import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/superadmin/SuperAdminLogin.css';

const Policy = ({ onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="sa-login-container">
            <div className="sa-login-card sa-register-mode" style={{ maxWidth: '800px' }}>
                <div className="d-flex align-items-center mb-4">
                    <button className="btn btn-outline-dark rounded-circle p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleBack}>
                        <FaArrowLeft />
                    </button>
                    <h2 className="sa-login-title m-0 text-start w-auto" style={{ background: 'none', WebkitTextFillColor: 'initial', color: '#1e293b' }}>Communication Policy</h2>
                </div>

                <p className="text-secondary border-bottom pb-3">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mt-4 text-secondary" style={{ textAlign: 'justify', lineHeight: '1.7' }}>
                    <h4 className="text-dark mt-4 mb-3">1. Communication Channels</h4>
                    <p>By registering, you explicitly consent to receive communications from Mehfil One via email, SMS, and WhatsApp regarding your account, updates, security alerts, and support messages.</p>

                    <h4 className="text-dark mt-4 mb-3">2. Promotional Messages</h4>
                    <p>We may send you promotional messages about new features, special offers, and events. You can opt-out of receiving promotional messages at any time by following the unsubscribe instructions provided in those messages.</p>

                    <h4 className="text-dark mt-4 mb-3">3. Privacy & Data Protection</h4>
                    <p>We respect your privacy and protect your data according to industry standards. We do not sell your personal contact information to third parties for marketing purposes without your explicit consent. Please refer to our Privacy Policy for more details on how we handle your data.</p>
                </div>
            </div>
        </div>
    );
};

export default Policy;
