import React from 'react';
import '../../styles/superadmin/SuperAdminLogin.css';

const Terms = ({ onBack }) => {
    return (
        <div className="sa-login-container">
            <div className="sa-login-card sa-register-mode" style={{ maxWidth: '800px' }}>
                <div className="d-flex align-items-center mb-4">
                    <h2 className="sa-login-title m-0 text-start w-auto" style={{ background: 'none', WebkitTextFillColor: 'initial', color: '#1e293b' }}>Terms and Conditions</h2>
                </div>

                <p className="text-secondary border-bottom pb-3">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mt-4 text-secondary" style={{ textAlign: 'justify', lineHeight: '1.7' }}>
                    <h4 className="text-dark mt-4 mb-3">1. Introduction</h4>
                    <p>Welcome to Mehfil One. By using our website/service, you agree to these terms. Please read them carefully before registering as a vendor or using our services.</p>

                    <h4 className="text-dark mt-4 mb-3">2. Vendor Obligations</h4>
                    <p>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>

                    <h4 className="text-dark mt-4 mb-3">3. Payments & Subscriptions</h4>
                    <p>All payments are processed securely via Razorpay. Subscription fees are billed in advance on a recurring basis (if applicable) and are non-refundable once processed, as detailed in our Refund Policy. Failure to pay subscription fees may result in the suspension or termination of your account.</p>

                    <h4 className="text-dark mt-4 mb-3">4. Limitation of Liability</h4>
                    <p>Mehfil One shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
