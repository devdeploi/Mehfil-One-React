import React, { useState } from 'react';
import { FaCheck, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../../styles/superadmin/PlanManagement.css';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';

const PlanManagement = () => {
    const [plans, setPlans] = useState(SUBSCRIPTION_PLANS);
    const [showModal, setShowModal] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '',
        price: '',
        features: ['']
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPlan(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceIncrement = () => {
        setNewPlan(prev => ({
            ...prev,
            price: (parseInt(prev.price) || 0) + 1
        }));
    };

    const handlePriceDecrement = () => {
        setNewPlan(prev => ({
            ...prev,
            price: Math.max(0, (parseInt(prev.price) || 0) - 1)
        }));
    };

    const handleFeatureChange = (index, value) => {
        const updatedFeatures = [...newPlan.features];
        updatedFeatures[index] = value;
        setNewPlan(prev => ({ ...prev, features: updatedFeatures }));
    };

    const handleAddFeature = () => {
        setNewPlan(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const handleRemoveFeature = (index) => {
        const updatedFeatures = newPlan.features.filter((_, i) => i !== index);
        setNewPlan(prev => ({ ...prev, features: updatedFeatures }));
    };

    const handleAddPlan = () => {
        if (!newPlan.name || !newPlan.price) return;

        const plan = {
            id: plans.length + 1,
            name: newPlan.name,
            price: parseInt(newPlan.price),
            currency: '₹',
            period: '/yr',
            features: newPlan.features.filter(f => f.trim() !== ''),
            recommended: false
        };

        setPlans([...plans, plan]);
        setShowModal(false);
        setNewPlan({ name: '', price: '', features: [''] });
    };

    return (
        <div className="container-fluid position-relative">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="sa-page-title mb-0">Subscription Plans</h1>
                <button className="sa-add-btn" onClick={() => setShowModal(true)}>
                    <FaPlus /> Add New Plan
                </button>
            </div>

            <div className="row g-4">
                {plans.map(plan => (
                    <div key={plan.id} className="col-md-4">
                        <div className="sa-plan-card">
                            <div className="sa-plan-header">
                                <h3 className="sa-plan-name">{plan.name}</h3>
                                <div className="d-flex justify-content-center align-items-baseline">
                                    <span className="sa-plan-price">{plan.currency}{plan.price}</span>
                                    <span className="sa-plan-period">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="sa-plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}><FaCheck /> {feature}</li>
                                ))}
                            </ul>

                            <div className="sa-plan-actions">
                                <button className="sa-btn-outline">
                                    <FaEdit /> Edit
                                </button>
                                <button className="sa-btn-outline sa-btn-delete">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bootstrap Modal - Light Theme */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px' }}>
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="modal-title fw-bold text-dark">Add New Plan</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body pt-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-secondary small text-uppercase">Plan Name</label>
                                        <input type="text" name="name" className="sa-modal-input" value={newPlan.name} onChange={handleInputChange} placeholder="e.g. Enterprise" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-secondary small text-uppercase">Price (₹)</label>
                                        <div className="sa-input-group">
                                            <button type="button" className="sa-input-spin-btn" onClick={handlePriceDecrement}>-</button>
                                            <input
                                                type="number"
                                                name="price"
                                                className="sa-modal-input text-center p-0 border-0 shadow-none bg-transparent"
                                                value={newPlan.price}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                style={{ boxShadow: 'none' }}
                                            />
                                            <button type="button" className="sa-input-spin-btn" onClick={handlePriceIncrement}>+</button>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold text-secondary small text-uppercase mb-2">Features</label>
                                        <div className="d-flex flex-column gap-3">
                                            {newPlan.features.map((feature, index) => (
                                                <div key={index} className="d-flex align-items-center gap-2">
                                                    <input
                                                        type="text"
                                                        className="sa-modal-input"
                                                        value={feature}
                                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                        placeholder="Enter feature details"
                                                    />

                                                    {/* Delete Icon - Show if more than one feature */}
                                                    {newPlan.features.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-link text-danger p-0"
                                                            onClick={() => handleRemoveFeature(index)}
                                                            title="Remove feature"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    )}

                                                    {/* Add Icon - Show only on the last feature */}
                                                    {index === newPlan.features.length - 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center p-0"
                                                            style={{ width: '24px', height: '24px' }}
                                                            onClick={handleAddFeature}
                                                            title="Add feature"
                                                        >
                                                            <FaPlus size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0">
                                    <button type="button" className="btn btn-light fw-semibold text-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button
                                        type="button"
                                        className="btn fw-bold text-white px-4"
                                        style={{ background: '#0f172a', border: 'none' }} /* Matching application theme */
                                        onClick={handleAddPlan}
                                    >
                                        Save Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlanManagement;
