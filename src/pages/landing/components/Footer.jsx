import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeadset, FaBell, FaEnvelope, FaInstagram, FaTwitter, FaLinkedin, FaFacebook, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import { HiCalendar } from 'react-icons/hi';

const Footer = ({ scrollToSection, refs }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) { setSubscribed(true); setEmail(''); }
    };

    const year = new Date().getFullYear();

    return (
        <footer className="ft-footer">
            {/* Top wave divider */}
            <div className="ft-wave">
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#0f172a" />
                </svg>
            </div>

            <div className="ft-body">
                {/* ── Main Grid ── */}
                <div className="ft-grid">
                    {/* Brand col */}
                    <div className="ft-brand-col">
                        <div className="ft-logo">
                            <div className="ft-logo-icon">
                                <HiCalendar size={22} />
                            </div>
                            <span className="ft-logo-text">MEHFIL ONE</span>
                        </div>
                        <p className="ft-tagline">
                            The premium solution for venue management. Elevating events, one booking at a time.
                        </p>

                        {/* Social icons */}
                        <div className="ft-socials">
                            {[
                                { icon: <FaInstagram />, label: 'Instagram' },
                                { icon: <FaTwitter />,   label: 'Twitter'   },
                                { icon: <FaLinkedin />,  label: 'LinkedIn'  },
                                { icon: <FaFacebook />,  label: 'Facebook'  },
                            ].map(({ icon, label }) => (
                                <button key={label} className="ft-social-btn" aria-label={label}>
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="ft-col">
                        <h4 className="ft-col-title">Quick Links</h4>
                        <ul className="ft-links">
                            <li onClick={() => scrollToSection(refs.home)}>Home</li>
                            <li onClick={() => scrollToSection(refs.about)}>Features</li>
                            <li onClick={() => scrollToSection(refs.plans)}>Pricing</li>
                            <li onClick={() => navigate('/vendor/register')}>Register</li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="ft-col">
                        <h4 className="ft-col-title">Resources</h4>
                        <ul className="ft-links">
                            <li>Help Center</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Vendor Guidelines</li>
                        </ul>
                    </div>

                    {/* Contact + Newsletter */}
                    <div className="ft-col">
                        <h4 className="ft-col-title">Get in Touch</h4>
                        <ul className="ft-contact-list">
                            <li><span className="ft-contact-icon"><FaHeadset /></span>Support 24/7</li>
                            <li><span className="ft-contact-icon"><FaBell /></span>+91 98765 43210</li>
                            <li><span className="ft-contact-icon"><FaEnvelope /></span>support@mehfilone.com</li>
                            <li><span className="ft-contact-icon"><FaMapMarkerAlt /></span>Mumbai, Maharashtra</li>
                        </ul>

                        {/* Newsletter */}
                        <div className="ft-newsletter">
                            <p className="ft-nl-label">Stay updated</p>
                            {subscribed ? (
                                <div className="ft-nl-success">✓ You're subscribed!</div>
                            ) : (
                                <form className="ft-nl-form" onSubmit={handleSubscribe}>
                                    <input
                                        type="email"
                                        className="ft-nl-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="ft-nl-btn">
                                        <FaArrowRight />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="ft-divider" />

                {/* ── Bottom bar ── */}
                <div className="ft-bottom">
                    <p className="ft-copy">© {year} Mehfil One. All rights reserved.</p>
                    <div className="ft-bottom-links">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Cookies</span>
                    </div>
                </div>
            </div>

            <style>{`
                /* ── Footer wrapper ── */
                .ft-footer {
                    position: relative;
                    font-family: 'Outfit', sans-serif;
                    margin-top: 0;
                }

                /* Wave svg transition into footer */
                .ft-wave {
                    display: block;
                    line-height: 0;
                    overflow: hidden;
                    background: transparent;
                }
                .ft-wave svg {
                    display: block;
                    width: 100%;
                    height: 80px;
                }

                /* Main body */
                .ft-body {
                    background: #0f172a;
                    padding: 60px 5% 40px;
                }

                /* ── Grid ── */
                .ft-grid {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.8fr 1fr 1fr 1.6fr;
                    gap: 48px;
                    margin-bottom: 56px;
                }

                /* Brand col */
                .ft-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .ft-logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 14px rgba(220,53,69,0.4);
                }
                .ft-logo-text {
                    font-size: 1.1rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    color: #ffffff;
                }
                .ft-tagline {
                    color: #94a3b8;
                    font-size: 0.88rem;
                    line-height: 1.8;
                    margin-bottom: 24px;
                    max-width: 280px;
                }

                /* Socials */
                .ft-socials {
                    display: flex;
                    gap: 10px;
                }
                .ft-social-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
                }
                .ft-social-btn:hover {
                    background: rgba(220,53,69,0.15);
                    border-color: rgba(220,53,69,0.3);
                    color: #ff6b7a;
                    transform: translateY(-3px);
                }

                /* Link columns */
                .ft-col-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: #ffffff;
                    margin-bottom: 20px;
                    position: relative;
                    padding-bottom: 12px;
                }
                .ft-col-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 24px;
                    height: 2px;
                    background: linear-gradient(90deg, #dc3545, transparent);
                    border-radius: 2px;
                }

                .ft-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .ft-links li {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: color 0.2s, padding-left 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .ft-links li::before {
                    content: '›';
                    color: #dc3545;
                    font-size: 1rem;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .ft-links li:hover {
                    color: #ffffff;
                    padding-left: 6px;
                }
                .ft-links li:hover::before { opacity: 1; }

                /* Contact list */
                .ft-contact-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .ft-contact-list li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #94a3b8;
                    font-size: 0.88rem;
                }
                .ft-contact-icon {
                    width: 28px;
                    height: 28px;
                    background: rgba(220,53,69,0.12);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #dc3545;
                    font-size: 0.8rem;
                    flex-shrink: 0;
                }

                /* Newsletter */
                .ft-newsletter { margin-top: 4px; }
                .ft-nl-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 10px;
                }
                .ft-nl-form {
                    display: flex;
                    gap: 0;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .ft-nl-input {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    padding: 10px 14px;
                    color: white;
                    font-size: 0.85rem;
                    font-family: 'Outfit', sans-serif;
                    outline: none;
                }
                .ft-nl-input::placeholder { color: #475569; }
                .ft-nl-btn {
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    border: none;
                    padding: 10px 16px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: opacity 0.2s;
                    display: flex;
                    align-items: center;
                }
                .ft-nl-btn:hover { opacity: 0.85; }
                .ft-nl-success {
                    color: #4ade80;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 10px 0;
                }

                /* Divider */
                .ft-divider {
                    max-width: 1200px;
                    margin: 0 auto 28px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                }

                /* Bottom bar */
                .ft-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .ft-copy {
                    color: #475569;
                    font-size: 0.82rem;
                }
                .ft-bottom-links {
                    display: flex;
                    gap: 20px;
                }
                .ft-bottom-links span {
                    color: #475569;
                    font-size: 0.82rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .ft-bottom-links span:hover { color: #dc3545; }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .ft-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 36px;
                    }
                    .ft-brand-col { grid-column: span 2; }
                }

                @media (max-width: 640px) {
                    .ft-wave svg { height: 50px; }
                    .ft-body { padding: 48px 5% 32px; }
                    .ft-grid {
                        grid-template-columns: 1fr;
                        gap: 28px;
                    }
                    .ft-brand-col { grid-column: span 1; }
                    .ft-tagline { max-width: 100%; }
                    .ft-bottom { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
