import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from './components/Footer';
import { FiFileText, FiShield, FiHelpCircle, FiSettings, FiGlobe, FiChevronRight } from 'react-icons/fi';
import heroBg from '../../assets/landing/hero-bg-2.png';

const ResourcePage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState(type || 'terms');

    useEffect(() => {
        window.scrollTo(0, 0);
        if (type) setActiveType(type);
    }, [type]);

    const handleNavClick = (newType) => {
        navigate(`/resources/${newType}`);
    };

    const navItems = [
        { id: 'terms', label: 'Terms of Service', icon: <FiFileText /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <FiShield /> },
        { id: 'help-center', label: 'Help Center', icon: <FiHelpCircle /> },
        { id: 'vendor-guidelines', label: 'Vendor Guidelines', icon: <FiSettings /> },
        { id: 'cookies', label: 'Cookie Policy', icon: <FiGlobe /> },
    ];

    const renderContent = () => {
        switch(activeType) {
            case 'terms':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="mb-2 fw-bold" style={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Terms of Service</h2>
                        <p className="text-secondary border-bottom pb-4 mb-4" style={{ fontSize: '0.9rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
                        <div className="text-secondary" style={{ textAlign: 'justify', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">1. Introduction</h4>
                            <p>Welcome to Mehfil One. By using our website/service, you agree to these terms. Please read them carefully before registering as a vendor or using our services.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">2. Vendor Obligations</h4>
                            <p>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">3. Payments & Subscriptions</h4>
                            <p>All payments are processed securely via Razorpay. Subscription fees are billed in advance on a recurring basis (if applicable) and are non-refundable once processed, as detailed in our Refund Policy. Failure to pay subscription fees may result in the suspension or termination of your account.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">4. Limitation of Liability</h4>
                            <p>Mehfil One shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="mb-2 fw-bold" style={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Privacy Policy</h2>
                        <p className="text-secondary border-bottom pb-4 mb-4" style={{ fontSize: '0.9rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
                        <div className="text-secondary" style={{ textAlign: 'justify', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">1. Communication Channels</h4>
                            <p>By registering, you explicitly consent to receive communications from Mehfil One via email, SMS, and WhatsApp regarding your account, updates, security alerts, and support messages.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">2. Promotional Messages</h4>
                            <p>We may send you promotional messages about new features, special offers, and events. You can opt-out of receiving promotional messages at any time by following the unsubscribe instructions provided in those messages.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">3. Privacy & Data Protection</h4>
                            <p>We respect your privacy and protect your data according to industry standards. We do not sell your personal contact information to third parties for marketing purposes without your explicit consent.</p>
                        </div>
                    </div>
                );
            case 'help-center':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="mb-2 fw-bold" style={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Help Center</h2>
                        <p className="text-secondary border-bottom pb-4 mb-4" style={{ fontSize: '0.9rem' }}>Find answers to your questions.</p>
                        <div className="text-secondary" style={{ textAlign: 'justify', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            <p>Welcome to the Mehfil One Help Center! Here are some frequently asked questions:</p>
                            <div className="p-4 bg-light rounded-4 my-4 shadow-sm border border-white">
                                <h5 className="text-dark mb-2 fw-bold d-flex align-items-center gap-2"><FiHelpCircle className="text-danger" /> How do I book a venue?</h5>
                                <p className="mb-0">You can search for venues on our homepage, select the dates and shifts you prefer, and submit a booking request. The vendor will get back to you shortly.</p>
                            </div>
                            <div className="p-4 bg-light rounded-4 my-4 shadow-sm border border-white">
                                <h5 className="text-dark mb-2 fw-bold d-flex align-items-center gap-2"><FiHelpCircle className="text-danger" /> Can I cancel my booking?</h5>
                                <p className="mb-0">Cancellations are subject to the vendor's specific policies. Please contact the vendor directly via the messaging feature for cancellation requests.</p>
                            </div>
                            <div className="p-4 bg-light rounded-4 my-4 shadow-sm border border-white">
                                <h5 className="text-dark mb-2 fw-bold d-flex align-items-center gap-2"><FiHelpCircle className="text-danger" /> How do I contact support?</h5>
                                <p className="mb-0">If you face any issues, feel free to email us at support@mehfilone.com or call our 24/7 helpline.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'vendor-guidelines':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="mb-2 fw-bold" style={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Vendor Guidelines</h2>
                        <p className="text-secondary border-bottom pb-4 mb-4" style={{ fontSize: '0.9rem' }}>Best practices for Mehfil One vendors.</p>
                        <div className="text-secondary" style={{ textAlign: 'justify', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">1. Listing Quality</h4>
                            <p>Ensure that all photos provided for your venue are high quality and accurately represent the current state of the property. Clear descriptions help attract more bookings.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">2. Timely Responses</h4>
                            <p>Vendors are expected to respond to customer inquiries and booking requests within 24 hours to maintain a high rating on the platform.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">3. Pricing Transparency</h4>
                            <p>All prices listed must be accurate. Any additional charges (e.g., cleaning fees, catering) should be clearly communicated to the customer before finalizing the booking.</p>
                        </div>
                    </div>
                );
            case 'cookies':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="mb-2 fw-bold" style={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Cookie Policy</h2>
                        <p className="text-secondary border-bottom pb-4 mb-4" style={{ fontSize: '0.9rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
                        <div className="text-secondary" style={{ textAlign: 'justify', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            <p>Mehfil One uses cookies to improve your experience on our site. Cookies are small text files placed on your device to collect standard internet log information and visitor behavior information.</p>
                            <h4 className="text-dark mt-4 mb-3 fw-bold">How we use cookies:</h4>
                            <ul className="list-unstyled ps-3">
                                <li className="mb-2 position-relative"><span className="position-absolute start-0 ms-n3 text-danger">•</span> To keep you signed in.</li>
                                <li className="mb-2 position-relative"><span className="position-absolute start-0 ms-n3 text-danger">•</span> To understand how you use our platform.</li>
                                <li className="mb-2 position-relative"><span className="position-absolute start-0 ms-n3 text-danger">•</span> To securely process payments and session data.</li>
                            </ul>
                            <p className="mt-4">You can set your browser not to accept cookies, but some of our website features may not function properly as a result.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-5 animate-fade-in-up">
                        <h2 className="mb-3 fw-bold" style={{ color: '#1e293b' }}>Page Not Found</h2>
                        <p className="text-secondary">The resource you are looking for does not exist.</p>
                        <button className="btn btn-danger mt-3 px-4 py-2 rounded-pill fw-bold shadow-sm" onClick={() => navigate('/')}>Return to Home</button>
                    </div>
                );
        }
    };

    return (
        <div className="resource-page min-vh-100 d-flex flex-column bg-light font-outfit">
            <Navbar />
            
            {/* Premium Theme Header Section */}
            <div className="pb-5" style={{ 
                paddingTop: '130px', 
                background: `linear-gradient(90deg, rgba(15, 15, 15, 0.85) 0%, rgba(68, 10, 14, 0.85) 40%, rgba(220, 53, 69, 0.85) 100%), url(${heroBg}) center/cover no-repeat`,
                borderBottom: '1px solid rgba(0,0,0,0.05)' 
            }}>
                <div className="container mt-4 text-center position-relative" style={{ zIndex: 1 }}>
                    <h1 className="fw-bold mb-3 text-capitalize text-white" style={{ fontSize: '3rem', letterSpacing: '-0.03em' }}>{activeType ? activeType.replace('-', ' ') : 'Resources'}</h1>
                    <p className="text-white-50 mx-auto" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>Everything you need to know about our policies, guidelines, and support to get the best out of Mehfil One.</p>
                </div>
            </div>

            {/* Content Section with Sidebar */}
            <div className="flex-grow-1 py-5" style={{ background: '#f8f9fa' }}>
                <div className="container">
                    <div className="row g-4 g-lg-5">
                        
                        {/* Sidebar Navigation */}
                        <div className="col-lg-3">
                            <div className="sticky-top" style={{ top: '100px' }}>
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                                    <div className="p-4 bg-light border-bottom">
                                        <h6 className="fw-bold mb-0 text-dark text-uppercase tracking-widest" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>Navigation</h6>
                                    </div>
                                    <div className="p-2">
                                        {navItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavClick(item.id)}
                                                className={`w-100 text-start btn d-flex align-items-center justify-content-between p-3 rounded-3 mb-1 border-0 transition-all ${activeType === item.id ? 'bg-danger text-white shadow-sm' : 'bg-transparent text-secondary hover-bg-light'}`}
                                                style={{ fontWeight: activeType === item.id ? '600' : '500' }}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <span style={{ opacity: activeType === item.id ? 1 : 0.7 }}>{item.icon}</span>
                                                    {item.label}
                                                </div>
                                                {activeType === item.id && <FiChevronRight size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Card */}
                        <div className="col-lg-9">
                            <div className="card border-0 rounded-4 p-4 p-md-5 bg-white" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                {renderContent()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
            <style>{`
                .font-outfit {
                    font-family: 'Outfit', sans-serif;
                }
                .hover-bg-light:hover {
                    background-color: #f8f9fa !important;
                    color: #111 !important;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .tracking-widest {
                    letter-spacing: 0.1em;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default ResourcePage;
