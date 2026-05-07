import React from 'react';
import { FaUserTie, FaPaintBrush, FaCalendarAlt, FaBell, FaGem, FaShieldAlt, FaChartLine, FaHeadset } from 'react-icons/fa';

const Features = ({ aboutRef }) => {
    const features = [
        {
            icon: <FaUserTie />,
            title: "Vendor Profile",
            description: "Create a stunning digital profile. Showcase your amenities and galleries with high-end presentation."
        },
        {
            icon: <FaPaintBrush />,
            title: "Custom Branding",
            description: "Your brand, your identity. Personalize your venue page with custom themes and logos."
        },
        {
            icon: <FaCalendarAlt />,
            title: "Smart Calendar",
            description: "Effortlessly manage your schedule, block dates, and prevent conflicts with our intelligent system."
        },
        {
            icon: <FaBell />,
            title: "Instant Alerts",
            description: "Stay ahead with real-time SMS and email notifications for every premium inquiry."
        },
        {
            icon: <FaGem />,
            title: "Premium Leads",
            description: "Access a curated list of high-quality leads from verified users to boost your conversion rates."
        },
        {
            icon: <FaShieldAlt />,
            title: "Secure Payments",
            description: "Seamless, secure transaction management to ensure your finances are always protected."
        },
        {
            icon: <FaChartLine />,
            title: "Growth Analytics",
            description: "Unlock deep insights into your earnings and booking trends to drive strategic decisions."
        },
        {
            icon: <FaHeadset />,
            title: "Concierge Support",
            description: "Our dedicated support team is available 24/7 to assist you with priority service."
        }
    ];

    return (
        <section className="lp-section" ref={aboutRef}>
            <div className="lp-section-header">
                <h2 className="lp-section-title">Experience Excellence</h2>
                <p className="lp-section-subtitle">We provide a suite of premium tools designed to elevate your venue business.</p>
            </div>
            <div className="lp-features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="lp-feature-card">
                        <div className="lp-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
