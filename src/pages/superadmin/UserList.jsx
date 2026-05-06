import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaUserEdit, FaTrash, FaEnvelope, FaSearch, FaTimes, FaSave, FaFilePdf, FaUser, FaPhone, 
    FaCheck, FaExclamationTriangle, FaEye, FaChevronLeft, FaChevronRight, FaCalendarAlt,
    FaHome, FaMapMarkerAlt, FaIdCard
} from 'react-icons/fa';
import { API_URL } from '../../utils/function';
import '../../styles/superadmin/UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Modals state
    const [editModal, setEditModal] = useState({ show: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [editData, setEditData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'Active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to fetch users', 'error');
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setIsProcessing(true);
        try {
            await axios.delete(`${API_URL}/users/${deleteModal.id}`);
            setUsers(users.filter(user => user._id !== deleteModal.id));
            showToast('User deleted successfully', 'success');
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Failed to delete user', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditClick = (user) => {
        setEditModal({ show: true, user });
        setEditData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user',
            status: user.status || 'Active'
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const response = await axios.put(`${API_URL}/users/${editModal.user._id}`, editData);
            setUsers(users.map(u => u._id === editModal.user._id ? response.data : u));
            showToast('User updated successfully', 'success');
            setEditModal({ show: false, user: null });
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Failed to update user', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const getRoleBadge = (role) => {
        const r = role?.toLowerCase();
        return r === 'admin' || r === 'superadmin' ? 'sa-role-badge role-admin' : 'sa-role-badge role-user';
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'active') return 'badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill';
        if (s === 'pending') return 'badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill';
        return 'badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill';
    };

    const toastStyles = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
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

    const filteredUsers = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="sa-spinner mb-3"></div>
                <p className="text-secondary fw-medium">Loading users...</p>
                <style>{toastStyles}</style>
            </div>
        );
    }

    return (
        <div className="sa-user-list-page">
            <style>{toastStyles}</style>
            
            {/* Toast Notification */}
            {toast.show && (
                <div className="position-fixed top-0 end-0 p-4" style={{ zIndex: 1100 }}>
                    <div className={`custom-toast-glass px-4 py-3 rounded-4 d-flex align-items-center gap-3 ${toast.type === 'error' ? 'border-danger' : 'border-success'}`}>
                        <div className={`rounded-circle p-2 ${toast.type === 'error' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                            {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheck />}
                        </div>
                        <div className="fw-bold text-dark">{toast.message}</div>
                        <button className="btn-close ms-auto" onClick={() => setToast({ ...toast, show: false })}></button>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-end mb-4 px-4 pt-4">
                <div>
                    <h1 className="sa-page-title">User Management</h1>
                    <p className="text-muted mb-0">Overview and management of all registered users</p>
                </div>
                <div className="position-relative" style={{ width: '350px' }}>
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input 
                        type="text" 
                        className="form-control ps-5 rounded-4 border-0 shadow-sm" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '14px 20px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                </div>
            </div>

            <div className="px-4 pb-4">
                <div className="sa-user-table-container shadow-sm border-0">
                    <table className="table sa-table mb-0 align-middle">
                        <thead>
                            <tr>
                                <th className="ps-4">User Details</th>
                                <th>Contact & City</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle bg-dark text-warning d-flex align-items-center justify-content-center me-3 shadow-sm overflow-hidden" style={{ width: '48px', height: '48px', fontWeight: '700' }}>
                                                    {user.profileImage ? (
                                                        <img src={`${API_URL.replace('/api', '')}/${user.profileImage}`} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                    ) : (
                                                        user.fullName?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark">{user.fullName}</span>
                                                    <small className="text-muted small">Joined: {new Date(user.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="text-dark fw-medium small">{user.email}</span>
                                                <small className="text-muted small">{user.city || 'N/A'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={getStatusBadge(user.status)}>{user.status}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className="btn btn-sm btn-light rounded-3 shadow-sm p-2 text-primary"
                                                    title="View Full Details"
                                                    onClick={() => handleEditClick(user)}
                                                >
                                                    <FaIdCard />
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-light rounded-3 shadow-sm p-2 text-danger"
                                                    title="Delete User"
                                                    onClick={() => setDeleteModal({ show: true, id: user._id })}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="text-muted">No users found.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View User Details Modal - Premium Side-by-Side Redesign */}
            {editModal.show && editModal.user && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050, backdropFilter: 'blur(10px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-xl">
                            <div className="modal-content premium-modal-content border-0">
                                <div className="modal-split-container">
                                    {/* Left Side: Comprehensive Profile Summary */}
                                    <div className="profile-side-panel">
                                        <div className="modal-avatar-squircle">
                                            {editModal.user.profileImage ? (
                                                <img src={`${API_URL.replace('/api', '')}/${editModal.user.profileImage}`} alt="Profile" />
                                            ) : (
                                                editModal.user.fullName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <h4 className="modal-user-name">{editModal.user.fullName}</h4>
                                        <span className={getRoleBadge(editModal.user.role)}>{editModal.user.role}</span>
                                        
                                        <div className="side-panel-divider"></div>
                                        
                                        {/* Quick Stats Section */}
                                        <div className="side-panel-stats">
                                            <div className="panel-stat-item">
                                                <span className="stat-label">Member Status</span>
                                                <span className={getStatusBadge(editModal.user.status)}>{editModal.user.status}</span>
                                            </div>
                                            <div className="panel-stat-item">
                                                <span className="stat-label">Total Bookings</span>
                                                <span className="stat-value">04</span>
                                            </div>
                                            <div className="panel-stat-item">
                                                <span className="stat-label">Last Login</span>
                                                <span className="stat-value">Today, 10:24 AM</span>
                                            </div>
                                        </div>

                                        <div className="side-panel-divider"></div>

                                        {/* Activity Log Placeholder */}
                                        <div className="side-panel-info w-100 px-3">
                                            <h6 className="text-uppercase small fw-bold mb-3" style={{ color: '#fbbf24', fontSize: '0.65rem', letterSpacing: '0.1rem' }}>Security Overview</h6>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <FaCheck className="text-success small" />
                                                <small className="text-white-50">Email Verified</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <FaCheck className="text-success small" />
                                                <small className="text-white-50">Phone Linked</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <FaCheck className="text-success small" />
                                                <small className="text-white-50">Two-Factor Off</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Detailed Info with Fixed Header */}
                                    <div className="details-content-area p-0">
                                        <div className="details-header">
                                            <h3 className="fw-bold text-dark mb-0">User Profile Dashboard</h3>
                                            <button 
                                                type="button" 
                                                className="btn-close" 
                                                onClick={() => setEditModal({ show: false, user: null })}
                                            ></button>
                                        </div>

                                        <div className="details-scroll-content p-5">
                                            <div className="details-section">
                                                <div className="details-section-title">
                                                    <FaUser size={12} /> Personal & Contact Information
                                                </div>
                                                <div className="detail-info-grid">
                                                    <div className="detail-info-card">
                                                        <div className="info-card-icon"><FaEnvelope /></div>
                                                        <span className="info-card-label">Email Address</span>
                                                        <div className="info-card-value">{editModal.user.email}</div>
                                                    </div>

                                                    <div className="detail-info-card">
                                                        <div className="info-card-icon"><FaPhone /></div>
                                                        <span className="info-card-label">Mobile Number</span>
                                                        <div className="info-card-value">{editModal.user.phone || 'Not Linked'}</div>
                                                    </div>

                                                    <div className="detail-info-card">
                                                        <div className="info-card-icon"><FaSearch /></div>
                                                        <span className="info-card-label">Current City</span>
                                                        <div className="info-card-value">{editModal.user.city || 'Not Specified'}</div>
                                                    </div>

                                                    <div className="detail-info-card">
                                                        <div className="info-card-icon"><FaCalendarAlt /></div>
                                                        <span className="info-card-label">Registration Date</span>
                                                        <div className="info-card-value">{new Date(editModal.user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="details-section mt-5">
                                                <div className="details-section-title">
                                                    <FaHome size={12} /> Residential Details
                                                </div>
                                                <div className="detail-info-grid">
                                                    <div className="detail-info-card address-card">
                                                        <div className="info-card-icon"><FaMapMarkerAlt /></div>
                                                        <span className="info-card-label">Full Residential Address</span>
                                                        <div className="info-card-value">{editModal.user.address || 'Address details have not been provided yet.'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal - VendorList Style */}
            {deleteModal.show && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1100, backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1105 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-body p-5 text-center">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle shadow-sm bg-danger-subtle text-danger" style={{ width: '80px', height: '80px', border: '4px solid #fff' }}>
                                        <FaTrash size={30} />
                                    </div>
                                    <h4 className="fw-bold text-dark mb-2">Delete User Account?</h4>
                                    <p className="text-secondary mb-4 small">This action is permanent and cannot be undone. All data associated with this user will be removed.</p>
                                    <div className="d-flex gap-3">
                                        <button className="btn btn-light flex-grow-1 py-2 rounded-3 border fw-semibold" onClick={() => setDeleteModal({ show: false, id: null })}>Cancel</button>
                                        <button className="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold" onClick={handleDelete} disabled={isProcessing}>
                                            {isProcessing ? <span className="spinner-border spinner-border-sm"></span> : 'Delete Now'}
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

export default UserList;
