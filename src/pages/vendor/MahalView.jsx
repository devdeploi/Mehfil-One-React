import React from 'react';
import { FaMapMarkerAlt, FaFilePdf, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { API_URL } from '../../utils/function';

const InfoItem = ({ label, value }) => (
    <div className="col-md-6 col-lg-4">
        <label className="fw-bold text-secondary small d-block mb-1">{label}</label>
        <p className="fw-bold text-dark mb-0 form-control-plaintext border-bottom pb-1">{value || '-'}</p>
    </div>
);

const MahalView = ({ currentHall, onEdit }) => {

    const getPreview = (file) => {
        if (!file) return null;
        if (file.preview) return file.preview; // It's a File object with preview
        if (typeof file === 'string') {
            // It's a server path (e.g., 'uploads/mahal/...')
            return `${API_URL.replace('/api', '')}/${file}`;
        }
        return null;
    };

    const sectionTitleStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '10px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-9">
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-header bg-white p-4 border-bottom-0 d-flex justify-content-between align-items-center">
                        <h3 className="fw-bold m-0 text-danger">Mahal Details</h3>
                        <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={onEdit}>
                            <FaEdit className="me-1" /> Edit Profile
                        </button>
                    </div>
                    <div className="card-body p-4 bg-light">
                        {/* View Mode: Information Display */}
                        <div className="d-flex flex-column gap-4">

                            {/* 1. Basic Info View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>1. Basic Details</h4>
                                <div className="row g-3">
                                    <InfoItem label="Mahal Name" value={currentHall.mahalName} />
                                    <InfoItem label="Type" value={currentHall.mahalType} />
                                    <InfoItem label="Owner Name" value={currentHall.ownerName} />
                                    <InfoItem label="Mobile" value={currentHall.mobile} />
                                    <InfoItem label="Alt Mobile" value={currentHall.altMobile || '-'} />
                                    <InfoItem label="Email" value={currentHall.email} />
                                    <InfoItem label="WhatsApp" value={currentHall.whatsapp || '-'} />
                                    <div className="col-12 mt-2">
                                        <label className="fw-bold text-secondary small d-block">Description</label>
                                        <p className="bg-light p-3 rounded border text-dark mb-0">{currentHall.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Address View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>2. Address</h4>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <p className="mb-1 fw-bold">{currentHall.doorNo}, {currentHall.street}</p>
                                        <p className="mb-1">{currentHall.city}, {currentHall.district} - {currentHall.pincode}</p>
                                        <p className="mb-0 text-muted">{currentHall.state}</p>
                                    </div>
                                    <InfoItem label="Landmark" value={currentHall.landmark || '-'} />
                                    <div className="col-12 mt-2">
                                        <a href={currentHall.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger btn-sm rounded-pill">
                                            <FaMapMarkerAlt className="me-1" /> View on Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Capacity View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>3. Capacity</h4>
                                <div className="row g-3">
                                    <InfoItem label="Seating" value={`${currentHall.seatingCapacity} Pax`} />
                                    <InfoItem label="Dining" value={`${currentHall.diningCapacity} Pax`} />
                                    <InfoItem label="Parking" value={`${currentHall.parkingCapacity || 0} Cars`} />
                                    <InfoItem label="Rooms" value={currentHall.totalRooms} />
                                    <InfoItem label="Bride Room" value={currentHall.brideRoom ? 'Available' : 'Not Available'} />
                                    <InfoItem label="Groom Room" value={currentHall.groomRoom ? 'Available' : 'Not Available'} />
                                </div>
                            </div>

                            {/* 4. Pricing / Rent View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>4. Pricing / Rent</h4>
                                <div className="row g-3">
                                    <InfoItem label="Morning Slot" value={currentHall.morningPrice ? `₹${currentHall.morningPrice}` : '-'} />
                                    <InfoItem label="Evening Slot" value={currentHall.eveningPrice ? `₹${currentHall.eveningPrice}` : '-'} />
                                    <InfoItem label="Full Day" value={currentHall.fullDayPrice ? `₹${currentHall.fullDayPrice}` : '-'} />
                                    <InfoItem label="Extra Hour" value={currentHall.extraHourPrice ? `₹${currentHall.extraHourPrice}` : '-'} />
                                    <InfoItem label="Advance" value={currentHall.advanceAmount ? `₹${currentHall.advanceAmount}` : '-'} />
                                    <div className="col-12 mt-2">
                                        <label className="fw-bold text-secondary small d-block">Refund Policy</label>
                                        <p className="mb-0 small">{currentHall.refundPolicy || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Availability View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>5. Availability</h4>
                                <div className="row g-3">
                                    <InfoItem label="Days" value={currentHall.availableDays} />
                                    <InfoItem label="Morning Slot" value={`${currentHall.morningTimeFrom} - ${currentHall.morningTimeTo}`} />
                                    <InfoItem label="Evening Slot" value={`${currentHall.eveningTimeFrom} - ${currentHall.eveningTimeTo}`} />
                                </div>
                            </div>

                            {/* 6. Facilities View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>6. Facilities</h4>
                                <div className="d-flex flex-wrap gap-2">
                                    {['ac', 'generator', 'parking', 'lift', 'drinkingWater', 'cleaning', 'soundSystem', 'stage', 'cctv'].map(key => (
                                        currentHall[key] && (
                                            <span key={key} className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill">
                                                <FaCheckCircle className="me-1" /> {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                        )
                                    ))}
                                    {!['ac', 'generator', 'parking', 'lift', 'drinkingWater', 'cleaning', 'soundSystem', 'stage', 'cctv'].some(k => currentHall[k]) && <span className="text-muted">No specific facilities listed.</span>}
                                </div>
                                <div className="row g-3 mt-2">
                                    <InfoItem label="Power Supply" value={currentHall.powerSupply} />
                                    <InfoItem label="Rest Rooms" value={currentHall.restRooms} />
                                </div>
                            </div>

                            {/* 7. Gallery / Media View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>7. Gallery & Media</h4>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="fw-bold text-secondary small d-block mb-2">Cover Image</label>
                                        {currentHall.coverImage ? (
                                            <img src={getPreview(currentHall.coverImage)} alt="Cover" className="img-fluid rounded border" style={{ maxHeight: '150px' }} />
                                        ) : <span className="text-muted small">No cover image</span>}
                                    </div>
                                    <div className="col-md-8">
                                        <label className="fw-bold text-secondary small d-block mb-2">Gallery</label>
                                        <div className="d-flex gap-2 overflow-auto pb-2">
                                            {currentHall.galleryImages && currentHall.galleryImages.length > 0 ? currentHall.galleryImages.map((img, i) => (
                                                <img key={i} src={getPreview(img)} alt="Gallery" className="rounded border shadow-sm" style={{ width: '120px', height: '100px', objectFit: 'cover' }} />
                                            )) : <span className="text-muted small">No images uploaded.</span>}
                                        </div>
                                    </div>
                                    <InfoItem label="Video URL" value={currentHall.videoUrl} />
                                    {currentHall.brochureUrl && (
                                        <div className="col-md-6">
                                            <label className="fw-bold text-secondary small d-block mb-1">Brochure</label>
                                            <a href={getPreview(currentHall.brochureUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger"><FaFilePdf className="me-1" /> View Brochure</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 8. Decoration View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>8. Decoration</h4>
                                {currentHall.decoration.available ? (
                                    <div className="d-flex flex-column gap-3">
                                        {currentHall.decoration.items.map((item, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded border">
                                                <h6 className="fw-bold mb-1">Option {idx + 1} ({item.type})</h6>
                                                <p className="small text-muted mb-2">{item.description}</p>
                                                <div className="d-flex gap-3 small">
                                                    <span className="fw-bold text-dark">₹{item.startPrice} - ₹{item.maxPrice}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-muted fst-italic mb-0">Not provided by venue.</p>}
                            </div>

                            {/* 9. Stalls View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>9. Stalls</h4>
                                {currentHall.stalls.available ? (
                                    <div className="row g-3">
                                        <InfoItem label="Count" value={currentHall.stalls.count} />
                                        <InfoItem label="Type" value={currentHall.stalls.type} />
                                        <InfoItem label="Price" value={currentHall.stalls.price} />
                                        <div className="col-md-6 pt-3"><span className="badge bg-light text-dark border me-2">{currentHall.stalls.electricity ? 'Electricity: Yes' : 'Electricity: No'}</span><span className="badge bg-light text-dark border">{currentHall.stalls.water ? 'Water: Yes' : 'Water: No'}</span></div>
                                        <div className="col-12"><p className="small text-muted mb-0">Note: {currentHall.stalls.notes}</p></div>
                                    </div>
                                ) : <p className="text-muted fst-italic mb-0">Not provided by venue.</p>}
                            </div>

                            {/* 10. Utensils View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>10. Utensils</h4>
                                {currentHall.utensils.available ? (
                                    <div className="row g-3">
                                        <InfoItem label="Included?" value={currentHall.utensils.included} />
                                        {currentHall.utensils.included === 'Paid' && <InfoItem label="Price" value={currentHall.utensils.price} />}
                                        <InfoItem label="Plates" value={currentHall.utensils.plates} />
                                        <InfoItem label="Glasses" value={currentHall.utensils.glasses} />
                                        <InfoItem label="Spoons" value={currentHall.utensils.spoons} />
                                        <InfoItem label="Bowls" value={currentHall.utensils.bowls} />
                                        <div className="col-12"><span className="badge bg-light text-dark border">Cleaning: {currentHall.utensils.cleaning ? 'Included' : 'Not Included'}</span></div>
                                        <div className="col-12"><p className="small text-muted mb-0">Note: {currentHall.utensils.notes}</p></div>
                                    </div>
                                ) : <p className="text-muted fst-italic mb-0">Not provided by venue.</p>}
                            </div>

                            {/* 11. Catering View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>11. Food / Catering</h4>
                                {currentHall.catering.available ? (
                                    <div className="row g-3">
                                        <InfoItem label="Type" value={currentHall.catering.type} />
                                        <InfoItem label="Price (Start)" value={`₹${currentHall.catering.startPrice}`} />
                                        <InfoItem label="Price (Max)" value={`₹${currentHall.catering.maxPrice}`} />
                                        <InfoItem label="Serving Items" value={currentHall.catering.servingItems} />
                                        <div className="col-12">
                                            <label className="fw-bold text-secondary small d-block mb-2">Menu</label>
                                            <div className="d-flex gap-2 overflow-auto">
                                                {currentHall.catering.menuImages && currentHall.catering.menuImages.length > 0 ? currentHall.catering.menuImages.map((img, i) => (
                                                    <img key={i} src={getPreview(img)} alt="Menu" className="rounded border" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                                )) : <span className="text-muted small">No menu images</span>}
                                            </div>
                                        </div>
                                        <div className="col-12"><p className="small text-muted mb-0">Note: {currentHall.catering.notes}</p></div>
                                    </div>
                                ) : (
                                    <p className="text-muted fst-italic mb-0">Catering not provided by venue.</p>
                                )}
                            </div>

                            {/* 12. Terms View */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 style={sectionTitleStyle}>12. Terms & Conditions</h4>
                                <p className="small text-dark bg-white p-3 rounded border mb-0" style={{ whiteSpace: 'pre-wrap' }}>{currentHall.terms || 'No terms specified.'}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MahalView;
