import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { SUBSCRIPTION_PLANS } from '../../../utils/constants';

const Pricing = ({ plansRef }) => {
    const navigate = useNavigate();

    return (
        <section className="lp-section" ref={plansRef}>
            <div className="lp-section-header">
                <h2 className="lp-section-title">Exclusive Membership</h2>
                <p className="lp-section-subtitle">Choose the tier that complements your ambition.</p>
            </div>
            <div className="lp-plans-grid">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div key={plan.id} className={`lp-plan-card ${plan.recommended ? 'recommended' : ''}`}>
                        {plan.recommended && <div className="lp-plan-badge">Most Popular</div>}
                        <h3 className="lp-plan-name">{plan.name}</h3>
                        <div className="lp-plan-price">{plan.currency}{plan.price.toLocaleString()}<span className="period">/ {plan.period}</span></div>
                        <div className="lp-plan-divider"></div>
                        <ul className="lp-plan-features">
                            {plan.features.map((feature, idx) => (
                                <li key={idx}><FaCheckCircle className="feature-icon" /> {feature}</li>
                            ))}
                        </ul>
                        <button onClick={() => navigate('/vendor/register')} className="lp-btn-plan">
                            Select {plan.name}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Pricing;
