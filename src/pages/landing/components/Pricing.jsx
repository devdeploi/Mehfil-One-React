import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimes, FaCrown, FaArrowRight, FaBolt } from 'react-icons/fa';
import { SUBSCRIPTION_PLANS } from '../../../utils/constants';

const Pricing = ({ plansRef }) => {
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <section ref={plansRef} className="pr-section">
            {/* Background blobs */}
            <div className="pr-blob pr-blob-1" />
            <div className="pr-blob pr-blob-2" />
            <div className="pr-blob pr-blob-3" />

            <div className="pr-container">
                {/* Header */}
                <div className="pr-header">
                    <span className="pr-pill">
                        <FaBolt style={{ fontSize: '0.6rem', marginRight: 6 }} />
                        PRICING
                    </span>
                    <h2 className="pr-title">
                        Simple, Transparent <span className="pr-accent">Pricing</span>
                    </h2>
                    <p className="pr-subtitle">
                        Choose the plan that fits your venue business. No hidden charges, ever.
                    </p>
                </div>

                {/* Cards */}
                <div className="pr-cards">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                        const isRec = plan.recommended;
                        const isHov = hoveredId === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`pr-card${isRec ? ' pr-card--featured' : ''}${isHov && !isRec ? ' pr-card--hovered' : ''}`}
                                onMouseEnter={() => setHoveredId(plan.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Glow ring for featured */}
                                {isRec && <div className="pr-glow-ring" />}

                                {/* Badge */}
                                {isRec && (
                                    <div className="pr-badge">
                                        <FaCrown style={{ fontSize: '0.65rem' }} />
                                        Most Popular
                                    </div>
                                )}

                                {/* Plan name */}
                                <div className="pr-plan-label">{plan.name}</div>

                                {/* Price */}
                                <div className="pr-price-row">
                                    <span className="pr-currency">{plan.currency}</span>
                                    <span className="pr-amount">{plan.price.toLocaleString()}</span>
                                    <span className="pr-period">/{plan.period.replace('/', '')}</span>
                                </div>

                                {/* Monthly equivalent */}
                                <div className="pr-monthly">
                                    ≈ {plan.currency}{Math.round(plan.price / 12).toLocaleString()} / month
                                </div>

                                {/* Divider */}
                                <div className={`pr-divider${isRec ? ' pr-divider--featured' : ''}`} />

                                {/* Features */}
                                <ul className="pr-features">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="pr-feature">
                                            <span className={`pr-check${isRec ? ' pr-check--featured' : ''}`}>
                                                <FaCheckCircle />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                    {/* Show locked features for Standard */}
                                    {!isRec && (
                                        <>
                                            {['Advanced Analytics', 'Custom Branding'].map((f, i) => (
                                                <li key={`locked-${i}`} className="pr-feature pr-feature--locked">
                                                    <span className="pr-cross"><FaTimes /></span>
                                                    {f}
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </ul>

                                {/* CTA */}
                                <button
                                    className={`pr-btn${isRec ? ' pr-btn--featured' : ''}`}
                                    onClick={() => navigate('/vendor/register')}
                                >
                                    Get {plan.name}
                                    <FaArrowRight className="pr-btn-arrow" />
                                </button>

                                {/* Guarantee text */}
                                <p className="pr-guarantee">✓ No setup fees · Cancel anytime</p>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom trust bar */}
                <div className="pr-trust">
                    {['Secure Payments', 'Instant Activation', '24/7 Support', '100% Satisfaction'].map((t, i) => (
                        <div key={i} className="pr-trust-item">
                            <span className="pr-trust-dot" />
                            {t}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                /* ── Section ── */
                .pr-section {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(150deg, #fff5f6 0%, #ffffff 50%, #fff0f2 100%);
                    padding: 120px 5%;
                    font-family: 'Outfit', sans-serif;
                }

                /* Blobs */
                .pr-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(80px);
                }
                .pr-blob-1 {
                    width: 600px; height: 600px;
                    top: -200px; left: -150px;
                    background: rgba(220,53,69,0.08);
                }
                .pr-blob-2 {
                    width: 500px; height: 500px;
                    top: -100px; right: -150px;
                    background: rgba(220,53,69,0.06);
                }
                .pr-blob-3 {
                    width: 400px; height: 400px;
                    bottom: -120px; left: 50%;
                    transform: translateX(-50%);
                    background: rgba(220,53,69,0.05);
                }

                /* Container */
                .pr-container {
                    max-width: 900px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                /* Header */
                .pr-header {
                    text-align: center;
                    margin-bottom: 64px;
                }
                .pr-pill {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: #dc3545;
                    background: rgba(220,53,69,0.08);
                    border: 1px solid rgba(220,53,69,0.2);
                    padding: 6px 18px;
                    border-radius: 999px;
                    margin-bottom: 20px;
                }
                .pr-title {
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 800;
                    color: #111111;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    margin: 0 0 14px;
                }
                .pr-accent {
                    background: linear-gradient(135deg, #dc3545, #ff6b7a);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .pr-subtitle {
                    color: #64748b;
                    font-size: 1rem;
                    line-height: 1.8;
                    max-width: 440px;
                    margin: 0 auto;
                }

                /* Cards row */
                .pr-cards {
                    display: flex;
                    gap: 24px;
                    align-items: stretch;
                    justify-content: center;
                    margin-bottom: 48px;
                }

                /* ── Base Card ── */
                .pr-card {
                    flex: 1;
                    max-width: 400px;
                    position: relative;
                    background: #ffffff;
                    border: 1px solid rgba(220,53,69,0.1);
                    border-radius: 28px;
                    padding: 40px 32px;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.35s cubic-bezier(0.165,0.84,0.44,1),
                                border-color 0.35s, box-shadow 0.35s;
                    box-shadow: 0 4px 24px rgba(220,53,69,0.06);
                }
                .pr-card--hovered {
                    transform: translateY(-6px);
                    border-color: rgba(220,53,69,0.25);
                    box-shadow: 0 20px 48px rgba(220,53,69,0.12);
                }

                /* ── Featured Card ── */
                .pr-card--featured {
                    background: #ffffff;
                    border: 2px solid rgba(220,53,69,0.45);
                    box-shadow: 0 0 0 4px rgba(220,53,69,0.06),
                                0 24px 64px rgba(220,53,69,0.15);
                    transform: scale(1.04);
                }
                .pr-card--featured:hover {
                    transform: scale(1.04) translateY(-6px);
                    box-shadow: 0 0 0 4px rgba(220,53,69,0.1),
                                0 32px 72px rgba(220,53,69,0.2);
                }

                /* Glow ring */
                .pr-glow-ring {
                    position: absolute;
                    inset: -2px;
                    border-radius: 30px;
                    background: linear-gradient(135deg, rgba(220,53,69,0.5), transparent, rgba(220,53,69,0.3));
                    z-index: -1;
                    animation: pr-ring-spin 4s linear infinite;
                }
                @keyframes pr-ring-spin {
                    0%   { opacity: 0.5; }
                    50%  { opacity: 1;   }
                    100% { opacity: 0.5; }
                }

                /* Badge */
                .pr-badge {
                    position: absolute;
                    top: -14px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    color: white;
                    font-size: 0.68rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 5px 16px;
                    border-radius: 999px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 4px 14px rgba(220,53,69,0.45);
                    white-space: nowrap;
                }

                /* Plan label */
                .pr-plan-label {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 20px;
                }
                .pr-card--featured .pr-plan-label { color: #dc3545; }

                /* Price */
                .pr-price-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    margin-bottom: 6px;
                }
                .pr-currency {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #111111;
                    line-height: 1;
                    padding-bottom: 6px;
                }
                .pr-amount {
                    font-size: 4rem;
                    font-weight: 900;
                    color: #111111;
                    line-height: 1;
                    letter-spacing: -0.03em;
                }
                .pr-card--featured .pr-currency,
                .pr-card--featured .pr-amount {
                    color: #dc3545;
                    -webkit-text-fill-color: #dc3545;
                }
                .pr-period {
                    font-size: 1rem;
                    color: #94a3b8;
                    font-weight: 500;
                    padding-bottom: 8px;
                }

                /* Monthly eq */
                .pr-monthly {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-bottom: 24px;
                }
                .pr-card--featured .pr-period { color: #94a3b8; }
                .pr-card--featured .pr-monthly { color: #64748b; }

                /* Divider */
                .pr-divider {
                    height: 1px;
                    background: rgba(220,53,69,0.1);
                    margin-bottom: 24px;
                }
                .pr-divider--featured {
                    background: linear-gradient(90deg, transparent, rgba(220,53,69,0.3), transparent);
                }

                /* Features */
                .pr-features {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 13px;
                    padding-bottom: 28px;
                }
                .pr-feature {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    color: #374151;
                }
                .pr-feature--locked {
                    color: #d1d5db;
                }
                .pr-check {
                    color: #dc3545;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }
                .pr-check--featured {
                    color: #dc3545;
                }
                .pr-card--featured .pr-feature { color: #374151; }
                .pr-cross {
                    color: #d1d5db;
                    font-size: 0.8rem;
                    flex-shrink: 0;
                }

                /* CTA Button */
                .pr-btn {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 14px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.25s;
                    border: 1px solid rgba(220,53,69,0.2);
                    background: rgba(220,53,69,0.06);
                    color: #dc3545;
                    margin-bottom: 12px;
                }
                .pr-btn:hover {
                    background: rgba(220,53,69,0.12);
                    color: #a51020;
                    transform: translateY(-2px);
                }
                .pr-btn--featured {
                    background: linear-gradient(135deg, #dc3545, #a51020);
                    color: white;
                    border: none;
                    box-shadow: 0 8px 24px rgba(220,53,69,0.3);
                }
                .pr-btn--featured:hover {
                    box-shadow: 0 14px 32px rgba(220,53,69,0.45);
                    transform: translateY(-3px);
                    background: linear-gradient(135deg, #e8404f, #b51525);
                }
                .pr-btn-arrow {
                    font-size: 0.8rem;
                    transition: transform 0.2s;
                }
                .pr-btn:hover .pr-btn-arrow {
                    transform: translateX(4px);
                }

                /* Guarantee */
                .pr-guarantee {
                    text-align: center;
                    font-size: 0.73rem;
                    color: #94a3b8;
                    margin: 0;
                }
                .pr-card--featured .pr-guarantee { color: #94a3b8; }

                /* Trust bar */
                .pr-trust {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 32px;
                    flex-wrap: wrap;
                    padding: 20px 0 0;
                    border-top: 1px solid rgba(220,53,69,0.1);
                }
                .pr-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .pr-trust-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #dc3545;
                    flex-shrink: 0;
                }

                /* ── Responsive ── */
                @media (max-width: 720px) {
                    .pr-cards {
                        flex-direction: column;
                        align-items: center;
                    }
                    .pr-card {
                        max-width: 100%;
                        width: 100%;
                    }
                    .pr-card--featured {
                        transform: none;
                        order: -1;
                    }
                    .pr-card--featured:hover { transform: translateY(-6px); }
                    .pr-trust { gap: 16px; }
                }

                @media (max-width: 480px) {
                    .pr-section { padding: 80px 5%; }
                    .pr-header  { margin-bottom: 44px; }
                    .pr-card    { padding: 32px 24px; border-radius: 22px; }
                    .pr-amount  { font-size: 3.2rem; }
                }
            `}</style>
        </section>
    );
};

export default Pricing;
