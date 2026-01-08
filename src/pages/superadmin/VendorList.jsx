import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import { FaToggleOn, FaToggleOff, FaTrash, FaCheck, FaChevronLeft, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';
import '../../styles/superadmin/VendorList.css';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // UI States
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [statusModal, setStatusModal] = useState({ show: false, id: null, currentStatus: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

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

    // Animation styles
    const toastStyles = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
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
        setStatusModal({ show: true, id, currentStatus });
    };

    const handleStatusToggle = async () => {
        if (!statusModal.id) return;

        try {
            let newStatus;
            if (statusModal.currentStatus === 'Active') newStatus = 'Inactive';
            else if (statusModal.currentStatus === 'Inactive') newStatus = 'Active';
            else if (statusModal.currentStatus === 'Pending') newStatus = 'Active';

            await axios.put(`${API_URL}/vendors/${statusModal.id}/status`, { status: newStatus });
            showToast(`Vendor ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success');
            setStatusModal({ show: false, id: null, currentStatus: '' });
            fetchVendors();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status', 'error');
        }
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
                                        className={`sa-action-btn ${vendor.status === 'Pending' ? 'sa-btn-approve' : 'sa-btn-toggle'}`}
                                        onClick={() => confirmToggle(vendor._id, vendor.status)}
                                        title={vendor.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {vendor.status === 'Active' ? <FaToggleOn /> : vendor.status === 'Pending' ? <FaCheck /> : <FaToggleOff />}
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
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050, backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ borderRadius: '20px' }}>
                                <div className="modal-body p-5 text-center">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle shadow-sm"
                                        style={{
                                            width: '90px', height: '90px',
                                            background: statusModal.currentStatus === 'Active' ? '#fffbeb' : '#f0fdf4',
                                            color: statusModal.currentStatus === 'Active' ? '#d97706' : '#16a34a',
                                            border: '4px solid #ffffff',
                                            boxShadow: statusModal.currentStatus === 'Active' ? '0 0 0 4px #fef3c7' : '0 0 0 4px #dcfce7'
                                        }}
                                    >
                                        {statusModal.currentStatus === 'Active' ? <FaToggleOff size={36} /> : <FaToggleOn size={36} />}
                                    </div>
                                    <h3 className="mb-2 fw-bold" style={{ color: '#0f172a' }}>
                                        {statusModal.currentStatus === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                                    </h3>
                                    <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '350px', lineHeight: '1.6' }}>
                                        Are you sure you want to <strong>{statusModal.currentStatus === 'Active' ? 'deactivate' : 'activate'}</strong> this vendor's access?
                                    </p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-lg px-4 fw-bold"
                                            onClick={() => setStatusModal({ show: false, id: null, currentStatus: '' })}
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
                                                background: statusModal.currentStatus === 'Active' ? '#d97706' : '#16a34a',
                                                border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                                            }}
                                        >
                                            Confirm Action
                                        </button>
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
