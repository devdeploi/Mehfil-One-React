import React, { useState } from 'react';
import { FaToggleOn, FaToggleOff, FaTrash, FaEdit } from 'react-icons/fa';
import '../../styles/superadmin/VendorList.css';

const VendorList = () => {
    const [vendors, setVendors] = useState([
        { id: 1, name: 'Vendor A', status: 'Active' },
        { id: 2, name: 'Vendor B', status: 'Inactive' },
        { id: 3, name: 'Vendor C', status: 'Pending' },
        { id: 4, name: 'Vendor D', status: 'Active' },
    ]);

    const toggleStatus = (id) => {
        setVendors(vendors.map(v =>
            v.id === id ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' } : v
        ));
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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>#{vendor.id}</td>
                                <td>{vendor.name}</td>
                                <td><span className={getStatusBadge(vendor.status)}>{vendor.status}</span></td>
                                <td>
                                    <button
                                        className="sa-action-btn sa-btn-toggle"
                                        onClick={() => toggleStatus(vendor.id)}
                                        title={vendor.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {vendor.status === 'Active' ? <FaToggleOn /> : <FaToggleOff />}
                                    </button>
                                    <button className="sa-action-btn" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button className="sa-action-btn sa-btn-delete" title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorList;
