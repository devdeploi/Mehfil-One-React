import React from 'react';
import { FiUserPlus, FiMapPin, FiShield, FiTrendingUp } from 'react-icons/fi';

const steps = [
    {
        number: '01',
        icon: <FiUserPlus size={26} />,
        title: 'Register',
        description: 'Sign up as a vendor and complete your profile with your business details in minutes.',
    },
    {
        number: '02',
        icon: <FiMapPin size={26} />,
        title: 'List Your Mahal',
        description: 'Showcase your venue with high-resolution images, pricing details, and amenities.',
    },
    {
        number: '03',
        icon: <FiShield size={26} />,
        title: 'Get Verified',
        description: 'Receive a trusted badge to attract premium clients and increase your visibility.',
    },
    {
        number: '04',
        icon: <FiTrendingUp size={26} />,
        title: 'Manage & Grow',
        description: 'Handle all bookings from one smart dashboard and watch your business thrive.',
    },
];

const HowItWorks = ({ flowRef }) => {
    return (
        <section ref={flowRef} className="hiw-section">
            {/* Background blobs */}
            <div className="hiw-blob hiw-blob-tl" />
            <div className="hiw-blob hiw-blob-br" />

            <div className="hiw-container">
                {/* Header */}
                <div className="hiw-header">
                    <span className="hiw-pill">HOW IT WORKS</span>
                    <h2 className="hiw-title">
                        Your Path to <span className="hiw-accent">Success</span>
                    </h2>
                    <p className="hiw-subtitle">
                        A simple four-step journey to list and grow your Mahal business on Mehfil One.
                    </p>
                </div>

                {/* Steps */}
                <div className="hiw-steps">
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            <div className="hiw-step">
                                {/* Ghost number */}
                                <span className="hiw-ghost-number">{step.number}</span>

                                {/* Icon circle */}
                                <div className="hiw-icon-wrap">
                                    <div className="hiw-icon-ring" />
                                    <div className="hiw-icon">{step.icon}</div>
                                </div>

                                {/* Step label */}
                                <div className="hiw-step-label">STEP {step.number}</div>

                                {/* Card */}
                                <div className="hiw-card">
                                    <h3 className="hiw-card-title">{step.title}</h3>
                                    <p className="hiw-card-desc">{step.description}</p>
                                </div>
                            </div>

                            {/* Connector */}
                            {i < steps.length - 1 && (
                                <div className="hiw-connector">
                                    <div className="hiw-connector-line" />
                                    <div className="hiw-connector-arrow">›</div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <style>{`
                .hiw-section {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(160deg, #fff5f5 0%, #ffffff 55%, #fff0f1 100%);
                    padding: 110px 5%;
                    font-family: 'Outfit', sans-serif;
                }

                /* ── Blobs ── */
                .hiw-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .hiw-blob-tl {
                    width: 560px; height: 560px;
                    top: -160px; left: -160px;
                    background: radial-gradient(circle, rgba(220,53,69,0.07) 0%, transparent 70%);
                }
                .hiw-blob-br {
                    width: 420px; height: 420px;
                    bottom: -120px; right: -120px;
                    background: radial-gradient(circle, rgba(220,53,69,0.05) 0%, transparent 70%);
                }

                /* ── Container ── */
                .hiw-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                /* ── Header ── */
                .hiw-header {
                    text-align: center;
                    margin-bottom: 72px;
                }
                .hiw-pill {
                    display: inline-block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #dc3545;
                    background: rgba(220,53,69,0.08);
                    border: 1px solid rgba(220,53,69,0.18);
                    padding: 6px 20px;
                    border-radius: 999px;
                    margin-bottom: 20px;
                }
                .hiw-title {
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 800;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    margin-bottom: 14px;
                }
                .hiw-accent { color: #dc3545; }
                .hiw-subtitle {
                    color: #666;
                    font-size: 1rem;
                    max-width: 480px;
                    margin: 0 auto;
                    line-height: 1.8;
                }

                /* ── Steps row ── */
                .hiw-steps {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 0;
                }

                /* ── Single step ── */
                .hiw-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    flex: 1;
                    max-width: 240px;
                    text-align: center;
                }

                /* Ghost number behind icon */
                .hiw-ghost-number {
                    position: absolute;
                    top: -18px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 5.5rem;
                    font-weight: 900;
                    color: rgba(220,53,69,0.06);
                    line-height: 1;
                    pointer-events: none;
                    user-select: none;
                    letter-spacing: -0.04em;
                }

                /* Icon */
                .hiw-icon-wrap {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    margin-bottom: 16px;
                    flex-shrink: 0;
                }
                .hiw-icon-ring {
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    border: 2px dashed rgba(220,53,69,0.25);
                    animation: hiw-spin 12s linear infinite;
                }
                @keyframes hiw-spin {
                    to { transform: rotate(360deg); }
                }
                .hiw-icon {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #dc3545 0%, #a51020 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 8px 28px rgba(220,53,69,0.35);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hiw-step:hover .hiw-icon {
                    transform: scale(1.1);
                    box-shadow: 0 14px 36px rgba(220,53,69,0.45);
                }

                /* Step label */
                .hiw-step-label {
                    font-size: 0.6rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    color: rgba(180,30,46,0.55);
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                /* Card */
                .hiw-card {
                    background: #ffffff;
                    border: 1px solid rgba(220,53,69,0.12);
                    border-radius: 20px;
                    padding: 22px 20px;
                    box-shadow: 0 8px 32px rgba(220,53,69,0.07);
                    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
                    width: 100%;
                }
                .hiw-step:hover .hiw-card {
                    transform: translateY(-6px);
                    border-color: rgba(220,53,69,0.3);
                    box-shadow: 0 20px 48px rgba(220,53,69,0.14);
                }
                .hiw-card-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #111;
                    margin: 0 0 8px;
                    letter-spacing: -0.01em;
                }
                .hiw-card-desc {
                    font-size: 0.85rem;
                    color: #666;
                    line-height: 1.75;
                    margin: 0;
                }

                /* ── Connector ── */
                .hiw-connector {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: 34px;      /* aligns with icon center */
                    flex-shrink: 0;
                    width: 48px;
                    position: relative;
                }
                .hiw-connector-line {
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, rgba(220,53,69,0.35), rgba(220,53,69,0.1));
                    position: relative;
                    overflow: hidden;
                }
                .hiw-connector-line::after {
                    content: '';
                    position: absolute;
                    left: -100%;
                    top: 0;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(220,53,69,0.7), transparent);
                    animation: hiw-shimmer 2.4s ease-in-out infinite;
                }
                @keyframes hiw-shimmer {
                    0%   { left: -60%; }
                    100% { left: 120%; }
                }
                .hiw-connector-arrow {
                    font-size: 1.1rem;
                    color: rgba(220,53,69,0.45);
                    line-height: 1;
                    margin-top: 2px;
                }

                /* ── Responsive ── */
                @media (max-width: 900px) {
                    .hiw-steps {
                        flex-direction: column;
                        align-items: center;
                        gap: 0;
                    }
                    .hiw-step {
                        max-width: 480px;
                        width: 100%;
                        flex-direction: row;
                        text-align: left;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .hiw-ghost-number {
                        display: none;
                    }
                    .hiw-icon-wrap {
                        flex-shrink: 0;
                        margin-bottom: 0;
                        margin-top: 4px;
                    }
                    .hiw-step-label {
                        margin-bottom: 4px;
                    }
                    .hiw-card {
                        border-radius: 16px;
                    }
                    .hiw-connector {
                        flex-direction: row;
                        width: 100%;
                        max-width: 480px;
                        padding-top: 0;
                        padding-left: 46px;
                        height: 36px;
                        align-items: center;
                    }
                    .hiw-connector-line {
                        width: 2px;
                        height: 100%;
                        background: linear-gradient(180deg, rgba(220,53,69,0.35), rgba(220,53,69,0.1));
                    }
                    .hiw-connector-line::after {
                        width: 100%;
                        height: 60%;
                        left: 0;
                        top: -60%;
                        background: linear-gradient(180deg, transparent, rgba(220,53,69,0.7), transparent);
                        animation: hiw-shimmer-v 2.4s ease-in-out infinite;
                    }
                    @keyframes hiw-shimmer-v {
                        0%   { top: -60%; }
                        100% { top: 120%; }
                    }
                    .hiw-connector-arrow {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .hiw-section {
                        padding: 72px 5%;
                    }
                    .hiw-header {
                        margin-bottom: 48px;
                    }
                    .hiw-step {
                        gap: 14px;
                    }
                    .hiw-card {
                        padding: 18px 16px;
                    }
                }
            `}</style>
        </section>
    );
};

export default HowItWorks;
