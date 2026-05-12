import React from 'react';
import { FiUserPlus, FiMapPin, FiShield, FiTrendingUp } from 'react-icons/fi';

const HowItWorks = ({ flowRef }) => {
    const steps = [
        {
            number: "01",
            icon: <FiUserPlus size={28} />,
            title: "Register",
            description: "Sign up as a vendor and complete your profile with your business details in minutes.",
            color: "#dc3545",
        },
        {
            number: "02",
            icon: <FiMapPin size={28} />,
            title: "List Your Mahal",
            description: "Showcase your venue with high-resolution images, pricing details, and amenities.",
            color: "#e85d6b",
        },
        {
            number: "03",
            icon: <FiShield size={28} />,
            title: "Get Verified",
            description: "Receive a trusted badge to attract premium clients and increase your visibility.",
            color: "#f07080",
        },
        {
            number: "04",
            icon: <FiTrendingUp size={28} />,
            title: "Manage & Grow",
            description: "Handle all bookings from one smart dashboard and watch your business thrive.",
            color: "#f8a1ab",
        }
    ];

    return (
        <section ref={flowRef} style={{
            background: 'linear-gradient(160deg, #fff5f5 0%, #fff 50%, #fff0f1 100%)',
            padding: '100px 0',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background decorative orbs */}
            <div style={{
                position: 'absolute', top: '-120px', left: '-120px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,53,69,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-100px', right: '-100px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,53,69,0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div className="container position-relative">
                {/* Section Header */}
                <div className="text-center mb-5 pb-3">
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: '#dc3545',
                        background: 'rgba(220,53,69,0.08)',
                        padding: '6px 20px', borderRadius: '999px',
                        marginBottom: '20px',
                        border: '1px solid rgba(220,53,69,0.15)'
                    }}>
                        HOW IT WORKS
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 800,
                        color: '#111111',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.15,
                        marginBottom: '16px'
                    }}>
                        Your Path to <span style={{ color: '#dc3545' }}>Success</span>
                    </h2>
                    <p style={{
                        color: '#666',
                        fontSize: '1rem',
                        maxWidth: '480px',
                        margin: '0 auto',
                        lineHeight: 1.8
                    }}>
                        A simple way to list and grow your Mahal business on Mehfil One.
                    </p>
                </div>

                {/* Steps */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0',
                    maxWidth: '820px',
                    margin: '0 auto',
                    position: 'relative',
                }}>
                    {/* Vertical connecting line */}
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        bottom: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '2px',
                        background: 'linear-gradient(to bottom, rgba(220,53,69,0.2), rgba(220,53,69,0.05))',
                        zIndex: 0,
                    }} />

                    {steps.map((step, index) => {
                        const isLeft = index % 2 === 0;
                        return (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                flexDirection: isLeft ? 'row' : 'row-reverse',
                                gap: '0',
                                marginBottom: index < steps.length - 1 ? '0' : '0',
                                position: 'relative',
                                zIndex: 1,
                                paddingBottom: index < steps.length - 1 ? '30px' : '0',
                            }}>
                                {/* Card */}
                                <div className="flow-step-card" style={{
                                    flex: 1,
                                    maxWidth: '340px',
                                    background: '#ffffff',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(220,53,69,0.12)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    marginLeft: isLeft ? '0' : 'auto',
                                    marginRight: isLeft ? 'auto' : '0',
                                    transition: 'all 0.4s ease',
                                    cursor: 'default',
                                    boxShadow: '0 8px 32px rgba(220,53,69,0.08)',
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        marginBottom: '14px',
                                    }}>
                                        <div style={{
                                            width: '52px', height: '52px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #dc3545, #8b1a26)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: '0 6px 20px rgba(220,53,69,0.35)',
                                            flexShrink: 0,
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.6rem', fontWeight: 800,
                                                letterSpacing: '0.2em', color: 'rgba(180,30,46,0.5)',
                                                textTransform: 'uppercase', marginBottom: '2px'
                                            }}>
                                                STEP {step.number}
                                            </div>
                                            <h4 style={{
                                                margin: 0, fontSize: '1.15rem',
                                                fontWeight: 800, color: '#111111',
                                                letterSpacing: '-0.01em',
                                            }}>
                                                {step.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.75,
                                        margin: 0,
                                    }}>
                                        {step.description}
                                    </p>
                                </div>

                                {/* Center Node */}
                                <div style={{
                                    width: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    position: 'relative',
                                    zIndex: 2,
                                }}>
                                    <div style={{
                                        width: '20px', height: '20px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #dc3545, #ff6b7a)',
                                        boxShadow: '0 0 0 5px rgba(220,53,69,0.12), 0 0 0 10px rgba(220,53,69,0.05)',
                                        border: '3px solid white',
                                    }} />
                                </div>

                                {/* Spacer on the other side */}
                                <div style={{ flex: 1, maxWidth: '340px' }} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .flow-step-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(220,53,69,0.35) !important;
                    box-shadow: 0 20px 48px rgba(220,53,69,0.15) !important;
                }

                @media (max-width: 768px) {
                    .flow-step-card {
                        max-width: 100% !important;
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default HowItWorks;
