import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaSave } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const VendorProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        fullName: 'John Doe',
        phone: '+1 987 654 3210',
        email: 'contact@grandroyal.com'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // Mock API call to save
        console.log("Saved Vendor Profile:", profile);
        alert('Profile Updated Successfully!');
    };

    // Standard styling for inputs
    const inputStyle = {
        padding: '10px 15px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="sa-dashboard-title mb-0">Vendor Profile</h1>
                {!isEditing && (
                    <button
                        className="btn text-white fw-bold shadow-sm"
                        onClick={() => setIsEditing(true)}
                        style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontSize: '0.85rem'
                        }}
                    >
                        <i className="bi bi-pencil me-2"></i> Edit Profile
                    </button>
                )}
            </div>

            <div className="row d-flex justify-content-center">
                <div className="col-lg-8">
                    <div className="sa-card-wrapper">
                        <form onSubmit={handleSave}>

                            <div className="row g-4">
                                {/* Basic Info */}
                                <div className="col-12">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Personal Information</h4>
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Full Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaUser className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={profile.fullName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Phone</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaPhone className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={profile.phone}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaEnvelope className="text-secondary" /></span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={profile.email}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                                    <button type="button" className="btn btn-light border" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button
                                        type="submit"
                                        className="btn text-white fw-bold shadow-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                            padding: '12px 30px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <FaSave className="me-2" /> Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
