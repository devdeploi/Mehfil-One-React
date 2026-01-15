import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { FaToggleOn, FaToggleOff, FaTrash, FaCheck, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaEye, FaTimes, FaHistory, FaFilePdf, FaFileDownload, FaExternalLinkAlt } from 'react-icons/fa';
import '../../styles/superadmin/VendorList.css';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // UI States
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [statusModal, setStatusModal] = useState({ show: false, id: null, currentStatus: '', targetStatus: '' });
    const [viewModal, setViewModal] = useState({ show: false, vendor: null });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isProcessing, setIsProcessing] = useState(false); // New state for loader

    useEffect(() => {
        fetchVendors();
    }, [currentPage]);

    const fetchVendors = async () => {
        try {
            const response = await axios.get(`${API_URL}/vendors?page=${currentPage}`);
            setVendors(response.data.vendors);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast('Failed to fetch vendors', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Animation styles with spinner
    const toastStyles = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes spinner {
            to { transform: rotate(360deg); }
        }
        .sa-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(59, 130, 246, 0.2);
            border-left-color: #3b82f6;
            border-radius: 50%;
            animation: spinner 0.8s linear infinite;
        }
        .custom-toast-glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-left: 5px solid;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
    `;

    const confirmToggle = (id, currentStatus) => {
        let target = '';
        if (currentStatus === 'Active') target = 'Inactive';
        else target = 'Active';

        setStatusModal({ show: true, id, currentStatus, targetStatus: target });
    };

    const handleStatusToggle = async () => {
        if (!statusModal.id) return;
        setIsProcessing(true); // Start processing

        try {
            const newStatus = statusModal.targetStatus;
            await axios.put(`${API_URL}/vendors/${statusModal.id}/status`, { status: newStatus });

            showToast(`Vendor status updated to ${newStatus} successfully`, 'success');

            // Close modals after success
            setStatusModal({ show: false, id: null, currentStatus: '', targetStatus: '' });
            setViewModal({ show: false, vendor: null });

            fetchVendors();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status', 'error');
        } finally {
            setIsProcessing(false); // Stop processing
        }
    };

    const confirmModalAction = (targetStatus) => {
        if (!viewModal.vendor) return;
        setStatusModal({
            show: true,
            id: viewModal.vendor._id,
            currentStatus: viewModal.vendor.status,
            targetStatus: targetStatus
        });
    };

    const confirmDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;

        try {
            await axios.delete(`${API_URL}/vendors/${deleteModal.id}`);
            showToast('Vendor deleted successfully', 'success');
            setDeleteModal({ show: false, id: null });
            fetchVendors();
        } catch (error) {
            console.error('Error deleting vendor:', error);
            showToast('Failed to delete vendor', 'error');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return 'sa-badge sa-badge-active';
            case 'Inactive': return 'sa-badge sa-badge-inactive';
            default: return 'sa-badge sa-badge-pending';
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="sa-page-title">Vendor Management</h1>
            <div className="sa-table-container">
                <table className="table sa-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vendor Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor, index) => (
                            <tr key={vendor._id}>
                                <td>{index + 1}</td>
                                <td>{vendor.fullName}</td>
                                <td>{vendor.email}</td>
                                <td>{vendor.phone}</td>
                                <td><span className={getStatusBadge(vendor.status)}>{vendor.status}</span></td>
                                <td>
                                    <button
                                        className="sa-action-btn sa-btn-view"
                                        title="View Details"
                                        onClick={() => setViewModal({ show: true, vendor: vendor })}
                                        style={{ color: '#3b82f6', background: '#eff6ff', marginRight: '5px' }}
                                    >
                                        <FaEye />
                                    </button>

                                    <button
                                        className="sa-action-btn sa-btn-delete"
                                        title="Delete"
                                        onClick={() => confirmDelete(vendor._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="sa-pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="sa-pagination-btn"
                    title="Previous Page"
                >
                    <FaChevronLeft />
                </button>
                <span className="sa-pagination-info">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="sa-pagination-btn"
                    title="Next Page"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Styles */}
            <style>{toastStyles}</style>

            {/* Premium Toast Notification */}
            {toast.show && (
                <div
                    className="position-fixed top-0 end-0 m-4 p-3 rounded-3 custom-toast-glass d-flex align-items-center gap-3 pe-4"
                    style={{
                        zIndex: 9999,
                        borderLeftColor: toast.type === 'error' ? '#dc2626' : '#22c55e',
                        minWidth: '300px'
                    }}
                >
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                        style={{
                            width: '32px', height: '32px',
                            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            color: toast.type === 'error' ? '#dc2626' : '#22c55e'
                        }}
                    >
                        {/* Use Icons directly or classnames */}
                        <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-lg'}`}></i>
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                            {toast.type === 'error' ? 'Error' : 'Success'}
                        </h6>
                        <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050, backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ borderRadius: '20px' }}>
                                <div className="modal-body p-5 text-center">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle shadow-sm"
                                        style={{
                                            width: '90px', height: '90px',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            border: '4px solid #ffffff',
                                            boxShadow: '0 0 0 4px #fee2e2'
                                        }}
                                    >
                                        <FaTrash size={36} />
                                    </div>
                                    <h3 className="mb-2 fw-bold" style={{ color: '#0f172a' }}>Delete Vendor</h3>
                                    <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '300px', lineHeight: '1.6' }}>
                                        Are you sure you want to remove this vendor? This action is <strong className="text-danger">irreversible</strong>.
                                    </p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-lg px-4 fw-bold"
                                            onClick={() => setDeleteModal({ show: false, id: null })}
                                            style={{
                                                background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-lg px-4 fw-bold text-white shadow-sm"
                                            onClick={handleDelete}
                                            style={{
                                                background: '#dc2626', border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                                            }}
                                        >
                                            Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Status Toggle Confirmation Modal */}
            {statusModal.show && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1060, backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ borderRadius: '20px' }}>
                                <div className="modal-body p-5 text-center">
                                    {isProcessing ? (
                                        // Loading State UI
                                        <div className="d-flex flex-column align-items-center justify-content-center py-3">
                                            <div className="sa-spinner mb-4"></div>
                                            <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Sending Email Notification...</h4>
                                            <p className="text-muted small">Please wait while we update the status and notify the vendor.</p>
                                        </div>
                                    ) : (
                                        // Standard Confirmation UI
                                        <>
                                            <div
                                                className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle shadow-sm"
                                                style={{
                                                    width: '90px', height: '90px',
                                                    background: statusModal.targetStatus === 'Inactive' ? '#fffbeb' : '#f0fdf4',
                                                    color: statusModal.targetStatus === 'Inactive' ? '#d97706' : '#16a34a',
                                                    border: '4px solid #ffffff',
                                                    boxShadow: statusModal.targetStatus === 'Inactive' ? '0 0 0 4px #fef3c7' : '0 0 0 4px #dcfce7'
                                                }}
                                            >
                                                {statusModal.targetStatus === 'Inactive' ? <FaToggleOff size={36} /> : <FaToggleOn size={36} />}
                                            </div>
                                            <h3 className="mb-2 fw-bold" style={{ color: '#0f172a' }}>
                                                {statusModal.targetStatus === 'Active' ? 'Activate Vendor' : statusModal.targetStatus === 'Pending' ? 'Set to Pending' : 'Deactivate Vendor'}
                                            </h3>
                                            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '350px', lineHeight: '1.6' }}>
                                                Are you sure you want to set this vendor's status to <strong>{statusModal.targetStatus}</strong>?
                                            </p>
                                            <div className="d-flex justify-content-center gap-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-lg px-4 fw-bold"
                                                    onClick={() => setStatusModal({ show: false, id: null, currentStatus: '', targetStatus: '' })}
                                                    style={{
                                                        background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-lg px-4 fw-bold text-white shadow-sm"
                                                    onClick={handleStatusToggle}
                                                    style={{
                                                        background: statusModal.targetStatus === 'Inactive' ? '#d97706' : '#16a34a',
                                                        border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                                                    }}
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* View Details Modal */}
            {viewModal.show && viewModal.vendor && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050, backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ borderRadius: '20px', background: '#f8fafc' }}>
                                {/* Header */}
                                <div className="modal-header border-bottom-0 p-4 pb-2">
                                    <div>
                                        <h4 className="modal-title fw-bold text-dark mb-1">Vendor Details</h4>
                                        <p className="text-secondary small mb-0">Review vendor information and take action.</p>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setViewModal({ show: false, vendor: null })}></button>
                                </div>

                                {/* Body */}
                                <div className="modal-body p-4">
                                    <div className="row g-4">
                                        {/* Personal Info Card */}
                                        <div className="col-md-6">
                                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
                                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                                    <i className="bi bi-person-badge text-primary fs-5"></i>
                                                    <h6 className="text-uppercase text-secondary fw-bold mb-0 small">Personal Info</h6>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">Full Name</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.fullName}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">Email Address</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.email}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">Phone Number</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.phone}</div>
                                                </div>
                                                <div>
                                                    <label className="text-muted small d-block mb-1">Current Status</label>
                                                    <span className={getStatusBadge(viewModal.vendor.status)}>{viewModal.vendor.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Business Info Card */}
                                        <div className="col-md-6">
                                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
                                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                                    <i className="bi bi-building text-primary fs-5"></i>
                                                    <h6 className="text-uppercase text-secondary fw-bold mb-0 small">Business Info</h6>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">Business Name</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.businessName || 'N/A'}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">GST Number</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.gstNumber || 'N/A'}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="text-muted small d-block mb-1">Address</label>
                                                    <div className="fw-semibold text-dark">{viewModal.vendor.businessAddress || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-muted small d-block mb-1">Subscription Plan</label>
                                                    <div className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal">
                                                        {viewModal.vendor.plan || 'Standard'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Proof Document Section */}
                                        <div className="col-12">
                                            <div className="p-4 bg-white rounded-4 shadow-sm border border-light">
                                                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="bi bi-file-earmark-image text-primary fs-5"></i>
                                                        <h6 className="text-uppercase text-secondary fw-bold mb-0 small">Proof Document</h6>
                                                    </div>
                                                    {viewModal.vendor.proofDocument && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                const fileUrl = `${API_URL.replace('/api', '')}/${viewModal.vendor.proofDocument}`;
                                                                const fileName = viewModal.vendor.proofDocument.split(/[/\\]/).pop();
                                                                try {
                                                                    const response = await fetch(fileUrl);
                                                                    const blob = await response.blob();
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.style.display = 'none';
                                                                    a.href = url;
                                                                    a.download = fileName;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    window.URL.revokeObjectURL(url);
                                                                    document.body.removeChild(a);
                                                                } catch (err) {
                                                                    console.error("Download failed", err);
                                                                    window.open(fileUrl, '_blank');
                                                                }
                                                            }}
                                                            className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-2"
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                            title="Download Document"
                                                        >
                                                            <FaFileDownload /> Download
                                                        </button>
                                                    )}
                                                </div>
                                                {viewModal.vendor.proofDocument ? (
                                                    (() => {
                                                        const fileUrl = `${API_URL.replace('/api', '')}/${viewModal.vendor.proofDocument}`;
                                                        const extension = viewModal.vendor.proofDocument.split('.').pop().toLowerCase();
                                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
                                                        const isPdf = extension === 'pdf';

                                                        if (isImage) {
                                                            return (
                                                                <div className="rounded-3 overflow-hidden border bg-light d-flex justify-content-center align-items-center p-3" style={{ minHeight: '200px' }}>
                                                                    <img
                                                                        src={fileUrl}
                                                                        alt="Proof Document"
                                                                        className="img-fluid rounded shadow-sm hover-zoom"
                                                                        style={{ maxHeight: '450px', objectFit: 'contain', transition: 'transform 0.3s' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x300?text=Image+Not+Found+or+Corrupted'; }}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (isPdf) {
                                                            return (
                                                                <div className="rounded-3 overflow-hidden border bg-light" style={{ height: '450px' }}>
                                                                    <iframe
                                                                        src={fileUrl}
                                                                        title="Proof Document PDF"
                                                                        width="100%"
                                                                        height="100%"
                                                                        style={{ border: 'none' }}
                                                                    >
                                                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                                                                            <FaFilePdf size={48} className="text-danger mb-3" />
                                                                            <p className="mb-3">This browser does not support PDFs. Please download the PDF to view it.</p>
                                                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                                                <FaFileDownload className="me-2" /> Download PDF
                                                                            </a>
                                                                        </div>
                                                                    </iframe>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="rounded-3 border bg-light d-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ minHeight: '200px' }}>
                                                                    <div className="mb-3 p-3 bg-white rounded-circle shadow-sm text-primary">
                                                                        <FaFileDownload size={32} />
                                                                    </div>
                                                                    <h6 className="mb-2 fw-bold text-dark">Document Available</h6>
                                                                    <p className="text-muted small mb-4">This file type ({extension}) cannot be previewed directly.</p>
                                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary px-4 rounded-pill fw-semibold hover-shadow">
                                                                        <FaExternalLinkAlt className="me-2" /> Open / Download
                                                                    </a>
                                                                </div>
                                                            );
                                                        }
                                                    })()
                                                ) : (
                                                    <div className="text-center text-muted py-5 bg-light rounded-3 border border-dashed">
                                                        <FaExclamationTriangle className="mb-2 fs-1 text-warning opacity-50" />
                                                        <p className="mb-0 fw-medium">No proof document uploaded.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="modal-footer border-top-0 p-4 pt-2 d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-light px-4 py-2 fw-semibold rounded-3 border"
                                        onClick={() => setViewModal({ show: false, vendor: null })}
                                    >
                                        Close
                                    </button>
                                    <div className="d-flex gap-3">
                                        {/* Reject Button (Always visible) */}
                                        <button
                                            type="button"
                                            className="btn btn-danger px-4 py-2 fw-bold shadow-sm rounded-3 d-flex align-items-center gap-2"
                                            onClick={() => confirmModalAction('Inactive')}
                                        >
                                            <FaTimes /> Reject
                                        </button>

                                        {/* Conditional Button: Pending if Active, Accept if Pending/Inactive */}
                                        {viewModal.vendor.status === 'Active' ? (
                                            <button
                                                type="button"
                                                className="btn px-4 py-2 fw-bold shadow-sm rounded-3 d-flex align-items-center gap-2 text-white"
                                                onClick={() => confirmModalAction('Pending')}
                                                style={{ background: '#d97706', border: 'none' }}
                                            >
                                                <FaHistory /> Pending
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-success px-4 py-2 fw-bold shadow-sm rounded-3 d-flex align-items-center gap-2"
                                                onClick={() => confirmModalAction('Active')}
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorList;
