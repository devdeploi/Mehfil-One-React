import React from 'react';

const HowItWorks = ({ flowRef }) => {
    const steps = [
        {
            number: "01",
            title: "Register",
            description: "Sign up as a refined vendor and complete your profile with business details.",
            position: "left"
        },
        {
            number: "02",
            title: "List Venue",
            description: "Showcase your venue with high-resolution imagery and detailed amenity lists.",
            position: "right"
        },
        {
            number: "03",
            title: "Get Verified",
            description: "Gain the trusted badge to attract elite clientele and boost visibility.",
            position: "left"
        },
        {
            number: "04",
            title: "Manage & Grow",
            description: "Control bookings from one dashboard and watch your business thrive.",
            position: "right"
        }
    ];

    return (
        <section className="lp-section lp-section-alt" ref={flowRef}>
            <div className="lp-section-header">
                <h2 className="lp-section-title">Your Path to Success</h2>
                <p className="lp-section-subtitle">A refined journey to get you started with Mehfil One.</p>
            </div>
            <div className="lp-timeline-container">
                <div className="lp-timeline-line"></div>
                {steps.map((step, index) => (
                    <div key={index} className="lp-timeline-item">
                        <div className="lp-timeline-dot"></div>
                        <div className={`lp-timeline-content ${step.position}`}>
                            <span className="lp-timeline-number">{step.number}</span>
                            <h4>{step.title}</h4>
                            <p>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
