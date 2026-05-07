import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeadset, FaBell, FaCheckCircle } from 'react-icons/fa';

const Footer = ({ scrollToSection, refs }) => {
    const navigate = useNavigate();

    return (
        <footer className="lp-footer">
            <div className="lp-footer-container">
                <div className="lp-footer-col brand-col">
                    <div className="lp-brand footer-brand">
                        <i className="bi bi-calendar-check-fill"></i>
                        <span>MEHFIL ONE</span>
                    </div>
                    <p className="lp-footer-desc">
                        The premium solution for venue management.
                        Elevating events, one booking at a time.
                    </p>
                </div>

                <div className="lp-footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li onClick={() => scrollToSection(refs.home)}>Home</li>
                        <li onClick={() => scrollToSection(refs.about)}>About Us</li>
                        <li onClick={() => scrollToSection(refs.plans)}>Pricing</li>
                        <li onClick={() => navigate('/vendor/register')}>Register</li>
                    </ul>
                </div>

                <div className="lp-footer-col">
                    <h4>Resources</h4>
                    <ul>
                        <li>Help Center</li>
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>Vendor Guidelines</li>
                    </ul>
                </div>

                <div className="lp-footer-col">
                    <h4>Contact</h4>
                    <ul>
                        <li><FaHeadset className="footer-icon" /> Support 24/7</li>
                        <li><FaBell className="footer-icon" /> +91 98765 43210</li>
                        <li><FaCheckCircle className="footer-icon" /> support@mehfilone.com</li>
                    </ul>
                </div>
            </div>
            <div className="lp-footer-bottom">
                <p>&copy; {new Date().getFullYear()} Mehfil One. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
