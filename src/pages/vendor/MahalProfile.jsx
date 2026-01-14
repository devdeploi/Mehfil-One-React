import React, { useState, useRef, useEffect } from 'react';
import MahalView from './MahalView';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaSave, FaImage, FaTrash, FaPlusCircle, FaEdit, FaArrowLeft, FaRupeeSign, FaFilePdf, FaCamera, FaClock, FaCheckCircle, FaExclamationCircle, FaEye, FaEllipsisV } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';


const MahalProfile = () => {
    // View State: 'list' | 'form'
    const [view, setView] = useState('list');
    const [halls, setHalls] = useState([]);
    const [currentHall, setCurrentHall] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mahalToDelete, setMahalToDelete] = useState(null);

    // References for file inputs
    const coverImageRef = useRef(null);
    const galleryImagesRef = useRef(null);
    const decorationImagesRef = useRef(null);
    const menuImagesRef = useRef(null);

    // Vendor Data for Auto-fill
    const [vendorData, setVendorData] = useState(null);

    useEffect(() => {
        fetchMahals();
        fetchVendorDetails();
    }, []);

    const fetchMahals = async () => {
        try {
            const storedUser = localStorage.getItem('vendor_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const response = await axios.get(`${API_URL}/mahals?vendorId=${user.id}`);
                setHalls(response.data.mahals);
            }
        } catch (error) {
            console.error("Error fetching mahals", error);
        }
    };

    const fetchVendorDetails = async () => {
        try {
            const storedUser = localStorage.getItem('vendor_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const response = await axios.get(`${API_URL}/vendors/${user.id}`);
                setVendorData(response.data);
            }
        } catch (error) {
            console.error("Error fetching vendor details", error);
        }
    };

    // Initial State Structure
    const initialHallState = {
        id: null,
        // 1. Basic Details
        mahalName: '',
        mahalType: '',
        ownerName: '',
        mobile: '',
        altMobile: '',
        email: '',
        whatsapp: '',
        description: '',

        // 2. Address & Location
        doorNo: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        mapUrl: '',
        landmark: '',

        // 3. Hall Capacity
        seatingCapacity: '',
        diningCapacity: '',
        parkingCapacity: '',
        totalRooms: '',
        brideRoom: false,
        groomRoom: false,

        // 4. Pricing / Rent
        // rentType removed as per request
        morningPrice: '',
        eveningPrice: '',
        fullDayPrice: '',
        extraHourPrice: '',
        advanceAmount: '',
        refundPolicy: '',

        // 5. Availability / Booking
        availableDays: 'All Days', // Default
        morningTimeFrom: '06:00',  // Default AM
        morningTimeTo: '13:00',
        eveningTimeFrom: '16:00',  // Default PM
        eveningTimeTo: '22:00',

        // 6. Facilities / Amenities
        ac: false,
        generator: false,
        powerSupply: '',
        parking: false,
        lift: false,
        restRooms: '',
        drinkingWater: false,
        cleaning: false,
        soundSystem: false,
        stage: false,
        cctv: false,

        // 7. Images / Media (Mixing Valid URLs and File objects for upload)
        coverImage: null,
        galleryImages: [],
        videoUrl: '',
        brochureUrl: null,

        // 8. Decoration Module (Array of items)
        decoration: {
            available: false,
            items: [] // {type: '', startPrice: '', maxPrice: '', description: '', images: [] }
        },

        // 9. Stalls Module
        stalls: {
            available: false,
            count: '',
            type: '',
            price: '',
            electricity: false,
            water: false,
            notes: ''
        },

        // 10. Utensils Module
        utensils: {
            available: false,
            included: '',
            price: '',
            plates: '',
            glasses: '',
            spoons: '',
            bowls: '',
            cleaning: false,
            notes: ''
        },

        // 11. Food / Catering
        catering: {
            available: false,
            type: '',
            startPrice: '',
            maxPrice: '',
            servingItems: '',
            menuImages: [],
            notes: ''
        },

        // 12. Terms
        terms: '',

    };

    const handleAddClick = () => {
        // Auto-fill vendor data
        const autoFilledState = {
            ...initialHallState,
            ownerName: vendorData?.fullName || '',
            mobile: vendorData?.phone || '',
            email: vendorData?.email || '',
        };
        setCurrentHall(autoFilledState);
        setIsViewMode(false);
        setView('form');
    };

    const prepareHallForEditOrView = (hall) => {
        // Ensure complex fields are initialized if missing
        const completeHall = {
            ...initialHallState,
            ...hall,
            // Ensure nested objects exist to prevent crashes
            decoration: hall.decoration || initialHallState.decoration,
            stalls: hall.stalls || initialHallState.stalls,
            // Utensils: Flatten 'items' if it comes from backend nested structure
            utensils: {
                ...initialHallState.utensils,
                ...(hall.utensils || {}),
                ...(hall.utensils?.items || {}) // Flatten items (plates, glasses, etc)
            },
            catering: hall.catering || initialHallState.catering,
            facilities: hall.facilities || {}
        };

        // Flatten facilities for frontend toggles if they come as object
        if (hall.facilities) {
            completeHall.ac = hall.facilities.ac;
            completeHall.generator = hall.facilities.generator;
            completeHall.parking = hall.facilities.parking;
            completeHall.lift = hall.facilities.lift;
            completeHall.drinkingWater = hall.facilities.drinkingWater;
            completeHall.cleaning = hall.facilities.cleaning;
            completeHall.soundSystem = hall.facilities.soundSystem;
            completeHall.stage = hall.facilities.stage;
            completeHall.cctv = hall.facilities.cctv;
        }

        return completeHall;
    };

    const handleEditClick = (hall) => {
        const completeHall = prepareHallForEditOrView(hall);
        setCurrentHall(completeHall);
        setIsViewMode(false);
        setView('form');
    };

    const handleViewClick = (hall) => {
        const completeHall = prepareHallForEditOrView(hall);
        setCurrentHall(completeHall);
        setIsViewMode(true);
        setView('form');
    };

    const handleDeleteClick = (hall) => {
        setMahalToDelete({ id: hall._id, name: hall.mahalName });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!mahalToDelete) return;
        try {
            await axios.delete(`${API_URL}/mahals/${mahalToDelete.id}`);
            setHalls(prev => prev.filter(h => h._id !== mahalToDelete.id));
            showToast('Mahal deleted successfully', 'success');
            setShowDeleteModal(false);
            setMahalToDelete(null);
        } catch (error) {
            console.error("Error deleting mahal", error);
            showToast('Error deleting mahal', 'error');
        }
    };

    const handleCancel = () => {
        setView('list');
        setCurrentHall(null);
    };

    const handleFormChange = (e, section = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        // Mobile Validation: Allow only digits and max 10 chars
        if (['mobile', 'altMobile', 'whatsapp'].includes(name)) {
            const numericValue = value.replace(/\D/g, ''); // Remove non-digits
            if (numericValue.length > 10) return; // Prevent more than 10

            // For updates, we pass the cleaned numericValue
            if (section) {
                setCurrentHall(prev => ({
                    ...prev,
                    [section]: { ...prev[section], [name]: numericValue }
                }));
            } else {
                setCurrentHall(prev => ({ ...prev, [name]: numericValue }));
            }
            return;
        }

        if (section) {
            setCurrentHall(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: val
                }
            }));
        } else {
            setCurrentHall(prev => ({ ...prev, [name]: val }));
        }
    };

    // Dynamic Decoration Handlers
    const addDecorationItem = () => {
        setCurrentHall(prev => ({
            ...prev,
            decoration: {
                ...prev.decoration,
                items: [...prev.decoration.items, { type: '', startPrice: '', maxPrice: '', description: '', images: [] }]
            }
        }));
    };

    const removeDecorationItem = (index) => {
        const newItems = currentHall.decoration.items.filter((_, i) => i !== index);
        setCurrentHall(prev => ({
            ...prev,
            decoration: {
                ...prev.decoration,
                items: newItems
            }
        }));
    };

    const handleDecorationChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...currentHall.decoration.items];
        newItems[index] = { ...newItems[index], [name]: value };
        setCurrentHall(prev => ({
            ...prev,
            decoration: {
                ...prev.decoration,
                items: newItems
            }
        }));
    };


    // File Handlers
    // Note: We store the ACTUAL File object for upload, and a URL for preview.
    // To distinguish, we might check if 'file' property exists or if it's string.

    const handleFileChange = (e, field, section = null) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result;
                const fileObj = Object.assign(file, { preview: previewUrl }); // Attach preview to file object

                if (section) {
                    if (Array.isArray(currentHall[section][field])) {
                        setCurrentHall(prev => ({
                            ...prev,
                            [section]: {
                                ...prev[section],
                                [field]: [...prev[section][field], fileObj]
                            }
                        }));
                    } else {
                        setCurrentHall(prev => ({
                            ...prev,
                            [section]: {
                                ...prev[section],
                                [field]: fileObj
                            }
                        }));
                    }
                } else {
                    if (Array.isArray(currentHall[field])) {
                        setCurrentHall(prev => ({ ...prev, [field]: [...prev[field], fileObj] }));
                    } else {
                        setCurrentHall(prev => ({ ...prev, [field]: fileObj }));
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index, field, section = null) => {
        if (section) {
            const newImages = currentHall[section][field].filter((_, i) => i !== index);
            setCurrentHall(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newImages
                }
            }));
        } else {
            const newImages = currentHall[field].filter((_, i) => i !== index);
            setCurrentHall(prev => ({ ...prev, [field]: newImages }));
        }
    };

    // Decoration Image logic (Simplified: Add to specific item)
    // NOTE: For true nesting in FormData, logic is complex. 
    // Simplified: We won't support per-item image upload in this iteration OR we just assume broad upload.
    // User asked "if user have all types means then how thw price make it as separately add for Type" -> solved by array.
    // Images per type: Let's skip per-type image upload for now to keep FormData simple or add them as specific fields if needed.
    // Actually, backend has `decoration.items[].images`. Frontend needs to support it. 
    // Implementing nested file upload is tricky with FormData. 
    // WORKAROUND: We will omit image uploading for INDIVIDUAL decoration items for now to prevent bugs, or handle it simply. 
    // Let's leave the 'images' field in data structure but maybe hide upload button there or implement robustly later.

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const storedUser = localStorage.getItem('vendor_user');
        if (!storedUser) {
            showToast('Please login first', 'error');
            return;
        }
        const user = JSON.parse(storedUser);

        // Validation for Mobile length before saving (Double check)
        if (currentHall.mobile && currentHall.mobile.length !== 10) {
            showToast('Mobile number must be exactly 10 digits', 'error');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('vendorId', user.id);

        // Append all text fields
        Object.keys(currentHall).forEach(key => {
            if (['galleryImages', 'coverImage', 'brochureUrl', 'decoration', 'stalls', 'utensils', 'catering', 'facilities', 'terms', 'vendorId', '_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
            formData.append(key, currentHall[key]);
        });

        // Facilities Boolean Map
        const facilities = {
            ac: currentHall.ac,
            generator: currentHall.generator,
            parking: currentHall.parking,
            lift: currentHall.lift,
            drinkingWater: currentHall.drinkingWater,
            cleaning: currentHall.cleaning,
            soundSystem: currentHall.soundSystem,
            stage: currentHall.stage,
            cctv: currentHall.cctv
        };
        formData.append('facilities', JSON.stringify(facilities));

        // Nested JSON modules
        // Clean up File objects from JSON before stringifying (they don't serialize well)

        const cleanDecoration = {
            ...currentHall.decoration,
            items: currentHall.decoration.items.map(i => ({ ...i, images: [] })) // Remove images from JSON, we handle via files? No, mixed mode usually fails.
        };
        // Strategy: Send JSON for structure. Send Files handling separately.
        // Format Utensils (Nest items back to schema structure)
        const formattedUtensils = {
            available: currentHall.utensils.available,
            included: currentHall.utensils.included,
            price: currentHall.utensils.price,
            cleaning: currentHall.utensils.cleaning,
            notes: currentHall.utensils.notes,
            items: {
                plates: currentHall.utensils.plates,
                glasses: currentHall.utensils.glasses,
                spoons: currentHall.utensils.spoons,
                bowls: currentHall.utensils.bowls
            }
        };

        formData.append('stalls', JSON.stringify(currentHall.stalls));
        formData.append('utensils', JSON.stringify(formattedUtensils));
        formData.append('catering', JSON.stringify({ ...currentHall.catering, menuImages: [] })); // Clean images references
        formData.append('decoration', JSON.stringify(cleanDecoration));

        formData.append('terms', currentHall.terms);

        // Append Files
        if (currentHall.coverImage && currentHall.coverImage.preview) {
            formData.append('coverImage', currentHall.coverImage);
        }

        if (currentHall.brochureUrl && currentHall.brochureUrl.preview) {
            formData.append('brochure', currentHall.brochureUrl);
        }

        currentHall.galleryImages.forEach(file => {
            if (file.preview) formData.append('galleryImages', file);
            else {
                // It's an existing URL string. Determine how to handle "kept" images. 
                // Backend needs to know which existing images to keep. 
                // We can append 'existingGalleryImages' array.
                formData.append('existingGalleryImages', file);
            }
        });

        currentHall.catering.menuImages.forEach(file => {
            if (file.preview) formData.append('menuImages', file);
            else {
                formData.append('existingMenuImages', file);
            }
        });

        // TODO: Decoration Images per item handling is omitted for simplicity in FormData.

        try {
            if (currentHall._id) {
                // Update
                await axios.put(`${API_URL}/mahals/${currentHall._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create
                await axios.post(`${API_URL}/mahals`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            showToast('Mahal Saved Successfully!', 'success');
            fetchMahals();
            setView('list');
        } catch (error) {
            console.error("Save Error", error);
            showToast('Failed to save: ' + (error.response?.data?.msg || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Toast Animation Styles
    const toastStyles = `
            @keyframes slideInTop {
                from {transform: translateY(-100%); opacity: 0; }
            to {transform: translateY(0); opacity: 1; }
        }
            .custom-toast {
                animation: slideInTop 0.3s ease-out;
            z-index: 9999;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
            `;

    // Helpers
    const getPreview = (file) => {
        if (!file) return null;
        if (file.preview) return file.preview; // It's a File object with preview
        if (typeof file === 'string') {
            // It's a server path (e.g., 'uploads/mahal/...')
            return `${API_URL.replace('/api', '')}/${file}`;
        }
        return null;
    };

    const inputStyle = {
        padding: '10px 15px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
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
        <div className="container-fluid">
            {/* Inject Toast Styles */}
            <style>{toastStyles}</style>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`custom-toast position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 d-flex align-items-center gap-3 bg-white border-${toast.type === 'error' ? 'danger' : 'success'} border-start border-5`} style={{ minWidth: '300px' }}>
                    <div className={`text-${toast.type === 'error' ? 'danger' : 'success'}`}>
                        {toast.type === 'error' ? <FaExclamationCircle size={20} /> : <FaCheckCircle size={20} />}
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold">{toast.type === 'error' ? 'Error' : 'Success'}</h6>
                        <small className="text-secondary">{toast.message}</small>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold text-dark m-0 border-start border-5 border-danger ps-3">My Mahals</h2>
                        <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={handleAddClick}>
                            <FaPlusCircle className="me-2" /> Add New Mahal
                        </button>
                    </div>

                    <div className="row g-4">
                        {halls.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <div className="text-muted mb-3">
                                    <FaBuilding size={50} className="opacity-25" />
                                </div>
                                <h4 className="text-secondary fw-bold">No Mahals Found</h4>
                                <p className="text-muted">You haven't added any mahals yet. Click the "Add New Mahal" button to get started.</p>
                            </div>
                        ) : (
                            halls.map(hall => (
                                <div key={hall._id} className="col-lg-4 col-md-6">
                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="position-relative" style={{ height: '200px' }}>
                                            {hall.coverImage ? (
                                                <img src={`${API_URL.replace('/api', '')}/${hall.coverImage}`} alt={hall.mahalName} className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                                                    <FaImage size={40} />
                                                </div>
                                            )}
                                            {/* Status Badge */}
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                                                    {hall.city}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold text-dark mb-1">{hall.mahalName}</h5>
                                            <p className="card-text text-muted small mb-3"><FaMapMarkerAlt className="me-1 text-danger" /> {hall.district}, {hall.state}</p>

                                            <div className="d-flex align-items-center justify-content-between mt-4">
                                                <div className="d-flex align-items-center text-secondary small">
                                                    <FaUsers className="me-2 text-danger" />
                                                    <span>{hall.seatingCapacity} Seats</span>
                                                </div>

                                                {/* Action Menu (Dot Center) */}
                                                <div className="dropdown">
                                                    <button className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ width: '40px', height: '40px' }}>
                                                        <FaEllipsisV className="text-secondary" />
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow rounded-4 p-2">
                                                        <li><button className="dropdown-item rounded-3 py-2 small fw-bold mb-1" onClick={() => handleViewClick(hall)}><FaEye className="me-2 text-info" /> View Details</button></li>
                                                        <li><button className="dropdown-item rounded-3 py-2 small fw-bold mb-1" onClick={() => handleEditClick(hall)}><FaEdit className="me-2 text-warning" /> Edit Profile</button></li>
                                                        <li><hr className="dropdown-divider my-1" /></li>
                                                        <li><button className="dropdown-item rounded-3 py-2 small fw-bold text-danger" onClick={() => handleDeleteClick(hall)}><FaTrash className="me-2" /> Delete Mahal</button></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {view === 'form' && currentHall && (
                <div className="container-fluid py-4">
                    <button type="button" className="btn btn-outline-danger mb-4 rounded-pill px-4 fw-bold" onClick={handleCancel}>
                        <FaArrowLeft className="me-2" /> Back to My Mahals
                    </button>

                    {isViewMode ? (
                        <MahalView
                            currentHall={currentHall}
                            onEdit={() => setIsViewMode(false)}
                        />
                    ) : (
                        /* Edit / Add Form */
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="card-header bg-white p-4 border-bottom-0">
                                <h3 className="fw-bold m-0 text-danger">{currentHall._id ? 'Edit Mahal' : 'Add New Mahal'}</h3>
                            </div>
                            <div className="card-body p-4 bg-light">
                                <form className="row g-4 justify-content-center" onSubmit={handleSave}> {/* Removed e.preventDefault to use handleSave directly, but added handleSave onSubmit */}
                                    {/* 1. Basic Details */}
                                    <div className="col-12 col-xl-10 mx-auto">

                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>1. Basic Details</h4>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-secondary">Mahal Name *</label>
                                                    <input type="text" className="form-control" style={inputStyle} name="mahalName" value={currentHall.mahalName} onChange={handleFormChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-secondary">Mahal Type *</label>
                                                    <select className="form-select" style={inputStyle} name="mahalType" value={currentHall.mahalType} onChange={handleFormChange} required>
                                                        <option value="">Select Type</option>
                                                        <option value="Wedding Hall">Wedding Hall</option>
                                                        <option value="Convention Center">Convention Center</option>
                                                        <option value="Mini Hall">Mini Hall</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-secondary">Owner / Vendor Name *</label>
                                                    <input type="text" className="form-control" style={inputStyle} name="ownerName" value={currentHall.ownerName} onChange={handleFormChange} required readOnly />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-secondary">Mobile Number *</label>
                                                    <input type="tel" className="form-control" style={inputStyle} name="mobile" value={currentHall.mobile} onChange={handleFormChange} required readOnly />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-secondary">Alternate Mobile</label>
                                                    <input type="tel" className="form-control" style={inputStyle} name="altMobile" value={currentHall.altMobile} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-secondary">Email ID</label>
                                                    <input type="email" className="form-control" style={inputStyle} name="email" value={currentHall.email} onChange={handleFormChange} readOnly />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-secondary">WhatsApp Number</label>
                                                    <input type="tel" className="form-control" style={inputStyle} name="whatsapp" value={currentHall.whatsapp} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-bold small text-secondary">Description / About Mahal *</label>
                                                    <textarea className="form-control" style={inputStyle} rows="3" name="description" value={currentHall.description} onChange={handleFormChange} required></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ... (Address Section - No Change needed mostly, remove Lat/Lng if mistakenly re-added) */}
                                    <div className="col-12 col-xl-10 mx-auto">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>2. Address & Location</h4>
                                            <div className="row g-3">
                                                {/* Address Fields */}
                                                <div className="col-md-6"><label className="form-label fw-bold small text-secondary">Door No / Building Name *</label><input type="text" className="form-control" style={inputStyle} name="doorNo" value={currentHall.doorNo} onChange={handleFormChange} required /></div>
                                                <div className="col-md-6"><label className="form-label fw-bold small text-secondary">Street / Area *</label><input type="text" className="form-control" style={inputStyle} name="street" value={currentHall.street} onChange={handleFormChange} required /></div>
                                                <div className="col-md-4"><label className="form-label fw-bold small text-secondary">City *</label><input type="text" className="form-control" style={inputStyle} name="city" value={currentHall.city} onChange={handleFormChange} required /></div>
                                                <div className="col-md-4"><label className="form-label fw-bold small text-secondary">District *</label><input type="text" className="form-control" style={inputStyle} name="district" value={currentHall.district} onChange={handleFormChange} required /></div>
                                                <div className="col-md-4"><label className="form-label fw-bold small text-secondary">State *</label><input type="text" className="form-control" style={inputStyle} name="state" value={currentHall.state} onChange={handleFormChange} required /></div>
                                                <div className="col-md-4"><label className="form-label fw-bold small text-secondary">Pincode *</label><input type="text" className="form-control" style={inputStyle} name="pincode" value={currentHall.pincode} onChange={handleFormChange} required /></div>
                                                <div className="col-md-8"><label className="form-label fw-bold small text-secondary">Google Map Location / Map Link *</label><input type="url" className="form-control" style={inputStyle} name="mapUrl" value={currentHall.mapUrl} onChange={handleFormChange} required /></div>
                                                <div className="col-md-12"><label className="form-label fw-bold small text-secondary">Landmark</label><input type="text" className="form-control" style={inputStyle} name="landmark" value={currentHall.landmark} onChange={handleFormChange} /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ... Hall Capacity (Same) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>3. Hall Capacity</h4>
                                            <div className="row g-3">
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Seating Capacity *</label><input type="number" className="form-control" style={inputStyle} name="seatingCapacity" value={currentHall.seatingCapacity} onChange={handleFormChange} required /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Dining Capacity *</label><input type="number" className="form-control" style={inputStyle} name="diningCapacity" value={currentHall.diningCapacity} onChange={handleFormChange} required /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Parking Capacity</label><input type="number" className="form-control" style={inputStyle} name="parkingCapacity" value={currentHall.parkingCapacity} onChange={handleFormChange} /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Total Rooms</label><input type="number" className="form-control" style={inputStyle} name="totalRooms" value={currentHall.totalRooms} onChange={handleFormChange} /></div>
                                                <div className="col-md-6 d-flex align-items-center gap-3 mt-4">
                                                    {/* Toggles */}
                                                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id="brideRoom" name="brideRoom" checked={currentHall.brideRoom} onChange={handleFormChange} /><label className="form-check-label fw-bold small" htmlFor="brideRoom">Bride Room Available</label></div>
                                                    <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id="groomRoom" name="groomRoom" checked={currentHall.groomRoom} onChange={handleFormChange} /><label className="form-check-label fw-bold small" htmlFor="groomRoom">Groom Room Available</label></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Pricing / Rent (Removed Rent Type) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>4. Pricing / Rent</h4>
                                            <div className="row g-3">
                                                {/* Rent Type Removed */}
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Morning Slot Price</label><input type="number" className="form-control" style={inputStyle} name="morningPrice" value={currentHall.morningPrice} onChange={handleFormChange} /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Evening Slot Price</label><input type="number" className="form-control" style={inputStyle} name="eveningPrice" value={currentHall.eveningPrice} onChange={handleFormChange} /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Full Day Price *</label><input type="number" className="form-control" style={inputStyle} name="fullDayPrice" value={currentHall.fullDayPrice} onChange={handleFormChange} required /></div>
                                                <div className="col-md-3"><label className="form-label fw-bold small text-secondary">Extra Hour Charges</label><input type="number" className="form-control" style={inputStyle} name="extraHourPrice" value={currentHall.extraHourPrice} onChange={handleFormChange} /></div>
                                                <div className="col-md-6"><label className="form-label fw-bold small text-secondary">Advance Amount</label><input type="number" className="form-control" style={inputStyle} name="advanceAmount" value={currentHall.advanceAmount} onChange={handleFormChange} /></div>
                                                <div className="col-12"><label className="form-label fw-bold small text-secondary">Refund Policy</label><textarea className="form-control" style={inputStyle} rows="2" name="refundPolicy" value={currentHall.refundPolicy} onChange={handleFormChange}></textarea></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5, 6, 7 (Avail, Facilities, Images) - Essentially same, mostly minor props passed */}
                                    {/* ... (Skipping full re-paste of static sections unless changed) ... */}
                                    {/* For brevity, I will include the critical updated modules below */}

                                    {/* 5. Availability (With Clock Icons) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>5. Availability / Booking</h4>
                                            <div className="row g-3">
                                                <div className="col-md-12">
                                                    <label className="form-label fw-bold small text-secondary">Available Days</label>
                                                    <select className="form-select" style={inputStyle} name="availableDays" value={currentHall.availableDays} onChange={handleFormChange}>
                                                        <option value="All Days">All Days</option>
                                                        <option value="Weekends">Weekends Only</option>
                                                        <option value="Custom">Custom</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold small text-secondary">Morning Time From (AM)</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0"><FaClock className="text-muted" /></span>
                                                        <input type="time" className="form-control border-start-0 ps-0" style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }} name="morningTimeFrom" value={currentHall.morningTimeFrom} onChange={handleFormChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold small text-secondary">Morning Time To</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0"><FaClock className="text-muted" /></span>
                                                        <input type="time" className="form-control border-start-0 ps-0" style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }} name="morningTimeTo" value={currentHall.morningTimeTo} onChange={handleFormChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold small text-secondary">Evening Time From (PM)</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0"><FaClock className="text-muted" /></span>
                                                        <input type="time" className="form-control border-start-0 ps-0" style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }} name="eveningTimeFrom" value={currentHall.eveningTimeFrom} onChange={handleFormChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold small text-secondary">Evening Time To</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0"><FaClock className="text-muted" /></span>
                                                        <input type="time" className="form-control border-start-0 ps-0" style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }} name="eveningTimeTo" value={currentHall.eveningTimeTo} onChange={handleFormChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Facilities (Condensed) */}
                                    <div className="col-12 col-xl-10"><div className="card border-0 shadow-sm rounded-4 p-4"><h4 style={sectionTitleStyle}>6. Facilities / Amenities</h4><div className="row g-3"><div className="col-12 d-flex flex-wrap gap-4 mb-3">{['ac', 'generator', 'parking', 'lift', 'drinkingWater', 'cleaning', 'soundSystem', 'stage', 'cctv'].map(key => (<div className="form-check form-switch" key={key}><input className="form-check-input" type="checkbox" role="switch" id={key} name={key} checked={currentHall[key]} onChange={handleFormChange} /><label className="form-check-label fw-bold small text-capitalize" htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()} Available</label></div>))}</div><div className="col-md-6"><label className="form-label fw-bold small text-secondary">Power Supply Details</label><input type="text" className="form-control" style={inputStyle} name="powerSupply" value={currentHall.powerSupply} onChange={handleFormChange} /></div><div className="col-md-6"><label className="form-label fw-bold small text-secondary">Rest Rooms Count</label><input type="number" className="form-control" style={inputStyle} name="restRooms" value={currentHall.restRooms} onChange={handleFormChange} /></div></div></div></div>

                                    {/* 7. Images (Updated logic for existing vs new) */}
                                    <div className="col-12 col-xl-10"><div className="card border-0 shadow-sm rounded-4 p-4"><h4 style={sectionTitleStyle}>7. Images / Media</h4><div className="row g-4"><div className="col-md-4"><label className="form-label fw-bold small text-secondary mb-2">Main Cover Image *</label><div className="position-relative rounded-3 bg-light border d-flex align-items-center justify-content-center" style={{ height: '200px', cursor: 'pointer' }} onClick={() => coverImageRef.current.click()}>{currentHall.coverImage ? (<img src={getPreview(currentHall.coverImage)} alt="Cover" className="w-100 h-100 object-fit-cover rounded-3" />) : (<div className="text-center text-muted"><FaCamera size={24} /><p className="small mb-0 mt-2">Upload Cover</p></div>)}</div><input type="file" ref={coverImageRef} accept="image/*" className="d-none" onChange={(e) => handleFileChange(e, 'coverImage')} /></div><div className="col-md-8"><div className="d-flex justify-content-between align-items-center mb-2"><label className="form-label fw-bold small text-secondary mb-0">Gallery Images (min 3) *</label><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => galleryImagesRef.current.click()}>+ Add Images</button></div><div className="d-flex gap-2 overflow-auto pb-2" style={{ whiteSpace: 'nowrap' }}>{currentHall.galleryImages.map((img, idx) => (<div key={idx} className="position-relative d-inline-block" style={{ width: '120px', height: '100px' }}><img src={getPreview(img)} alt="Gallery" className="w-100 h-100 object-fit-cover rounded shadow-sm border" /><button type="button" className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle" style={{ width: '20px', height: '20px' }} onClick={() => removeImage(idx, 'galleryImages')}><FaTrash size={10} /></button></div>))}</div><input type="file" ref={galleryImagesRef} accept="image/*" className="d-none" onChange={(e) => handleFileChange(e, 'galleryImages')} /></div><div className="col-md-6"><label className="form-label fw-bold small text-secondary">Video URL (YouTube/Drive)</label><input type="url" className="form-control" style={inputStyle} name="videoUrl" value={currentHall.videoUrl} onChange={handleFormChange} /></div><div className="col-md-6"><label className="form-label fw-bold small text-secondary">Brochure PDF (Optional)</label><input type="file" className="form-control" style={inputStyle} accept=".pdf" onChange={(e) => handleFileChange(e, 'brochureUrl')} /></div></div></div></div>

                                    {/* 8. Decoration Module (REFACTORED for Multiple Types) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 style={{ ...sectionTitleStyle, borderBottom: 'none', marginBottom: 0 }}>8. Decoration Module</h4>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="decAvailable" name="available" checked={currentHall.decoration.available} onChange={(e) => handleFormChange(e, 'decoration')} />
                                                    <label className="form-check-label fw-bold" htmlFor="decAvailable">Available?</label>
                                                </div>
                                            </div>
                                            {currentHall.decoration.available && (
                                                <div className="border-top pt-3">
                                                    {currentHall.decoration.items.map((item, index) => (
                                                        <div key={index} className="bg-light p-3 rounded mb-3 position-relative border">
                                                            {/* Remove Item Button */}
                                                            <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onClick={() => removeDecorationItem(index)}><FaTrash /></button>

                                                            <h6 className="fw-bold mb-3">Option {index + 1}</h6>
                                                            <div className="row g-3">
                                                                <div className="col-md-4">
                                                                    <label className="form-label fw-bold small text-secondary">Type (e.g. Simple, Premium)</label>
                                                                    <input type="text" className="form-control" style={inputStyle} name="type" value={item.type} onChange={(e) => handleDecorationChange(index, e)} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <label className="form-label fw-bold small text-secondary">Starting Price</label>
                                                                    <input type="number" className="form-control" style={inputStyle} name="startPrice" value={item.startPrice} onChange={(e) => handleDecorationChange(index, e)} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <label className="form-label fw-bold small text-secondary">Max Price</label>
                                                                    <input type="number" className="form-control" style={inputStyle} name="maxPrice" value={item.maxPrice} onChange={(e) => handleDecorationChange(index, e)} />
                                                                </div>
                                                                <div className="col-12">
                                                                    <label className="form-label fw-bold small text-secondary">Description</label>
                                                                    <textarea className="form-control" style={inputStyle} name="description" value={item.description} onChange={(e) => handleDecorationChange(index, e)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={addDecorationItem}>+ Add Decoration Option</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 9. Stalls Module (Same) */}
                                    <div className="col-12 col-xl-10"><div className="card border-0 shadow-sm rounded-4 p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ ...sectionTitleStyle, borderBottom: 'none', marginBottom: 0 }}>9. Stalls Module</h4><div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id="stallsAvailable" name="available" checked={currentHall.stalls.available} onChange={(e) => handleFormChange(e, 'stalls')} /><label className="form-check-label fw-bold" htmlFor="stallsAvailable">Available?</label></div></div>{currentHall.stalls.available && (<div className="row g-3 border-top pt-3"><div className="col-md-3"><label className="form-label fw-bold small text-secondary">Number of Stalls</label><input type="number" className="form-control" style={inputStyle} name="count" value={currentHall.stalls.count} onChange={(e) => handleFormChange(e, 'stalls')} /></div><div className="col-md-3"><label className="form-label fw-bold small text-secondary">Type</label><select className="form-select" style={inputStyle} name="type" value={currentHall.stalls.type} onChange={(e) => handleFormChange(e, 'stalls')}><option value="">Select</option><option value="Food">Food</option><option value="Tea">Tea</option><option value="Mixed">Mixed</option></select></div><div className="col-md-3"><label className="form-label fw-bold small text-secondary">Price (Total/Stall)</label><input type="number" className="form-control" style={inputStyle} name="price" value={currentHall.stalls.price} onChange={(e) => handleFormChange(e, 'stalls')} /></div><div className="col-md-3 d-flex flex-column gap-2 pt-4"><div className="form-check"><input className="form-check-input" type="checkbox" name="electricity" checked={currentHall.stalls.electricity} onChange={(e) => handleFormChange(e, 'stalls')} /><label className="form-check-label small">Electricity Provided</label></div><div className="form-check"><input className="form-check-input" type="checkbox" name="water" checked={currentHall.stalls.water} onChange={(e) => handleFormChange(e, 'stalls')} /><label className="form-check-label small">Water Provided</label></div></div><div className="col-12"><label className="form-label fw-bold small text-secondary">Notes</label><textarea className="form-control" style={inputStyle} name="notes" value={currentHall.stalls.notes} onChange={(e) => handleFormChange(e, 'stalls')} /></div></div>)}</div></div>

                                    {/* 10. Utensils (Conditional Price) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 style={{ ...sectionTitleStyle, borderBottom: 'none', marginBottom: 0 }}>10. Utensils Module</h4>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="utensilsAvailable" name="available" checked={currentHall.utensils.available} onChange={(e) => handleFormChange(e, 'utensils')} />
                                                    <label className="form-check-label fw-bold" htmlFor="utensilsAvailable">Available?</label>
                                                </div>
                                            </div>
                                            {currentHall.utensils.available && (
                                                <div className="row g-3 border-top pt-3">
                                                    {/* Configuration Row */}
                                                    <div className="col-md-3">
                                                        <label className="form-label fw-bold small text-secondary">Included?</label>
                                                        <select className="form-select" style={inputStyle} name="included" value={currentHall.utensils.included} onChange={(e) => handleFormChange(e, 'utensils')}>
                                                            <option value="Free">Free</option>
                                                            <option value="Paid">Paid</option>
                                                        </select>
                                                    </div>

                                                    {currentHall.utensils.included === 'Paid' && (
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold small text-secondary">Price (if paid)</label>
                                                            <input type="number" className="form-control" style={inputStyle} name="price" value={currentHall.utensils.price} onChange={(e) => handleFormChange(e, 'utensils')} />
                                                        </div>
                                                    )}

                                                    <div className="col-md-3 d-flex align-items-center pt-4">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" name="cleaning" checked={currentHall.utensils.cleaning} onChange={(e) => handleFormChange(e, 'utensils')} />
                                                            <label className="form-check-label small fw-bold">Cleaning Included?</label>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Row - Forced to new line */}
                                                    <div className="col-12">
                                                        <div className="row g-3">
                                                            <div className="col-md-3"><label className="small fw-bold text-secondary">Plates Qty</label><input type="number" className="form-control" style={inputStyle} name="plates" value={currentHall.utensils.plates} onChange={(e) => handleFormChange(e, 'utensils')} /></div>
                                                            <div className="col-md-3"><label className="small fw-bold text-secondary">Glass Qty</label><input type="number" className="form-control" style={inputStyle} name="glasses" value={currentHall.utensils.glasses} onChange={(e) => handleFormChange(e, 'utensils')} /></div>
                                                            <div className="col-md-3"><label className="small fw-bold text-secondary">Spoon Qty</label><input type="number" className="form-control" style={inputStyle} name="spoons" value={currentHall.utensils.spoons} onChange={(e) => handleFormChange(e, 'utensils')} /></div>
                                                            <div className="col-md-3"><label className="small fw-bold text-secondary">Bowl Qty</label><input type="number" className="form-control" style={inputStyle} name="bowls" value={currentHall.utensils.bowls} onChange={(e) => handleFormChange(e, 'utensils')} /></div>
                                                        </div>
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label fw-bold small text-secondary">Notes</label>
                                                        <textarea className="form-control" style={inputStyle} name="notes" value={currentHall.utensils.notes} onChange={(e) => handleFormChange(e, 'utensils')} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 11. Catering (Same) */}
                                    <div className="col-12 col-xl-10">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 style={{ ...sectionTitleStyle, borderBottom: 'none', marginBottom: 0 }}>11. Food / Catering</h4>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="cateringAvailable" name="available" checked={currentHall.catering.available} onChange={(e) => handleFormChange(e, 'catering')} />
                                                    <label className="form-check-label fw-bold" htmlFor="cateringAvailable">Available?</label>
                                                </div>
                                            </div>
                                            {currentHall.catering.available && (
                                                <div className="row g-3 border-top pt-3">
                                                    <div className="col-md-4"><label className="form-label fw-bold small text-secondary">Type</label><select className="form-select" style={inputStyle} name="type" value={currentHall.catering.type} onChange={(e) => handleFormChange(e, 'catering')}><option value="Veg">Veg</option><option value="Non-Veg">Non-Veg</option><option value="Both">Both</option></select></div>
                                                    <div className="col-md-4"><label className="form-label fw-bold small text-secondary">Price per Plate (Start)</label><input type="number" className="form-control" style={inputStyle} name="startPrice" value={currentHall.catering.startPrice} onChange={(e) => handleFormChange(e, 'catering')} /></div>
                                                    <div className="col-md-4"><label className="form-label fw-bold small text-secondary">Price per Plate (Max)</label><input type="number" className="form-control" style={inputStyle} name="maxPrice" value={currentHall.catering.maxPrice} onChange={(e) => handleFormChange(e, 'catering')} /></div>
                                                    <div className="col-md-4"><label className="form-label fw-bold small text-secondary">Serving Items Qty</label><input type="number" className="form-control" style={inputStyle} name="servingItems" value={currentHall.catering.servingItems} onChange={(e) => handleFormChange(e, 'catering')} /></div>
                                                    <div className="col-12"><label className="form-label fw-bold small text-secondary d-block mb-2">Menu Images</label><button type="button" className="btn btn-sm btn-outline-danger mb-2" onClick={() => menuImagesRef.current.click()}>Upload Menu</button><div className="d-flex gap-2 overflow-auto">{currentHall.catering.menuImages.map((img, idx) => (<div key={idx} className="position-relative d-inline-block" style={{ width: '80px', height: '80px' }}><img src={getPreview(img)} alt="Menu" className="w-100 h-100 object-fit-cover rounded border" /><button type="button" className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle" style={{ width: '15px', height: '15px', fontSize: '10px' }} onClick={() => removeImage(idx, 'menuImages', 'catering')}>x</button></div>))}</div><input type="file" ref={menuImagesRef} accept="image/*" className="d-none" onChange={(e) => handleFileChange(e, 'menuImages', 'catering')} /></div>
                                                    <div className="col-12"><label className="form-label fw-bold small text-secondary">Notes</label><textarea className="form-control" style={inputStyle} name="notes" value={currentHall.catering.notes} onChange={(e) => handleFormChange(e, 'catering')} /></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 12. Terms (No checkbox mandatory) */}
                                    <div className="col-12 col-xl-10 mx-auto">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h4 style={sectionTitleStyle}>12. Terms & Conditions</h4>
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label fw-bold small text-secondary">Terms & Conditions *</label>
                                                    <textarea className="form-control" style={inputStyle} rows="4" name="terms" value={currentHall.terms} onChange={handleFormChange} required placeholder="Enter your terms and conditions here..."></textarea>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xl-10 mx-auto text-center mt-5">
                                        <button
                                            type="button"
                                            className="btn btn-danger px-5 py-3 rounded-pill fw-bold shadow-sm"
                                            style={{ minWidth: '200px', fontSize: '1.1rem' }}
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : <><FaSave className="me-2" /> Save Profile</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                    <div className="modal-header border-bottom-0 p-4">
                                        <h5 className="modal-title fw-bold text-danger">Delete Mahal?</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-4 pt-0 text-center">
                                        <div className="mb-3">
                                            <span className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                <FaTrash size={24} />
                                            </span>
                                        </div>
                                        <h5 className="mb-2 fw-bold text-dark">{mahalToDelete?.name}</h5>
                                        <p className="text-secondary mb-0">
                                            Are you sure you want to delete this Mahal? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="modal-footer border-top-0 p-3 bg-light d-flex justify-content-center gap-2">
                                        <button type="button" className="btn btn-light rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                        <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={confirmDelete}>Delete Mahal</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
};

export default MahalProfile;
