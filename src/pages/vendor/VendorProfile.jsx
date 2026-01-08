import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { FaUser, FaPhone, FaEnvelope, FaSave, FaCamera } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const VendorProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profile, setProfile] = useState({
        fullName: '',
        phone: '',
        email: '',
        profileImage: null
    });
    const [originalProfile, setOriginalProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('vendor_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.id) {
                    try {
                        const response = await axios.get(`${API_URL}/vendors/${user.id}`);
                        const vendorData = response.data;
                        const BASE_URL = API_URL.replace('/api', '');
                        const imageUrl = vendorData.profileImage ? `${BASE_URL}/${vendorData.profileImage}` : null;

                        const fetchedProfile = {
                            fullName: vendorData.fullName || '',
                            phone: vendorData.phone || '',
                            email: vendorData.email || '',
                            profileImage: imageUrl
                        };
                        setProfile(fetchedProfile);
                        setOriginalProfile(fetchedProfile); // Store original profile for cancellation
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    }
                }
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Store the file itself for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profileImage: reader.result })); // For immediate preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        if (originalProfile) {
            setProfile(originalProfile);
        }
        setSelectedFile(null);
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const storedUser = localStorage.getItem('vendor_user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('phone', profile.phone);
        if (selectedFile) {
            formData.append('profileImage', selectedFile);
        }

        try {
            const response = await axios.put(`${API_URL}/vendors/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Updated Vendor Profile:", response.data);

            // Update original profile with new data
            const vendorData = response.data;
            const BASE_URL = API_URL.replace('/api', '');
            const newProfile = {
                fullName: vendorData.fullName,
                phone: vendorData.phone,
                email: vendorData.email,
                profileImage: vendorData.profileImage ? `${BASE_URL}/${vendorData.profileImage}` : null
            };

            setProfile(newProfile);
            setOriginalProfile(newProfile);
            setSelectedFile(null);
            setIsEditing(false);
            alert('Profile Updated Successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
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

                            {/* Profile Image Section */}
                            <div className="d-flex justify-content-center mb-4">
                                <div className="position-relative">
                                    <div
                                        className="rounded-circle overflow-hidden border border-3 border-light shadow-sm d-flex align-items-center justify-content-center bg-light"
                                        style={{ width: '120px', height: '120px' }}
                                    >
                                        {profile.profileImage ? (
                                            <img src={profile.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <FaUser size={50} className="text-secondary opacity-50" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <>
                                            <label
                                                htmlFor="profile-upload"
                                                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer hover-scale"
                                                style={{ cursor: 'pointer', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Upload Photo"
                                            >
                                                <FaCamera size={14} />
                                            </label>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={handleImageChange}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

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
                                            className="form-control text-muted"
                                            style={isEditing ? { ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : { borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            value={profile.email}
                                            readOnly={true}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                                    <button type="button" className="btn btn-light border" onClick={handleCancel}>Cancel</button>
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
