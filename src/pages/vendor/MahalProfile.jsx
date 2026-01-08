import React, { useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaSave, FaImage, FaTrash, FaPlusCircle, FaEdit, FaArrowLeft, FaRupeeSign } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const MahalProfile = () => {
    // View State: 'list' | 'form'
    const [view, setView] = useState('list');
    const fileInputRef = React.useRef(null);

    // Hall List State
    const [halls, setHalls] = useState([
        {
            id: 1,
            hallName: 'Grand Royal Palace',
            address: '123 Wedding Ave, Celebration City',
            capacity: '500 Guests',
            pricePerDay: '25000',
            pricePerHour: '500',
            policies: 'No smoking inside the hall.\nEvents must end by 11:00 PM.',
            description: 'A luxurious venue for your perfect day.',
            acType: 'AC',
            amenities: {
                decoration: true,
                stalls: false,
                utensils: true
            },
            images: [
                'https://picsum.photos/seed/hall1a/800/500',
                'https://picsum.photos/seed/hall1b/800/600'
            ]
        },
        {
            id: 2,
            hallName: 'Sunset Garden Hall',
            address: '456 Party Road, Festival Town',
            capacity: '300 Guests',
            pricePerDay: '15000',
            pricePerHour: '300',
            policies: 'Outside catering allowed.\nNo loud music after 10:00 PM.',
            description: 'An open-air venue perfect for evening receptions.',
            acType: 'Non-AC',
            amenities: {
                decoration: true,
                stalls: true,
                utensils: false
            },
            images: [
                'https://picsum.photos/seed/hall2a/800/500',
                'https://picsum.photos/seed/hall2b/800/600'
            ]
        }
    ]);

    // Current Editing Hall State
    const [currentHall, setCurrentHall] = useState(null);

    // Handlers
    const handleAddClick = () => {
        setCurrentHall({
            id: Date.now(), // Temp ID
            hallName: '',
            address: '',
            capacity: '',
            pricePerDay: '',
            pricePerHour: '',
            policies: '',
            description: '',
            acType: 'AC',
            amenities: {
                decoration: false,
                stalls: false,
                utensils: false
            },
            images: []
        });
        setView('form');
    };

    const handleEditClick = (hall) => {
        // Ensure legacy data has new fields if missing
        const hallData = {
            ...hall,
            acType: hall.acType || 'AC',
            amenities: hall.amenities || { decoration: false, stalls: false, utensils: false }
        };
        setCurrentHall(hallData);
        setView('form');
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this Mahal?')) {
            setHalls(prev => prev.filter(h => h.id !== id));
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCurrentHall(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenitiesChange = (e) => {
        const { name, checked } = e.target;
        setCurrentHall(prev => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [name]: checked
            }
        }));
    };

    const handleImageUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentHall(prev => ({ ...prev, images: [...prev.images, reader.result] }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDelete = (index) => {
        const newImages = currentHall.images.filter((_, i) => i !== index);
        setCurrentHall(prev => ({ ...prev, images: newImages }));
    };

    const handleSort = () => {
        // Validation
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        // duplicate items
        let _images = [...currentHall.images];

        // remove and save the dragged item content
        const draggedItemContent = _images.splice(dragItem.current, 1)[0];

        // switch the position
        _images.splice(dragOverItem.current, 0, draggedItemContent);

        // reset the position ref
        dragItem.current = null;
        dragOverItem.current = null;

        // update the actual array
        setCurrentHall(prev => ({ ...prev, images: _images }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        setHalls(prev => {
            const index = prev.findIndex(h => h.id === currentHall.id);
            if (index >= 0) {
                // Update existing
                const newHalls = [...prev];
                newHalls[index] = currentHall;
                return newHalls;
            } else {
                // Add new
                return [...prev, currentHall];
            }
        });

        alert('Mahal Saved Successfully!');
        setView('list');
    };

    const handleCancel = () => {
        setView('list');
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
            {/* VIEW: LIST */}
            {view === 'list' && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="sa-dashboard-title mb-0">My Mahals</h1>
                        <button
                            className="btn text-white fw-bold shadow-sm"
                            onClick={handleAddClick}
                            style={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                textTransform: 'uppercase',
                                fontSize: '0.85rem'
                            }}
                        >
                            <FaPlusCircle className="me-2" /> Add Mahal
                        </button>
                    </div>

                    <div className="row g-4">
                        {halls.map(hall => (
                            <div key={hall.id} className="col-lg-4 col-md-6">
                                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <div className="position-relative" style={{ height: '200px' }}>
                                        {hall.images.length > 0 ? (
                                            <img src={hall.images[0]} alt={hall.hallName} className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                                                <FaImage size={40} />
                                            </div>
                                        )}
                                        <div className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75">
                                            {hall.capacity}
                                        </div>
                                        {hall.acType === 'AC' && <div className="position-absolute top-0 start-0 m-2 badge bg-info text-dark shadow-sm">AC</div>}
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold text-dark mb-1">{hall.hallName || 'Untitled Hall'}</h5>
                                        <p className="card-text text-muted small mb-3">
                                            <FaMapMarkerAlt className="me-1 text-danger" /> {hall.address || 'No Address'}
                                        </p>
                                        <div className="mb-3">
                                            <div className="d-flex flex-wrap gap-2">
                                                {hall.amenities?.decoration && <span className="badge bg-light text-secondary border">Decoration</span>}
                                                {hall.amenities?.stalls && <span className="badge bg-light text-secondary border">Stalls</span>}
                                                {hall.amenities?.utensils && <span className="badge bg-light text-secondary border">Utensils</span>}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center bg-light rounded p-2 mb-3">
                                            <div className="text-center w-50 border-end">
                                                <small className="text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>Per Day</small>
                                                <div className="fw-bold text-success">₹{hall.pricePerDay || '0'}</div>
                                            </div>
                                            <div className="text-center w-50">
                                                <small className="text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>Per Hour</small>
                                                <div className="fw-bold text-primary">₹{hall.pricePerHour || '0'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white border-top-0 d-flex justify-content-between p-3">
                                        <button
                                            className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold"
                                            onClick={() => handleEditClick(hall)}
                                        >
                                            <FaEdit className="me-1" /> Edit
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold"
                                            onClick={() => handleDeleteClick(hall.id)}
                                        >
                                            <FaTrash className="me-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {halls.length === 0 && (
                            <div className="col-12 text-center py-5">
                                <div className="text-muted mb-3 opacity-50"><FaBuilding size={60} /></div>
                                <h4 className="text-muted">No Mahals Added Yet</h4>
                                <p className="text-muted small">Click the "Add Mahal" button to list your venue.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* VIEW: FORM (CREATE / EDIT) */}
            {view === 'form' && currentHall && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={handleCancel} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <FaArrowLeft />
                            </button>
                            <h1 className="sa-dashboard-title mb-0">{currentHall.id ? 'Edit Mahal' : 'Add New Mahal'}</h1>
                        </div>
                    </div>

                    <div className="row d-flex justify-content-center">
                        <div className="col-lg-10">
                            <div className="sa-card-wrapper">
                                <form onSubmit={handleSave}>
                                    {/* Header Image Section (First Image as Cover) */}
                                    <div className="mb-5 text-center position-relative">
                                        <div className="ratio ratio-21x9 rounded-4 mb-3 d-flex align-items-center justify-content-center bg-light border" style={{ maxHeight: '300px', overflow: 'hidden' }}>
                                            {currentHall.images.length > 0 ? (
                                                <img src={currentHall.images[0]} alt="Cover" className="w-100 h-100 object-fit-fill" />
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
                                                    required
                                                    className="form-control"
                                                    style={inputStyle}
                                                    value={currentHall.hallName}
                                                    onChange={handleFormChange}
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
                                                    required
                                                    className="form-control"
                                                    style={inputStyle}
                                                    value={currentHall.capacity}
                                                    onChange={handleFormChange}
                                                    placeholder="e.g. 500 Guests"
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
                                                    required
                                                    className="form-control"
                                                    style={inputStyle}
                                                    value={currentHall.address}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Features & Amenities */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold text-secondary text-uppercase small mb-3">Features & Amenities</label>
                                            <div className="p-3 bg-light rounded border">
                                                {/* AC Type */}
                                                <div className="mb-3">
                                                    <label className="fw-bold text-dark small mb-2 d-block">Hall Type:</label>
                                                    <div className="d-flex gap-4">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="radio" name="acType" id="ac" value="AC" checked={currentHall.acType === 'AC'} onChange={handleFormChange} />
                                                            <label className="form-check-label" htmlFor="ac">AC</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="radio" name="acType" id="non-ac" value="Non-AC" checked={currentHall.acType === 'Non-AC'} onChange={handleFormChange} />
                                                            <label className="form-check-label" htmlFor="non-ac">Non-AC</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkboxes */}
                                                <div>
                                                    <label className="fw-bold text-dark small mb-2 d-block">Available Facilities:</label>
                                                    <div className="d-flex flex-wrap gap-4">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" name="decoration" id="decoration" checked={currentHall.amenities?.decoration} onChange={handleAmenitiesChange} />
                                                            <label className="form-check-label" htmlFor="decoration">Decoration</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" name="stalls" id="stalls" checked={currentHall.amenities?.stalls} onChange={handleAmenitiesChange} />
                                                            <label className="form-check-label" htmlFor="stalls">Stalls</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" name="utensils" id="utensils" checked={currentHall.amenities?.utensils} onChange={handleAmenitiesChange} />
                                                            <label className="form-check-label" htmlFor="utensils">Utensils</label>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                    style={inputStyle}
                                                    value={currentHall.pricePerDay}
                                                    onChange={handleFormChange}
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
                                                    style={inputStyle}
                                                    value={currentHall.pricePerHour}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold text-secondary text-uppercase small">Hall Rules & Policies</label>
                                            <textarea
                                                name="policies"
                                                rows="4"
                                                className="form-control"
                                                style={inputStyle}
                                                value={currentHall.policies}
                                                onChange={handleFormChange}
                                                placeholder="Enter rules..."
                                            ></textarea>
                                        </div>

                                        {/* Image Gallery */}
                                        <div className="col-12 mt-4">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                                <h4 className="sa-section-title mb-0">Image Gallery</h4>
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleImageUploadClick}>
                                                    <FaPlusCircle className="me-2" /> Add Image
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            {currentHall.images.map((img, index) => (
                                                <div
                                                    key={img}
                                                    className="col-md-4 col-sm-6"
                                                    draggable
                                                    onDragStart={() => (dragItem.current = index)}
                                                    onDragEnter={() => (dragOverItem.current = index)}
                                                    onDragEnd={handleSort}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    style={{ cursor: 'move' }}
                                                >
                                                    <div className="position-relative rounded overflow-hidden shadow-sm border group-hover-container">
                                                        <img src={img} alt={`Gallery ${index}`} className="w-100" style={{ height: '150px', objectFit: 'fill' }} />
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                            onClick={() => handleImageDelete(index)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {currentHall.images.length === 0 && (
                                                <div className="col-12 text-center text-muted py-4 bg-light rounded">
                                                    No images uploaded yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>

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
                                            <FaSave className="me-2" /> Save Hall
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MahalProfile;
