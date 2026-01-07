import React, { useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaSave, FaImage, FaTrash, FaPlusCircle } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const MahalProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [hallProfile, setHallProfile] = useState({
        hallName: 'Grand Royal Palace',
        address: '123 Wedding Ave, Celebration City',
        capacity: '500 Guests',
        pricePerDay: '25000',
        pricePerHour: '500',
        policies: 'No smoking inside the hall.\nEvents must end by 11:00 PM.',
        description: 'A luxurious venue for your perfect day.',
        images: [
            'https://picsum.photos/seed/hall1/800/500',
            'https://picsum.photos/seed/hall2/800/600'
        ]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setHallProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // Mock API call to save
        console.log("Saved Hall Profile:", hallProfile);
        alert('Mahal Profile Updated Successfully!');
    };

    const handleImageDelete = (index) => {
        if (!isEditing) return;
        const newImages = hallProfile.images.filter((_, i) => i !== index);
        setHallProfile(prev => ({ ...prev, images: newImages }));
    };

    const handleImageUpload = () => {
        // Mock Image Upload
        const newImage = `https://picsum.photos/800/600?random=${Date.now()}`;
        setHallProfile(prev => ({ ...prev, images: [...prev.images, newImage] }));
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
                <h1 className="sa-dashboard-title mb-0">Mahal Profile</h1>
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
                <div className="col-lg-10">
                    <div className="sa-card-wrapper">
                        <form onSubmit={handleSave}>
                            {/* Header Image Section (First Image as Cover) */}
                            <div className="mb-5 text-center position-relative">
                                <div className="ratio ratio-21x9 rounded-4 mb-3 d-flex align-items-center justify-content-center bg-light border" style={{ maxHeight: '300px', overflow: 'hidden' }}>
                                    {hallProfile.images.length > 0 ? (
                                        <img src={hallProfile.images[0]} alt="Cover" className="w-100 h-100 object-fit-fill" />
                                    ) : (
                                        <div className="text-center text-muted">
                                            <FaImage size={40} className="mb-2" />
                                            <p>No Images Uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="row g-4">
                                {/* Basic Info */}
                                <div className="col-12">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Venue Information</h4>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Venue Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaBuilding className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="hallName"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={hallProfile.hallName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Capacity</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaUsers className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="capacity"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={hallProfile.capacity}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}><FaMapMarkerAlt className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={hallProfile.address}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                {/* Pricing & Rules */}
                                <div className="col-12 mt-4">
                                    <h4 className="sa-section-title border-bottom pb-2 mb-3">Pricing & Policies</h4>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Price per Day (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}>₹</span>
                                        <input
                                            type="number"
                                            name="pricePerDay"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={hallProfile.pricePerDay}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Price per Hour (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid #e2e8f0' }}>₹</span>
                                        <input
                                            type="number"
                                            name="pricePerHour"
                                            className="form-control"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={hallProfile.pricePerHour}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary text-uppercase small">Hall Rules & Policies</label>
                                    <textarea
                                        name="policies"
                                        rows="4"
                                        className="form-control"
                                        style={isEditing ? inputStyle : {}}
                                        value={hallProfile.policies}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    ></textarea>
                                </div>

                                {/* Image Gallery */}
                                <div className="col-12 mt-4">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                        <h4 className="sa-section-title mb-0">Image Gallery</h4>
                                        {isEditing && (
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleImageUpload}>
                                                <FaPlusCircle className="me-2" /> Add Image
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="row g-3">
                                    {hallProfile.images.map((img, index) => (
                                        <div key={index} className="col-md-4 col-sm-6">
                                            <div className="position-relative rounded overflow-hidden shadow-sm border group-hover-container">
                                                <img src={img} alt={`Gallery ₹{index}`} className="w-100" style={{ height: '150px', objectFit: 'fill' }} />
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                        onClick={() => handleImageDelete(index)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {hallProfile.images.length === 0 && (
                                        <div className="col-12 text-center text-muted py-4 bg-light rounded">
                                            No images uploaded yet.
                                        </div>
                                    )}
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

export default MahalProfile;
